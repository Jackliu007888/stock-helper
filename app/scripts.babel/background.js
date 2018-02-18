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
  text: '2'
});


// 检测新消息
function checkMsg() {
  if (isBussiness) {
    // 开市
    setInterval(() => {
      var codeList = localStorage.localStock
      checkVarify(codeList)
    }, 1000 * 60 * 10)
  }
}

function isBussiness() {
  var curTime = (new Date()).getTime()
  var open = (new Date()).setHours(9, 30)
  var close = (new Date()).setHours(15, 0)

  return open < curTime && curTime < close
}


function checkVarify(codeList) {
  codeList.forEach(element => {
    let {code, cost , count, upLimit, downLimit} = element
    console.log(downLimit)
    console.log(upLimit)

    getStockByCode(code).then(res => {
      var stockObj = getStockDetail(res, code, cost, count, upLimit, downLimit);
      console.log(stockObj)
      let {curPrice, name} = stockObj
      var isUp = upLimit && curPrice > upLimit
      var isDown = downLimit && curPrice < downLimit
      console.log(isUp)
      console.log(isDown)

      isUp && notifyMe('股价上涨！请关注！', `您关注的 ${name} - ${code} 已上涨到${curPrice},设置上限为￥${downLimit}`, 'images/stock_up.png', `http://quote.eastmoney.com/${code}.html`)
      isDown && notifyMe('股价下跌！请关注！', `您关注的 ${name} - ${code} 已下跌到${curPrice},设置下限为￥${downLimit}`, 'images/stock_down.png', `http://quote.eastmoney.com/${code}.html`)
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
function notifyMe(title, msgBody, icon, url) {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
  }

  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  } else {
    var notification = new Notification(title, {
      icon: icon,
      body: msgBody
    });
    notification.onclick = function () {
      window.open(url);
    };
  }
}