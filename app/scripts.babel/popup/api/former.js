import { getFixedNum } from './base'

export function getStockDetail(res, code, cost) {
  var result = res.split('=')[1];
  if (result.length <=10) {
    console.log('no result');
    return ;
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
  var profit = cost == 0 ? 0 : getFixedNum(curPrice - cost);
  // console.log(cost)
  // console.log(profit)
  var stockObj = {
    code,
    name,
    // toPrice,
    yesPrice,
    curPrice,
    // highPrice,
    // lowPrice,
    rangePrice,
    range,
    // date,
    // time,
    cost,
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
    newArr.push({value:name + '-' + code})
  }
  return newArr
}