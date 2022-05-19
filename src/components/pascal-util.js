const Pascal = [
    [1],
    [1, 1]
];

function buildRow() {
  let currentRowNdx = Pascal.length - 1;
  const currentRow = Pascal[currentRowNdx];
  const newRow = [1];
  for (let i = 1; i < currentRow.length; i++) {
    let number = currentRow[i - 1] + currentRow[i];
    newRow.push(number);
  }
  newRow.push(1);
  return newRow;
}

(function buildPascal(rows = 50) {
  while (Pascal.length < rows) {
    let newRow = buildRow();
    Pascal.push(newRow);
  }
})();


export function getPascalRow(n) {
  return Pascal[n];
}


export function constructXYPower(x, y, n) {
  const pascalNums = Pascal[n];
  let powerX = n;
  let powerY = 0;
  const result = [];
  const numTerms = pascalNums.length;
  for (let termNdx = 0; termNdx < numTerms; termNdx++) {
    let pascalNum = pascalNums[termNdx];
    let termParts = [pascalNum];
    if (powerX > 0) {
      termParts.push(`${x}^${powerX}`);
    }
    if (powerY > 0) {
      termParts.push(`${y}^${powerY}`);
    }
    let term = termParts.join('*');
    result.push(term);
    powerX--;
    powerY++;
  }
  return result;
}

const radicalSymbol = '√';
const radicalSymbol5 = radicalSymbol + '5';
function getSqrt5Power(power) {
  let sqrt5Power = '';
  if (power % 2) {
    power--;
    sqrt5Power = radicalSymbol5;
  }
  let powerOf5 = 5**(power / 2);
  sqrt5Power = powerOf5 + sqrt5Power;
  return sqrt5Power;
}

export function constructPhiPower(n, keepExponents = true) {
  const pascalNums = Pascal[n];
  let powerX = n;
  let powerY = 0;
  const result = [];
  const numTerms = pascalNums.length;
  for (let termNdx = 0; termNdx < numTerms; termNdx++) {
    let pascalNum = pascalNums[termNdx];
    let termParts = [pascalNum];
    if (powerX > 0) {
      let sqrt5Power;
      if (keepExponents) {
        sqrt5Power = radicalSymbol5 + '^' + powerX;
      } else {
        sqrt5Power = getSqrt5Power(powerX);
      }
      termParts.push(`${sqrt5Power}`);
    }
    const joinChar = keepExponents ? '' : '*';
    let term = termParts.join(joinChar);
    result.push(term);
    powerX--;
    powerY++;
  }
  return result;
}

const root5re = new RegExp(radicalSymbol5);
export function reducedTerms(terms) {
  const reduced = [];
  terms.forEach(term => {
    let xVal = '';
    if (root5re.test(term)) {
      xVal = radicalSymbol5;
      term = term.replace(root5re, '');
    }
    let calc;
    try {
      calc = eval(term);
    } catch (e) {
      console.log('error with', term);
    }
    calc = calc + xVal;
    reduced.push(calc);
  });
  return reduced;
}

export function combineTerms(terms) {
  const divideBy = 2**(terms.length - 2);
  let combinedRoot5 = 0;
  let combined = 0;
  terms.forEach(term => {
    if (root5re.test(term)) {
      term = term.replace(root5re, '');
      combinedRoot5 += parseInt(term, 10);
    } else {
      combined += parseInt(term, 10);
    }
  });
  const simplifiedRoot5 = combinedRoot5 / divideBy;
  const simplified = combined / divideBy;
  const result = [
    combinedRoot5 + radicalSymbol5, 
    combined + '', 
    divideBy,
    simplifiedRoot5 + radicalSymbol5,
    simplified + ''
  ];
  return result;
}

export function isolateFibonacciTerms(terms) {
  const divideBy = 2**(terms.length - 2);
  const fibTerms = [];
  const sumElements = [];
  terms.forEach(term => {
    if (root5re.test(term)) {
      fibTerms.push(term);
      sumElements.push(term.replace(root5re, ''));
    }
  });
  let sum = '(' + sumElements.join(' + ') + ') / ' + divideBy;
  return { fibTerms, divideBy, sum };
}