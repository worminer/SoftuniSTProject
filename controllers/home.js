const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const User = mongoose.model('User');
const Category = mongoose.model('Category');

module.exports = {
    index: (req, res) => {
        Category.find({}).then(categories => {
            res.render('home/index', {categories: categories});
        })
    },

    contact:(req, res) =>{
        res.render('home/contact');
    },
    about:(req, res) =>{
        res.render('home/about');
    },



    listCategoryArticles: (req, res) => {
        let id = req.params.id;

        Category.findById(id).populate('articles').then(category => {
            User.populate(category.articles, {path: 'author'}, (err) => {
                if (err) {
                    console.log(err);
                }

                res.render('home/article', {articles: category.articles});
            })
        })
    }
};