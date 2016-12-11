const Movie = require('mongoose').model('Movie');
const Tag = require('mongoose').model('Tag');

module.exports = {
    lisMoviesByTag: (req, res) => {
        let name = req.params.name;

        Tag.findOne({name: name}).then(tag => {
            Movie.find({tags: tag.id}).populate('tags').then(movies => {
                res.render('tag/details', {
                    subTitle: 'List of all movies with tag ' + tag.name + '..',
                    tag: tag,
                    movies: movies
                });
            })
        })
    }
};