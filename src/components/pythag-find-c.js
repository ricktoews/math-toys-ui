import { getPrimes } from './denom-helper';

function isRelativePrime(a, b) {
  [a, b] = [Math.min(a, b), Math.max(a, b)];
  var safety = 50;
  while (a > 1 && safety > 0) {
    [a, b] = [Math.min(b % a, a), Math.max(b % a, a)];
    safety--;
  }
  return a === 1;
}

function layers(c) {
  var result = [];
  var layerSum = 0;
  var layer = c * 2 - 1;
  // All this does is start with the outer layer and work our way in.
  // Whenever the sum of the layers is a square, note it.
  while (layer > 5) {
    layerSum += layer;
    if (Math.sqrt(layerSum) === parseInt(Math.sqrt(layerSum), 10)) {
      result.push(layerSum);
    }
    layer -= 2;
  }
  return result;
}

const arrangeTriples = (cSquared, squares) => {
  let results = [];
  let used = {};
  for (let sq of squares) {
      let aSquared = sq;
      let bSquared = cSquared - aSquared;
      if (!used[aSquared] && !used[bSquared]) {
          let [a, b, c] = [aSquared, bSquared, cSquared].map(n => Math.sqrt(n));
          results.push({a, b, c});
          used[aSquared] = true;
          used[bSquared] = true;
      }
  }

  return results;
}

export const getCList = (config) => {
  const { primeOnly, triplesOnly } = config;
  const result = [];
  const primeList = getPrimes();
  const integerList = [...Array(100).keys()].map(item => item+5);
  const cCandidates = primeOnly ? primeList : integerList;
  for (let i of cCandidates) {
    let a_squares = layers(i);
    if (triplesOnly && a_squares.length > 0 || !triplesOnly) {
      let triples = arrangeTriples(i*i, a_squares);
      result.push({
        c: i,
        ab: a_squares.map(item => Math.sqrt(item)),
        triples
      });
    }
/*
    if (a_squares.length > 0) {
      let used = {};
      var n = 1;
      a_squares.forEach(a_squared => {
        let a = Math.pow(a_squared, .5);
        let c = i;
        let b = Math.pow(i * i - a_squared, .5);
        if (!used[a] && !used[b]) {
          if (isRelativePrime(a, b)) {
//            console.log(`${n}. triple`, a, b, c, ' => ', c - b, a * a, b * b, c * c, `(prime ${primes})`);
          } else {
//            console.log(`${n}. triple`, a, b, c, ' => ', c - b, a * a, b * b, c * c);
          }
        }
        used[a] = true;
        used[b] = true;
        n++;
      });
    }
*/
  }

  return result;
}
