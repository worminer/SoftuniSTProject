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
            res.render('movie/create', {categories: categories});
        });
    },

    createPost: (req, res) => {
        let MovieData = req.body;

        let errorMsg = '';
        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged to make Movies';
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

        Movie.create(MovieData).then(Movie => {
            let tagNames = MovieData.tagNames.split(/\s+|,/).filter(tag => {
                return tag
            });
            initializeTags(tagNames, Movie.id);

            Movie.prepareInsert();
            res.redirect('/');
        })
    },

    details: (req, res) => {
        let id = req.params.id;

        Movie.findById(id).populate('author tags').then(Movie => {
            if (!req.user) {
                res.render('movie/details', {Movie: Movie, isUserAuthorized: false});
                return;
            }

            req.user.isInRole('Admin').then(isAdmin => {
                let isUserAuthorized = isAdmin || req.user.isAuthor(Movie);

                res.render('movie/details', {Movie: Movie, isUserAuthorized: isUserAuthorized});
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

        Movie.findById(id).populate('tags').then(Movie => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(Movie)) {
                    res.redirect('/');
                    return;
                }
                Category.find({}).then(categories => {
                    Movie.categories = categories;
                    Movie.tagNames = Movie.tags.map(tag => {
                        return tag.name
                    });

                    res.render('movie/edit', Movie);
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
            Movie.findById(id).populate('category tags').then(Movie => {
                if (Movie.category.id !== MovieArgs.category) {
                    Movie.category.movies.remove(Movie.id);
                    Movie.category.save();
                }

                Movie.category = MovieArgs.category;
                Movie.title = MovieArgs.title;
                Movie.content = MovieArgs.content;

                let newTagNames = MovieArgs.tags.split(/\s+|,/).filter(tag => {
                    return tag
                });

                let oldTags = Movie.tags
                    .filter(tag => {
                        return newTagNames.indexOf(tag.name) === -1;
                    });

                for (let tag of oldTags) {
                    tag.deleteMovie(Movie.id);
                    Movie.deleteTag(tag.id);
                }

                initializeTags(newTagNames, Movie.id);

                Movie.save((err) => {
                    if (err) {
                        console.log(err.message);
                    }

                    Category.findById(Movie.category).then(category => {
                        if (category.movies.indexOf(Movie.id) === -1) {
                            category.movies.push(Movie.id);
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

        Movie.findById(id).populate('category tags').then(Movie => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(Movie)) {
                    res.redirect('/');
                    return;
                }

                Category.findById(Movie.category).then(category => {
                    Movie.category = category;
                    Movie.tagNames = Movie.tags.map(tag => {
                        return tag.name
                    });

                    res.render('movie/delete', Movie);
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