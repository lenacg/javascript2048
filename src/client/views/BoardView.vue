<template>
	
    <div class="content">
		<Row type="flex" justify="center"  >
			<Col :xl="12" :sm="24" :xs="24">
				<div class="gamebody" style="text-align: center;">
					<Row>
						<Col span="12">
							<span class="head-left">
								{{board.players.point}}
							</span>
						</Col>
						<Col span="12">
							<span class="head-right">
								Best
								{{myBest}}	
							</span>	
						</Col>
					</Row>
			
					<div class="gcontent" style="text-align: center;">
						<div class="board"  tabIndex="1" style="margin:0 auto"  id="board">
							<div v-for="(r_item,r_index) in board.cells" :key="'1'+r_index">
								<cell v-for="(c_item,c_index) in r_item" :key="c_index"></cell>
							</div>
							<tile-view v-for="(tile,index) in tiles" :tile="tile" :key="'2'+index">
							</tile-view>
							<game-end-overlay v-on:toupload="upPoint" :board="board" :onrestart="onRestart"></game-end-overlay>
						</div>
					</div>
					
					<span class="head-bottom" @click="onRestart()">
						Restart
					</span>
					
				</div>
			</Col>
			<Col :xl="6" :sm="12" :xs="12">
				<Card style="width: 80%;margin:0 auto;">
					<p slot="title">
						<Icon type="md-contact" />
						{{board.players.name}}
					</p>
					<a v-show="isLogin" href="http://localhost:4000/" slot="extra" @click="logout()">
						<Icon type="ios-loop-strong"></Icon>
						Logout
					</a>
					<ul style="list-style-type:none">
						<li v-for="item in pointList">
							<span class="mypoint">{{item.point}}</span>
						</li>
					</ul>
				</Card>
			</Col>
			<Col :xl="6" :sm="12" :xs="12">
				<Card style="width: 80%;margin:0 auto;">
					<p slot="title">
						总排行  Rank:{{myRank}}
					</p>
					<ul style="list-style-type:none">
						<li v-for="(item,index) in allRank>50?allRank.slice(0,50):allRank">
							<span class="mypoint">{{index+1}}  {{item.name}}</span>
							<span class="mypoint" style="float: right;">{{item.point}}</span>
						</li>
					</ul>
				</Card>
			</Col>
					
		</Row>
		<Tabs value="name3">
			<TabPane label="在线玩家" name="name3">
				<Row style="background:#eee;padding: 20px;border-radius: 20px;">
					<Col span="8">
						<div v-for="(value,key) in playerList" style="font-size: 20px;">{{key}}:{{value}}</div>
					</Col>
					<Col span="16">
						<Card style="width: 80%;margin-left: 0px;">
							<ul style="list-style-type:none">
								<li v-for="item in msgList">
									<span class="msgPart">{{item.time}} {{item.name}}: {{item.msg}}</span>
								</li>
							</ul>
						</Card>
						<Input placeholder="开始聊天吧..." v-model="text" id="msg" style="width: 80%"> 
							<Button slot="append" @click="sendMsg(board.players.name,text)" icon="md-arrow-round-back"></Button>
						</Input>
					</Col>
				</Row>
				
			</TabPane>
		</Tabs>

    </div>
    
</template>

<script>
    import Cell from '../components/Cell.vue'
    import TileView from '../components/TileView.vue'
    import GameEndOverlay from '../components/GameEndOverlay.vue'
    import Board from '../board'
    export default {
        data(){
          return {
			  msgList:[],
			  text:"",
			  playerList:{},
			  isLogin:true,
			  pointList:[],
			  myBest:0,
			  allRank:[],
			  myRank:0,
              board:new Board()
          }
        },
        mounted(){
			this.$socket.removeAllListeners();
			var game = document.getElementById('board');
			window.addEventListener('keydown',this.enterToSend.bind(this))
			var startX;
			var startY;
			var endX;
			var endY;
			var direction;
			game.addEventListener('touchstart',function(event){
				event.preventDefault();
				startX = event.changedTouches[0].pageX;
				startY = event.changedTouches[0].pageY;
// 				startX = event.pageX;
// 				startY = event.pageY;		
			}.bind(this),false)

			game.addEventListener("touchend",function(event){
				event.preventDefault();
				endX = event.changedTouches[0].pageX;
				endY = event.changedTouches[0].pageY;
				if((endY-startY)>60&&Math.abs((endY-startY)/(endX-startX))>1){
					//down
					direction=3;
				}
				else if(endY-startY<-60&&Math.abs((endY-startY)/(endX-startX))>1){
					//up
					direction=1;
				}
				else if((endX-startX)>60&&Math.abs((endY-startY)/(endX-startX))<1){
					//right
					direction=2;
				}
				else if((endX-startX)<-60&&Math.abs((endY-startY)/(endX-startX))<1){
					//left
					direction=0;
				}else{
					direction=-1;
				}
				
				if(direction!==-1){
					this.board.move(direction)
					if(this.isLogin){
						this.$socket.emit('curPoint',{name:this.board.players.name,point:this.board.players.point});
					}
				}
			}.bind(this),false)
            window.addEventListener('keydown', this.handleKeyDown.bind(this));
			this.init();
        },
        beforeDestroy(){
			//clearInterval(this.timer);
            window.removeEventListener('keydown', this.handleKeyDown.bind(this));
			window.removeEventListener('keydown', this.enterToSend.bind(this));
        },
        computed:{
          tiles(){
              return this.board.tiles
                      .filter(tile => tile.value != 0)
          }
        },
        methods:{
			enterToSend(event){
				if(event.keyCode === 13&&this.text.trim().length!==0){
					this.sendMsg(this.board.players.name,this.text);
				}
			},
			sendMsg(name,text){
				//this.$socket.removeAllListeners();
				this.$socket.emit('sendMsg',{name:name,msg:text});
				this.text = '';
			},
			formatDate(date){
				var month = date.getMonth()+1;
				month = month<10?'0'+month : month;
				var day = date.getDate()<10?'0'+date.getDate():date.getDate();
				var hour = date.getHours()<10?'0'+date.getHours():date.getHours();
				var min = date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes();
				var sec = date.getSeconds()<10?'0'+date.getSeconds():date.getSeconds();
				var strDate = hour+':'+min+':'+sec;
				return strDate;
			},
            handleKeyDown(event){
                if (this.board.hasWon()) {
                    return;
                }
                if (event.keyCode >= 37 && event.keyCode <= 40) {
                    event.preventDefault();
                    var direction = event.keyCode - 37;
                    this.board.move(direction)
					if(this.isLogin){
						this.$socket.emit('curPoint',{name:this.board.players.name,point:this.board.players.point});
					}
					
                }
            },
            onRestart(){
                this.board = new Board()
				this.init();
            },
			init(){
				this.$axios.get('/getName').then((response)=>{
					var data = response.data;
					if(data.name === ''){
						this.isLogin = false;
						this.board.players.name = '点击登录'
						return;
					}
					this.board.players.name = data.name;
					this.sendMsg(data.name,"");
					this.$socket.emit('login',this.board.players.name);
					this.$socket.removeAllListeners();
					this.$socket.on('current',function(data){
						console.log("data:"+JSON.stringify(data)+"---------------------");
						this.getPlayerList(data);
					}.bind(this))
					this.$socket.on('out',function(data){
						console.log("data:"+JSON.stringify(data)+"---------------------");
						this.getPlayerList(data);
					}.bind(this))
					if(this.isLogin){
						this.$socket.emit('curPoint',{name:this.board.players.name,point:this.board.players.point});
					}
					this.getPointList(this.board.players.name);
					
					this.$socket.on('showMsg',function(data){
						if(data.message.msg!==''){
							console.log("msg:"+JSON.stringify(data)+"---------------------");
							var message = data.message;
							var date = new Date();
							var strDate = this.formatDate(date);
							message.time = strDate;
							this.msgList.push(message);
							console.log(this.msgList);
						}
					}.bind(this));
					if(this.isLogin){
						this.getAllRank();
					}
				})
			},
			getPlayerList(data){
				this.playerList = data.players;
				//console.log("get:"+this.board.playersList);
			},
			logout(){
				this.$axios.get('/logout').then((response)=>{
					var data = response.data;
					
				})
			},
			getAllRank(){
				this.$axios.get('/getAllRank').then((response)=>{
					var data = response.data;
					console.log(data)
					this.allRank = data;
					this.getMyRank();
					this.$socket.emit('allRank',this.allRank);
					this.$socket.on('updateRank',function(data){
						this.allRank = data;
					}.bind(this))
				})
			},
			getMyRank(){
				for(var i =0;i<this.allRank.length;i++){
					if(this.allRank[i].name === this.board.players.name){
						this.myRank = i+1;
						return;
					}
				}
			},
			getPointList(name){
				//console.log("name"+name);
				if(localStorage.getItem(this.board.players.name)){
					this.pointList = JSON.parse(localStorage.getItem(this.board.players.name));
					this.myBest = this.pointList[0].point;
					//console.log("has");
				}else{
					this.$axios.post('/getPointList',{name:name}).then((response)=>{
						var data = response.data;
						this.pointList = data;
						this.myBest = data[0].point;
						localStorage.setItem(this.board.players.name,JSON.stringify(this.pointList));
					})
				}
			},
			upPoint(){
				if(!this.isLogin)
					return;
				this.pointList.push({point:this.board.players.point});
				this.pointList.sort(function(a,b){
					return b.point-a.point;
				})
				localStorage.setItem(this.board.players.name,JSON.stringify(this.pointList));
				
				this.$axios.post('/upPoint',{name:this.board.players.name,point:this.board.players.point}).then((response)=>{
					var data = response.data;
// 					this.pointList.push({point:data.point});
// 					this.pointList.sort(function(a,b){
// 						return b.point-a.point;
// 					})
					
					this.board.players.point = 0;
					this.myBest = this.pointList[0].point;
					this.getAllRank();
					//this.$socket.removeAllListeners();
					this.$socket.emit('curPoint',{name:this.board.players.name,point:this.board.players.point});
					// this.board.players = this.board.players
				})
			}
        },
        components: {
            Cell,
            TileView,
            GameEndOverlay,
        }
    }
</script>
