/*
 * Sort decimal expansions by numerator
 */
function sortExpansions(a, b) {
  // Subtraction forces numeric rather than string sort.
  // When a < b, should return negative.
  // When a > b, should return positive.
  return a.numerator - b.numerator;
}


/*
 * The data hash is keyed by the decimal expansions for the denominator.
 * Each value is an array of specifications corresponding to the decimal expansion:
 *   numerator, position, beginRepeat
 * numerator is ... Yeah, you can probably work that one out, can't you?
 * position is the position (1-based) in the decimal expansion where the numerator begins. For composite denominators,
 *   this value is always 1.
 * beginRepeat is the position at which the decimal expansion begins to repeat. If the decimal expansion resolves,
 *   this value is -1, indicating that it need not be used.
 *   For prime denominators that do not resolve, this value is always 1.
 *
 * This is a little complicated, so... Examples.
 * If 6 is the denominator, the decimal expansion for 1/6 is "16", whose array looks like this:
 * "16": [ {
 *   "numerator": 1,
 *   "position": 1,
 *   "beginRepeat": 2
 * } ]
 * The beginRepeat is 2, since the repeating portion begins at the second digit of the expansion: so, .166666...
 *
 * If 7 is the denominator, the decimal expansion for 2/7 is "285714". Because the 7ths all use the same series of digits,
 * the hash is keyed on the expansion for 1/7, which is "142857". This is where the numerator value provides needed information.
 * The array for "142857" has six items, one for each of the six numerators in the 7ths. For 2/7, the array item looks like this:
 * "142857": [ ... {
 *   "numerator": 2,
 *   "position": 3,
 *   "beginRepeat": 1
 * }, ... ]
 * The position value is 3, which means that the expansion for 2/7 begins with the 3rd digit in the "142857" key, which is 2.
 * The actual expansion for 2/7 is then the portion from 2 to the end, followed by the portion from the beginning to just
 * beffore the 2: 285714.
 */
function formatExpansions(data) {
  let periods = Object.keys(data);
  let formatted = [];
  periods.forEach(period => {
    data[period].forEach(specs => {
      let { numerator, position, beginRepeat } = specs;
      let numPeriod = period.substr(position-1) + period.substr(0, position-1);
      formatted.push({ numerator, period: numPeriod, beginRepeat });
    });
  });

  formatted.sort(sortExpansions);

  return formatted;
}

exports.formatExpansions = formatExpansions;
