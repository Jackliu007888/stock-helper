import axios from 'axios';

const  url = 'http://hq.sinajs.cn/'

export function getStockByCode(code) {
  
  return axios.get(`${url}list=${code}`).then(res => {
    return Promise.resolve(res.data)
  })
}
