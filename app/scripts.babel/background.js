'use strict';
import {
  getStockByCode
} from './popup/api/api.js'

import {
  getStockDetail
} from './popup/api/former.js'

let msgCount = 0

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({
  text: ''
});

function showBrowserAction(msg = '') {
  chrome.browserAction.setBadgeText({
    text: msg
  })
}

// 主程序调用
setInterval(() => {
  process.runCheckCode()
}, 3 * 60 * 1000)

var process = {
  runCheckCode() {
    if (process.isBussiness()) {
      // 开市时间，每三分钟运行一次
      const localStocks = JSON.parse(localStorage.getItem('localStocks'))
      Object.values(localStocks).forEach((code, index) => {
        const stockData = new StockData(code)
        stockData.getDetail().then((obj) => {
          stockData.varifyData(obj)
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
  varifyData({ curPrice, name, date } = {}) {
    let {
      code,
      upLimit,
      downLimit,
      notifiedTime = new Date().getTime() - 13 * 60 * 60 * 1000
    } = this.baseObj

    const d = new Date()
    const day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate()
    const month = (d.getMonth() + 1) < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1
    const year = d.getFullYear()
    const curDate = `${year}-${month}-${day}`

    // 当天的数据当天提醒
    if (date !== curDate) return null
    const isUp = upLimit && curPrice > upLimit
    const isDown = downLimit && curPrice < downLimit

    const upMsgBox = new MsgBox('股价上涨！请关注！', `您关注的 ${name} - ${code} 已上涨到${curPrice},设置上限为￥${upLimit}`, 'images/stock_up.png', `http://quote.eastmoney.com/${code}.html`)
    const downMsgBox = new MsgBox('股价下跌！请关注！', `您关注的 ${name} - ${code} 已下跌到${curPrice},设置下限为￥${downLimit}`, 'images/stock_down.png', `http://quote.eastmoney.com/${code}.html`)

    isUp && this.isOnTheTime(notifiedTime) && upMsgBox.show()
    isDown && this.isOnTheTime(notifiedTime) && downMsgBox.show()

    if ((isUp && this.isOnTheTime(notifiedTime)) || (isDown && this.isOnTheTime(notifiedTime))) {
      msgCount++
      showBrowserAction(msgCount.toString())
      const localStocks = JSON.parse(localStorage.getItem('localStocks'))
      localStocks[code].notifiedTime = new Date().getTime()
      localStorage.setItem('localStocks', JSON.stringify(localStocks))
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
        notifiedTime = new Date().getTime() - 13 * 60 * 60 * 1000
      } = this.baseObj
      getStockByCode(code).then(res => {
        resolve(getStockDetail({ res, code, cost, count, upLimit, downLimit, notifiedTime }))
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
      notification.onclick = () => {
        window.open(this.url);
      };
    }
  }
}
