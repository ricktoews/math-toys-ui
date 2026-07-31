import React, { useState, useEffect } from 'react';
import { Table, Modal } from 'react-bootstrap';
import '../css/LucasLab.scss';

const formatDifferenceMagnitude = (value) => {
  const magnitude = Math.abs(value);
  return magnitude < 0.000001 && magnitude !== 0
    ? magnitude.toExponential(6)
    : magnitude.toFixed(12);
};

const formatTruncatedFraction = (numerator, denominator, decimalPlaces) => {
  const integerPart = numerator / denominator;
  let remainder = numerator % denominator;
  let decimalPart = '';

  for (let place = 0; place < decimalPlaces; place++) {
    remainder *= 10n;
    decimalPart += (remainder / denominator).toString();
    remainder %= denominator;
  }

  return `${integerPart.toString()}.${decimalPart}`;
};

const formatTableInteger = (value) => {
  const digits = value.toString();

  if (digits.length <= 10) {
    return {
      display: digits,
      abbreviated: false
    };
  }

  return {
    display: `${digits[0]}.${digits.slice(1, 6)}e${digits.length - 1}`,
    abbreviated: true
  };
};

const greatestCommonDivisor = (a, b) => {
  let left = a;
  let right = b;

  while (right !== 0n) {
    [left, right] = [right, left % right];
  }

  return left;
};

const hasDigitsBeyond = (numerator, denominator, decimalPlaces) => {
  let reducedDenominator = denominator / greatestCommonDivisor(numerator, denominator);
  let factorsOfTwo = 0;
  let factorsOfFive = 0;

  while (reducedDenominator % 2n === 0n) {
    reducedDenominator /= 2n;
    factorsOfTwo += 1;
  }

  while (reducedDenominator % 5n === 0n) {
    reducedDenominator /= 5n;
    factorsOfFive += 1;
  }

  return reducedDenominator !== 1n || Math.max(factorsOfTwo, factorsOfFive) > decimalPlaces;
};

function InfoModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      dialogClassName="lucas-info-modal"
      aria-labelledby="lucas-info-title"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="lucas-info-title">
          Square Root Lab
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="lucas-info-body">
        <p>
          This illustrates a method for computing square roots of integers using recursive formulas.
        </p>
        <p>
          For a given integer D, the sequence converges to √D through the recurrence relations:
        </p>
        <div className="lucas-info-formulas">
          • y<sub>n</sub> = (D-1)y<sub>n-1</sub> + x<sub>n-1</sub>
          <br />
          • x<sub>n</sub> = Dy<sub>n-1</sub> + (D-1)x<sub>n-1</sub>
        </div>
        <p>
          Starting with y<sub>0</sub> = 1 and x<sub>0</sub> = D-1, the ratio x/y converges rapidly to √D.
        </p>
      </Modal.Body>
    </Modal>
  );
}

function LucasLab() {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [lucasData, setLucasData] = useState([]);
  const [selectorCollapsed, setSelectorCollapsed] = useState(false);
  const [infoShow, setInfoShow] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  useEffect(() => {
    if (selectedNumber !== null) {
      calculateLucasSequence(selectedNumber);
    }
  }, [selectedNumber]);

  const calculateLucasSequence = (n) => {
    const data = [];
    const bigD = window.BigInt(n);
    const bigCoefficient = window.BigInt(n - 1);
    let y = 1n;
    let x = bigCoefficient;
    
    for (let i = 0; i < 20; i++) {
      const ratio = y === 0n ? 0 : Number(x) / Number(y);
      data.push({
        y: y,
        x: x,
        ratio: ratio
      });
      
      // Calculate next values
      const nextY = bigCoefficient * y + x;
      const nextX = bigD * y + bigCoefficient * x;
      y = nextY;
      x = nextX;
    }
    
    setLucasData(data);
  };

  const handleNumberSelect = (num) => {
    setSelectedNumber(num);
    setSelectedRow(null);
    setSelectorCollapsed(true);
  };

  const handlePillClick = () => {
    setSelectorCollapsed(false);
  };

  const handleRowSelect = (index) => {
    setSelectedRow(previous => previous === index ? null : index);
  };

  return (
    <div className="lucas-lab">
      <div className="math-toy-page-header">
        <h1 className="math-toy-page-title">Square Root Lab</h1>
      </div>
      
      <section
        className={[
          'lucas-selector-container',
          selectedNumber !== null && selectorCollapsed ? 'lucas-selector-container-collapsed' : ''
        ].filter(Boolean).join(' ')}
      >
        {selectedNumber !== null && selectorCollapsed ? (
          <div className="lucas-result-summary">
            <div className="lucas-result-heading">
              <button
                type="button"
                className="lucas-back"
                onClick={handlePillClick}
                aria-label="Choose another number"
              >
                <svg
                  className="lucas-back-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19 12H5" />
                  <path d="M11 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="lucas-toggle">
                <span className="lucas-summary-label">D =</span>
                <span className="lucas-summary-value">{selectedNumber}</span>
                <span className="lucas-summary-sep">·</span>
                <span className="lucas-summary-label">√{selectedNumber} =</span>
                <span className="lucas-summary-value">{Math.sqrt(selectedNumber).toFixed(16)}</span>
              </div>
            </div>

            <div className="lucas-formula-box">
              <div>
                x<sub>n</sub> = {selectedNumber}y<sub>n-1</sub> + {selectedNumber - 1 === 1 ? '' : selectedNumber - 1}x<sub>n-1</sub>
              </div>
              <div>
                y<sub>n</sub> = {selectedNumber - 1 === 1 ? '' : selectedNumber - 1}y<sub>n-1</sub> + x<sub>n-1</sub>
              </div>
            </div>
          </div>
        ) : (
          <div className="lucas-selector">
            <div className="lucas-section-title">
              Select a Number (D)
              <button
                type="button"
                className="lucas-info-icon"
                onClick={() => setInfoShow(true)}
                aria-label="Info about Lucas sequences"
              >
                ⓘ
              </button>
            </div>
            
            <div className="lucas-chip-grid">
              {numbers.map(num => (
                <button
                  key={num}
                  className={selectedNumber === num ? "lucas-chip lucas-chip-active" : "lucas-chip"}
                  type="button"
                  onClick={() => handleNumberSelect(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {lucasData.length > 0 && (
        <section className="lucas-table-section">
          <div className="lucas-card">
            <Table className="lucas-table">
              <thead className="lucas-table-head">
                <tr>
                  <th>n</th>
                  <th>x</th>
                  <th>y</th>
                  <th>x/y</th>
                </tr>
              </thead>
              <tbody>
                {lucasData.map((item, index) => {
                  const target = Math.sqrt(selectedNumber);
                  const signedDifference = item.ratio - target;
                  const displayedRatio = formatTruncatedFraction(item.x, item.y, 8);
                  const ratioContinues = hasDigitsBeyond(item.x, item.y, 8);
                  const previous = index > 0 ? lucasData[index - 1] : null;
                  const displayedY = formatTableInteger(item.y);
                  const displayedX = formatTableInteger(item.x);
                  const yCoefficient = selectedNumber - 1;
                  return (
                    <React.Fragment key={index}>
                      {selectedRow === index && (
                        <tr className="lucas-detail-row">
                          <td colSpan="4">
                            <div className="lucas-row-note" aria-live="polite">
                              {previous ? (
                                <>
                                  <div className="lucas-row-note-title">
                                    Build row {index} from row {index - 1}
                                  </div>
                                  <div className="lucas-previous-values">
                                    <span>Previous values:</span>
                                    <span>
                                      y<sub>{index - 1}</sub> ={' '}
                                      <strong className="lucas-previous-value">{previous.y.toString()}</strong>
                                    </span>
                                    <span className="lucas-previous-values-separator">·</span>
                                    <span>
                                      x<sub>{index - 1}</sub> ={' '}
                                      <strong className="lucas-previous-value">{previous.x.toString()}</strong>
                                    </span>
                                  </div>
                                  <div className="lucas-row-calculation">
                                    y<sub>{index}</sub> = {yCoefficient === 1 ? '' : `${yCoefficient} × `}
                                    <span className="lucas-previous-value">{previous.y.toString()}</span>
                                    {' + '}<span className="lucas-previous-value">{previous.x.toString()}</span>
                                    {' = '}<strong className="lucas-current-value">{item.y.toString()}</strong>
                                  </div>
                                  <div className="lucas-row-calculation">
                                    x<sub>{index}</sub> = {selectedNumber} × <span className="lucas-previous-value">{previous.y.toString()}</span>
                                    {' + '}{yCoefficient === 1 ? '' : `${yCoefficient} × `}
                                    <span className="lucas-previous-value">{previous.x.toString()}</span>
                                    {' = '}<strong className="lucas-current-value">{item.x.toString()}</strong>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="lucas-row-note-title">Initial values</div>
                                  <div className="lucas-previous-values">
                                    <span>
                                      y<sub>0</sub> = <strong className="lucas-current-value">{item.y.toString()}</strong>
                                    </span>
                                    <span className="lucas-previous-values-separator">·</span>
                                    <span>
                                      x<sub>0</sub> = D − 1 = <strong className="lucas-current-value">{item.x.toString()}</strong>
                                    </span>
                                  </div>
                                </>
                              )}
                              <div className="lucas-ratio-result">
                                <span>
                                  x<sub>{index}</sub>/y<sub>{index}</sub> =
                                </span>
                                <span className="lucas-fraction lucas-current-value">
                                  <span className="lucas-fraction-numerator">{item.x.toString()}</span>
                                  <span className="lucas-fraction-denominator">{item.y.toString()}</span>
                                </span>
                                <span>≈</span>
                                <span className="lucas-ratio-decimal lucas-current-value">
                                  {item.ratio.toFixed(12)}
                                </span>
                              </div>
                              <div className="lucas-ratio-comparison">
                                {signedDifference === 0 ? (
                                  <>Exactly √{selectedNumber}</>
                                ) : (
                                  <>
                                    <span className="lucas-current-value">
                                      {formatDifferenceMagnitude(signedDifference)}
                                    </span>{' '}
                                    {signedDifference > 0 ? 'above' : 'below'} √{selectedNumber}
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      <tr
                        className={[
                          'lucas-data-row',
                          index % 2 === 1 ? 'lucas-data-row-alt' : '',
                          selectedRow !== null && index === selectedRow - 1 ? 'lucas-data-row-previous' : '',
                          selectedRow === index ? 'lucas-data-row-selected' : ''
                        ].filter(Boolean).join(' ')}
                        onClick={() => handleRowSelect(index)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleRowSelect(index);
                          }
                        }}
                        tabIndex="0"
                        aria-label={`Step ${index}: x equals ${item.x.toString()}, y equals ${item.y.toString()}, x divided by y equals ${item.ratio.toFixed(12)}`}
                      >
                        <td>{index}</td>
                        <td title={displayedX.abbreviated ? item.x.toString() : undefined}>
                          {displayedX.display}
                        </td>
                        <td title={displayedY.abbreviated ? item.y.toString() : undefined}>
                          {displayedY.display}
                        </td>
                        <td>
                          {item.y === 0n ? '—' : (
                            <span title={ratioContinues ? 'Truncated to 8 decimal places' : undefined}>
                              {displayedRatio}{ratioContinues ? '…' : ''}
                            </span>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </section>
      )}
      <InfoModal show={infoShow} onHide={() => setInfoShow(false)} />
    </div>
  );
}

export default LucasLab;
