const Movie = require('mongoose').model('Movie');
const Comment = require('mongoose').model('Comment');

module.exports={
    commentGet:(req,res)=>{
        let id=req.params.id;

        Movie.findById(id).then(movie=>{
            res.render('comment/create',movie);
        })
    },

    commentPost:(req,res)=>{
        let commentArgs=req.body;

        let id=commentArgs.about;//we take from the view form about field which show movie id,the view has field from type about which is the same like on the model field about

        Movie.findById(id).populate('comments').then(movie => {
            let commentArgs=req.body;
            Comment.create(commentArgs).then(comment => {
                comment.prepareInsert();
                movie.save();
                res.redirect(`/movie/details/${id}`);
            })
        })
    },

    allGet:(req,res)=>{
        let id=req.params.id;

        Movie.findById(id).populate('author tags comments').then(movie=>{
            Comment.find({'about':id}).populate('author').then(comments=>{
                res.render('comment/all',{movie: movie,comments: comments});
            })
        })
    }
};