import {
  getFixedNum
} from './base'

export function getStockTradeDetail(res) {
  // console.log(res)
  try {
    var trade_item_list = eval(`(function() {
      ${res}
      return trade_item_list
    })()`)
  } catch (e) {
    console.log('error');
    console.log(e.toString());
  }

  console.log(trade_item_list);
  

  trade_item_list = trade_item_list.filter((item, index) => {
    return parseInt(item[2]) > 0
  })

  // 筛选100量级数据
  var lenTimes =  trade_item_list.length > 100 ? parseInt(trade_item_list.length / 100) : 1
  trade_item_list = trade_item_list.filter((item, index) => {
    return index % lenTimes == 0
  })

  if (trade_item_list.length > 100) {

  }


  var revList = trade_item_list.reverse();

  var resultList = []
  for (let i = 0; i < revList.length; i++) {
    let element = revList[i][2]
    resultList.push(element)
  }

  // 放大趋势
  var minVal = resultList.min()
  var maxVal = resultList.max()
  var times = (10 / (maxVal - minVal))
  var mapResult = resultList.map((item, index, array) => {
    return (item - minVal) * times
  })
  return mapResult
}






export function getStockDetail(res, code, cost, count) {
  var result = res.split('=')[1];
  if (result.length <= 10) {
    console.log('no result');
    return;
  }
  var itemArr = result.split('"')[1].split(',');
  var name = itemArr[0],
    toPrice = getFixedNum(itemArr[1]), // 今开
    yesPrice = getFixedNum(itemArr[2]), // 昨收
    curPrice = getFixedNum(itemArr[3]), // 当前价
    highPrice = getFixedNum(itemArr[4]), // 最高
    // lowPrice = getFixedNum(itemArr[5]), // 未知
    // lowPrice = getFixedNum(itemArr[6]), // 未知
    lowPrice = getFixedNum(itemArr[7]), // 最低
    date = Number(itemArr[8]), // 日期
    time = Number(itemArr[9]); // 时间
  var rangePrice = getFixedNum(curPrice - yesPrice);
  var range = getFixedNum((curPrice - yesPrice) / yesPrice * 100);
  cost = getFixedNum(cost, 3)
  var profit = curPrice == 0 ? 0 : (cost == 0 ? 0 : getFixedNum((curPrice - cost) * count, 3))

  // console.log(cost)
  // console.log(profit)
  var stockObj = {
    code,
    name,
    toPrice,
    yesPrice,
    curPrice,
    highPrice,
    lowPrice,
    rangePrice,
    range,
    // date,
    // time,
    cost,
    count,
    profit
  };
  return stockObj
}

export function getSuggestList(res) {
  var result = res.split('=')[1];
  if (result.length <= 10) {
    console.log('no result suggest');
    return [];
  }
  var itemArr = result.split('"')[1].split(';')
  var newArr = []
  for (let i = 0; i < itemArr.length; i++) {
    const element = itemArr[i];
    let detailArr = element.split(',')
    let name = detailArr[4]
    let code = detailArr[3]
    newArr.push({
      value: name + '-' + code
    })
  }
  return newArr
}