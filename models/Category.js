const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

let categorySchema = mongoose.Schema({
    name: {type: String, required: true, unique: true},
    movies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

categorySchema.method({
    prepareDelete: function () {
        let Movie = mongoose.model('Movie');
        for (let movie of this.movies) {
            Movie.findById(movie).then(movie => {
                movie.prepareDelete();
                movie.remove();
            })
        }
    }
});
categorySchema.plugin(mongoosePaginate);

categorySchema.set('versionKey', false);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;

module.exports.seedCategories = () => {
    categorySeeds = [
        "Action",
        "Comedy",
        "Family",
        "History",
        "Mystery",
        "Sci-Fi",
        "War",
        "Western",
        "Adventure",
        "Crime",
        "Fantasy",
        "Horror",
        "Thriller"
    ];
    for (let i = 0; i < categorySeeds.length; i++) {
        let currentCategory = categorySeeds[i];
        Category.findOne({name: currentCategory}).then(category => {
            if (!category) {
                let categoryData = {
                    name: currentCategory,
                    movies: []
                };

                Category.create(categoryData).then(category => {
                  console.log(`Category -> "${currentCategory}" seeded!`);
                })
            }
        })
    }
}