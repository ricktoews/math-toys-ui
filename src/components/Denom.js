import React, { useState } from 'react';
import { Table, Modal, Button } from 'react-bootstrap';
import '../css/Denom.scss';
import NumeratorList from './NumeratorList';
import NumeratorDescription from './NumeratorDescription';
import { getDenomByExpansion, getExpansions, postExpansions } from '../api/math-toys-api';
import { getDenominatorFactors, parsedPeriod, getPeriodJSX } from './denom-helper';

function formatDenominatorFactors(factors) {
  let factorCount = 0;
  let lastFactor = factors[0];
  const factorEls = [];
  factors.forEach(factor => {
    if (factor === lastFactor) {
      factorCount++;
    } else {
      factorEls.push(<span key={lastFactor}>{lastFactor}<sup>{factorCount}</sup></span>);
      lastFactor = factor;
      factorCount = 1;
    }
  });
  factorEls.push(<span key={lastFactor}>{lastFactor}<sup>{factorCount}</sup></span>);

  return factorEls.map((el, key) => (
    <React.Fragment key={key}>{el}</React.Fragment>
  ));
}

function factorsToString(factors) {
  if (factors.length === 0) return "1";
  let factorCount = 0;
  let lastFactor = factors[0];
  const parts = [];
  
  factors.forEach(factor => {
    if (factor === lastFactor) {
      factorCount++;
    } else {
      parts.push(factorCount === 1 ? `${lastFactor}` : `${lastFactor}^${factorCount}`);
      lastFactor = factor;
      factorCount = 1;
    }
  });
  parts.push(factorCount === 1 ? `${lastFactor}` : `${lastFactor}^${factorCount}`);
  
  return parts.join(" · ");
}

function InfoModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="decimal-expansions-info-title"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="decimal-expansions-info-title">
          About Decimal Expansions
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Enter a denominator to see its decimal expansions. Prime numbers are
          usually interesting. Try 7, for instance. The reciprocal of 7 is
          0.142857. Notice that it's six digits and that if you add the first
          three (142) to the last three (857), you get 999. This same sort of
          thing happens with all prime denominators whose expansions have an
          even number of digits.
        </p>
        <p>
          Another interesting denominator is 41. Here, the reciprocal has five
          digits: 0.02439. Since the number of digits is odd, you can't split
          them into two equal groups that add up to all 9s.
        </p>
        <p>
          All prime numbers other than 2 and 5 necessarily belong to one or the
          other of these categories.
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

function MyVerticallyCenteredModal(props) {
  const { numeratordata } = props;
  const { numerator, denom, period, digits, denomIsPrime, position, beginRepeat } =
    numeratordata;
  const periodData = parsedPeriod(period, beginRepeat);
  const periodJSX = getPeriodJSX(periodData);
  const power10 = period.length;
  const is10PrimitiveRoot = power10 < denom - 1 ? 'No' : 'Yes';

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <div className="digits">Digits&nbsp;in&nbsp;Expansion&nbsp;{digits}</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NumeratorDescription
          {...numeratordata}
          power10={power10}
          periodJSX={periodJSX}
          digits={digits}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button className="app-btn" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function Denom(props) {
  const [denom, setDenom] = useState();
  const [inputValue, setInputValue] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const [infoShow, setInfoShow] = useState(false);
  const [expansionKeys, setExpansionKeys] = useState([]);
  const [expansionData, setExpansionData] = useState([]);
  const [numeratorData, setNumeratorData] = useState({});
  const [denomFactors, setDenomFactors] = useState([]);
  const [denomFactorsRaw, setDenomFactorsRaw] = useState([]);
  const [periodList, setPeriodList] = useState([]);
  const [denomIsPrime, setDenomIsPrime] = useState(false);
  const [error, setError] = useState('');
  const [denomCollapsed, setDenomCollapsed] = useState(false);

  const primeQuickPicks = [
    3, 7, 11, 13, 17, 19,
    23, 29, 31, 37, 41,
    43, 47, 53, 59,
    61, 67, 71, 73,
    79, 83, 89, 97,
    101, 103, 107, 109
  ];

  async function getDenomData(selectedDenom) {
    const results = await getExpansions(selectedDenom);
    const data = results.data;

    let organizeExpansionData = data.byExpansion;
    let expansionData = data.byNumerator;

    const factors = getDenominatorFactors(selectedDenom);
    const formattedFactors =
      factors.length > 0 ? formatDenominatorFactors(factors) : <></>;

    setDenom(selectedDenom);
    setDenomIsPrime(
      factors.length === 1 && factors[0] === selectedDenom && 10 % factors[0] !== 0
    );
    setDenomFactors(formattedFactors);
    setDenomFactorsRaw(factors);
    setExpansionKeys(Object.keys(organizeExpansionData).sort());
    setExpansionData(organizeExpansionData);
    setPeriodList(expansionData);

    // Collapse the selection panel after a successful selection
    setDenomCollapsed(true);
  }

  const handleClickNumerator = e => {
    const el = e.target;
    const { digits, numerator, stringified } = el.dataset;
    const data = JSON.parse(stringified);
    const { position, beginRepeat } = data;
    const { expansion } = periodList[numerator];
    let numDataObj = {
      numerator,
      denom,
      period: expansion,
      digits,
      denomIsPrime,
      position,
      beginRepeat,
      denomFactors
    };
    setNumeratorData(numDataObj);
    setModalShow(true);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const n = parseInt(inputValue, 10);

    if (Number.isNaN(n) || n <= 1) {
      setError('Please enter an integer greater than 1.');
      return;
    }
    setError('');
    getDenomData(n);
  };

  const handleQuickPick = n => {
    setInputValue(String(n));
    setError('');
    getDenomData(n);
  };

  // Summary info for collapsed pill
  const factorStr = denom ? factorsToString(denomFactorsRaw) : '';
  const expansionCount = expansionKeys.length;

  return (
    <div className="denom-page">
      <h1>Decimal Expansions</h1>

      <main className="denom-main">
        {/* Denominator selector */}
        <section className="denom-selector-container">
          {denomCollapsed ? (
            // COLLAPSED PILL
            <button
              type="button"
              className="denom-toggle"
              onClick={() => setDenomCollapsed(false)}
            >
              <span className="denom-summary-label">Denominator</span>
              <span className="denom-summary-value">{denom}</span>

              {factorStr && (
                <>
                  <span className="denom-summary-sep">·</span>
                  <span className="denom-summary-label">Factors</span>
                  <span className="denom-summary-value">{factorStr}</span>
                </>
              )}

              {expansionCount > 0 && (
                <>
                  <span className="denom-summary-sep">·</span>
                  <span className="denom-summary-label">Expansions</span>
                  <span className="denom-summary-value">{expansionCount}</span>
                </>
              )}

              <span className="denom-toggle-icon">▾</span>
            </button>
          ) : (
            // EXPANDED TOOLS
            <div className="denom-selector">
              <div className="denom-section-title">
                Denominator Selection
                <button
                  type="button"
                  className="denom-info-icon"
                  onClick={() => setInfoShow(true)}
                  aria-label="Info about decimal expansions"
                >
                  ⓘ
                </button>
              </div>

              {/* Custom input */}
              <form className="denom-custom-input" onSubmit={handleSubmit}>
                <label>
                  <span className="denom-input-label">Enter denominator:</span>
                  <input
                    className="denom-input"
                    type="number"
                    min={2}
                    step={1}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="e.g. 7, 13, 41"
                  />
                  <button className="denom-btn" type="submit">
                    Go
                  </button>
                </label>
                {error && (
                  <div className="denom-error">
                    {error}
                  </div>
                )}
              </form>

              {/* Prime quick picks */}
              <div className="denom-primes-section">
                <div className="denom-primes-label">
                  Prime denominators (≤ 109, excluding 2 and 5)
                </div>
                <div className="denom-chip-grid">
                  {primeQuickPicks.map(p => (
                    <button
                      key={p}
                      className={denom === p ? "denom-chip denom-chip-active" : "denom-chip"}
                      type="button"
                      onClick={() => handleQuickPick(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Done button */}
              {denom && (
                <div className="denom-done-row">
                  <button
                    className="denom-btn"
                    type="button"
                    onClick={() => setDenomCollapsed(true)}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Main expansions table */}
        {expansionKeys.length > 0 && (
          <section className="denom-expansions">
            <div className="denom-card">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Decimal Expansions {denomFactors}</th>
                  </tr>
                </thead>
                <tbody>
                  {expansionKeys.map((expansion, key) => {
                    const numeratorData = [];
                    const periodData = parsedPeriod(
                      expansion,
                      expansionData[expansion][0].beginRepeat
                    );
                    const periodJSX = getPeriodJSX(periodData);
                    expansionData[expansion].forEach(item => {
                      numeratorData[item.numerator] = {
                        position: item.position,
                        beginRepeat: item.beginRepeat
                      };
                    });
                    return (
                      <tr key={key}>
                        <td>
                          <div className="digits">{periodJSX}</div>
                          <NumeratorList
                            digits={expansion}
                            numeratorData={numeratorData}
                            onClick={handleClickNumerator}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </section>
        )}
      </main>

      {modalShow && (
        <MyVerticallyCenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          numeratordata={numeratorData}
        />
      )}

      <InfoModal show={infoShow} onHide={() => setInfoShow(false)} />
    </div>
  );
}

export default Denom;