var Movie = require('../models/movie');
var Comment = require('../models/comment');
var Category = require('../models/category');
var _ = require('underscore');
var fs = require('fs')
var path = require('path')
//detail page
exports.detail = function(req, res){
    var id = req.params.id;

    Movie.update({_id: id}, {$inc: {pv: 1}}, function(err) {
        if(err) {
            console.log(err)
        }
    })
    
    Movie.findById(id, function(err, movie) {
        Comment
            .find({movie: id}) //找到对电影评论过的数据
            .populate('from', 'name')  //找到from 中objectId 在表中找到name
            .populate('reply.from reply.to', 'name')
            .exec(function(err, comments) {
                //console.log("comments:")
                console.log(comments)
                res.render('detail', {
                    title: movie.title,
                    movie: movie,
                    comments: comments
                })
            })
    })
    /*res.render('detail', {
        title: 'imooc 详情页',
        movie: {
            doctor:'何塞.帕迪利亚',
            country: '美国',
            title: '机械战警',
            year: 2014,
            poster: 'http://r3.ykimg.com/05160000530EEB63675839160D0B79D5',
            language: '英语',
            flash: 'http://player.youku.com/kimg.com/05160000530EEB63675839160D0B79D5',
            summary: '《机械战警》（2014）是由何塞·帕迪里亚执导，乔尔·金纳曼、塞缪尔·杰克逊、加里·奥德曼等主演的一部科幻' +
                 '电影改编自1987年保罗.范霍文执导的同名电影.影片于2014年2月12日在美国上映,2014年2月28日在中国大陆上映.' +
                ' 影片的故事背景与原版基本相同,故事设定在2028年的底特律,男主角亚历克斯.墨菲是一名正直的警察,被坏人安装在车' +
                '  上的炸弹炸成重伤,为了救他,OmniCorp公司将他改造成了生化机器人机器战警,代表着美国司法的未来'
        }*/
}

//admin new page
exports.new = function(req, res){
    Category.find({}, function(err, categories) {
        res.render('admin', {
            title: 'imooc 后台录入页',
            categories: categories,
            movie: {}
        })       
    })
}

//admin update movie
exports.update = function(req, res) {
    var id = req.params.id;

    if(id) {        
        Movie.findById(id, function(err, movie) {
            Category.find({}, function(err, categories) {
                res.render('admin', {
                    title: 'imooc 后台更新页',
                    movie: movie,
                    categories: categories
                })
            })
        })
    }
}

//admin poster

exports.savePoster = function(req, res, next) {
    var posterData = req.files.uploadPoster;
    var filePath = posterData.path;
    var originalFilename = posterData.originalFilename;

    //console.log(req.files)
    if (originalFilename) {
        fs.readFile(filePath, function(err, data) {
            var timestamp = Date.now();
            var type = posterData.type.split('/')[1];
            var poster = timestamp + '.' + type;
            var newPath = path.join(__dirname, '../../', '/public/upload/' + poster);

            fs.writeFile(newPath, data, function(err) {
                req.poster = poster
                next()
            })
        })
    }
    else{
        next();
    }
}

//admin post movie
exports.save = function(req, res){
    var id = req.body.movie._id;
    var movieObj = req.body.movie;
    var _movie;

    if(req.poster){
        movieObj.poster = req.poster;
    }

    if (id) {
        Movie.findById(id, function(err, movie) {
            if(err) {
                console.log(err)
            }

            _movie = _.extend(movie, movieObj);
            _movie.save( function(err, movie) {
                if(err){
                    console.log(err)
                }

                res.redirect('/movie/' + movie._id)
            })
        })
    }
    else{
        _movie = new Movie(movieObj)

        var categoryId = movieObj.category
        var categoryName = movieObj.categoryName
        
        console.log(movieObj)
        _movie.save( function(err, movie) {
            if(err){
                console.log(err)
            }

            if(categoryId) {
                Category.findById(categoryId, function(err, category){
                    
                    category.movies.push(movie._id)
                
                    category.save(function(err, category){
                        
                        res.redirect('/movie/' + movie._id)
                    })
                })               
            }
            else if (categoryName) {
                var category = new Category({
                    name: categoryName,
                    movies: [movie._id]
                })

                category.save(function(err, category){  
                    movie.category = category._id;
                    movie.save (function(err, movie){
                        res.redirect('/movie/' + movie._id)
                    })                 
                })
            }
        })
    }
}

//list page
exports.list = function(req, res){
    Movie.fetch(function(err, movies){
        if(err) {
            console.log(err)
        }

        res.render('list', {
            title: 'imooc 首页',
            movies: movies
            /*[{
             title: '机械战警',
             _id: 1,
             doctor:'何塞.帕迪利亚',
             country: '美国',
             year: 2014,
             poster: 'http://r3.ykimg.com/05160000530EEB63675839160D0B79D5',
             language: '英语',
             flash: 'http://player.youku.com/kimg.com/05160000530EEB63675839160D0B79D5'

             }]*/
        })
    })
}

//list delete movie
exports.del = function(req, res) {
    var id = req.query.id;

    if(id) {
        Movie.remove({_id: id}, function(err, movie) {
            if(err){
                console.log(err)
                res.json({success: 0})
            }
            else{
                res.json({success: 1})
            }
        })
    }
}