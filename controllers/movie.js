const Movie = require('mongoose').model('Movie');
const Category = require('mongoose').model('Genre');
//TODO: see witch constants are deprecated and remove them!
const initializeTags = require('./../models/Tag').initializeTags;
const imdb = require('imdb-api');
const util = require('./../utilities/utilities')

module.exports = {

    searchGet:(req, res) => {
        if (!req.isAuthenticated()) {
            let returnUrl = '/movie/details';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');

        }
        //da se dobavi searchPost

        res.render('movie/search');

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
    }

};