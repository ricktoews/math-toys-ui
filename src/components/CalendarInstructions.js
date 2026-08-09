import { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthOffsets = [
  ['January', 0], ['February', 3], ['March', 3], ['April', 6],
  ['May', 1], ['June', 4], ['July', 6], ['August', 2],
  ['September', 5], ['October', 0], ['November', 3], ['December', 5],
];
const contents = [
  ['summary', 'Summary'],
  ['introduction', 'Introduction'],
  ['month-offset', 'Month Offset'],
  ['year-offsets', 'Year Offsets'],
  ['leap-years', 'Leap Years'],
  ['other-centuries', 'Other Centuries'],
  ['calendar-1582', '1582'],
];

function WeeklyCycle() {
  return (
    <div className="calendar-instructions-weekly-cycle" aria-label="Weekly cycle">
      {weekdays.map(day => <strong key={day}>{day}</strong>)}
      {Array.from({ length: 6 }, (_, index) => <span key={`blank-${index}`} />)}
      {Array.from({ length: 9 }, (_, index) => <span key={index}>{index}</span>)}
    </div>
  );
}

function SeptemberCalendar() {
  return (
    <div className="calendar-instructions-calendar" aria-label="September 2023 calendar">
      <strong className="calendar-instructions-calendar-heading">September 2023</strong>
      {weekdays.map(day => <strong key={day}>{day}</strong>)}
      <div className="calendar-instructions-offset-label">Month Offset</div>
      {Array.from({ length: 4 }, (_, index) => (
        <span className="calendar-instructions-offset-cell" key={`offset-${index}`} />
      ))}
      {Array.from({ length: 30 }, (_, index) => <span key={index + 1}>{index + 1}</span>)}
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

      <nav className="calendar-instructions-toc" aria-label="On this page">
        <strong>On this page</strong>
        <ol>
          {contents.map(([id, label]) => (
            <li key={id}><a href={`#${id}`}>{label}</a></li>
          ))}
        </ol>
      </nav>

      <header className="calendar-instructions-heading">
        <h1>Calculate Day of Week</h1>
      </header>

      <section id="summary" className="calendar-instructions-summary">
        <h2>Summary</h2>
        <p><em>generic month offsets</em>: 0 3 3 6 1 4 6 2 5 0 3 5</p>
        <p><em>century offset</em>: 0 for 2000s, 1 for 1900s; others given below.</p>
        <p><em>year offset</em>: <em>two-digit year</em> + <em>number of leap days</em> + <em>century offset</em></p>
        <p><em>leap days</em>: <em>two-digit year divided by 4</em></p>
        <p><em>month offset</em> = <em>generic month offset</em> + <em>year offset</em></p>
        <p><strong>Day of week: (month offset + date) modulo 7</strong></p>
        <p><em>For January or February in a leap year, subtract 1 from month offset.</em></p>
      </section>

      <section id="introduction">
        <h2>Introduction</h2>
        <p>It really just comes down to the position of a day within the weekly cycle. Day 1 is Sunday, day 2 is Monday, and so on.</p>
        <p>When the position of the day is more than 7, you can just divide by 7 and use the remainder. For example, the 8th day is the same as the 1st day.</p>
        <WeeklyCycle />
        <p>And if the position turns out to be 0, that&apos;s the same as 7, so Saturday.</p>
        <p>To get the position of the day from the date, you need the <em>month offset</em>.</p>
      </section>

      <section id="month-offset">
        <h2>Month Offset</h2>
        <p>The <em>month offset</em> is just the number of placeholders in the week before the first day of the month. You&apos;ve seen this many times on a conventional calendar. Here, for example, is the calendar for September 2023, which has a <em>month offset</em> of 5 days:</p>
        <SeptemberCalendar />
        <p>To determine the day of the week, you just add the <em>month offset</em> to the date. For example, the day of the week for September 1, 2023 is Friday:</p>
        <ul>
          <li><em>Month offset</em> for September 2023: 5.</li>
          <li>Add the date: 1 + 5 = 6.</li>
          <li>Day 6 in the weekly cycle is Friday.</li>
        </ul>
        <p>How about September 23?</p>
        <ul>
          <li><em>Month offset</em> for September 2023: 5.</li>
          <li>Add the date: 23 + 5 = 28.</li>
          <li>Day 28 in the weekly cycle is Saturday.</li>
        </ul>
        <p>Because the number of days in a month doesn&apos;t change (except February in a leap year), the month offsets follow the same pattern from year to year. If you calculate the offset for a given <em>year</em>, you can get any <em>month offset</em> in that year by adding the <em>generic month offset</em>.</p>
        <p>These offsets aren&apos;t arbitrary: each one represents the sum of the previous one and the number of days in the previous month. February&apos;s is 3. That&apos;s because January&apos;s is 0, and there are 31 days in January. April&apos;s is 6. That&apos;s because March&apos;s is 3, and there are 31 days in March. You could calculate the offset for any month by adding the number of days in the preceding months, dividing by 7, and taking the remainder.</p>
        <p>Or you could just become familiar with this chart.</p>
        <p>Generic month offsets:</p>
        <div className="calendar-instructions-month-offsets">
          {monthOffsets.map(([month, offset]) => <div key={month}>{month}: {offset}</div>)}
        </div>
      </section>

      <section id="year-offsets">
        <h2>Year Offsets</h2>
        <p>Just like the <em>month offset</em>, you can think of the <em>year offset</em> as the number of placeholders in the week before the first day of the year. (Disclaimer, because I&apos;d be &quot;that guy&quot;: this isn&apos;t strictly accurate in the case of a leap year, but it &quot;works.&quot;) We&apos;ll be focusing on years in the 21st century.</p>
        <p>To get the <em>year offset</em>, start with the two-digit year, divide by 4 to get the number of leap days from 2001 to that year, and add the number of leap days to the two-digit year.</p>
        <p>Let&apos;s use 2025 as an example:</p>
        <ul>
          <li>Two-digit year: 25.</li>
          <li>25 / 4 = 6 (we&apos;re only interested in the whole number).</li>
          <li>6 + 25 = 31. Day 31 in the weekly cycle is also day 3.</li>
          <li>So the <em>year offset</em> for 2025 is 3.</li>
        </ul>
        <p>Let&apos;s get the day of the week for June 28, 2025</p>
        <ul>
          <li>We have the <em>year offset</em> for 2025: 3.</li>
          <li>The <em>month offset</em> for June is the <em>year offset</em> (3) + the <em>generic month offset</em> (4), so 7, which in the weekly cycle is the same as 0.</li>
          <li>Add the <em>month offset</em> (0) to the date (28), for a total of 28.</li>
          <li>The 28th day in the weekly cycle is Saturday.</li>
        </ul>
      </section>

      <section id="leap-years">
        <h2>Leap Years</h2>
        <p>If the date you want is in January or February of a leap year, there&apos;s one small adjustment you need to make. To compensate for the leap day, just subtract 1 at some point in your process.</p>
        <p>Let&apos;s take an example: February 4, 2024.</p>
        <ul>
          <li>Start with the <em>year offset</em>: 24 + 6 = 30 = 2.</li>
          <li>The <em>month offset</em> for February is the <em>year offset</em> + 3, so 5.</li>
          <li>Add that to the date, for a total of 9, so 2.</li>
          <li>To adjust for the leap year, Subtract 1, giving a result of 1.</li>
        </ul>
        <p>So February 4, 2024 is on the 1st day of the week.</p>
        <p>The reason only January and February need to be adjusted is that no adjustment is needed for dates after the leap day.</p>
      </section>

      <section id="other-centuries">
        <h2>Other Centuries</h2>
        <p>As with months and years, each century has its own offset. The offset for the 21st century happens to be 0, which is why there&apos;s no need to add it when finding the day of the week in the 21st century.</p>
        <p>The 20th century had an offset of 1. If you want to find the day of the week for a date in the 1900s, just follow the process above, and add 1.</p>
        <p>Let&apos;s take May 8, 1934 as an example:</p>
        <ul>
          <li><em>Year offset</em> for 2034: 34 + 8 = 42 = 0.</li>
          <li><em>Century offset</em> for 1900 is 1: 0 + 1 = 1.</li>
          <li><em>Generic month offset</em> for May is 1: 1 + 1 = 2.</li>
          <li><em>Month offset</em> for May 1934 is therefore 2.</li>
          <li>Day of week for May 8, 1934 is 2 + 8 = 10 = 3.</li>
          <li>May 8, 1934 was the 3rd day of the week: Tuesday.</li>
        </ul>
        <p>The 19th century had an offset of 3, and the 18th century had an offset of 5. The 1600s are exactly the same as the 2000s, so September 16, 1623 was a Saturday, just like September 16, 2023.</p>
        <p>For earlier centuries, you can take the integer value of any year in that century divided by 100, and subtract that from 19. So for the 1500s, the offset is 4; for the 1400s, it&apos;s 5; for the 700s, it&apos;s 12 = 5; &amp;c.</p>
        <p>As a random curiosity, this would mean that dates in the 1200s, as in the 1600s, had the same weekdays as the same dates in the 2000s. That&apos;s right: September 21, 1223 was a Thursday, just like September 21, 2023.</p>
      </section>

      <section id="calendar-1582">
        <h2>1582</h2>
        <p>It&apos;s told that in October 1582, 10 days were dropped from the calendar to sort of recalibrate. Seems too many leap days had been added over the centuries, and things were a bit off.</p>
        <p>So instead of October 5 following October 4 that year, Thursday, October 4 was followed by Friday, October 15.</p>
        <p>How does this affect weekday calculation? Treat dates up to October 4, 1582 as any other date in the 1500s: the century offset is 19 - 15, or 4. Treat any subsequent dates in the 1500s as though they were in the 1900s, so the century offset is 1.</p>
      </section>

      <div className="calendar-instructions-actions">
        <Link to="/calendar/lab">Practice generating a calendar</Link>
        <Link to="/calendar">Browse the calendars</Link>
      </div>
    </main>
  );
}
