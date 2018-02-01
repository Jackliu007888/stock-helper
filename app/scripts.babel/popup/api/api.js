import axios from 'axios';

const url = 'http://hq.sinajs.cn/'

export function getStockByCode(code) {
  return axios.get(`${url}list=${code}`).then(res => {
    return Promise.resolve(res.data)
  })
}

// http://suggest3.sinajs.cn/suggest/type=&key=%E6%80%A1&name=suggestdata_1
const url_get_stock = 'http://suggest3.sinajs.cn/suggest/'
export function getStockBySuggest(sug) {
  return axios.get(`${url_get_stock}type=&key=${sug}&name=suggestdata_${(Math.random()).toString().slice(2,-2)}`).then(res => {
    return Promise.resolve(res.data)
  })
}

// http://vip.stock.finance.sina.com.cn/quotes_service/view/CN_TransListV2.php?num=100&symbol=sz002183&rn=25278288
const url_get_stock_trade = 'http://vip.stock.finance.sina.com.cn/quotes_service/view/CN_TransListV2.php'
export function getStockTrade(code, num) {
  var num = num ? num : 20000
  return axios.get(`${url_get_stock_trade}?num=${num}&symbol=${code}&rn=${(Math.random(4).toString()).slice(2,10)}`).then(res => {
    return Promise.resolve(res.data)
  })
}

//https://api-prod.wallstreetcn.com/apiv1/content/lives/pc?limit=20
const url_get_announcement = 'https://api-prod.wallstreetcn.com/apiv1/content/lives/pc'
export function getAnnouncement(limit) {
  return axios.get(`${url_get_announcement}?limit=${limit}`).then(res => {
    return Promise.resolve(res.data)
  })
}