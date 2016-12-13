const mongoose = require('mongoose');

let tagSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    movies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

tagSchema.method({
    prepareInsert: function () {
        let Movie = mongoose.model('Movie');
        for (let article of this.movies) {
            Movie.findById(article).then(movie => {
                if (movie.tags.indexOf(this.id) === -1) {
                    movie.tags.push(this.id);
                    movie.save();
                }
            })
        }
    },
    deleteMovie: function (movieId) {
        this.movies.remove(movieId);
        this.save();
    }
});

tagSchema.set('versionKey', false);

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;

module.exports.initializeTags = function (newTags, movieId) {
    for (let newTag of newTags) {
        if (newTag) {
            Tag.findOne({name: newTag}).then(tag => {
                // If is existing - insert movie in it
                if (tag) {
                    if (tag.movies.indexOf(movieId) === -1) {
                        tag.movies.push(movieId);
                        tag.prepareInsert();
                        tag.save();
                    }
                } else {
                    Tag.create({name: newTag}).then(tag => {
                        tag.movies.push(movieId);
                        tag.prepareInsert();
                        tag.save();
                    })
                }
            })
        }
    }
};