const config = require('./../config/config');
const mongoose = require('mongoose');
const Movie = mongoose.model('Movie');
const User = mongoose.model('User');
const Category = mongoose.model('Category');

module.exports = {
    index: (req, res) => {
        Category.find({}).then(categories => {
            Movie.find({}).limit(config.homeConfig.postLimit).populate('category').populate('author').populate('tags').then(movies => {

                res.render('home/index', {
                    subTitle: 'Home',
                    categories: categories,
                    movies:movies
                });
            })
        })
    },

    listCategoryMovies: (req, res) => {
        let id = req.params.id;

        Category.findById(id).populate('movies').then(category => {

            User.populate(category.movies, {path: 'author'}, (err) => {
                if (err) {
                    console.log('home - listCategoryMovies -> populate authors')
                    console.log(err);
                }
                Movie.populate(category.movies,{path: 'tags'},(err) =>{
                    if (err) {
                        console.log('home - listCategoryMovies -> tags')
                        console.log(err);
                    }
                    Category.find({}).then(categories => {
                        res.render('home/movies', {
                            subTitle: 'List of all movies in ' + category.name + ' category!',
                            movies: category.movies,
                            categories: categories,
                        });
                    })
                });


            })
        })
    }
};