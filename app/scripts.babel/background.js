'use strict';
import {
  getStockByCode
} from './popup/api/api.js'

import {
  getStockDetail
} from './popup/api/former.js'


chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({
  text: '1'
});


// 检测新消息
function checkMsg() {
  if (isBussiness) {
    // 开市
    setInterval(() => {
      // var codeList = getCodeList()
      var codeList = localStorage.localStock
      checkVarify(codeList)
    }, 50000)
  }
}

function isBussiness() {
  var curTime = (new Date()).getTime()
  var open = (new Date()).setHours(9, 30)
  var close = (new Date()).setHours(15, 0)

  return open < curTime && curTime < close
}

// function getCodeList() {
//   var localStock = localStorage.localStock
//   var tempArr = []
//   for (let i = 0; i < localStock.length; i++) {
//     const element = localStock[i];
//     tempArr.push(element.code)
//   }
//   return tempArr
// }

function checkVarify(codeList) {
  codeList.forEach(element => {
    var code = element.code
    var cost = element.cost
    var count = element.count
    var upLimit = element.upLimit
    var downLimit = element.downLimit
    console.log(downLimit)
    console.log(upLimit)

    getStockByCode(code).then(res => {
      var stockObj = getStockDetail(res, code, cost, count, upLimit, downLimit);
      console.log(stockObj)
      var curPrice = stockObj.curPrice
      var name = stockObj.name
      var isUp = upLimit && curPrice > upLimit
      var isDown = downLimit && curPrice < downLimit
      console.log(isUp)
      console.log(isDown)

      isUp && notifyMe(code, `您关注的 ${name} - ${code} 已上涨到${curPrice},设置上限为￥${downLimit}`, 'up')
      isDown && notifyMe(code, `您关注的 ${name} - ${code} 已下跌到${curPrice},设置下限为￥${downLimit}`, 'down')
    })
  });
}

var codeList = JSON.parse(localStorage.localStock)
checkVarify(codeList)



/**
 * 调用系统提醒
 * 
 * 第一次进入页面需要授权，之后弹出提醒
 */
if (Notification.permission == 'granted') {
  Notification.requestPermission();
}
function notifyMe(code, msg, type) {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
  }

  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  } else {
    var notification = new Notification(type == 'down' ? '股价下跌！请关注！': '股价上涨！请关注！', {
      icon: type == 'down' ? 'images/stock_down.png' : 'images/stock_up.png',
      body: msg
    });
    notification.onclick = function () {
      window.open(`http://quote.eastmoney.com/${code}.html`);
    };
  }
}