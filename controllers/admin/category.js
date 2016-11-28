const Category = require('mongoose').model('Category');

module.exports = {
    all: (req, res) => {
        Category.find({}).then(categories => {
            res.render('admin/category/all', {categories: categories});
        })
    },

    createGet: (req, res) => {
        res.render('admin/category/create')
    },

    createPost: (req, res) => {
        let categoryArgs = req.body;

        if (!categoryArgs) {
            let errorMsg = 'Category can not be null';
            categoryArgs.error = errorMsg;
            res.render('admin/category/create', categoryArgs);
        } else {
            Category.create(categoryArgs).then(category => {
                res.redirect('/admin/category/all');
            })
        }
    },

    editGet: (req, res) => {
        let id = req.params.id;

        Category.findById(id).then(category => {
            res.render('admin/category/edit', {category: category});
        })
    },

    editPost: (req, res) => {
        let id = req.params.id;

        let editArgs = req.body;

        if (!editArgs.name) {
            let errorMsg = 'Category can not be empty';

            Category.findById(id).then(category => {
                res.render('admin/category/edit', {category: category, error: errorMsg});
            });
        } else {
            Category.findById(id).then(category => {
                category.prepareDelete();
                category.save();
            });

            Category.findOneAndUpdate({_id: id}, {name: editArgs.name}).then(category => {
                res.redirect('/admin/category/all');
            })
        }
    },

    deleteGet: (req, res) => {
        let id = req.params.id;

        Category.findById(id).then(category => {
            res.render('admin/category/delete', {category: category});
        })
    },

    deletePost: (req, res) => {
        let id = req.params.id;

        Category.findOneAndRemove({_id: id}).then(category => {
            category.prepareDelete();
            res.redirect('/admin/category/all');
        });
    }
};