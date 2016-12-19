const Movie = require('mongoose').model('Movie');
const Genre = require('mongoose').model('Genre');
const util = require('./../utilities/utilities');
//TODO: see witch constants are deprecated and remove them!
const initializeTags = require('./../models/Tag').initializeTags;
const imdb = require('imdb-api');


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
        let populateQuery = [
            {path: 'added_by',select: 'fullName'},
            {path: 'genres',  select: 'name'},
            {path: 'tags',    select: 'name'}
        ];
        Movie.findById(id).populate(populateQuery).then(movie => {

            let subTitle = 'Details for ' + movie.title + ' Movie. ';
            let movies = [];
            movies.push(movie);
            if (!req.user) {
                res.render('movie/details', {
                    subTitle: subTitle,
                    movies: movies,
                    isUserAuthorized: false,
                    showDetailedArticle: true
                });
                return;
            }

            req.user.isInRole('Admin').then(isAdmin => {
                let isUserAuthorized = isAdmin;
                //console.log(isUserAuthorized);
                res.render('movie/details', {
                    subTitle: subTitle,
                    movies: movies,
                    isUserAuthorized: isUserAuthorized,
                    showDetailedArticle: true
                });
            })
        })
    }

};