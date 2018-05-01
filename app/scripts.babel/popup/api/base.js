const colWidth = {
  init: 90,
  curPrice: 50,
  range: 70,
  rangePrice: 70,
  profit: 50,
  cost: 50,
  count: 50,
  upLimit: 50,
  downLimit: 50,
  toPrice: 45,
  highPrice: 45,
  lowPrice: 45,
  chart: 60,
  set: 145
}

export const MIN_STOCKWIDTH_WITH_SET = 520;

export function getColWidth(col) {
  return colWidth[col]
}

const normalCode = {
  sh: ['600', '601','603'],
  sz: ['000'],
  ms: ['002'],
  cy: ['300'],
  shB: ['900'],
  szB: ['200'],
  shN: ['730'],
  szN: ['000'],
  shP: ['700'],
  szP: ['080']
};

var normalCodeArr = (() =>{
  var tempArr = [];
  for (let k in normalCode) {
    tempArr = [...tempArr, ...normalCode[k]]
  }
  return tempArr;
})();

export function checkAllow(shortCode) {
  return normalCodeArr.includes(shortCode.slice(0, 3))
}

export function getFixedNum(num, digit = 2) {
  if (num) {
    return Number(Number(num).toFixed(digit));
  }
  if (num === 0) {
    return num
  }
}

