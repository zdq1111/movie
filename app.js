/**
 * Created by lenovo on 2015/4/2.
 */
var express = require('express');
var path = require('path');  //告诉express 请求样式和脚本的时候去查找
var mongoose = require('mongoose');

var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var app = express();

var dbUrl = "mongodb://localhost/imooc";
mongoose.connect(dbUrl);
//mongoose.connect('mongodb://localhost/imooc') ;//本地数据库

app.set('views', './app/views/pages');  //更改视图的默认目录
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({extended:true}));   //将表单数据格式化

var session = require('express-session'); //如果要使用session，需要单独包含这个模块
var cookieParser = require('cookie-parser'); //如果要使用cookie，需要显式包含这个模块
var mongoStore = require("connect-mongo")(session); //express4 的写法详见参考connect-mongo API
var logger = require('morgan');
var multipart = require('connect-multiparty');

app.use(cookieParser())  //session依赖这个中间件
app.use(multipart())  //处理enctype中表单类型的中间件
app.use(session({   //会话信息
    name: "zz",
    secret: "imooc",
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({
        url: dbUrl,
        auto_reconnect: true,//issue 推荐解决方法
        collection: "sessions"
    })
}))

if('development' === app.get('env')) {
    app.set('showStackError', true);
    app.use(logger(':method :url :status'))
    app.locals.pretty = true;
    mongoose.set('debug', true);
}

require("./config/routes")(app);

app.use(express.static(path.join(__dirname, 'public')));  //静态资源的获取 当前目录
app.locals.moment = require('moment');
app.listen(port);


console.log('imooc started on port ' + port);








