// 'use strict';
import Vue from 'vue';
import ElementUI from 'element-ui';
import scroll from 'vue-seamless-scroll';
// import '../../node_modules/element-ui/lib/theme-chalk/inedx.css'
import 'element-ui/lib/theme-chalk/index.css';
import Popup from './popup/Popup.vue';

Array.prototype.indexOf = function (val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == val) return i;
  }
  return -1;
};

Array.prototype.indexOfAtt = function (val, attribute) {
  for (var i = 0; i < this.length; i++) {
    if (this[i][attribute] == val) return i;
  }
  return -1;
};

Array.prototype.remove = function (val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

//最小值
Array.prototype.min = function () {
  var min = this[0];
  var len = this.length;
  for (var i = 1; i < len; i++) {
    if (this[i] < min) {
      min = this[i];
    }
  }
  return min;
}
//最大值
Array.prototype.max = function () {
  var max = this[0];
  var len = this.length;
  for (var i = 1; i < len; i++) {
    if (this[i] > max) {
      max = this[i];
    }
  }
  return max;
}



Vue.use(ElementUI);
Vue.use(scroll);
new Vue({
  el: '#app',
  render: c => c(Popup)
});