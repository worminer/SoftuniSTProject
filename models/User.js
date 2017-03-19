const mongoose = require('mongoose');
const Role = require('mongoose').model('Role');
const encryption = require('./../utilities/encryption');

let userSchema = mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        passwordHash: {type: String, required: true},
        fullName: {type: String, required: true},
        avatar: {type: String, required: false},
        movies: {type: [mongoose.Schema.Types.ObjectId], ref: 'Movie'},
        roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
        comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
        salt: {type: String, required: true}
    }
);

userSchema.method({
    authenticate: function (password) {
        let inputPasswordHash = encryption.hashPassword(password, this.salt);
        let isSamePasswordHash = inputPasswordHash === this.passwordHash;

        return isSamePasswordHash;
    },
    isAuthor: function (movie) {
        if (!movie) {
            return false;
        }

        let isAuthor = movie.added_by.equals(this.id);
        return isAuthor;
    },
    isInRole: function (roleName) {
        return Role.findOne({name: roleName}).then(role => {
            if (!role) {
                return false;
            }

            let isInRole = this.roles.indexOf(role.id) !== -1;
            return isInRole;
        })
    },
    prepareDelete: function () {
        for (let role of this.roles) {
            Role.findById(role).then(role => {
                role.users.remove(this.id);
                role.save();
            })
        }

        let Comment = mongoose.model('Comment');
        for (let i = 0; i < this.comments.length; i++) {
            let comment = this.comments[i];
            Comment.findById(comment).then(comment => {
                if (comment) {
                    comment.remove(this.id);
                    comment.save();
                }
            })
        }

        let Movie = mongoose.model('Movie');
        for (let movie of this.movies) {
            Movie.findById(movie).then(movie => {
                movie.prepareDelete();
                movie.remove();
            })
        }
    },
    prepareInsert: function () {
        for (let role of this.roles) {
            Role.findById(role).then(role => {
                role.users.push(this.id);
                role.save();
            })
        }
    }
});

userSchema.set('versionKey', false);

const User = mongoose.model('User', userSchema);
module.exports = User;

module.exports.seedAdmin = () => {
    let email = 'admin@softuni.bg';
    User.findOne({email: email}).then(admin => {
        if (!admin) {
            Role.findOne({name: 'Admin'}).then(role => {
                let salt = encryption.generateSalt();
                let passwordHash = encryption.hashPassword('admin', salt);

                let roles = [];
                roles.push(role.id);

                let user = {
                    email: email,
                    passwordHash: passwordHash,
                    fullName: 'Admin',
                    comments: [],
                    movies: [],
                    salt: salt,
                    roles: roles,
                    avatar: ''
                };

                User.create(user).then(user => {
                    role.users.push(user.id);
                    role.save(err => {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log('Admin seeded successfully');
                        }
                    })
                })
            })
        }
    })
};