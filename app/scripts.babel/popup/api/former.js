import {
  getFixedNum
} from './base'

export function getStockTradeDetail (res) {
  let  tradeItemList = []
  try {
    tradeItemList = eval(`(function() {
      ${res}
      return trade_item_list
    })()`)
  } catch (e) {
    console.error('getStockTradeDetail error' , e.toString())
  }

  tradeItemList = tradeItemList.filter((item, index) => {
    return parseInt(item[2]) > 0
  })
  // 筛选100量级数据
  const lenTimes = tradeItemList.length > 100 ? parseInt(tradeItemList.length / 100) : 1
  tradeItemList = tradeItemList.filter((item, index) => {
    return index % lenTimes === 0
  })

  // 反转数组
  const revList = tradeItemList.reverse()
  const resultList = revList.map(d => d[2])

  // 放大趋势，适应peity
  const minVal = Math.min(...resultList)
  const maxVal = Math.max(...resultList)
  const times = (10 / (maxVal - minVal))
  const mapResult = resultList.map((item, index, array) => {
    return (item - minVal) * times
  })
  // 空数组返回 20个0 的数组
  return +mapResult === 0 ? new Array(20).fill(0) : mapResult
}

export const getAnnouncementDetail = res =>  {
  return res['data']['a_stock']['items'].map(item => {
    return {
      content: item['content_text'],
      time: item['display_time']
    }
  })
}

/**
 * 股票数据清洗
 * @param {*} param0 
 * @returns {}
 */
export const getStockDetail = ({
  res,
  code,
  cost = 0,
  count = 0
}) => {

  const result = res.split('=')[1]
  if (result.length <= 10) {
    return null
  }
  
  const itemArr = result.split('"')[1].split(',')

  const [
    name,
    toPrice,
    yesPrice,
    curPrice,
    highPrice,
    unkonwnA,
    unkonwnB,
    lowPrice,
    ...leftArr
  ] = itemArr
 
  const [date, time] = [leftArr[leftArr.length - 3], leftArr[leftArr.length - 2]] // 日期 、 时间
  
  const rangePrice = +curPrice === 0 ? 0 : getFixedNum(curPrice - yesPrice)
  const range = +rangePrice === 0 ? 0 : getFixedNum(rangePrice / yesPrice * 100)
  const profit = curPrice === 0 || cost === 0 ? 0 : getFixedNum((curPrice - cost) * count, 3)

  return {
    code,
    name,
    rangePrice,
    range,
    date,
    time,
    count,
    profit,
    toPrice: getFixedNum(toPrice),
    yesPrice: getFixedNum(yesPrice),
    curPrice: getFixedNum(curPrice),
    highPrice: getFixedNum(highPrice),
    lowPrice: getFixedNum(lowPrice),
    cost: getFixedNum(cost, 3)
  }
}

export function getSuggestList (res) {
  const result = res.split('=')[1]

  if (result.length <= 10) return []

  const itemArr = result.split('"')[1].split(';')

  return itemArr.map(item => {
    const splitArr = item.split(',')
    
    return {
      value: splitArr[4] + '-' + splitArr[3]
    }
  })
}
