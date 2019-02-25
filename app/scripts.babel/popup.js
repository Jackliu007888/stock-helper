// 'use strict';
import Vue from 'vue'
import ElementUI from 'element-ui'
import scroll from 'vue-seamless-scroll'
import 'element-ui/lib/theme-chalk/index.css'
import '../styles/index.css'
import Popup from './popup/popup'

Vue.use(ElementUI)
Vue.use(scroll)
new Vue({
  el: '#app',
  render: c => c(Popup)
})
