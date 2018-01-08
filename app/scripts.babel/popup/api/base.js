var normalStock = {
  sh: ['600', '601'],
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
var normalStockArr = (function() {
  var tempArr = [];
  for (let key in normalStock) {
    tempArr = tempArr.concat(normalStock[key]);
  }
  return tempArr;
})();

export function check(shock) {
  var firstStock = shock.slice(0, 3);
  var isNormal = false;
  for (var i = 0; i < normalStockArr.length; i++) {
    if (firstStock == normalStockArr[i]) {
      isNormal = true;
    }
  }
  return isNormal;
}

export function getRightShock(shock) {
  console.log(shock);

  var firstStock = shock.slice(0, 3);
  var shArr = normalStock['sh'].concat(
    normalStock['shB'],
    normalStock['shN'],
    normalStock['shP']
	);
  console.log(shArr);
	
  for (let i = 0; i < shArr.length; i++) {
    const element = shArr[i];
    if (element == firstStock) {
      return 'sh' + shock;
    }
	}
	
  return 'sz' + shock;
}

