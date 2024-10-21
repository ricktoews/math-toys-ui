var BASE = 10;

const Useful = require('./primes');

/*
 * Determine whether number is prime.
 *
 */
function isPrime(num) {
  num = 1*num;
  return Useful.primes.indexOf(num) !== -1;
}

function digitsToExpansion(data) {
  const { expansion, position, beginRepeat } = data;
  const digits = expansion.split('');
  let ndx = position - 1;
  const expansionDigits = [];
  for (let i = 0; i < digits.length; i++) {
    expansionDigits.push(digits[ndx]);
    ndx = (ndx + 1) % digits.length;
  }
  return expansionDigits.join('');
}

/*
 * Perform mechanical division to get expansion, digit by digit.
 * Also, keep track of where in the expansion each numerator starts.
 */
function divide(num, denom) {
  let digits = [];
  let numerators = {};
  let position = 1;

  while (num > 0 && !numerators[num]) {
    numerators[num] = position++;
    let digit = Math.floor(num * BASE / denom);
    digits.push(digit);
    num = num * BASE - digit * denom;
  }

  let beginRepeat = num > 0 ? numerators[num] : -1; // num is 0 if decimal resolves.
  let result = { expansion: digits.join(''), expansionNumerators: numerators, beginRepeat };

  return result;
}

/*
 * Get expansions for specified denominator.
 * Return a hash:
 * {
 *   byExpansion: [{ |expansion|: [{ numerator, position }...]}],
 *   byNumerator: [{ |numerator|: { expansion, position }}]
 * }           
 *
 * This feels like it needs to be broken up.
 */
function getExpansions(denom, specifiedNum) {
  let prime = isPrime(denom);
  let expansions = {};
  const nums = specifiedNum || Array.from({ length: denom - 1 }, (v, i) => i + 1);
  for (let num in nums) {
    // Check each numerator, and calculate the expansion if it hasn't already been done.
    if (!expansions[num]) {
      let { expansion, expansionNumerators, beginRepeat } = divide(num, denom);
      expansions[num] = { digits: expansion, expansion, position: expansionNumerators[num], beginRepeat };
      // This forEach block is only for prime numbers.
      prime && Object.keys(expansionNumerators).forEach(num => {
        expansions[num] = { digits: expansion, expansion: expansion, position: expansionNumerators[num], beginRepeat };
      });
    } else {
      expansions[num].expansion = digitsToExpansion(expansions[num]);
    }
  }
  let output = {};
  for (let num in nums) {
    let digits = expansions[num].digits;
    let numerator = num;
    let position = expansions[num].position;
    let beginRepeat = expansions[num].beginRepeat;
    if (!output[digits]) { output[digits] = []; }
    output[digits].push({ numerator, position, beginRepeat });
  }

  return { byExpansion: output, byNumerator: expansions };
}

module.exports.divide = divide;
module.exports.getExpansions = getExpansions;
