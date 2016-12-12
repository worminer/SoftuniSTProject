const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

let movieSchema = mongoose.Schema(
    {
        title: {type: String, required: true},
        content: {type: String, required: true},
        author: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
        category: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category'},
        tags: [{type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tag'}],
        date: {type: Date, default: Date.now()}
    });

movieSchema.plugin(mongoosePaginate);

movieSchema.method({
    prepareInsert: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            user.movies.push(this.id);
            user.save();
        });

        let Category = mongoose.model('Category');
        Category.findById(this.category).then(category => {
            if (category) {
                category.movies.push(this.id);
                category.save();
            }
        });

        let Tag = mongoose.model('Tag');
        for (let tagId of this.tags) {
            Tag.findById(tagId).then(tag => {
                if (tag) {
                    tag.movies.push(this.id);
                    tag.save();
                }
            });
        }
    },
    prepareDelete: function () {
        let User = mongoose.model('User');
        User.findById(this.author).then(user => {
            if (user) {
                user.movies.remove(this.id);
                user.save();
            }
        });

        let Category = mongoose.model('Category');
        Category.findById(this.category).then(category => {
            if (category) {
                category.movies.remove(this.id);
                category.save();
            }
        });

        let Tag = mongoose.model('Tag');
        for (let tagId of this.tags) {
            Tag.findById(tagId).then(tag => {
                if (tag) {
                    tag.movies.remove(this.id);
                    tag.save();
                }
            });
        }
    },
    deleteTag: function (tagId) {
        this.tags.remove(tagId);
        this.save();
    }
});

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;