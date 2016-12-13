const homeController = require('./../controllers/home');
const adminController = require('./../controllers/admin/admin');
const userController = require('./../controllers/user');
const movieController = require('./../controllers/movie');
const tagController = require('./../controllers/tag');
var paginate = require('express-paginate');

module.exports = (app) => {
    app.use(paginate.middleware(10, 50));
    app.get('/', homeController.index);

    app.get('/category/:id', homeController.listCategoryMovies);
    app.get('/category/:id/:page', homeController.listCategoryMovies);

    app.get('/user/register', userController.registerGet);
    app.post('/user/register', userController.registerPost);

    app.get('/user/login', userController.loginGet);
    app.post('/user/login', userController.loginPost);

    app.get('/user/logout', userController.logout);

    app.get('/tag/:name', tagController.lisMoviesByTag);
    app.get('/tag/:name/:page', tagController.lisMoviesByTag);

    app.get('/movie/details/:id', movieController.details);



    app.get('/home/about',homeController.about);

    app.get('/home/contact',homeController.contact);

    app.use((req, res, next) => {
        if (req.isAuthenticated()) {
            req.user.isInRole('Admin').then(isAdmin => {
                if (isAdmin) {
                    next();
                } else {
                    res.redirect('/');
                }
            })
        } else {
            res.redirect('/user/login');
        }
    });
    app.get('/movie/create', movieController.createGet);
    app.post('/movie/create', movieController.createPost);

    app.get('/movie/edit/:id', movieController.editGet);
    app.post('/movie/edit/:id', movieController.editPost);

    app.get('/movie/delete/:id', movieController.deleteGet);
    app.post('/movie/delete/:id', movieController.deletePost);

    app.get('/admin/user/all', adminController.user.all);

    app.get('/admin/user/edit/:id', adminController.user.editGet);
    app.post('/admin/user/edit/:id', adminController.user.editPost);

    app.get('/admin/user/delete/:id', adminController.user.deleteGet);
    app.post('/admin/user/delete/:id', adminController.user.deletePost);

    app.get('/admin/category/all', adminController.category.all);

    app.get('/admin/category/create', adminController.category.createGet);
    app.post('/admin/category/create', adminController.category.createPost);

    app.get('/admin/category/edit/:id', adminController.category.editGet);
    app.post('/admin/category/edit/:id', adminController.category.editPost);

    app.get('/admin/category/delete/:id', adminController.category.deleteGet);
    app.post('/admin/category/delete/:id', adminController.category.deletePost);
};