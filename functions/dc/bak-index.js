const dcUtils = require('./dc-utils');

const letter_digit = ['A', 'B', 'C', 'D', 'E', 'F'];
const get_digit = (value) => {
  if (value > 9) {
    value = letter_digit[value-10];
  }
  return value;
}

const getDecimal = (denominator, numerator, base = 10) => {
  const section_list = ['', '', ''];
  let section_ndx = 0;
        
  let non_repeating = dcUtils.tally(denominator, base);
  if (non_repeating == -1) {
    non_repeating_tally = denom - 1;
  } else {
    non_repeating_tally = non_repeating;
  }

  // either find how to fill an array in Python, or take a different approach.
  let remainder_flag_list = Array(denominator - 1).fill(false);

  let repeating_decimal_flag = non_repeating != -1;
  let start_repeat = 0;
  let step_digit = 0;
  let step_remainder = numerator;
  let decimal_length = 0;

  // BEGIN LONG DIVISION -----
  while (step_remainder !== 0 && remainder_flag_list.indexOf(step_remainder) === -1) {
    remainder_flag_list.push(step_remainder);
    step_value = Math.floor(step_remainder * base / denominator);
    step_digit = get_digit(step_value);
            
    if (decimal_length == non_repeating_tally) {
      section_ndx += 1;
      // Store this digit; it'll be used to determine when/if the complement begins.
      start_repeat = step_remainder;
    }

    section_list[section_ndx] += '' + step_digit;
        
    step_remainder = step_remainder * base - step_value * denominator
    if (step_remainder + start_repeat == denominator) {
      section_ndx += 1;
    }    

    decimal_length += 1
  }
  // END LONG DIVISION -----
  if (repeating_decimal_flag) {
    repeating = decimal_length - non_repeating_tally;
  } else {
    repeating = 0;
  }
  period_length = decimal_length;
  repeating = repeating;
  period = section_list.join('');
  decimal_object = {
    "fraction": numerator + ' / ' + denominator,
    "non_repeating": section_list[0],
    "repeating_1": section_list[1],
    "repeating_complement": section_list[2],
    "period_length": period_length,
    "repeating": repeating,
    "period": period,
  };

  return decimal_object;
}

module.exports.getDecimal = getDecimal;