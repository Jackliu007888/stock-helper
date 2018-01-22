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
  curPrice: 90,
  range: 90,
  rangePrice: 90,
  profit: 90,
  cost: 50,
  count: 50,
  toPrice: 45,
  highPrice: 45,
  lowPrice: 45,
  set: 120
};
var normalCodeArr = (function() {
  var tempArr = [];
  for (let key in normalCode) {
    tempArr = tempArr.concat(normalCode[key]);
  }
  return tempArr;
})();

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