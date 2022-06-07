const PRIMES = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199];

export const getPrimes = () => {
  return PRIMES;
}

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
  console.log('getPeriodData', data);
  const { nonRepeating, firstHalf, secondHalf } = data;
  const nonRepeatingJSX = <span className="non-repeating">{nonRepeating}</span>;
  const firstHalfJSX = <span className="first-half">{firstHalf}</span>;
  const secondHalfJSX = <span className="second-half">{secondHalf}</span>;

  const jsx = <span className="period">{nonRepeatingJSX}{firstHalfJSX}{secondHalfJSX}</span>;
  
  return jsx;
}

export function parsedPeriod(period, beginRepeat) {
  console.log('parsedPeriod', period, beginRepeat);
  const beginRepeatZeroBased = beginRepeat - 1;
  let nonRepeating, firstHalf, secondHalf;
  let parsed;
  
  // Decimal resolves, so no repeating portion.
  if (beginRepeat === -1) {
    nonRepeating = period;
  } 
  
  // Decimal does not resolve, so check where repeating portion begins.
  else {
    // If repeating portion begins after the first digit in the expansion, extract the non-repeating part,
    // and get the repeating part as the period.
    if (beginRepeatZeroBased > 0) {
      nonRepeating = period.substring(0, beginRepeatZeroBased);
      period = period.substring(beginRepeatZeroBased);
    }

    // Now that we have the repeating period, see if it has an even number of digits.
    // A period with an even length will have the two halves complementary.
    if (period.length % 2 === 0) {
      firstHalf = period.substring(0, period.length / 2);
      secondHalf = period.substring(period.length / 2);
    } 
    
    // Otherwise--period with an odd number of digits--the period is not internally complementary.
    else {
      firstHalf = period;
    }
  }
  parsed = { nonRepeating, firstHalf, secondHalf };
  return parsed;
}
 
