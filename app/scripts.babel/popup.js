// 'use strict';
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '../styles/index.css'
import Popup from './popup/popup'

Vue.use(ElementUI)
new Vue({
  el: '#app',
  render: c => c(Popup)
})
