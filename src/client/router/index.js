import Vue from 'vue'
import Router from 'vue-router'

// 导入对应的vuex文件
import store from './../store/store'

// 导入相应的子组件
import Hello from './../components/Hello'

Vue.use(Router)

var router = new Router({
  mode: 'history',
  routes: [
    { name: 'hello', path: '/hello', component: Hello },
    {
      path: '/game',
      meta: {
          title: 'game'
      },
      component: (resolve) => require(['../views/BoardView.vue'], resolve)
    },
		{
		  path: '/',
		  meta: {
		      title: 'login'
		  },
		  component: (resolve) => require(['../views/Login.vue'], resolve)
		}
  ]
})

export default router