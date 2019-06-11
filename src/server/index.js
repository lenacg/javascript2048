import express from 'express'
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import webpack from 'webpack'
import socketio from 'socket.io'
import {connection} from './DB'
//import Board from '../client/board'
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

// 设置监听端口
const SERVER_PORT = 4000
const server = app.listen(SERVER_PORT, () => {
  console.info(`服务已经启动，监听端口${SERVER_PORT}`)
})

// Setup socket.io
const io = socketio(server).of('/game');

var player = {};
//const board = new Board()
// Listen for socket.io connections
io.on('connection',socket=>{
	console.log('Link start!-------------------------------------');
	socket.on('login',function(msg){
		console.log("msg"+msg+"-----------------------------------------");
		if(!(msg in player)){
			socket.playerName = msg;
			player[msg]=0;
			
		}
		io.emit('current',{players:player});
	})
	socket.on('curPoint',function(data){
		console.log("data:"+JSON.stringify(data)+"-----------------------------------------");
		var name = data.name;
		var point = data.point;
		player[name] = point;
		io.emit('current',{players:player})
	})
	socket.on('sendMsg',function(data){
		console.log("text:"+JSON.stringify(data)+"-----------------------------------------");
		io.emit('showMsg',{message:data});
	})
	socket.on('allRank',function(data){
		console.log("rank:"+JSON.stringify(data)+"-----------------------------------------");
		io.emit('updateRank',data);
	})
	socket.on('disconnect',function(data){
		console.log("disccccccc"+socket.playerName+"--------------")
		delete player[socket.playerName];
		io.emit('out',{players:player});
	})
	
})

app.get('/', function (req, res) {
	
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

app.get('/getAllRank',function(req,res){
	var sql='SELECT point,p.name FROM record r LEFT JOIN player p ON r.player_id=p.player_id WHERE point>= \
			(SELECT MAX(d.point) FROM record d WHERE d.player_id = r.player_id) ORDER BY point desc';
	connection.query(sql,function(err,result){
		if(err){
		  console.log('[SELECT ERROR] - ',err.message);
		  return;
		}
		console.log(result);
		res.end(JSON.stringify(result));
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


export default app
