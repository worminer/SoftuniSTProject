const config = require('./../config/config');
const mongoose = require('mongoose');
const Movie = mongoose.model('Movie');
const User = mongoose.model('User');
const Genre = mongoose.model('Genre');
const paginate = require('express-paginate');

module.exports = {
    index: (req, res) => {
        Genre.find({}).sort('name').then(categories => {
            let populateQuery = [
                {path: 'added_by',   select: 'fullName'},
                {path: 'categories', select: 'name'},
                {path: 'tags',     select: 'name'}
            ];
            Movie.find({}).limit(config.homeConfig.postLimit).populate(populateQuery).then(movies => {

                res.render('home/index', {
                    subTitle: 'Home',
                    categories: categories,
                    movies:movies
                });
            })
        })
    },
    contact:(req, res) =>{
        res.render('home/contact');
    },
    about:(req, res) =>{
        res.render('home/about');
    },

    listGenreMovies: (req, res) => {
        let genreId = req.params.id;
        let currentPage = parseInt(req.params.page);
        if(isNaN(currentPage)){
            currentPage = 1;
        }

        Genre.find({}).sort('name').then(genre => {
            Genre.findById(genreId).then(genres => {
                // this will is slow quarry
                Movie.paginate({genres:genreId},{page: currentPage, limit: config.categoriesConfig.postLimit}).then(pagesInfo => {
                    //console.log(pagesInfo);
                    let populateQuery = [
                        {path: 'added_by',select: 'fullName'},
                        {path: 'genres',  select: 'name'},
                        {path: 'tags',    select: 'name'}
                    ];

                    Movie.populate(pagesInfo.docs, populateQuery,(err) => {
                        if(err){
                            console.log(err);
                        }

                        // configuring pagination stuff
                        let previousPage = pagesInfo.page - 1;
                        let nextPage = pagesInfo.page + 1;
                        let isOnFistPage = false;
                        let isOnLastPage = false;

                        if(previousPage < 1)
                        {
                            previousPage = 1;
                        }

                        if(nextPage > pagesInfo.pages)
                        {
                          nextPage = pagesInfo.pages;
                        }

                        if(previousPage == pagesInfo.page){
                            isOnFistPage = true;
                        }
                        if(nextPage == pagesInfo.page){
                            isOnLastPage = true;
                        }

                        let pageArr = [];

                        for (let i = 1; i <= pagesInfo.pages; i++) {
                            pageArr.push(i)
                        }


                        res.render('home/movies', {
                            subTitle: 'List of all movie in ' + genres.name + ' category!', // subTitle
                            movies: pagesInfo.docs, // the movie..
                            categoryId: genreId, // category id..
                            categories: genre, // all the categories for the left menu
                            paginationInfo:{                   // all the info needed for pagination
                                totalItems  : pagesInfo.total, // total videos matched
                                itemsLimit  : pagesInfo.limit, // what is the item limit per page
                                currentPage : pagesInfo.page,  // witch is the current page
                                pages       : pagesInfo.pages, // how many pages there are
                                pagesArr    : pageArr,         // array with pages that will be drown as buttons .. this is because handlebars is STUPID!!
                                previousPage : previousPage,   // witch is the previous page
                                nextPage: nextPage,            // witch is the next page
                                isOnFistPage: isOnFistPage,    // is current page the fist page ?
                                isOnLastPage: isOnLastPage     // is current page the last page ?

                            }
                        });
                    });

                })

            });
        });
        //
        //Genre.findById(id).populate('movie').then(category => {
        //     User.populate(category.movie, {path: 'author'}, (err) => {
        //         if (err) {
        //             console.log('home - listGenreMovies -> populate authors')
        //             console.log(err);
        //         }
        //         Movie.populate(category.movie,{path: 'tags'},(err) =>{
        //             if (err) {
        //                 console.log('home - listGenreMovies -> tags')
        //                 console.log(err);
        //             }
        //             Genre.find({}).then(categories => {
        //                 res.render('home/movies', {
        //                     subTitle: 'List of all movie in ' + category.name + ' category!',
        //                     movie: category.movie,
        //                     categories: categories,
        //                 });
        //             })
        //         });
        //
        //
        //     })
        // })
    }
};