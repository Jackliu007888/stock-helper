var normalCode = {
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
var colWidth = {
  init: 90,
  curPrice: 50,
  range: 70,
  rangePrice: 70,
  profit: 50,
  cost: 45,
  count: 45,
  toPrice: 40,
  highPrice: 40,
  lowPrice: 40,
  chart: 100,
  set: 145
};
var normalCodeArr = (function() {
  var tempArr = [];
  for (let key in normalCode) {
    tempArr = tempArr.concat(normalCode[key]);
  }
  return tempArr;
})();

export const MIN_STOCKWIDTH_WITH_SET = 520;

export function check(shortCode) {
  var firstCode = shortCode.slice(0, 3);
  return normalCodeArr.indexOf(firstCode) >= 0 ? true : false ;
}

export function getRightShock(shortCode) {

  var firstCode = shortCode.slice(0, 3);
  var shArr = normalCode['sh'].concat(
    normalCode['shB'],
    normalCode['shN'],
    normalCode['shP']
  );
  return shArr.indexOf(firstCode) >= 0 ? `sh${code}` : `sz${code}`;
}

export function getFixedNum(num, digit) {
  digit = digit ? digit : 2;
  return Number(Number(num).toFixed(digit));
}

export function getColWidth(col) {
  return colWidth[col];
}