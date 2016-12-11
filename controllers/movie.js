const Movie = require('mongoose').model('Movie');
const Category = require('mongoose').model('Category');
const initializeTags = require('./../models/Tag').initializeTags;

module.exports = {
    createGet: (req, res) => {
        if (!req.isAuthenticated()) {
            let returnUrl = '/movie/create';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Category.find({}).then(categories => {
            res.render('movie/create', {
                subTitle: 'Add new Movie!',
                categories: categories
            });
        });
    },

    createPost: (req, res) => {
        let MovieData = req.body;

        let errorMsg = '';
        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged to add new Movie';
        } else if (!MovieData.title) {
            errorMsg = 'Invalid Title';
        } else if (!MovieData.content) {
            errorMsg = 'Invalid Content';
        }

        if (errorMsg) {
            res.render('movie/create', {error: errorMsg});
            return;
        }

        MovieData.author = req.user.id;
        MovieData.tags = [];

        Movie.create(MovieData).then(movie => {
            let tagNames = MovieData.tagNames.split(/\s+|,/).filter(tag => {
                return tag
            });
            initializeTags(tagNames, movie.id);

            movie.prepareInsert();
            res.redirect('/');
        })
    },

    details: (req, res) => {
        let id = req.params.id;

        Movie.findById(id).populate('tags').then(movie => {

            let subTitle = 'Details for ' + movie.title + ' Movie. ';

            if (!req.user) {
                res.render('movie/details', {
                    subTitle: subTitle,
                    movie: movie,
                    isUserAuthorized: false}
                    );
                return;
            }

            req.user.isInRole('Admin').then(isAdmin => {
                let isUserAuthorized = isAdmin || req.user.isAuthor(movie);

                res.render('movie/details', {
                    subTitle: subTitle,
                    movie: movie,
                    isUserAuthorized: isUserAuthorized
                });
            })
        })
    },

    editGet: (req, res) => {
        let id = req.params.id;

        if (!req.isAuthenticated()) {
            let returnUrl = `/movie/edit/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Movie.findById(id).populate('tags').then(movie => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(movie)) {
                    res.redirect('/');
                    return;
                }
                Category.find({}).then(categories => {
                    movie.categories = categories;
                    movie.tagNames = movie.tags.map(tag => {
                        return tag.name
                    });

                    res.render('movie/edit',{
                        subTitle: 'Edit the information for ' + movie.title + ' Movie.',
                        movie:movie
                    });
                });
            });
        })
    },

    editPost: (req, res) => {

        let id = req.params.id;

        let MovieArgs = req.body;

        let errorMsg = '';
        if (!MovieArgs.title) {
            errorMsg = 'movie title can not be empty!';
        } else if (!MovieArgs.content) {
            errorMsg = 'movie content can not be empty!'
        }

        if (errorMsg) {
            res.render('movie/edit', {error: errorMsg});
        } else {
            Movie.findById(id).populate('category tags').then(movie => {
                if (movie.category.id !== MovieArgs.category) {
                    movie.category.movies.remove(movie.id);
                    movie.category.save();
                }

                movie.category = MovieArgs.category;
                movie.title = MovieArgs.title;
                movie.content = MovieArgs.content;

                let newTagNames = MovieArgs.tags.split(/\s+|,/).filter(tag => {
                    return tag
                });

                let oldTags = movie.tags
                    .filter(tag => {
                        return newTagNames.indexOf(tag.name) === -1;
                    });

                for (let tag of oldTags) {
                    tag.deleteMovie(movie.id);
                    movie.deleteTag(tag.id);
                }

                initializeTags(newTagNames, movie.id);

                movie.save((err) => {
                    if (err) {
                        console.log(err.message);
                    }

                    Category.findById(movie.category).then(category => {
                        if (category.movies.indexOf(movie.id) === -1) {
                            category.movies.push(movie.id);
                            category.save();
                        }

                        res.redirect(`/movie/details/${id}`);
                    })
                })
            })
        }
    },

    deleteGet: (req, res) => {
        let id = req.params.id;

        if (!req.isAuthenticated()) {
            let returnUrl = `/movie/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
        }

        Movie.findById(id).populate('category tags').then(movie => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(movie)) {
                    res.redirect('/');
                    return;
                }

                Category.findById(movie.category).then(category => {
                    movie.category = category;
                    movie.tagNames = movie.tags.map(tag => {
                        return tag.name
                    });

                    res.render('movie/delete', {
                        subTitle: 'Delete ' + movie.title + ' Movie.',
                        movie: movie
                    });
                });
            })
        })
    },

    deletePost: (req, res) => {
        let id = req.params.id;

        if (!req.isAuthenticated()) {
            let returnUrl = `/movie/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
        }

        Movie.findOneAndRemove({_id: id}).populate('author').then(Movie => {
            Movie.prepareDelete();
            res.redirect('/');
        })
    }
};