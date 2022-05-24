const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];

export function getDenominatorFactors(denom) {
  const factors = [];
  const maxFactor = Math.floor(denom / 2);
  for (let i = 0; PRIMES[i] <= maxFactor; i++) {
    while (denom % PRIMES[i] === 0) {
      denom /= PRIMES[i];
      factors.push(PRIMES[i]);
    }
  }
  if (factors.length === 0) {
    factors.push(denom);
  }

  return factors;
}	

export function getPeriodJSX(data) {
  const { nonRepeating, firstHalf, secondHalf } = data;
  const nonRepeatingJSX = <span className="non-repeating">{nonRepeating}</span>;
  const firstHalfJSX = <span className="first-half">{firstHalf}</span>;
  const secondHalfJSX = <span className="second-half">{secondHalf}</span>;

  const jsx = <span className="digits">{nonRepeatingJSX}{firstHalfJSX}{secondHalfJSX}</span>;
  
  return jsx;
}

export function parsedPeriod(period, beginRepeat) {
  const beginRepeatZeroBased = beginRepeat - 1;
  let nonRepeating, firstHalf, secondHalf;
  let parsed;
  if (beginRepeatZeroBased) {
    nonRepeating = period.substring(0, beginRepeatZeroBased);
    period = period.substring(beginRepeatZeroBased);
  }
  if (period.length % 2 === 0) {
    firstHalf = period.substring(0, period.length / 2);
    secondHalf = period.substring(period.length / 2);
  } else {
    firstHalf = period;
  }
  
  parsed = { nonRepeating, firstHalf, secondHalf };
  return parsed;
}
 
