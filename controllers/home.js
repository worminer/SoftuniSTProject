const config = require('./../config/config');
const mongoose = require('mongoose');
const Movie = mongoose.model('Movie');
const User = mongoose.model('User');
const Category = mongoose.model('Category');
const paginate = require('express-paginate');

module.exports = {
    index: (req, res) => {
        Category.find({}).sort('name').then(categories => {
            Movie.find({}).limit(config.homeConfig.postLimit).populate('category').populate('author').populate('tags').then(movies => {

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
    listCategoryMovies: (req, res) => {
        let categoryId = req.params.id;
        let currentPage = parseInt(req.params.page);
        if(isNaN(currentPage)){
            currentPage = 1;
        }
        Category.find({}).sort('name').then(categories => {
            Category.findById(categoryId).then(category => {
                Movie.paginate({category:categoryId},{page: currentPage, limit: config.categoriesConfig.postLimit}).then(pagesInfo => {
                    let populateQuery = [
                        {path:'author', select: 'fullName'},
                        {path: 'category', select: 'name'},
                        {path: 'tags', select: 'name'}
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

                        let pageArr = []

                        for (let i = 1; i <= pagesInfo.pages; i++) {
                            pageArr.push(i)
                        }


                        res.render('home/movies', {
                            subTitle: 'List of all movies in ' + category.name + ' category!', // subTitle
                            movies: pagesInfo.docs, // the movies..
                            categoryId: categoryId, // category id..
                            categories: categories, // all the categories for the left menu
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
        //Category.findById(id).populate('movies').then(category => {
        //     User.populate(category.movies, {path: 'author'}, (err) => {
        //         if (err) {
        //             console.log('home - listCategoryMovies -> populate authors')
        //             console.log(err);
        //         }
        //         Movie.populate(category.movies,{path: 'tags'},(err) =>{
        //             if (err) {
        //                 console.log('home - listCategoryMovies -> tags')
        //                 console.log(err);
        //             }
        //             Category.find({}).then(categories => {
        //                 res.render('home/movies', {
        //                     subTitle: 'List of all movies in ' + category.name + ' category!',
        //                     movies: category.movies,
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