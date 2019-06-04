import express from 'express'
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import webpack from 'webpack'

import {connection} from './DB'
// 引入history模块
import history from 'connect-history-api-fallback'

// 正式环境时，下面两个模块不需要引入
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

import config from '../../build/webpack.dev.conf'

const app = express()

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// 引入history模式让浏览器进行前端路由页面跳转
app.use(history())
// connection.connect();
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())

const compiler = webpack(config)
//webpack 中间件
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: { colors: true }
}))

app.use(webpackHotMiddleware(compiler))

app.use(express.static(path.join(__dirname, 'views')))
app.get('/', function (req, res) {
  //res.sendFile('./views/index.html')
//	res.redirect('/game')
// 	if(req.cookies.name){
// 		res.redirect('/game')
// 	}
})

app.get('/getName',function(req,res){
	var name = req.cookies.name;
	var response = {
		name:name
	}
	res.end(JSON.stringify(response));
})

app.get('/logout',function(req,res){
	res.cookie('name','');
	var name = req.cookies.name;
	var response = {
		name:name
	}
	res.end(JSON.stringify(response));
})

app.post('/checklogin', urlencodedParser, function (req, res){
	var name = req.body.name;
	var password = req.body.password;
	var response={}
	var sql = 'SELECT * FROM player WHERE name='+"'"+name+"'";
	connection.query(sql,function (err, result) {
	    if(err){
	      console.log('[SELECT ERROR] - ',err.message);
	      return;
	    }
		console.log(result);
		if(result.length!==0){
			console.log(result[0].password)
			if(password === result[0].password){
				//console.log("yes");
				response = {code:0};
				res.cookie('name',name);
				res.end(JSON.stringify(response));
			}else{
				//console.log("no1");
				response = {code:1};
				res.end(JSON.stringify(response));
			}
		}else{
			//console.log("no2");
			response = {code:-1};
			res.end(JSON.stringify(response));
		}
	});
})

app.post('/reg',urlencodedParser,function(req,res){
	var name = req.body.name;
	var password = req.body.password;
	var response = {};
	var sql = 'SELECT * FROM player WHERE name='+"'"+name+"'";
	connection.query(sql,function(err,result){
		if(err){
		  console.log('[SELECT ERROR] - ',err.message);
		  return;
		}
		if(result.length!==0){
			response = {code:1};
			res.end(JSON.stringify(response));
		}else{
			var sql1 = 'INSERT INTO player(name,password) VALUES('+"'"+name+"'"+','+"'"+password+"'"+')';
			
			connection.query(sql1,function (err1, result1) {
			    if(err1){
			      console.log('[INSERT ERROR] - ',err1.message);
			      return;
			    }
				console.log(result1);
				response={code:0};
				res.end(JSON.stringify(response))
			});
			
		}
	})
})

app.post('/getPointList', urlencodedParser, function (req, res){
	var name = req.body.name;
	var sql = 'SELECT (record.point) FROM record,player WHERE record.player_id = player.player_id AND player.name='+"'"+name+"' ORDER BY record.point DESC";
	connection.query(sql,function (err, result) {
	    if(err){
	      console.log('[SELECT ERROR] - ',err.message);
	      return;
	    }
		console.log(result);
		res.end(JSON.stringify(result))
	});
	
})

app.post('/upPoint', urlencodedParser, function (req, res){
	var name = req.body.name;
	var point = req.body.point;
	var sql = 'INSERT INTO record(point,player_id) VALUE('+point+', \
	(SELECT player_id FROM player WHERE name='+"'"+name+"'"+') \
)';
	connection.query(sql,function (err, result) {
	    if(err){
	      console.log('[INSERT ERROR] - ',err.message);
	      return;
	    }
		console.log(result);
		var response = {point:point}
		res.end(JSON.stringify(response))
	});
	
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  console.log(err)
  res.send(err.message)
})

// 设置监听端口
const SERVER_PORT = 4000
app.listen(SERVER_PORT, () => {
  console.info(`服务已经启动，监听端口${SERVER_PORT}`)
})

export default app
