import React, { useState, useEffect } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import '../css/LucasLab.scss';

const formatSignedDifference = (value) => {
  if (value === 0) {
    return '0';
  }

  const sign = value > 0 ? '+' : '−';
  const magnitude = Math.abs(value);
  const formattedMagnitude = magnitude < 0.000001
    ? magnitude.toExponential(6)
    : magnitude.toFixed(12);

  return `${sign}${formattedMagnitude}`;
};

function InfoModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="lucas-info-title"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="lucas-info-title">
          About Lucas Sequences
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Lucas sequences are a method for computing square roots of integers using recursive formulas.
        </p>
        <p>
          For a given integer D, the sequence converges to √D through the recurrence relations:
        </p>
        <p>
          • y<sub>n</sub> = (D-1)y<sub>n-1</sub> + x<sub>n-1</sub>
          <br />
          • x<sub>n</sub> = Dy<sub>n-1</sub> + (D-1)x<sub>n-1</sub>
        </p>
        <p>
          Starting with y<sub>0</sub> = 1 and x<sub>0</sub> = D-1, the ratio x/y converges rapidly to √D.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button className="app-btn" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
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
    let y = 1;
    let x = n - 1;
    
    for (let i = 0; i < 20; i++) {
      const ratio = y === 0 ? 0 : (x / y);
      data.push({
        y: y,
        x: x,
        ratio: ratio
      });
      
      // Calculate next values
      const nextY = (n - 1) * y + x;
      const nextX = n * y + (n - 1) * x;
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
                <span className="lucas-summary-value">{Math.sqrt(selectedNumber).toFixed(4)}</span>
              </div>
            </div>

            <div className="lucas-formula-box">
              <div>
                y<sub>n</sub> = {selectedNumber - 1 === 1 ? '' : selectedNumber - 1}y<sub>n-1</sub> + x<sub>n-1</sub>
              </div>
              <div>
                x<sub>n</sub> = {selectedNumber}y<sub>n-1</sub> + {selectedNumber - 1 === 1 ? '' : selectedNumber - 1}x<sub>n-1</sub>
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
                  <th>y</th>
                  <th>x</th>
                  <th>x/y → √{selectedNumber}</th>
                </tr>
              </thead>
              <tbody>
                {lucasData.map((item, index) => {
                  const target = Math.sqrt(selectedNumber);
                  const difference = item.y === 0 ? 0 : Math.abs(item.ratio - target);
                  const signedDifference = item.ratio - target;
                  const previous = index > 0 ? lucasData[index - 1] : null;
                  const yCoefficient = selectedNumber - 1;
                  return (
                    <React.Fragment key={index}>
                      {selectedRow === index && (
                        <tr className="lucas-detail-row">
                          <td colSpan="4">
                            <div className="lucas-row-note" aria-live="polite">
                              {previous ? (
                                <>
                                  <div className="lucas-row-calculation">
                                    y<sub>{index}</sub> = {yCoefficient === 1 ? '' : yCoefficient}
                                    y<sub>{index - 1}</sub> + x<sub>{index - 1}</sub>
                                    {' = '}{yCoefficient === 1 ? '' : `${yCoefficient} × `}
                                    <span className="lucas-previous-value">{previous.y}</span>
                                    {' + '}<span className="lucas-previous-value">{previous.x}</span>
                                    {' = '}<strong className="lucas-current-value">{item.y}</strong>
                                  </div>
                                  <div className="lucas-row-calculation">
                                    x<sub>{index}</sub> = {selectedNumber}y<sub>{index - 1}</sub> + {yCoefficient === 1 ? '' : yCoefficient}
                                    x<sub>{index - 1}</sub>
                                    {' = '}{selectedNumber} × <span className="lucas-previous-value">{previous.y}</span>
                                    {' + '}{yCoefficient === 1 ? '' : `${yCoefficient} × `}
                                    <span className="lucas-previous-value">{previous.x}</span>
                                    {' = '}<strong className="lucas-current-value">{item.x}</strong>
                                  </div>
                                </>
                              ) : (
                                <div className="lucas-row-calculation">
                                  Initial values: y<sub>0</sub> = <strong className="lucas-current-value">{item.y}</strong>,{' '}
                                  x<sub>0</sub> = D − 1 = <strong className="lucas-current-value">{item.x}</strong>
                                </div>
                              )}
                              <div className="lucas-row-ratio">
                                x/y = <span className="lucas-current-value">{item.ratio.toFixed(12)}</span>
                              </div>
                              <div className="lucas-row-difference">
                                x/y − √{selectedNumber} ={' '}
                                <span className="lucas-current-value">
                                  {formatSignedDifference(signedDifference)}
                                </span>
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
                        aria-label={`Step ${index}: x equals ${item.x}, y equals ${item.y}, x divided by y equals ${item.ratio.toFixed(12)}`}
                      >
                        <td>{index}</td>
                        <td>{item.y}</td>
                        <td>{item.x}</td>
                        <td>
                          {item.y === 0 ? '—' : (
                            <>
                              {difference < 0.0001 && index > 0 && (
                                <span style={{ marginRight: '0.5rem', color: '#26C485', fontSize: '0.8rem' }}>✓</span>
                              )}
                              {item.ratio.toFixed(4)} → {target.toFixed(4)}
                            </>
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
