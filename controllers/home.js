const mongoose = require('mongoose');
const Movie = mongoose.model('Movie');
const User = mongoose.model('User');
const Category = mongoose.model('Category');

module.exports = {
    index: (req, res) => {
        Category.find({}).then(categories => {
            res.render('home/index', {categories: categories});
        })
    },

    listCategoryArticles: (req, res) => {
        let id = req.params.id;

        Category.findById(id).populate('movies').then(category => {
            User.populate(category.movies, {path: 'author'}, (err) => {
                if (err) {
                    console.log('home - listCategoryArticles')
                    console.log(err);
                }

                res.render('home/movies', {movies: category.movies});
            })
        })
    }
};