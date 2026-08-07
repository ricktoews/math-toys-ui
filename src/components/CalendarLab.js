import { useLayoutEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { calc12DigitYear } from './calendar-helper';

const randomYear = () => {
  let year;
  do {
    year = 1601 + Math.floor(Math.random() * 799);
  } while (year % 100 === 0);
  return year;
};

const isLeapYear = year => year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
const centuryOffsetFor = year => (Math.floor(year / 100) % 4 * 5) % 7;

const normalizeDigits = value => value.replace(/[^0-6]/g, '');

function AnswerForm({ label, onAnswer, wide = false, digitPad = false, onFocus }) {
  const [answer, setAnswer] = useState('');

  const submit = event => {
    event.preventDefault();
    if (answer.trim()) onAnswer(answer.trim());
  };

  const enterDigit = digit => {
    setAnswer(current => current.length < 12 ? `${current}${digit}` : current);
  };

  const undoDigit = () => {
    setAnswer(current => current.slice(0, -1));
  };

  if (digitPad) {
    return (
      <form className="calendar-lab-builder" onSubmit={submit}>
        <span className="visually-hidden">{label}</span>
        <div className="calendar-lab-builder-body">
          <div className="calendar-lab-digit-cluster" aria-label="Month offset digits">
            {[0, 1, 2, 3, 4, 5, 6].map(digit => (
              <button
                type="button"
                key={digit}
                className={`calendar-lab-digit calendar-lab-digit-${digit}`}
                onClick={() => enterDigit(digit)}
                disabled={answer.length >= 12}
                aria-label={`Enter ${digit}`}
              >
                {digit}
              </button>
            ))}
          </div>

          <div
            className="calendar-lab-calendar-entry"
            aria-label={`${answer.length} of 12 month offsets entered`}
            aria-live="polite"
          >
            {Array.from({ length: 12 }, (_, index) => (
              <span key={index} className={index < answer.length ? 'filled' : ''}>
                {answer[index] ?? ''}
              </span>
            ))}
          </div>
        </div>

        <div className="calendar-lab-builder-actions">
          <button type="button" className="calendar-lab-undo" onClick={undoDigit} disabled={!answer.length}>
            Undo
          </button>
          <button type="submit" className="calendar-lab-builder-check" disabled={answer.length !== 12}>
            Check
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="calendar-lab-answer" onSubmit={submit}>
      <label>
        <span className="visually-hidden">{label}</span>
        <input
          className={wide ? 'calendar-lab-digits-input' : ''}
          value={answer}
          onChange={event => setAnswer(
            digitPad ? normalizeDigits(event.target.value).slice(0, 12) : event.target.value
          )}
          inputMode={wide ? 'text' : 'numeric'}
          autoComplete="off"
          maxLength={digitPad ? 12 : undefined}
          onFocus={onFocus}
        />
      </label>
      <button type="submit">Check</button>
    </form>
  );
}

function Step({ number, children }) {
  return (
    <div className="calendar-lab-step">
      <span className="calendar-lab-step-number">Step {number}</span>
      <div>{children}</div>
    </div>
  );
}

export default function CalendarLab() {
  const [year, setYear] = useState(randomYear);
  const [completed, setCompleted] = useState(0);
  const [message, setMessage] = useState('');
  const [skipHidden, setSkipHidden] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [year]);

  const answers = useMemo(() => {
    const yearWithinCentury = year % 100;
    const leap = isLeapYear(year);
    const centuryOffset = centuryOffsetFor(year);
    const leapDays = Math.floor(yearWithinCentury / 4) - (leap ? 1 : 0);
    const yearTotal = yearWithinCentury + leapDays;
    const januaryDigit = (centuryOffset + yearTotal) % 7;
    const digits = calc12DigitYear(year);
    return { yearWithinCentury, leap, centuryOffset, leapDays, yearTotal, januaryDigit, digits };
  }, [year]);

  const newYear = () => {
    setYear(randomYear());
    setCompleted(0);
    setMessage('');
    setSkipHidden(false);
  };

  const checkNumber = (value, expected, step) => {
    if (Number(value) === expected) {
      setCompleted(step);
      setMessage('');
    } else {
      setMessage('Not quite—try that step again.');
    }
  };

  const checkDigits = value => {
    const entered = normalizeDigits(value);
    const expected = answers.digits.join('');
    if (entered === expected) {
      setCompleted(6);
      setMessage(`Correct! ${year} is ${answers.digits.join(' ')}.`);
    } else {
      setMessage(entered.length === 12
        ? 'Those offsets do not match this year yet.'
        : 'Enter all 12 month offsets, using digits from 0 through 6.');
    }
  };

  const chooseLeap = choice => {
    if (choice === answers.leap) {
      setCompleted(2);
      setMessage('');
    } else {
      setMessage('Check the Gregorian leap-year rule and try again.');
    }
  };

  return (
    <main className="calendar-lab-page">
      <div className="calendar-lab-heading">
        <Link to="/calendar" className="calendar-lab-back">← Back to calendar</Link>
        <h1>
          <span>Generate the calendar for</span>
          <strong>{year}</strong>
        </h1>
      </div>

      <section
        className={`calendar-lab-skip ${skipHidden ? 'calendar-lab-skip-hidden' : ''}`}
        aria-label="Enter the complete calendar"
        aria-hidden={skipHidden}
      >
        <AnswerForm
          key={`skip-${year}`}
          label="All 12 month offsets"
          onAnswer={checkDigits}
          wide
          digitPad
        />
      </section>

      <p className="calendar-lab-intro">Work through the year calculation one step at a time.</p>

      <section className="calendar-lab-steps" aria-label="Calendar calculation steps">
        <Step number="1">
          {completed >= 1 ? (
            <p>Century offset: <strong>{answers.centuryOffset}</strong></p>
          ) : (
            <>
              <p>Find the century offset for {year}.</p>
              <AnswerForm
                key={`century-${year}`}
                label="Century offset"
                onAnswer={value => checkNumber(value, answers.centuryOffset, 1)}
                onFocus={() => setSkipHidden(true)}
              />
            </>
          )}
        </Step>

        {completed >= 1 && (
          <Step number="2">
            {completed >= 2 ? (
              <p><strong>{answers.leap ? 'Leap year' : 'Non-leap year'}</strong></p>
            ) : (
              <>
                <p>Is {year} a leap year?</p>
                <div className="calendar-lab-choices">
                  <button type="button" onClick={() => chooseLeap(true)}>Leap year</button>
                  <button type="button" onClick={() => chooseLeap(false)}>Non-leap year</button>
                </div>
              </>
            )}
          </Step>
        )}

        {completed >= 2 && (
          <Step number="3">
            {completed >= 3 ? (
              <p>Prior leap days: <strong>{answers.leapDays}</strong></p>
            ) : (
              <>
                <p>Find the number of leap days before {year} in its century.</p>
                <div className="calendar-lab-equation">
                  <span>{answers.yearWithinCentury}</span><span>÷</span><span>4</span>
                  {answers.leap && <span>− 1</span>}
                </div>
                <AnswerForm label="Number of prior leap days" onAnswer={value => checkNumber(value, answers.leapDays, 3)} />
              </>
            )}
          </Step>
        )}

        {completed >= 3 && (
          <Step number="4">
            {completed >= 4 ? (
              <p>Year total: <strong>{answers.yearTotal}</strong></p>
            ) : (
              <>
                <p>Add the two-digit year and its prior leap days.</p>
                <div className="calendar-lab-equation">
                  <span>{answers.yearWithinCentury}</span><span>+</span><span>{answers.leapDays}</span>
                </div>
                <AnswerForm label="Year total" onAnswer={value => checkNumber(value, answers.yearTotal, 4)} />
              </>
            )}
          </Step>
        )}

        {completed >= 4 && (
          <Step number="5">
            {completed >= 5 ? (
              <p>January offset: <strong>{answers.januaryDigit}</strong></p>
            ) : (
              <>
                <p>Add the century offset, then reduce modulo 7.</p>
                <div className="calendar-lab-equation calendar-lab-equation-wide">
                  <span>({answers.centuryOffset}</span><span>+</span><span>{answers.yearTotal})</span><span>mod 7</span>
                </div>
                <AnswerForm label="January offset" onAnswer={value => checkNumber(value, answers.januaryDigit, 5)} />
              </>
            )}
          </Step>
        )}

        {completed >= 5 && (
          <Step number="6">
            <p>Complete the 12-digit calendar.</p>
            {completed >= 6 ? (
              <p className="calendar-lab-result"><strong>{answers.digits.join(' ')}</strong></p>
            ) : (
              <AnswerForm label="Complete 12-digit calendar" onAnswer={checkDigits} digitPad />
            )}
          </Step>
        )}
      </section>

      <p className={`calendar-lab-message ${completed === 6 ? 'success' : ''}`} role="status" aria-live="polite">
        {message}
      </p>

      <button type="button" className="calendar-lab-new-year" onClick={newYear}>New Year</button>
    </main>
  );
}
