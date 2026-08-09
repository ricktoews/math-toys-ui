import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
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

const alignCalculationCard = (card, behavior = 'auto') => {
  if (!card?.isConnected) return;
  const mastheadHeight = document.querySelector('.fixed-header')?.getBoundingClientRect().height ?? 60;
  const progressHeight = document.querySelector('.calendar-lab-progress')?.getBoundingClientRect().height ?? 0;
  const stickyGap = 18;
  const top = window.scrollY + card.getBoundingClientRect().top
    - mastheadHeight - progressHeight - stickyGap;

  window.scrollTo({ top: Math.max(0, top), behavior });
};

function AnswerForm({
  label,
  onAnswer,
  wide = false,
  digitPad = false,
  onFocus,
  onPointerDown,
  onDigitEntry,
  onDigitsEmpty,
  isCorrect = false,
  onAnother,
}) {
  const [answer, setAnswer] = useState('');

  const submit = event => {
    event.preventDefault();
    if (answer.trim()) onAnswer(answer.trim());
  };

  const evaluateOnBlur = event => {
    if (answer.trim() && event.relatedTarget?.type !== 'submit') {
      onAnswer(answer.trim());
    }
  };

  const enterDigit = digit => {
    onDigitEntry?.();
    setAnswer(current => current.length < 12 ? `${current}${digit}` : current);
  };

  const undoDigit = () => {
    if (answer.length === 1) onDigitsEmpty?.();
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
            className={`calendar-lab-calendar-entry ${isCorrect ? 'calendar-lab-calendar-entry-correct' : ''}`}
            aria-label={`${answer.length} of 12 month offsets entered`}
            aria-live="polite"
          >
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={index}
                className={index < answer.length ? 'filled' : ''}
                style={{ '--calendar-digit-index': index }}
              >
                {answer[index] ?? ''}
              </span>
            ))}
          </div>
        </div>

        <div className="calendar-lab-builder-actions">
          {isCorrect ? (
            <button type="button" className="calendar-lab-builder-another" onClick={onAnother}>
              Another
            </button>
          ) : (
            <>
              <button type="button" className="calendar-lab-undo" onClick={undoDigit} disabled={!answer.length}>
                Undo
              </button>
              <button type="submit" className="calendar-lab-builder-check" disabled={answer.length !== 12}>
                Check
              </button>
            </>
          )}
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
          onPointerDown={onPointerDown}
          onBlur={evaluateOnBlur}
        />
      </label>
      <button type="submit" className="calendar-lab-answer-check" aria-label="Check answer">✓</button>
    </form>
  );
}

function CalculationCard({ title, complete = false, incorrect = false, children }) {
  return (
    <article className={`calendar-lab-card ${complete ? 'calendar-lab-card-complete' : ''} ${incorrect ? 'calendar-lab-card-incorrect' : ''}`}>
      <h2>{title}</h2>
      {children}
    </article>
  );
}

export default function CalendarLab() {
  const [year, setYear] = useState(randomYear);
  const [completed, setCompleted] = useState({});
  const [message, setMessage] = useState('');
  const [skipHidden, setSkipHidden] = useState(false);
  const [skipInstant, setSkipInstant] = useState(false);
  const [walkthroughHidden, setWalkthroughHidden] = useState(false);
  const [yearOffsetEntry, setYearOffsetEntry] = useState(null);
  const [incorrect, setIncorrect] = useState({});
  const focusedCardRef = useRef(null);
  const pointerFocusRef = useRef(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [year]);

  useLayoutEffect(() => {
    if (!skipHidden || !focusedCardRef.current) return;

    alignCalculationCard(focusedCardRef.current);
    focusedCardRef.current = null;
  }, [skipHidden]);

  const answers = useMemo(() => {
    const yearWithinCentury = year % 100;
    const leap = isLeapYear(year);
    const centuryOffset = centuryOffsetFor(year);
    const leapQuotient = Math.floor(yearWithinCentury / 4);
    const yearTotal = yearWithinCentury + leapQuotient;
    const yearModulo = yearTotal % 7;
    const yearOffset = (centuryOffset + yearModulo) % 7;
    const digits = calc12DigitYear(year);
    return { yearWithinCentury, leap, centuryOffset, leapQuotient, yearTotal, yearModulo, yearOffset, digits };
  }, [year]);

  const newYear = () => {
    setYear(randomYear());
    setCompleted({});
    setMessage('');
    setSkipHidden(false);
    setSkipInstant(false);
    setWalkthroughHidden(false);
    setYearOffsetEntry(null);
    setIncorrect({});
  };

  const markComplete = component => {
    setCompleted(current => ({ ...current, [component]: true }));
    setIncorrect(current => ({ ...current, [component]: false }));
  };

  const checkNumber = (value, expected, component) => {
    const expectedValues = Array.isArray(expected) ? expected : [expected];
    if (expectedValues.includes(Number(value))) {
      if (component === 'total') setYearOffsetEntry(Number(value));
      markComplete(component);
      setMessage('');
    } else {
      setIncorrect(current => ({ ...current, [component]: true }));
      setMessage('Not quite—try that card again.');
    }
  };

  const checkDigits = value => {
    const entered = normalizeDigits(value);
    const expected = answers.digits.join('');
    if (entered === expected) {
      markComplete('calendar');
      setMessage('');
    } else {
      setIncorrect(current => ({ ...current, calendar: true }));
      setMessage(entered.length === 12
        ? 'Those offsets do not match this year yet.'
        : 'Enter all 12 month offsets, using digits from 0 through 6.');
    }
  };

  const chooseLeap = choice => {
    if (choice === answers.leap) {
      markComplete('leap');
      setMessage('');
    } else {
      setIncorrect(current => ({ ...current, leap: true }));
      setMessage('Check the Gregorian leap-year rule and try again.');
    }
  };

  const focusCalculationCard = event => {
    if (pointerFocusRef.current) {
      pointerFocusRef.current = false;
      return;
    }

    const card = event.currentTarget.closest('.calendar-lab-card');
    focusedCardRef.current = card;
    setSkipInstant(true);
    setSkipHidden(true);
  };

  const pointerFocusCalculationCard = event => {
    event.preventDefault();
    const input = event.currentTarget;
    const card = input.closest('.calendar-lab-card');
    pointerFocusRef.current = true;

    flushSync(() => {
      setSkipInstant(true);
      setSkipHidden(true);
    });

    input.focus({ preventScroll: true });
    pointerFocusRef.current = false;
    alignCalculationCard(card, 'smooth');
  };

  const componentsComplete = ['century', 'leap', 'total', 'base']
    .every(component => completed[component]);

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
        className={`calendar-lab-skip ${skipHidden ? 'calendar-lab-skip-hidden' : ''} ${skipInstant ? 'calendar-lab-skip-instant' : ''}`}
        aria-label="Enter the complete calendar"
        aria-hidden={skipHidden}
      >
        <AnswerForm
          key={`skip-${year}`}
          label="All 12 month offsets"
          onAnswer={checkDigits}
          wide
          digitPad
          onDigitEntry={() => setWalkthroughHidden(true)}
          onDigitsEmpty={() => setWalkthroughHidden(false)}
          isCorrect={completed.calendar}
          onAnother={newYear}
        />
      </section>

      {!walkthroughHidden && (
        <>
          <div className="calendar-lab-work-heading">
            <h2>Work Through</h2>
            <p>Complete the parts of the year calculation in any order.</p>
          </div>

          <div className="calendar-lab-progress" aria-live="polite">
            <table>
              <thead>
                <tr>
                  <th scope="col">Year Offset</th>
                  <th scope="col">Leap Year</th>
                  <th scope="col">Century Offset</th>
                  <th scope="col">Base Offset</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{completed.total ? yearOffsetEntry : '—'}</td>
                  <td>{completed.leap ? (answers.leap ? 'Yes' : 'No') : '—'}</td>
                  <td>{completed.century ? answers.centuryOffset : '—'}</td>
                  <td>{completed.base ? answers.yearOffset : '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <section className="calendar-lab-cards" aria-label="Calendar calculation workspace">
            <CalculationCard
              title="Year offset"
              complete={completed.total}
              incorrect={incorrect.total}
            >
              <div className="calendar-lab-card-year">{year}</div>
              <p>
                Divide {String(answers.yearWithinCentury).padStart(2, '0')} by 4, and add that to{' '}
                {String(answers.yearWithinCentury).padStart(2, '0')}.
              </p>
              <div className="calendar-lab-card-calculation">
                <div>
                  {completed.total ? (
                    <p className="calendar-lab-card-answer">= <strong>{yearOffsetEntry}</strong></p>
                  ) : (
                    <AnswerForm
                      label="Year sum or its offset modulo 7"
                      onAnswer={value => checkNumber(
                        value,
                        [answers.yearTotal, answers.yearModulo],
                        'total'
                      )}
                      onFocus={focusCalculationCard}
                      onPointerDown={pointerFocusCalculationCard}
                    />
                  )}
                </div>
              </div>
            </CalculationCard>

          <CalculationCard title="Leap Year" complete={completed.leap} incorrect={incorrect.leap}>
            {completed.leap ? (
              <p><strong>{answers.leap ? 'Yes' : 'No'}</strong></p>
            ) : (
              <>
                <p>Is {year} a leap year?</p>
                <div className="calendar-lab-choices">
                  <button type="button" onClick={() => { setSkipHidden(true); chooseLeap(true); }}>Yes</button>
                  <button type="button" onClick={() => { setSkipHidden(true); chooseLeap(false); }}>No</button>
                </div>
              </>
            )}
          </CalculationCard>

          <CalculationCard title="Century offset" complete={completed.century} incorrect={incorrect.century}>
            {completed.century ? (
              <p>Century offset: <strong>{answers.centuryOffset}</strong></p>
            ) : (
              <>
                <p>Choose the offset for the century containing {year}.</p>
                <div className="calendar-lab-offset-choices" aria-label="Choose the century offset">
                  {[0, 1, 3, 5].map(offset => (
                    <button
                      type="button"
                      key={offset}
                      onClick={() => {
                        setSkipHidden(true);
                        checkNumber(offset, answers.centuryOffset, 'century');
                      }}
                      aria-label={`Century offset ${offset}`}
                    >
                      {offset}
                    </button>
                  ))}
                </div>
              </>
            )}
          </CalculationCard>

          <CalculationCard title="Base offset" complete={completed.base} incorrect={incorrect.base}>
            {completed.base ? (
              <p>Base offset: <strong>{answers.yearOffset}</strong></p>
            ) : (
              <>
                <p>Add the Year and Century offsets.</p>
                <AnswerForm
                  label="Base offset"
                  onAnswer={value => checkNumber(value, answers.yearOffset, 'base')}
                  onFocus={focusCalculationCard}
                  onPointerDown={pointerFocusCalculationCard}
                />
              </>
            )}
          </CalculationCard>

        {componentsComplete && (
          <CalculationCard title="Build the calendar" complete={completed.calendar} incorrect={incorrect.calendar}>
            <p>
              The year offset is <strong>{answers.yearOffset}</strong>.
              {answers.leap && ' Subtract 1 from the ordinary January and February offsets.'}
            </p>
            <AnswerForm
              key={`guided-${year}`}
              label="Complete 12-digit calendar"
              onAnswer={checkDigits}
              digitPad
              isCorrect={completed.calendar}
              onAnother={newYear}
            />
          </CalculationCard>
        )}
          </section>
        </>
      )}

      <p className={`calendar-lab-message ${completed.calendar ? 'success' : ''}`} role="status" aria-live="polite">
        {message}
      </p>

    </main>
  );
}
