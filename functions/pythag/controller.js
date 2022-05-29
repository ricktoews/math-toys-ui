const CORNERS = 10;
const SIZE_OF_LIST = 15;

// Vestigial
function getCorners() {
  var corners = [...Array(CORNERS)].map((n, i) => Math.pow((i*2)+1, 2));
  corners.unshift(2);
  corners = corners.sort(numSort);
  return corners;
}


// Assumed that start is odd.
// Yields the square of the current odd number.
// Vestigial. Sad, because this illustrated yield.
function* getSquares(start) {
  var n = Math.sqrt(start) + 2;
  var sq;
  while (true) {
    yield(n*n);
    n += 2;
  }
}

/*
 * I believe the GCF technique for a, b is to repeatedly subtract the smaller from the larger
 * until the difference is 0 or 1. If the difference is 1, a and b are relatively prime.
 * At this point, I'm only strongly suspecting that this actually works. I have not proven it.
 * And, of course, googling would be cheating.
 */
function isRelativePrime(a, b) {
  let safety = 500; // Protect against infinite loop;
  while (safety && Math.abs(b - a) > 1) {
    [b, a] = [Math.max(a, b), Math.min(a, b)];
    b -= a;
    safety--;
  }
  return a !== b;
}


/*
 * Imagine a c x c square. The outer layer is c + (c-1). The next is (c-1)+(c-2), and so on.
 * This function inspects sums of layers, from the outer inward; and it gathers sums that
 * are square.
 */
function findLayers(c) {
  let result = [];
  let layerSum = 0;
  let layer = c * 2 - 1;
  while (layer > 5) {
    layerSum += layer;
    let sqRoot = Math.sqrt(layerSum);
    if (sqRoot == parseInt(sqRoot, 10)) {
      result.push(layerSum);
    }
    layer -= 2;
  }

  return result;
}


/*
 */
function getTriples(cList) {
  let data = [];
  for (num of cList) {
    let aSquares = findLayers(num);
    let triples = [];
    if (aSquares.length > 0) {
      triples = [];
      let used = [];
      let n = 1;
      let primes = 0;
      for (aSquare of aSquares) {
        let a = parseInt(Math.sqrt(aSquare), 10);
        let c = num;
        let b = parseInt(Math.sqrt(num**2 - aSquare), 10);
        if (!used[a] && !used[b]) {
          let triple = { "a": a, "b": b, "c": c };
          if (isRelativePrime(a, b)) {
            primes += 1;
            triples.push({ "a": a, "b": b, "c": c, "prime": true })
          } else {
            triples.push({ "a": a, "b": b, "c": c, "prime": false })
          }
          used.push(a);
          used.push(b);
          n += 1;
        }
      }
    }
    data.push({ "num": num, "aSquares": aSquares, "triples": triples });
  }

  return data;
}

exports.getTriples = getTriples;


function getByCorner(corner) {
  corner = 1*corner;
  var squares = [];
  var i = 1;
  while (squares.length <= 10) {
    var test = corner*(corner + 2*i);
    var sqrt = parseInt(Math.sqrt(test), 10);
    if (sqrt*sqrt === test) {
        let isPrimitive = isRelativePrime(corner, i);
        squares.push({ a: Math.sqrt(test), b: i, c: Math.sqrt(test + i*i), isPrimitive });
    }
    i++;
  }
  return squares;
}

exports.getByCorner = getByCorner;


// area has to be capable of expression as 2*b*n + n^2.
// alternatively: n(n + 2b).
function testA(area, n) {
	var result;
	var step1 = area / n;
	if (step1 === parseInt(step1, 10)) {
		var step2 = step1 - n;
		if (step2 > 0 && step2 % 2 === 0) {
			result = step2 / 2;
		}
	}
	return result;
}

function getByA(a) {
	var data = [];
	var areaA = a*a;
	var b;
	for (let n = 1; n < areaA/2; n++) {
		if (b = testA(areaA, n)) {
			let c = Math.pow(a*a + b*b, .5);
			let triple = { a, b, c };
			data.push(triple)
		}
	}
	return data;
}
exports.getByA = getByA;
