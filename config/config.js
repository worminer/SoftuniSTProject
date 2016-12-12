const path = require('path');

module.exports.env = "development"; // setting the environment

if(this.env == "development") {
    module.exports =
    {
        rootFolder: path.normalize(path.join(__dirname, '/../')), // path to root folder
        connectionString: 'mongodb://localhost:27017/FilmCatalog', // db string
        seedCategories: true, // if enabled will seed categories in db
        titleOptions: {
            siteTitle: "BEMP TV MovieHub", // title to be shown in all pages
            LongTitles: true, // if enabled .. pages will show subTitle as "Title - SubTitle"
            titleSeparator: ' - '
        },

        paginationOptions: { // Global options for the pagination

        },

        homeConfig:{ // config for homeController / index
            postLimit: 5 // limits the posts in the homepage
        },
        categoriesConfig:{ // config for homeController / listCategoryMovies
            postLimit: 1 // limits the posts in the listCategoryMovies
        }
        ,
        tagConfig:{ // config for tagController / lisMoviesByTag
            postLimit: 1 // limits the posts in the lisMoviesByTag
        }

    }
}else if(this.env == "production") {
    module.exports =
        {
        }
}






