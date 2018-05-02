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
setInterval(() => {
  process.runCheckCode()
}, 3 * 60 * 1000)



var process = {
  runCheckCode() {
    if (process.isBussiness()) {
      // 开市时间，每三分钟运行一次
      var codeList = JSON.parse(localStorage.localStock)
      codeList.forEach((element, index) => {
        let stockData = null
        stockData = new StockData(element)
        stockData.getDetail().then((obj) => {
          stockData.varifyData(obj, index)
        })
      });
    }
  },
  // 检查是否是开市时间 
  isBussiness() {
    var curTime = (new Date()).getTime()
    var open = (new Date()).setHours(9, 30)
    var close = (new Date()).setHours(15, 0)

    return open < curTime && curTime < close
  }
}

class StockData {
  constructor(baseObj) {
    this.baseObj = baseObj
  }
  varifyData(stockObj, index) {
    let {
      curPrice,
      name,
      date
    } = stockObj
    let {
      code,
      upLimit,
      downLimit,
      hasNotified = false,
      notifiedTime = new Date().getTime() - 13 * 60 * 60 * 1000
    } = this.baseObj
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
    let [upMsgBox, downMsgBox] = [null, null]
    upMsgBox = new MsgBox('股价上涨！请关注！', `您关注的 ${name} - ${code} 已上涨到${curPrice},设置上限为￥${upLimit}`, 'images/stock_up.png', `http://quote.eastmoney.com/${code}.html`)
    downMsgBox = new MsgBox('股价下跌！请关注！', `您关注的 ${name} - ${code} 已下跌到${curPrice},设置下限为￥${downLimit}`, 'images/stock_down.png', `http://quote.eastmoney.com/${code}.html`)
    isUp && this.isOnTheTime(notifiedTime) && upMsgBox.show()
    isDown && this.isOnTheTime(notifiedTime) && downMsgBox.show()
    console.log(name, this.isOnTheTime(notifiedTime))
    if ((isUp && this.isOnTheTime(notifiedTime)) || (isDown && this.isOnTheTime(notifiedTime))) {
      msgCount++
      showBrowserAction(msgCount.toString())
      let temp = JSON.parse(localStorage.localStock)
      temp[index].hasNotified = true
      temp[index].notifiedTime = new Date().getTime()
      localStorage.localStock = JSON.stringify(temp)
    }
  }
  isOnTheTime(oldTime) {
    return new Date().getTime() - oldTime >= 3 * 60 * 60 * 1000
  }
  getDetail() {
    return new Promise((resolve, reject) => {
      let {
        code,
        cost,
        count,
        upLimit,
        downLimit,
        hasNotified = false,
        notifiedTime = new Date().getTime() - 13 * 60 * 60 * 1000
      } = this.baseObj
      getStockByCode(code).then(res => {
        var stockObj = getStockDetail({res, code, cost, count, upLimit, downLimit});
        console.log(stockObj)
        resolve(stockObj)
      })
    })
  }
}

/**
 * 系统提醒
 * 
 * 第一次进入页面需要授权，之后弹出提醒
 */
class MsgBox {
  constructor(title, msgBody, icon, url) {
    this.title = title
    this.msgBody = msgBody
    this.icon = icon
    this.url = url
  }
  show() {
    if (!Notification) {
      alert('Desktop notifications not available in your browser. Try Chromium.');
      return;
    }

    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    } else {
      var notification = new Notification(this.title, {
        icon: this.icon,
        body: this.msgBody
      });
      notification.onclick =  ()=> {
        window.open(this.url);
      };
    }
  }
}