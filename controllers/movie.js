const Movie = require('mongoose').model('Movie');
const Category = require('mongoose').model('Genre');
//TODO: see witch constants are deprecated and remove them!
const initializeTags = require('./../models/Tag').initializeTags;
const imdb = require('imdb-api');
const util = require('./../utilities/utilities')

module.exports = {
<<<<<<< HEAD
=======
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
    searchGet:(req, res) => {
        if (!req.isAuthenticated()) {
            let returnUrl = '/movie/details';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');

        }
        //da se dobavi searchPost

        res.render('movie/search');

      // Movie.findByTitle({}).then(movies => {
      //       res.render('movie/', {
      //           categories: categories
      //       });
      //   });
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
>>>>>>> 79ec6e432652379ada37d0eb6e050770015bd683



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
    }

};