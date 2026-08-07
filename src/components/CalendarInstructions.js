import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

const commonOffsets = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5];
const leapOffsets = [0, 3, 4, 0, 2, 5, 0, 3, 6, 1, 4, 6];

function OffsetRow({ label, values }) {
  return (
    <div className="calendar-instructions-offset-row">
      <strong>{label}</strong>
      <div>{values.map((value, index) => <span key={index}>{value}</span>)}</div>
    </div>
  );
}

export default function CalendarInstructions() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="calendar-instructions-page">
      <Link to="/calendar" className="calendar-lab-back">← Back to calendar</Link>

      <header className="calendar-instructions-heading">
        <h1>How to generate a 12-digit calendar</h1>
        <p>
          A 12-digit calendar gives the weekday offset for the first day of each month,
          from January through December. An offset of 0 means the month begins on Sunday;
          1 means Monday, and so on through 6 for Saturday.
        </p>
      </header>

      <section>
        <h2>The basic idea</h2>
        <p>
          First find January’s offset for the year. Then add the appropriate monthly
          pattern, reducing every result modulo 7—that is, use the remainder after
          dividing by 7.
        </p>
      </section>

      <section>
        <h2>1. Find the century offset</h2>
        <p>The Gregorian century offsets repeat every 400 years.</p>
        <div className="calendar-instructions-century-grid" aria-label="Century offsets">
          <span>1600s</span><strong>0</strong>
          <span>1700s</span><strong>5</strong>
          <span>1800s</span><strong>3</strong>
          <span>1900s</span><strong>1</strong>
          <span>2000s</span><strong>0</strong>
          <span>2100s</span><strong>5</strong>
          <span>2200s</span><strong>3</strong>
          <span>2300s</span><strong>1</strong>
        </div>
      </section>

      <section>
        <h2>2. Decide whether it is a leap year</h2>
        <p>
          A year is a leap year when it is divisible by 4, except century years must
          also be divisible by 400. Thus 2024 and 2000 are leap years, but 1900 is not.
        </p>
      </section>

      <section>
        <h2>3. Count the prior leap days</h2>
        <p>
          Divide the two-digit year by 4 and keep only the whole-number part. If the
          target year is itself a leap year, subtract 1; its leap day has not occurred
          when January begins.
        </p>
      </section>

      <section>
        <h2>4. Find January’s offset</h2>
        <p>Add these three values, then reduce the total modulo 7:</p>
        <div className="calendar-instructions-formula">
          century offset + two-digit year + prior leap days
        </div>
      </section>

      <section>
        <h2>5. Generate all 12 offsets</h2>
        <p>
          Choose the common-year or leap-year pattern below. Add January’s offset to
          each number and reduce each result modulo 7.
        </p>
        <div className="calendar-instructions-months" aria-hidden="true">
          {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((month, index) => (
            <span key={index}>{month}</span>
          ))}
        </div>
        <OffsetRow label="Common" values={commonOffsets} />
        <OffsetRow label="Leap" values={leapOffsets} />
      </section>

      <section className="calendar-instructions-example">
        <h2>Example: 1785</h2>
        <ol>
          <li>The century offset for the 1700s is 5.</li>
          <li>1785 is not a leap year.</li>
          <li>The two-digit year is 85, and 85 ÷ 4 gives 21 prior leap days.</li>
          <li>5 + 85 + 21 = 111, and 111 modulo 7 is 6.</li>
          <li>Add 6 to the common-year pattern, reducing each result modulo 7.</li>
        </ol>
        <p className="calendar-instructions-example-result">
          <strong>1785:</strong> 6 2 2 5 0 3 5 1 4 6 2 4
        </p>
      </section>

      <aside className="calendar-instructions-note">
        <h2>Using an offset</h2>
        <p>
          Add a date to its month’s offset and reduce modulo 7. A result of 1 is
          Sunday, 2 is Monday, and so on; 0 is Saturday.
        </p>
      </aside>

      <div className="calendar-instructions-actions">
        <Link to="/calendar/lab">Practice generating a calendar</Link>
        <Link to="/calendar">Browse the calendars</Link>
      </div>
    </main>
  );
}
