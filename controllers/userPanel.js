const User = require('mongoose').model('User');
const Role = require('mongoose').model('Role');
const Comment=require('mongoose').model('Comment');
const encryption = require('./../utilities/encryption');

module.exports={
    commentsAllGet:(req,res) => {
        let userId=req.user.id;

        if(req.user){
            Comment.find({'author':userId}).then(comments=>{
                res.render('userPanel/comments',{comments:comments});
            })
        }else {
            res.redirect('/user/login/');
        }
    },

    editGet: (req,res) => {
        let id=req.params.id;

        Comment.findById(id).then(comment => {
            res.render('userPanel/edit', {comment: comment});
        })
    },

    editPost: (req,res) => {
        let id=req.params.id;
        let commentArgs=req.body;

        Comment.findById(id).then(comment => {
            comment.content=commentArgs.content;

            comment.save((err) => {
                if(err){
                    res.redirect('/');
                }

                res.redirect('/userPanel/comments');
            })
        })
    },

    deleteGet:(req,res) => {
        let id=req.params.id;

        Comment.findById(id).then(comment => {
            res.render('userPanel/delete',{comment:comment})
        });
    },

    deletePost:(req,res) => {
        let id=req.params.id;

        Comment.findOneAndRemove({_id:id}).then(comment => {
            comment.prepareDelete();
            res.redirect('/userPanel/comments');
        })
    },

    changePasswordGet:(req,res) => {
        let userId=req.user.id;

        if(req.user){
            User.findById(userId).then(user => {
                res.render('userPanel/changePassword',{user:user});
            })
        }else{
            res.redirect('/user/login/');
        }
    },

    changePasswordPost:(req,res) => {
        let userId=req.user.id;
        let userArgs=req.body;

        User.findById(userId).then(user => {
            let errorMsg='';
            if(userArgs.password != userArgs.confirmedPassword){
                errorMsg = 'Passwords do not match';
            }

            if(errorMsg){
                userArgs.error = errorMsg;
                res.render('userPanel/changePassword',userArgs);
            }else{
                User.findById(userId).then(user => {
                    if(userArgs.password){
                        let passwordHash = encryption.hashPassword(userArgs.password, user.salt);
                        user.passwordHash = passwordHash;
                    }

                    user.save();
                    res.redirect('/');
                })
            }
        })
    }
};