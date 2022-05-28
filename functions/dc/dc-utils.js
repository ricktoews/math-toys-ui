const SQRT_5 = 5**.5;
const PHI = (SQRT_5 + 1) / 2;
    
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 183, 191, 193, 199]
    

module.exports.isRelativePrime = (a, b) => {
  [a, b] = [Math.min(a, b), Math.max(a, b)];
  while (a > 1) {
    [a, b] = [Math.min(b % a, a), Math.max(b% a , a)]
  }

  return a == 1;
}


module.exports.isPrime = (p) => {
  let _result = true;
  for (let prime of PRIMES) {
    if (prime * prime > p) {
      break;
    }
    if (p % prime == 0) {
      _result = false;
      break;
    }
  }

  return _result;
}


module.exports.tally = (denom, base) => {
  let base_factor_tally = 0;
  let denom_tmp = denom;
  let base_tmp = base;
  let max_non_repeat_tally = 0;
  let non_repeat_tally = 0;
  let prime_ndx = 0;
  let retval = 0;
  
  let current_prime = PRIMES[prime_ndx];

  while (current_prime <= base_tmp) {
    non_repeat_tally = 0;
    base_factor_tally = 0;
        
    // First, tally occurrences of present prime number in base's set of factors.
    while (base_tmp % current_prime == 0) {
      base_tmp = base_tmp / current_prime;
      base_factor_tally += 1;
    }
    
    // If the present prime is a factor of the base, ...
    if (base_factor_tally > 0) {
      prime_power = current_prime**base_factor_tally;
    
      // First, divide out all complete sets of the present prime from the denominator, and tally the number of divisions.
      while (denom_tmp % prime_power == 0) {
        denom_tmp /= prime_power;
        non_repeat_tally += 1;
      }

      // Second, check for any remaining instances of the prime number. If there are any, divide them out, and increment the tally.
      if (denom_tmp % current_prime == 0) {
        non_repeat_tally += 1;
        while (denom_tmp % current_prime == 0) {
          denom_tmp /= current_prime;
        }
      }

      // Keep the max_non_repeat_tally up-to-date.
      max_non_repeat_tally = Math.max(non_repeat_tally, max_non_repeat_tally);
    }

    prime_ndx += 1 
    current_prime = PRIMES[prime_ndx]
  }

  // If denom_tmp is equal to 1 at this point, the denominator's prime factors were all included in the set of factors for the base, which means the decimal resolves.
  // If the denominator has no factors in common with the base, then there are no non-repeating digits.
  if (denom_tmp == 1) {
    retval = -1;
  } else {
    retval = max_non_repeat_tally;
  }

  return retval    
}
    