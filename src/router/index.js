import Vue from 'vue'
import VueRouter from 'vue-router'
import $store from '../store'
import Home from '../views/Home.vue'
import { getUrl, hasChange } from '../utiles/tools.js'
import { getUser } from '../utiles/apis/common.js'

Vue.use(VueRouter)
// 发运
const ShippingComBox = r => require.ensure([], () => r(require('@/views/shipping/CombinedBox.vue')), 'shippingComBox');

// 错误界面
const Err = r => require.ensure([], () => r(require('@/views/error/Err.vue')), 'err');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/shippingComBox',
    name: 'ShippingComBox',
    component: ShippingComBox,
    meta: { title: '并箱' }
  },
  // {
  //   path: 'err',
  //   name: 'Err',
  //   component: Err
  // }
]

const router = new VueRouter({
  routes
})
router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  // if (Array.isArray(to.matched) && to.matched.length == 0) {
  //   next({
  //     path: '/err',
  //     query: { msg: encodeURIComponent('页面丢失啦~') }
  //   })
  //   return
  // }
  let userToken = getUrl("apptoken") || '89018329018a2e66';
  if (!$store.state.userInfo.cname || hasChange()) {//用户信息丢失
    console.log('没有用户');
    getUser(userToken).then((res) => {
      if (!res.data.cname) {
        alert('登录人员名称获取失败，请联系it人员');
        return;
      }
      cachedUserInfo.exp = 6 * 60 * 60;//单位秒
      cachedUserInfo.save(info);
      $store.commit('SET_USER_INFO', info);
      $store.commit('SET_USER_INFO', res.data);
      $store.commit('SET_USER_TOKEN', userToken);
      alert(JSON.stringify(res.data))
      next();
      return
    }).catch((error) => {
      alert(error);
    });
  }
  next()
})
export default router
