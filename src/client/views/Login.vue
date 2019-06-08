<template>
	<div>
		<Card v-if="!isReg" style="width:350px;height: 300px;position: fixed;top: 0px;left: 0px;right: 0px;bottom: 0px;margin: auto;">
			<p slot="title">
				玩家登录
			</p>
			<Form ref="formCustom" :model="formCustom" :rules="ruleCustom" style="padding: 20px 20px;">
				<FormItem prop="user">
					<Input type="text" v-model="formCustom.user" placeholder="用户名"></Input>
				</FormItem>
				<FormItem prop="password">
					<Input type="password" v-model="formCustom.password" placeholder="密码"></Input>
				</FormItem>
				<FormItem>
					<Button type="primary" @click="handleSubmit()">登录</Button>
					<Button @click="register()" style="margin-left: 8px">注册</Button>
				</FormItem>
			</Form>
		</Card>
		
		<Card v-else style="width:350px;height: 300px;position: fixed;top: 0px;left: 0px;right: 0px;bottom: 0px;margin: auto;">
			<p slot="title">
				玩家注册
			</p>
			<Form ref="formReg" :model="formReg" :rules="ruleReg" style="padding: 20px 20px;">
				<FormItem prop="user">
					<Input type="text" v-model="formReg.user" placeholder="用户名"></Input>
				</FormItem>
				<FormItem prop="password">
					<Input type="password" v-model="formReg.password" placeholder="密码"></Input>
				</FormItem>
				<FormItem prop="confirm">
					<Input type="password" v-model="formReg.confirm" placeholder="确认密码"></Input>
				</FormItem>
				<FormItem>
					<Button @click="addPlayer()">确认</Button>
					<Button @click="cancel()" style="margin-left: 8px">取消</Button>
				</FormItem>
			</Form>
		</Card>
		
	</div>
</template>

<script>
	export default{
		data(){
			return{
				isReg:false,
				formReg:{
					user:'',
					password:'',
					confirm:''
				},
				ruleReg: {
				    user: [
				        { required: true, message: '请输入用户名', trigger: 'blur' }
				    ],
				    password: [
				        { required: true, message: '请输入密码', trigger: 'blur' }
				    ],
					confirm:[
						{ required: true, message: '请输入确认密码', trigger: 'blur' }
					]
				},
				formCustom: {
                    user: '',
                    password: ''
                },
                ruleCustom: {
                    user: [
                        { required: true, message: '请输入用户名', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' }
                    ]
                }
			}
		},
		methods:{
			register(){
				this.isReg = true;
			},
			addPlayer(){
				var name = this.formReg.user;
				var password = this.formReg.password;
				var confirm = this.formReg.confirm;
				if(password !== confirm){
					this.$Message.error('两次密码输入不一致');
					return;
				}
				this.$axios.post('reg',{name:name,password:password}).then((response)=>{
					var data = response.data;
					if(data.code === 1){
						this.$Message.warning('用户名已被注册');
						return;
					}else{
						this.$Message.success('注册成功');
						this.isReg = false;
					}
				})
			},
			cancel(){
				console.log("cancel")
				this.isReg = false;
			},
			handleSubmit(){
				if(this.formCustom.user === ''||this.formCustom.password === ''){
					return;
				}
				this.$axios.post('checklogin',{name:this.formCustom.user,password:this.formCustom.password}).then((response)=>{
					//console.log("resdata:"+JSON.stringify(response.data));
					var data = response.data;
					if(data.code === 0){
						//this.$socket.emit('login',{name:this.formCustom.user});
						this.$router.push({path:'/game'})
						this.$Notice.open({
							title: '欢迎 '+this.formCustom.user,
							desc: ''
						});
					}else if(data.code === 1){
						this.$Notice.open({
							title: '密码错误',
							desc: ''
						});
					}else if(data.code === -1){
						this.$Notice.open({
							title: '没有该用户',
							desc: ''
						});
					}
				})
			},
			reg(){
				this.isReg = true
			},
			cancel(){
				this.isReg = false
			},
			addUser(){
				if(this.password === this.repeat){
					localStorage.setItem("name",this.name)
					localStorage.setItem("password",this.password)
					this.name = ''
					this.password = ''
					this.repeat = ''
					this.isReg = false
				}else{
					alert("两次密码不一致")
				}
				
			}
		},
		mounted(){

		}
	}
</script>

<style>
</style>
