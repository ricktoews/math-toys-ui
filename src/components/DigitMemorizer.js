import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';

const KEYPAD_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

function DigitMemorizer({ show, onHide, digits = '', title = 'Practice digits', prompt }) {
  const allDigits = String(digits).replace(/\D/g, '');
  const [entry, setEntry] = useState('');
  const [incorrectDigit, setIncorrectDigit] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const hasSelectedRange = rangeStart !== null && rangeEnd !== null;
  const selectedStart = hasSelectedRange ? Math.min(rangeStart, rangeEnd) : null;
  const selectedEnd = hasSelectedRange ? Math.max(rangeStart, rangeEnd) : null;
  const target = hasSelectedRange
    ? allDigits.slice(selectedStart, selectedEnd + 1)
    : allDigits;
  const contextDigits = hasSelectedRange
    ? allDigits.slice(0, selectedStart)
    : '';

  useEffect(() => {
    setRangeStart(null);
    setRangeEnd(null);
  }, [allDigits]);

  useEffect(() => {
    if (show) {
      setEntry('');
      setIncorrectDigit(null);
    }
  }, [show, target]);

  const selectRangeBoundary = index => {
    if (hasSelectedRange) return;

    if (rangeStart === null) {
      setRangeStart(index);
    } else {
      setRangeEnd(index);
    }
  };

  const clearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setEntry('');
    setIncorrectDigit(null);
  };

  const enterDigit = digit => {
    if (!target || entry.length >= target.length) return;

    if (digit === target[entry.length]) {
      setEntry(previous => previous + digit);
      setIncorrectDigit(null);
    } else {
      setIncorrectDigit(digit);
    }
  };

  useEffect(() => {
    if (!show) return undefined;

    const handleKeyDown = event => {
      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        enterDigit(event.key);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        setEntry(previous => previous.slice(0, -1));
        setIncorrectDigit(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const complete = target.length > 0 && entry.length === target.length;
  const status = complete
    ? `Complete — ${target.length} digits correct.`
    : incorrectDigit !== null
      ? `${incorrectDigit} is not the next digit. Try again.`
      : `${entry.length} of ${target.length} digits`;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="digit-memorizer-modal"
      aria-labelledby="digit-memorizer-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="digit-memorizer-title">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {prompt && <p className="digit-memorizer-prompt">{prompt}</p>}
        <div className="digit-range-heading">
          <div>
            <strong>Focus group</strong>
            <span>
              {hasSelectedRange
                ? `Digits ${selectedStart + 1}–${selectedEnd + 1} selected`
                : rangeStart !== null
                  ? `Digit ${rangeStart + 1} is the start; choose the last digit`
                  : 'Choose the first digit, then the last'}
            </span>
          </div>
          <button
            type="button"
            className="digit-range-clear"
            onClick={clearRange}
            disabled={rangeStart === null}
          >
            Clear group
          </button>
        </div>
        <div className="digit-range-picker" aria-label="Select a group of digits to practice">
          <div className="digit-range-track">
            {allDigits.split('').map((digit, index) => {
              const isStart = index === rangeStart;
              const isEnd = index === rangeEnd;
              const isInRange = hasSelectedRange && index >= selectedStart && index <= selectedEnd;
              const classNames = [
                'digit-range-button',
                isInRange ? 'digit-range-button-selected' : '',
                isStart || isEnd ? 'digit-range-button-boundary' : ''
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={index}
                  type="button"
                  className={classNames}
                  onClick={() => selectRangeBoundary(index)}
                  disabled={hasSelectedRange}
                  aria-label={`Digit ${index + 1}: ${digit}`}
                  aria-pressed={isInRange || isStart}
                >
                  {digit}
                </button>
              );
            })}
          </div>
        </div>
        <div className="digit-memorizer-workspace">
          <div className="digit-memorizer-keypad" aria-label="Number keypad">
            {KEYPAD_DIGITS.map(digit => (
              <button
                key={digit}
                type="button"
                className={`digit-memorizer-key${digit === '0' ? ' digit-memorizer-key-zero' : ''}`}
                onClick={() => enterDigit(digit)}
                disabled={complete}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              className="digit-memorizer-key digit-memorizer-key-action"
              onClick={() => {
                setEntry(previous => previous.slice(0, -1));
                setIncorrectDigit(null);
              }}
              disabled={!entry.length}
              aria-label="Delete last digit"
            >
              ⌫
            </button>
          </div>

          <div className="digit-memorizer-answer">
            <div className="digit-memorizer-entry" aria-label="Digits entered">
              {contextDigits && (
                <span className="digit-memorizer-context" aria-label="Digits before the selected group">
                  {contextDigits}
                </span>
              )}
              {entry}
              {!contextDigits && !entry && (
                <span className="digit-memorizer-placeholder">Enter the first digit</span>
              )}
            </div>
            <div
              className={`digit-memorizer-status${incorrectDigit !== null ? ' digit-memorizer-status-error' : ''}${complete ? ' digit-memorizer-status-complete' : ''}`}
              role="status"
              aria-live="polite"
            >
              {status}
            </div>
            <button
              type="button"
              className="digit-memorizer-reset"
              onClick={() => {
                setEntry('');
                setIncorrectDigit(null);
              }}
              disabled={!entry.length && incorrectDigit === null}
            >
              Start over
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default DigitMemorizer;
