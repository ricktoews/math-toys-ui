import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const genericOffsets = [0, 3, 3, 6, 1, 4, 6, 2, 5, 0, 3, 5];
const offsets2025 = [3, 6, 6, 2, 4, 0, 2, 5, 1, 3, 6, 1];
const contents = [
  ['idea', 'The idea'],
  ['pattern', 'The pattern'],
  ['year', 'Choose a year'],
  ['use', 'Use a digit'],
];

function WeeklyCycle() {
  return (
    <div className="calendar-instructions-weekly-cycle" aria-label="Weekly cycle">
      {weekdays.map(day => <strong key={day}>{day}</strong>)}
      {Array.from({ length: 8 }, (_, index) => <span key={index + 1}>{index + 1}</span>)}
    </div>
  );
}

function OffsetGrid({ offsets, label }) {
  return (
    <div className="calendar-instructions-month-offsets" aria-label={label}>
      {months.map((month, index) => (
        <div key={month}>
          <span>{month}</span>
          <strong>{offsets[index]}</strong>
        </div>
      ))}
    </div>
  );
}

export default function CalendarInstructions() {
  const [activeSection, setActiveSection] = useState(contents[0][0]);
  const tocRef = useRef(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let frame;
    const updateActiveSection = () => {
      const marker = window.innerWidth < 1200 ? 145 : 110;
      const current = contents.reduce((active, [id]) => {
        const section = document.getElementById(id);
        return section && section.getBoundingClientRect().top <= marker ? id : active;
      }, contents[0][0]);

      setActiveSection(current);
      frame = undefined;
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const toc = tocRef.current;
    const activeLink = toc?.querySelector(`[href="#${activeSection}"]`);
    if (!toc || !activeLink || toc.scrollWidth <= toc.clientWidth) return;

    const left = activeLink.offsetLeft - (toc.clientWidth - activeLink.offsetWidth) / 2;
    toc.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [activeSection]);

  return (
    <main className="calendar-instructions-page">
      <Link to="/calendar" className="calendar-lab-back">← Back to calendar</Link>

      <nav ref={tocRef} className="calendar-instructions-toc" aria-label="On this page">
        <strong>On this page</strong>
        <ol>
          {contents.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={activeSection === id ? 'location' : undefined}
                onClick={() => setActiveSection(id)}
              >
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <header className="calendar-instructions-heading">
        <h1>How the 12-Digit Calendar Works</h1>
        <p>One digit for each month. Add the date, and you have the day of the week.</p>
      </header>

      <section id="idea">
        <h2>The idea</h2>
        <p>
          Weekdays repeat in a cycle of seven. After Saturday, counting starts again
          at Sunday. That is why day 8 lands in the same place as day 1.
        </p>
        <WeeklyCycle />
        <p>
          Whenever a number is larger than 7, keep only its remainder after division
          by 7. This is called <em>modulo 7</em>.
        </p>
      </section>

      <section id="pattern">
        <h2>The 12-digit pattern</h2>
        <p>
          Each digit is an offset for one month, from January through December. The
          starting pattern for an ordinary year is:
        </p>
        <OffsetGrid offsets={genericOffsets} label="Generic month offsets" />
        <p>
          The pattern follows the lengths of the months. You do not need to derive it
          each time—just use it as the starting point.
        </p>
      </section>

      <section id="year">
        <h2>Shift the pattern for a year</h2>
        <p>First find the year offset:</p>
        <div className="calendar-instructions-formula">
          two-digit year + whole leap days + century offset, modulo 7
        </div>
        <p>
          Whole leap days means the two-digit year divided by 4, with the fraction
          discarded. Century offsets are 0 for the 2000s, 1 for the 1900s, 3 for the
          1800s, and 5 for the 1700s. This sequence repeats every 400 years.
        </p>
        <div className="calendar-instructions-example">
          <h3>Example: 2025</h3>
          <p>25 + 6 leap days + 0 century offset = 31. Modulo 7, the year offset is 3.</p>
          <p>Add 3 to every generic digit and reduce each result modulo 7:</p>
          <OffsetGrid offsets={offsets2025} label="Month offsets for 2025" />
          <p className="calendar-instructions-example-result"><strong>2025:</strong> 3 6 6 2 4 0 2 5 1 3 6 1</p>
        </div>
        <aside className="calendar-instructions-note">
          <h3>Leap years</h3>
          <p>
            In a leap year, subtract 1 from the January and February digits. The other
            ten digits stay the same.
          </p>
        </aside>
      </section>

      <section id="use">
        <h2>Use one digit</h2>
        <p>Choose the digit for the month, add the date, and reduce modulo 7.</p>
        <div className="calendar-instructions-formula">
          month digit + date, modulo 7
        </div>
        <p>
          For June 28, 2025, the June digit is 0. So 0 + 28 = 28, which is 0 modulo 7.
          A result of 0 means Saturday.
        </p>
        <div className="calendar-instructions-weekday-key" aria-label="Weekday result key">
          <span><strong>0</strong> Sat</span>
          <span><strong>1</strong> Sun</span>
          <span><strong>2</strong> Mon</span>
          <span><strong>3</strong> Tue</span>
          <span><strong>4</strong> Wed</span>
          <span><strong>5</strong> Thu</span>
          <span><strong>6</strong> Fri</span>
        </div>
      </section>

      <div className="calendar-instructions-actions">
        <Link to="/calendar/lab">Practice generating a calendar</Link>
        <Link to="/calendar">Browse the calendars</Link>
      </div>
    </main>
  );
}
