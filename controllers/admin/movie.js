const Movie = require('mongoose').model('Movie');
const Genre = require('mongoose').model('Genre');
const initializeTags = require('./../../models/Tag').initializeTags;
const imdb = require('imdb-api');
const util = require('./../../utilities/utilities');

module.exports = {
    createGet: (req, res) => {
        if (!req.isAuthenticated()) {
            let returnUrl = '/admin/movie/create';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Genre.find({}).then(genres => {
            res.render('admin/movie/create', {
                subTitle    : 'Add new Movie!',
                formURL     : '/admin/movie/create/',
                formTitle   : 'Add new movie!',
                genres  : genres
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
        } else if (!MovieData.plot) {
            errorMsg = 'Invalid Content:movie plot';
        }

        if (errorMsg) {
            res.render('admin/movie/create', {
                error: errorMsg,
                formTitle: 'Add new movie!',
            });
            return;
        }
        // adding the information to the MovieData object
        MovieData.added_by= req.user.id;  // who added this movie
        MovieData.tags = [];  // it is an empty array that will be filled with the correct id's later
        MovieData.genres = [];// it is an empty array that will be filled with the correct id's later

        MovieData.directors = util.splitByComma(MovieData.directors);   // movie directors
        MovieData.writers = util.splitByComma(MovieData.writers);     // movie writers
        MovieData.actors = util.splitByComma(MovieData.actors);      // movie actors
        MovieData.languages = util.splitByComma(MovieData.languages);   // movie languages
        MovieData.countries = util.splitByComma(MovieData.countries);   // movie country
        MovieData.awards= util.splitByComma(MovieData.awards);       // movie awards

        Movie.findOne({title:MovieData.title}).then(movie => {

            if(movie){
                errorMsg = 'This movie: " ' + movie.title + '" already exist';
            }

            if (errorMsg) {
                res.render('admin/movie/create', {
                    formTitle: 'Add new movie!',
                    error: errorMsg
                });
                return;
            }

            Movie.create(MovieData).then(movie => {
                if(typeof MovieData.genres_in_db !== 'undefined' ){
                    let genres_in_db = util.arrayIfNeeded(MovieData.genres_in_db);
                    //console.log('genres in db');
                    //console.log(genres_in_db);
                    Genre.initializeGenres(genres_in_db,movie._id);
                }
                if(typeof MovieData.genres_not_in_db !== 'undefined' ){
                    let genres_not_in_db = util.arrayIfNeeded(MovieData.genres_not_in_db);
                    //console.log('genres not in db:');
                    //console.log(genres_not_in_db);
                    Genre.initializeGenres(genres_not_in_db,movie._id);
                }
                let tagNames = util.arrayIfNeeded(util.splitByComma(MovieData.tags_names));
                if(typeof tagNames != 'undefined' ){
                    //console.log('tags:');
                    //console.log(tagNames);
                    initializeTags(tagNames, movie.id);
                }

                movie.prepareInsert();
                res.redirect('/admin/movie/imdb/name/');

            }).catch((err) => {
                if(err){
                    console.log('movie:createPost: movie Create..');
                    console.log(err.message);
                    res.redirect('/admin/movie/imdb/name/');
                }
            });
        }).catch((err) => {
            if(err){
                console.log('movie:createPost: movie findOne..');
                console.log(err.message);
                res.redirect('/admin/movie/imdb/name/');
            }
        });

    },

    editGet: (req, res) => {
        let id = req.params.id;

        if (!req.isAuthenticated()) {
            let returnUrl = `/admin/movie/edit/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        let populateQuery = [
            {path: 'added_by',   select: 'fullName'},
            {path: 'genres', select: 'name'},
            {path: 'tags',     select: 'name'}
        ];
        Movie.findById(id).populate(populateQuery).then(movie => {
            console.log(movie);
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(movie)) {
                    res.redirect('/');
                    return;
                }
                Genre.find({}).then(genres => {
                    movie.genres = genres;
                    movie.tags = util.getFieldToArr(movie.tags,'name');

                    res.render('admin/movie/edit',{
                        subTitle: 'Edit the information for ' + movie.title + ' Movie.',
                        formTitle: 'Edit ' + movie.title + ' movie!',
                        formURL     : '/admin/movie/edit/',
                        movieData:movie
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
            res.render('admin/movie/edit', {
                formTitle: 'Edit movie!',
                error: errorMsg
            });
        } else {
            Movie.findById(id).populate('genre tags').then(movie => {
                if (movie.genre.id !== MovieArgs.genre) {
                    movie.genre.movies.remove(movie.id);
                    movie.genre.save();
                }

                movie.genre = MovieArgs.genre;
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

                    Genre.findById(movie.genre).then(genre => {
                        if (genre.movies.indexOf(movie.id) === -1) {
                            genre.movies.push(movie.id);
                            genre.save();
                        }

                        res.redirect(`/admin/movie/details/${id}`);
                    })
                })
            })
        }
    },

    deleteGet: (req, res) => {
        let id = req.params.id;

        if (!req.isAuthenticated()) {
            let returnUrl = `/admin/movie/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
        }

        Movie.findById(id).populate('genre tags').then(movie => {
            req.user.isInRole('Admin').then(isAdmin => {
                if (!isAdmin && !req.user.isAuthor(movie)) {
                    res.redirect('/');
                    return;
                }

                Genre.findById(movie.genre).then(genre => {
                    movie.genre = genre;
                    movie.tagNames = movie.tags.map(tag => {
                        return tag.name
                    });

                    res.render('admin/movie/delete', {
                        subTitle: 'Delete ' + movie.title + ' Movie.',
                        formTitle: 'Delete ' + movie.title + ' movie!',
                        formURL     : '/admin/movie/delete/',
                        movie: movie
                    });
                });
            })
        })
    },

    deletePost: (req, res) => {
        let id = req.params.id;

        if (!req.isAuthenticated()) {
            let returnUrl = `/admin/movie/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
        }

        Movie.findOneAndRemove({_id: id}).populate('author').then(Movie => {
            Movie.prepareDelete();
            res.redirect('/');
        })
    },

    imdbIndexGet: (req, res) => {
        res.render('admin/movie/imdb', {
            subTitle: 'Search for a movie in imdb.com database.. ', // subTitle
            showSaveForm:false // show/hide the form for adding the movie
        });
    },

    imdbByNamePost: (req, res) => {
        //let movieName = req.params.name;
        let reqData = req.body;
        let searchedMovieName = reqData.movieName;
        //console.log(movieName);
        imdb.getReq({name : searchedMovieName}).then(movieData => {
            let genres = util.splitByComma(movieData.genres);


            Genre.find({name: {$in :genres}}).select('name').then(genreDBObj => {
                movieData.tags = movieData.genres + ', ' + movieData.actors;
                movieData.genresInDB = util.getFieldToArr(genreDBObj,'name');
                movieData.genresNotInDB = util.getGenresNotInDB(genres,genreDBObj);
                //console.log(movieData);
                res.render('admin/movie/imdb', {
                    subTitle: 'Search for ' + reqData.movieName + ' in imdb.com database..(Prepared for save..) ', // subTitle
                    formTitle: 'Add new movie from imdb database!',
                    formURL     : '/admin/movie/create/',
                    searchedMovieName:searchedMovieName,
                    searchedMovieId: movieData.imdbid,
                    movieData: movieData, // movie data from imdb.com api
                    showSaveForm:true // show/hide the form for adding the movie
                });
            }).catch((err) => {
                if(err){
                    console.log(err.message);
                }
            });

        }).catch((err) => {
            if(err){
              console.log(err.message);
            }
        });

    },

    imdbByIdPost: (req, res) => {
        let reqData = req.body;
        let searchedMovieId = reqData.movieId;
        console.log(reqData);
        imdb.getById(searchedMovieId).then(movieData => {
            let genres = util.splitByComma(movieData.genres);

            Genre.find({name: {$in :genres}}).select('name').then(genreDBObj => {

                movieData.genresInDB = util.getFieldToArr(genreDBObj,'name');
                movieData.genresNotInDB = util.getGenresNotInDB(genres,genreDBObj);
                //console.log(movieData);
                res.render('admin/movie/imdb', {
                    subTitle: 'Search for ' + reqData.movieName + ' in imdb.com database..(Prepared for save..) ', // subTitle
                    formTitle: 'Add new movie from imdb database!',
                    searchedMovieName:movieData.movieName,
                    searchedMovieId: movieData.imdbid,
                    movieData: movieData, // movie data from imdb.com api
                    showSaveForm:true // show/hide the form for adding the movie
                });
            }).catch((err) => {
                if(err){
                    console.log(err.message);
                }
            });

        }).catch((err) => {
            if(err){
                console.log(err.message);
            }
        });

    }

};