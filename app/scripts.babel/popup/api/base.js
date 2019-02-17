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

export const getColWidth = col => colWidth[col]

const normalCode = {
  sh: ['600', '601', '603'],
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


/**
 * 根据股票代码前三位数字判断股票是否合法
 * @params {string} shortcode
 * @return {boolean}
 */
export function checkAllow (shortCode) {
  let normalCodeArr = []
  Object.values(normalCode).forEach(d => {
    normalCodeArr = [...normalCodeArr, ...d]
  })
  return normalCodeArr.includes(shortCode.slice(0, 3))
}

export const getFixedNum = (num, digit = 2) => {
  return num ? Number(Number(num).toFixed(digit)) : num
}
