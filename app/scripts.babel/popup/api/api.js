import axios from 'axios';

const  url = 'http://hq.sinajs.cn/'

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