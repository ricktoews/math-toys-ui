/*

Prime:
0.[formatted period]
[num] / [denom] has a period length of [x]. The period begins at position [x] within the expansion digits.

The lowest value of 10^n that [denom] divides without remainder is 10^power10 - 1.

Full-reptend, so 10 is not a primitive root of [denominator]

Not full-reptend, but period length is even, so period is complementary.

Not full-reptend, and period length is odd, so period is not complementary.

Composite:
0.[formatted period]
[num] / [denom] has a period length of [x]. The period begins at position [x] within the expansion digits.


*/
function NumeratorDescription(props) {
  const { periodJSX, numerator, denom, period, position, power10, denomIsPrime } = props;
  console.log('NumeratorDescription denomIsPrime', denomIsPrime, typeof denomIsPrime);
  let jsx;
  if (denomIsPrime) {
    jsx = <div>
      <div>{periodJSX}</div>
      <div>{numerator} / {denom} has a period length of {period.length}. The period begins at position {position} within the expansion digits.</div>
      <div>The lowest value of <i>10<sup>n</sup> - 1</i> that {denom} divides without remainder is 10<sup>{power10}</sup> - 1.</div>
      <div className="digits">0.{periodJSX}</div>
    </div>;
    console.log('NumeratorDescription, prime denominator')
  } else {
    jsx = <div>
      {periodJSX}
    </div>

  }

  return (
    <div>{jsx}</div>
  );
}

export default NumeratorDescription;