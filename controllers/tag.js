const Article = require('mongoose').model('Movie');
const Tag = require('mongoose').model('Tag');

module.exports = {
    lisArticlesByTag: (req, res) => {
        let name = req.params.name;

        Tag.findOne({name: name}).then(tag => {
            Article.find({tags: tag.id}).populate('author tags')
                .then(articles => {
                    res.render('tag/details', {movies: articles, tag: tag});
                })
        })
    }
};