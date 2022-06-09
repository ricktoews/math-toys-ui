import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { MathJax } from 'better-react-mathjax';
import styled from 'styled-components';
import Periodic from './Periodic';

const Footnote = styled.div`
	font-size: .7rem;
	line-height: 1rem;
	margin-bottom: 10px;
`;

const HomeWrapper = styled.div`

	article {
		color: ${({ theme }) => theme.primaryColor};
		font-size: 1.0rem;
		line-height: 2;
		margin-bottom: 15px;
	}

	article .article-title {
		cursor: pointer;
		font-size: 1rem;
		color: ${({ theme }) => theme.headingColor};
	}
	article .article-date {
		display: none;
		float: right;
	}
`;

const ToggleRead = styled.div`
	&.article-closed {
		display: none;
	}
	&.article-opened {
		display: block;
	}
`;


// Click an article title to toggle it open or closed.
const readArticle = e => {
	e.preventDefault();

	var classList = e.target.nextSibling.classList;
	if (classList.contains('article-closed')) {
		classList.remove('article-closed');
		classList.add('article-opened');
	} else {
		classList.remove('article-opened');
		classList.add('article-closed');
	}
}

export default () => {

	// This is for adding the 'click' handler to each article title.
	useEffect(() => {
		var els = Array.from(document.querySelectorAll('.article-title'));
		els.map(el => el.addEventListener('click', readArticle, el));
	}, []);
  
	const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	const yearTemplate = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5];

	return (
    <HomeWrapper className="container">
      <article>
        <div className="article-title">The 12-digit Calendar, Part 2</div>

        <ToggleRead className="article-open">

        <p>OK, so you can get the day of the week for any date in 2021. That's neat. But what about for other years?</p>

        <p>So. Piscatology 101. Remember the 12-digit calendar for 2021? Well, the following table is a list of month offsets you will use to find dates in any whatever year you're looking for. You'll do this in three steps: 1) Find the base number for the year, 2) Find the number for your target month, 3) Find the day of the week for the target date.</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px'}}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)'}}>
            <div style={{gridArea: '1/1/2/7', textAlign: 'center', fontWeight: 'bold'}}>Month Offsets</div>
          { months.map((m, key) => <React.Fragment key={key}><div style={{paddingRight: '3px'}}>{m}</div><div>{yearTemplate[key]}</div></React.Fragment>) }
          </div>
        </div>

        <Footnote>So, you remember how you had to memorize your multiplication table in school, and you were eternally grateful that that was part of your education? ... Yeah, this is the same kind of thing.</Footnote>

	<p>Let's start with the most likely practical application: years in the recent past or future.</p>

        <ul className="steps">
          <li><b>First, get the base number for the year</b>.</li>
          <li>Start with the last two digits of the year you want.</li>
          <li>Divide that by 4, and add the integer result to your year<sup>*</sup>. (<i>If your year is a leap year, AND you're finding a date in January or February, subtract 1</i>.)</li>
          <li><b>Next, find your taget month</b>.</li>
          <li>Get the month's offset value from the above table, and add it to the base number for the year. This is the target month's number. <i>Note: You can divide this by 7 and use the remainder, if that's more convenient for you</i>.</li>
          <li><b>Finally, get the day of the week</b>.</li>
          <li>Add the date to the target month's number.</li>
          <li>Divide by 7, and keep the remainder.</li>
          <li>The remainder is the number of the day of the week. (If there is no remainder, the date falls on a Saturday.)</li>
        </ul>

        <Footnote><sup>*</sup>Except for the step of dividing the year by 4, you can reduce any number you're working with by taking the remainder of that number divided by 7. For example, if you were working with the year 2085, you would divide 85 by 4, giving you 21. You could then reduce both 85 (1) and 21 (0) when you added them, giving you 1 as the base number for 2085. Note that this would be the same result as adding 85 and 21 and then taking the remainder of 106 divided by 7.</Footnote>

        <p>Let's try an example or two.</p>

        <p>How about September 16, 2025.</p>

	<ul>
          <li>Start with the last two digits of the year: 25.</li>
          <li>Divide by 4, and add the integer result to your year. The integer part of 25 divided by 4 is 6. Add 6 to 25, for a total of 31 (3, if you reduce).</li>
          <li>The offset for September is 5, so add 5 to 31, giving you 36 (1, if you reduce).</li>
          <li>The date is the 16th, so add 16 to 36 (or 1), giving you 52 (or 17).</li>
          <li>Divide 52 (or 17) by 7, and keep the remainder. The remainder is 3.</li>
          <li><i>September 16, 2025 falls on the 3rd day of the week, which is <b>Tuesday</b></i>.</li>
        </ul>

        <p>Now, let's try a leap year. How about February 4, 2028:</p>

	<ul>
          <li>Start with the last two digits of the year: 28.</li>
          <li>Divide by 4, and add the integer result to your year. The integer part of 28 divided by 4 is 7. Add 7 to 28, for a total of 35. <i>Since 2028 is a leap year, AND you're looking for a date in January or February, subtract 1, leaving 34 (6, if you reduce)</i>.</li>
          <li>The offset for February is 3, so add 3 to 34 (or 6), giving you 37 (or 9, which you could further reduce to 2).</li>
          <li>The date is the 4th, so add 4 to 37 (or 2), giving you 41 (or 6).</li>
          <li>Divide 41 (or 6) by 7, and keep the remainder. The remainder is 6.</li>
          <li><i>February 4, 2028 falls on the 6th day of the week, which is <b>Friday</b></i>.</li>
        </ul>

        <p style={{textAlign: 'center', fontWeight: 'bold'}}>0 3 3 6 1 4 6 2 5 0 3 5</p>

        </ToggleRead>
      </article>

      <article>
        <div className="article-title">The 12-digit Calendar, Part 1</div>

        <ToggleRead className="article-closed">
        <p>2021: 5 1 1 4 6 2 4 0 3 5 1 3</p>

        <p>The concept is simple enough: each month is represented by a single digit in the range 0-6. If you've ever noticed how most months on a conventional calendar have a number of blank weekdays leading up to the first day of the month, that number of blanks is the digit for that month. For 2021, the digits are Jan: 5, Feb: 1, Mar: 1, Apr: 4, May: 6, Jun: 2, Jul: 4, Aug: 0, Sep: 3, Oct: 5, Nov: 1, Dec: 3.</p>

        <p>To calculate the day of the week a date lands on, you start by adding the date to the month's digit. Then, you divide by 7 and take the remainder. If there is no remainder, the day of the week for that date is Saturday. Otherwise, it's the number corresponding to the day within the week: 1 = Sunday, 2 = Monday, &c.</p>

        <p>Take June 28, 2021 as an example. The digit for June 2021 is 2. Adding this digit to the date (28) gives you 30. When you divide 30 by 7, you get 4 remainder 2. The 2nd day of the week is Monday. So June 28, 2021 is a Monday.</p>

        <p>A brother of one of my dad's uncles introduced me to this stuff ages ago. He showed me what the calendar looked like for 1975 and taught me how to use it, and I took an interest and made it a project to write out the calendars for centuries back, thus becoming very familiar with the pattern. For a list of 12-digit calendars spanning several centuries, starting with 1600, have a look at the <a href="/calendar">Gregorian Calendar</a> page.</p>

        </ToggleRead>
      </article>

      <article>
        <div className="article-title">New Insight On 1/11</div>

        <ToggleRead className="article-closed">
        <p>In base 10, the reciprocal of 11&mdash;1/11&mdash;has the decimal expansion <Periodic whole="0" repeating="09" />. This caught my attention long ago, since 1/9 is <Periodic whole="0" repeating="11" />. That is, the period of 1/11 is 1 &times; 9, and the period of 1/9 is 1 &times; 11. Curious; but Why?</p>

        <p>As it happens, the answer is quite simple. It boils down to the fact that x<sup>2</sup> / (x + 1) = (x - 1) remainder 1. In this application, x is the number base: in this case, 10.</p>

        <p>This question came to the fore when a friend showed me a chart of the digits of the sexagesimal numbering system. I speculated that 1/11 in base 60 would have an expansion of <Periodic whole="0" repeating="0[59]" />, but I didn't have a handy way of demonstrating that&mdash;and I didn't feel like mucking about with the actual calculation.</p>

        <p>However, the pieces sort of fell in place. In the long division process for calculating 1/11, you have to add two 0s, since 11 necessarily does not go into 10 (regardless of the number base). Since 100 is the base squared, and 11 is the base + 1, you're dividing (x + 1) into x<sup>2</sup>, the result of which is (x - 1), with a remainder of 1. (Basic algebra: (x+1)(x-1) = x<sup>2</sup>-1.) So for base 60, you're dividing 61 into 3600. This gives you 59, remainder 1; and 59 is the highest digit in the sexagesimal system.</p>
        </ToggleRead>
      </article>

      <article>
        <p className="article-date">August 16, 2020</p>
        <div className="article-title">Pythagorean Triples - Primitives</div>

	<ToggleRead className="article-closed">

	    <p>I took some interest in Pythagorean triples&mdash;specifically, those that don't have a common factor greater than 1. Examples include the familiar (3, 4, 5), (5, 12, 13), (7, 24, 25). In each of these cases, the difference between b and c is 1.</p>

	    <p>Another triple is (6, 8, 10), since 36 + 64 = 100. However, this isn't a primitive, as a, b, and c are all divisible by 2.</p>

	    <p>My approach to generating a Pythagorean triple is to start with c - b and then calculate values for a^2. I envison b^2 positioned within c^2, so that the two share the lower right corner. Then, a^2 wraps around b^2, with the corner of a^2 being the square of (c - b).</p>

	    <p>Let n = (c - b). Then the area of a^2 is n^2 + 2(nb). Since this must be square, I rearrange the terms: n(n + 2b). If n is square, then (n + 2b) must also be square. If n isn't square, then (n + 2b) must be a square, multiplied by some number that, if mulplied by n would yield a square. (For example, if n is 12, (n + 2b) would have to be a square multiplied by 3&mdash;or 3 times some square.)</p>

	    <p>Since I'm interested in primitives, I want to find triples that don't have common factors. This is true for all triples where n = 1. What about for n = 2? Since 2 isn't a square, (n + 2b) must be a square multiplied by 2. With (c - b) of 2, a^2 will be even, and a will therefore be even. Therefore, b must be odd if we want a primitive triple. So with n = 2, we are looking for square products of 2(2+2b) such that b is an odd number. Algebra: 2(2+2b) = 4+4b = 4(1 + b). Since 4 is square, 1 + b must be square, and b must be one less than an even square. So: 3, 15, 35, 63, &c. Let's look at these.</p>

	    <p>Start with b = 3. Then c = 5, and we have our familiar (3, 4, 5) triple, just rearranged to (a = 4, b = 3, c = 5). With b = 15, c = 17, and a^2 = 4(1 +15) = 64, yielding a = 8, so (a = 8, b = 15, c = 17). With b = 35, the triple is (a = 12, b = 35, c = 37). And so on.</p>

	    <p>What about with different values of c - b? How about 3? Using n = 3, we get 3 x (3 + 2b). Since 3 isn't square, (3 + 2b) must be a square multiplied by 3. For (3 + 2b) to be a multiple of 3, 2b must be a multiple of 3, and so b itself must be a multiple of 3. This precludes a primitive triple.</p>

	    <p>In general, primitives are possible only with values of n that are either odd squares or doubled squares. This is because for n as an odd square (n + 2b) can be a square without n and b having any common factors. Likewise, with n being double a square, (n + 2b).</p>

	</ToggleRead>
      </article>
 
      <article>
        <div className="article-title">Prime Powers of 2 and Mersenne Primes</div>
	<ToggleRead className="article-closed">

        <p>So a Mersenne prime is a prime number of the form 2^n - 1. All known perfect numbers are based on Mersenne primes. I was toying one night with why the power of 2 for a Mersenne prime must itself be prime. I'm sure an algebraic proof would show that 2^n - 1 is factorable (and therefore not prime) if n is composite. But it was a different approach that occurred to me as I was lying there.</p>

        <p>Think of 2^n - 1 in its binary representation. It's just a repdigit of n 1s, right? So if n is composite&mdash;say axb&mdash;then 2^n - 1 can be described as a groups of b 1s, which is itself obviously composite. To illustrate, suppose n is 15 with a = 3, b = 5. Then 2^15 - 1 = 111111111111111, or 3 groups of 5 1s. Any number whose digits form multiple groups of the same pattern of digits can be expressed as a multiple of that pattern of digits&mdash;and therefore not a prime number.</p>
        </ToggleRead>
      </article>
 
      <article>
        <div className="article-title">Golden Ratio Fiddlings</div>
	<ToggleRead className="article-closed">

        <p>So I've not explored this much yet, but it's looking curious to me.</p>

        <p>Familiar: phi, the Golden Ratio, in its fractional form is (1 + sqrt(5)) / 2.</p>

        <p>The powers of phi have interested me in their fractional form, with 2 as the constant denominator (even when it's possible to reduce): (a + b x sqrt(5)) / 2, since each a and b is the sum of the previous two, so that each a is a Lucas number and each b is a Fibonacci number&mdash; so: (1 + 1√5) / 2, (3 + 1√5) / 2, (4 + 2√5) / 2, 7 + 3√5) / 2. </p>

        <p>The interesting thing is that as that as these powers increase, the ratio of a / b approaches <math><msqrt><mn>5</mn></msqrt></math>, 2.23606...:</p>
<Table variant="math" bordered>
  <thead>
  <tr className="success text-success">
    <th>phi<sup>n</sup></th>
    <th>Fraction Form</th>
    <th>a / b</th>
    <th>Approx to √5</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>phi<sup>4</sup></td>
    <td>(7 + 3√5) / 2</td>
    <td>7/3</td>
    <td>2.3333...</td>
  </tr>
  <tr>
    <td>phi<sup>7</sup></td>
    <td>(29 + 13√5) / 2</td>
    <td>29 / 13</td>
    <td>2.2307...</td>
  </tr>
  <tr>
    <td>phi<sup>19</sup></td>
    <td>(9349 + 4181√5) / 2</td>
    <td>9349 / 4181</td>
    <td>2.23606...</td>
  </tr>
  </tbody>
</Table>

        <p>Playing with other sequences in which each element is the sum of the previous two, I see that the ratios appear to approach some irrational (I assume) real number, but it's not evident to me that it's a number that can be expressed tidily. 2.23067977499... is irrational but what the decimal form approximates is precisely the square root of 5.</p>

        <p>So why should it be that the ratios of a/b in increasingly larger powers of phi approach a number that's not just another of the infinitely many undistinguished irrational numbers out there but is instead the square root of an integer? And I suspect I'm looking at a slipknot.</p>

        </ToggleRead>
      </article>

      <article>
        <div className="article-title">Fibonacci Numbers as Sums of Products of Fibonacci Numbers</div>
	<ToggleRead className="article-closed">

        <p>Let (a, b) be two consecutive fibonacci numbers, and let (c, d) be two consecutive Fibonacci numbers. (a, b) can overlap (c, d). The number ac + bd is a Fibonacci number. Examples: (a=3, b=5), (c=8, d=13). Then ac = 24, bd = 65, ac + bd = 89.</p>

        <p>I don't have a proof that this always works, though I'm pretty sure it does.</p>

        </ToggleRead>
      </article>

      <article>
        <div className="article-title">Reciprocals of Composite Denominators</div>
	<ToggleRead className="article-closed">

        <p>I've long known that when a denominator is prime (other than 2, 5), the period length of the reciprocal is the smallest 9s reptend that the number divides. For 7, that's 6; for 31, it's 15; for 41, it's 5; and so on. I don't believe there can be a pattern: it just depends on which value 10^n - 1 that prime number happens to divide. Of course, this number will be either one less than the prime number (as with 7), or a factor of that (as with 31 and 41). If the number is even, the period is internally complementary&mdash;that is, the sum of its two halves is a 9s reptend. For 1/7, the period is 142857, and 142 + 857 = 999.</p>

        <p>Today's observation has to do with the length of the period for the reciprocal of a composite number whose factors, again, do not include 2 and 5. For these, the period length is also the minimum 9s reptend that the denominator will divide.</p>

        <p>Today, I realized that the length of a composite denominator's period is determined by the lengths of the periods of the prime factors of that denominator. For example, consider 287 as the denominator. I chose this because 287 is 7 x 41, and 1/7 has a period length of 6, while 1/41 has a period length of 5. It is therefore expected that 1/287 has a period length of 30, because 30 is 6x5. And so it has: 1/287 = .003484320557491289198606271777...</p>

        <p>I needed to be satisfied that there was a reason why this should work. Since the minimum 9s reptend that 7 divides is 999999 (7x142957), and the minimum one that 41 divides is 99999 (41x2439), what must be the minimum 9s reptend that 287 divides? It would be the shortest one that's divisible by both 7 and 41, so it must be the smallest 9s reptend whose length is divisible by both 6 and 5. The least common multiple of 6 and 5 is 30.</p>

        </ToggleRead>
      </article>

      <article>
        <div className="article-title">Description of Periodic Decimals of Reciprocals of Prime Numbers</div>
	<ToggleRead className="article-closed">

        <p>Let p be the denominator, a prime number that is not a factor of the base. So in base 10, p is not 2 or 5.</p>

        <p>Observations:</p>

        <ul>
          <li>The maximum period length is (p-1).</li>
          <li>The period length is the minimum n, such that 10^n - 1 is a multiple of p.</li>
          <li>The period length is either (p-1) or a factor of (p-1).</li>
          <li>If the period length is even, the period can be split into two parts, the sum of which is 10^x - 1, where x is one half the period length.</li>
        </ul>

        <p>I actually did find it a little tiresome to try to defend some of these; however, I think I succeeded&mdash;or at least was confident of navigating there.</p>

        <p>Two classic examples: 1/7, whose period is 142857; and 1/13, with period 076923.</p>

        <p>For 7, the maximum period length is 6, and the period length actually is 6.</p>

        <p>For 13, the maximum period length would be 12; however, the actual period length is 6, a factor of 12.</p>

        <p>For both 7 and 13, 10^6 - 1, or 999999, is the minimum such number of which they're factors. 9, 99, 999, 9999, and 99999 all leave remainders when divided by either 7 or 13.</p>

        <p>Since the period lengths are even (both 6), they can be split in half, and the sum of the halves is 10^x - 1, where x is half the period length, or 3 in this case. So, for 7: 142 + 857 = 999. For 13: 076 + 923 = 999.</p>

        <p>In many cases, the period length is odd, so you don't get complementary halves. The determining factor is the smallest 9s repdigit (10^n - 1) the prime number happens to divide. For example, not only do 7 and 13 divide 999999: 37 also divides it, as do 3 and 11. However, the period lengths of 1/3, 1/11, and 1/37 are 1, 2, and 3, since 3 divides 10^1 - 1, 11 divides 10^2 - 1, and 37 divides 10^3 - 1.</p>

        </ToggleRead>
      </article>

    </HomeWrapper>
	)
}

