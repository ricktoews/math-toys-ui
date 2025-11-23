import React, { useState, useEffect } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import { MathJax } from 'better-react-mathjax';
import '../css/LucasLab.scss';

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
    setSelectorCollapsed(true);
  };

  const handlePillClick = () => {
    setSelectorCollapsed(false);
  };

  return (
    <div className="lucas-lab">
      <h1>Lucas Lab</h1>
      
      <section className="lucas-selector-container">
        {selectedNumber !== null && selectorCollapsed ? (
          <div className="lucas-toggle" onClick={handlePillClick}>
            <span className="lucas-summary-label">D =</span>
            <span className="lucas-summary-value">{selectedNumber}</span>
            <span className="lucas-summary-sep">·</span>
            <span className="lucas-summary-label">√{selectedNumber} =</span>
            <span className="lucas-summary-value">{Math.sqrt(selectedNumber).toFixed(4)}</span>
            <span className="lucas-summary-sep">·</span>
            <span className="lucas-summary-label">
              y<sub>n</sub> = {selectedNumber - 1 === 1 ? '' : selectedNumber - 1}y<sub>n-1</sub> + x<sub>n-1</sub>
            </span>
            <span className="lucas-summary-sep">·</span>
            <span className="lucas-summary-label">
              x<sub>n</sub> = {selectedNumber === 1 ? '' : selectedNumber}y<sub>n-1</sub> + {selectedNumber - 1 === 1 ? '' : selectedNumber - 1}x<sub>n-1</sub>
            </span>
            <span className="lucas-toggle-icon">▾</span>
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
            <Table striped hover>
              <thead>
                <tr>
                  <th style={{ textAlign: 'right' }}>y</th>
                  <th style={{ textAlign: 'right' }}>x</th>
                  <th style={{ textAlign: 'right' }}>x/y → √{selectedNumber}</th>
                </tr>
              </thead>
              <tbody>
                {lucasData.map((item, index) => {
                  const target = Math.sqrt(selectedNumber);
                  const difference = item.y === 0 ? 0 : Math.abs(item.ratio - target);
                  return (
                    <tr key={index}>
                      <td style={{ textAlign: 'right' }}>{item.y}</td>
                      <td style={{ textAlign: 'right' }}>{item.x}</td>
                      <td style={{ textAlign: 'right' }}>
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
