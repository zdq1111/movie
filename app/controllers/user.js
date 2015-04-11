var User = require('../models/user');
 
//signup
//showSignup page
exports.showSignup = function(req, res){
    res.render('signup', {
        title: '注册页面',
    })
}

exports.showSignin = function(req, res){
    res.render('signin', {
        title: '登录页面',
    })
}

exports.signup = function(req,res) {
    //var _user = req.body.user;
    var _user = req.body.user;
    //req.param('user'); 封装了下面几种方式 但是不确定拿到的是哪个
    //ex：/user/signup/1111?userid=1112 {userid：1113} 先从路由中拿 没有就拿body里面 再没有从query里面拿
    //'/user/signup/:userid'  var _userid = req.params.userid 路由中
    //'/user/signup/1111?userid=1112' var _userid = req.query.userid
    //ajax post(data) var _userid = req.body.userid
    //console.log(_user);
    User.findOne({name:_user.name},function(err, user){
        if(err){
            console.log(err);
        }
        console.log(user) //如果数据库为空时第次注册返回回来的user为[]空数组，这里有问题
        if(user){
            return res.redirect('/signin')
        }
        else{
            var user =  new User(_user);
            user.save(function(err, user){
                if(err){
                    console.log(err)
                }
                res.redirect('/');
            })            
        }
    })
}

//signin
exports.signin = function(req, res){
    var _user = req.body.user;
    var name = _user.name;
    var password = _user.password;

    User.findOne({name: name},function(err, user) {
        if(err){
            console.log(err);
        }

        if(!user) {
            return res.redirect('/signup');
        }

        user.comparePassword(password, function(err, isMatch) {
            if(err){
                console.log(err);
            }

            if(isMatch) {
                req.session.user = user


                return res.redirect('/')
            }
            else{
                return res.redirect('/signin')
            }
        })
    })
}

//logout
exports.logout = function(req, res) {
    delete req.session.user
    //delete app.locals.user
    res.redirect('/')
}

//userlist page
exports.list = function(req, res){
	/*var user = req.session.user;

	if(!user) {
		return res.redirect('/signin')
	}
	if(user.role > 10) {*/
	    User.fetch(function(err, users){
	        if(err) {
	            console.log(err)
	        }

	        res.render('userlist', {
	            title: 'imooc 用户列表页',
	            users: users
	        })
	    })
    //}
}

//midware for user
exports.signinRequired = function(req, res, next){
	var user = req.session.user;

	if(!user) {
		return res.redirect('/signin')
	}

    next();
}

exports.adminRequired = function(req, res, next){
	var user = req.session.user;
    
    console.log(user)
	if (user.role <= 10) {
		return res.redirect('/signin')
	}

    next();
}