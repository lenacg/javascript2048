<template>
    <div class="content">
        <Row >
			<Col span="8" style="text-align: center;">
				<div class="board"  tabIndex="1" >
				    <div v-for="(r_item,r_index) in board.cells" :key="'1'+r_index">
				        <cell v-for="(c_item,c_index) in r_item" :key="c_index"></cell>
				    </div>
				    <tile-view v-for="(tile,index) in tiles" :tile="tile" :key="'2'+index">
				    </tile-view>
				    <game-end-overlay v-on:toupload="upPoint" :board="board" :onrestart="onRestart"></game-end-overlay>
				</div>
			</Col>
			
			<Col span="8" class="currentPoint">
				<div style="background: #808695;width: 400px; height: 400px; color: white;">
					<div style="padding: 10px 20px;font-size:30px">当前得分：</div>
					<span style="padding: 10px 20px;font-size:30px">{{player.point}}</span>
				</div>
			</Col>
			<Col span="8">
				<Tabs value="name1">
					<TabPane label="个人排行" name="name1">
						<Card style="width: 270px;">
							<p slot="title">
								<Icon type="md-contact" />
								{{player.name}}
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
						
					</TabPane>
					<TabPane label="标签二" name="name2">标签二的内容</TabPane>
					<TabPane label="标签三" name="name3">标签三的内容</TabPane>
				</Tabs>
			</Col>
        </Row>
		
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
			  isLogin:true,
			  pointList:[],
			  player:{
				  name:'',
				  point:0
			  },
              board:new Board()
          }
        },
        mounted(){
            window.addEventListener('keydown', this.handleKeyDown.bind(this));
			this.getName();
        },
        beforeDestroy(){
            window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        },
        computed:{
          tiles(){
              return this.board.tiles
                      .filter(tile => tile.value != 0)
          }
        },
        methods:{
            handleKeyDown(event){
                if (this.board.hasWon()) {
                    return;
                }
                if (event.keyCode >= 37 && event.keyCode <= 40) {
                    event.preventDefault();
                    var direction = event.keyCode - 37;
                    this.board.move(direction)
                }
            },
            onRestart(){
                this.board = new Board()
            },
			getName(){
				this.$axios.get('/getName').then((response)=>{
					var data = response.data;
					if(data.name === ''){
						this.isLogin = false;
						this.player.name = '点击登录'
						return;
					}
					this.player.name = data.name;
					this.getPointList(this.player.name);
					this.board.players = this.player
				})
			},
			logout(){
				this.$axios.get('/logout').then((response)=>{
					var data = response.data;
					
				})
			},
			getPointList(name){
				//console.log("name"+name);
				this.$axios.post('/getPointList',{name:name}).then((response)=>{
					var data = response.data;
					this.pointList = data;
				})
			},
			upPoint(){
				if(this.player.name === '点击登录')
					return;
				this.$axios.post('/upPoint',{name:this.board.players.name,point:this.board.players.point}).then((response)=>{
					var data = response.data;
					//this.pointList = data;
					this.pointList.push({point:data.point});
					this.pointList.sort(function(a,b){
						return b.point-a.point;
					})
					this.player.point = 0;
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
