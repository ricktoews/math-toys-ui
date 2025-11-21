import React, { useState } from 'react';
import { Table, Modal, Button } from 'react-bootstrap';
import '../css/Denom.scss';
import NumeratorList from './NumeratorList';
import NumeratorDescription from './NumeratorDescription';
import { getDenomByExpansion, getExpansions, postExpansions } from '../api/math-toys-api';
import { getDenominatorFactors, parsedPeriod, getPeriodJSX } from './denom-helper';

function formatDenominatorFactors(factors) {
  if (!factors || factors.length === 0) return null;

  let factorCount = 0;
  let lastFactor = factors[0];
  const parts = [];

  factors.forEach(factor => {
    if (factor === lastFactor) {
      factorCount++;
    } else {
      parts.push({ base: lastFactor, count: factorCount });
      lastFactor = factor;
      factorCount = 1;
    }
  });
  parts.push({ base: lastFactor, count: factorCount });

  return parts.map((p, idx) => (
    <span key={`${p.base}-${idx}`}>
      {p.base}
      {p.count > 1 && <sup>{p.count}</sup>}
      {idx < parts.length - 1 && <>&nbsp;</>}
    </span>
  ));
}

function factorsToString(factors) {
  if (!factors || factors.length === 0) return "1";
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

function ReciprocalModal({ show, onHide, prime, reciprocalDisplay }) {
  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Reciprocal of {prime}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {reciprocalDisplay ? (
          <div style={{ fontSize: "1.5rem", textAlign: "center" }}>
            1 / {prime} = 0.{reciprocalDisplay}
          </div>
        ) : (
          <div>No reciprocal available.</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button className="app-btn" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function ExpansionRow({ expansion, expansionData, periodList, onClickNumerator, isExpanded, onToggle }) {
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

  const numeratorCount = Object.keys(numeratorData).length;

  return (
    <tr className={isExpanded ? "expansion-row-expanded" : "expansion-row-collapsed"}>
      <td>
        <div
          className="expansion-row-header"
          onClick={onToggle}
        >
          <div className="digits">{periodJSX}</div>
          <div className="expansion-toggle-indicator">
            <span className="expansion-numerator-count">
              {numeratorCount} numerator{numeratorCount !== 1 ? 's' : ''}
            </span>
            <span className="expansion-toggle-icon">
              {isExpanded ? '▴' : '▾'}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="expansion-row-content">
            <NumeratorList
              digits={expansion}
              numeratorData={numeratorData}
              onClick={onClickNumerator}
            />
          </div>
        )}
      </td>
    </tr>
  );
}

// Simple prime generator (excluding 2 and 5) for the catalog
function getPrimesUpTo(max) {
  const n = Math.floor(max);
  if (n < 2) return [];
  const sieve = new Array(n + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let p = 2; p * p <= n; p++) {
    if (sieve[p]) {
      for (let k = p * p; k <= n; k += p) {
        sieve[k] = false;
      }
    }
  }
  const primes = [];
  for (let i = 2; i <= n; i++) {
    if (sieve[i] && i !== 2 && i !== 5) {
      primes.push(i);
    }
  }
  return primes;
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
  const [expandedRow, setExpandedRow] = useState(null);
  const [recipModalShow, setRecipModalShow] = useState(false);
  const [recipModalPrime, setRecipModalPrime] = useState(null);
  const [recipModalJSX, setRecipModalJSX] = useState(null);


  // Period catalog state
  const [periodCatalogCollapsed, setPeriodCatalogCollapsed] = useState(true);
  const [periodMaxDenom, setPeriodMaxDenom] = useState(109);
  const [periodCatalog, setPeriodCatalog] = useState([]);
  const [periodStatus, setPeriodStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
  const [periodError, setPeriodError] = useState('');

  const primeQuickPicks = [
    3, 7, 11, 13, 17, 19,
    23, 29, 31, 37, 41,
    43, 47, 53, 59,
    61, 67, 71, 73,
    79, 83, 89, 97,
    101, 103, 107, 109
  ];

  const TEN_POWER_MINUS_ONE_FACTORS = {
    1: [3],
    2: [3, 11],
    3: [3, 37],
    4: [3, 11, 101],
    5: [3, 41, 271],
    6: [3, 7, 11, 13, 37],
    7: [3, 239, 4649],
    8: [3, 11, 73, 101, 137],
    9: [3, 37, 333667],
    10: [3, 11, 41, 271, 9091],
    11: [3, 21649, 513239],
    12: [3, 7, 11, 13, 37, 101, 9901],
    13: [3, 53, 79, 265371653],
    14: [3, 11, 239, 4649, 909091],
    15: [3, 31, 37, 41, 271, 2906161],
    16: [3, 11, 17, 73, 101, 137, 5882353],
    17: [3, 2071723, 5363222357],
    18: [3, 7, 11, 13, 19, 37, 52579, 333667],
    19: [3, 11111111111111111111],
    20: [3, 11, 41, 101, 271, 3541, 9091, 27961],
  };

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

    // Reset expanded row when new data loads
    setExpandedRow(null);

    // Collapse the selection panel after a successful selection
    setDenomCollapsed(true);
  }

  const showPrimeReciprocal = async (p) => {
    // Load full expansion data for the prime
    const res = await getExpansions(p);
    const byNumerator = res.data.byNumerator;
    const rec = byNumerator[1];

    let recJSX = null;

    if (rec && rec.expansion) {
      const d = parsedPeriod(rec.expansion, rec.beginRepeat ?? 0);
      recJSX = getPeriodJSX(d);
    }

    setRecipModalPrime(p);
    setRecipModalJSX(recJSX);
    setRecipModalShow(true);
  };

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

  const handleToggleRow = (expansion) => {
    setExpandedRow(prevExpanded => prevExpanded === expansion ? null : expansion);
  };

  // Summary info for collapsed pill
  const factorStr = denom ? factorsToString(denomFactorsRaw) : '';
  const expansionCount = expansionKeys.length;

  // Get the reciprocal expansion (numerator = 1)
  const reciprocalData = denom ? periodList[1] : null;
  let reciprocalDisplay = null;
  if (reciprocalData && reciprocalData.expansion) {
    const periodData = parsedPeriod(
      reciprocalData.expansion,
      reciprocalData.beginRepeat ?? 0
    );
    reciprocalDisplay = getPeriodJSX(periodData);
  }

  // Build the prime period-length catalog
  const buildPeriodCatalog = () => {
    const maxDen = parseInt(periodMaxDenom, 10);
    if (Number.isNaN(maxDen) || maxDen < 3) {
      setPeriodError('Enter a maximum denominator of at least 3.');
      return;
    }

    setPeriodError('');
    setPeriodStatus('loading');

    // 1. Compute smallest period for each prime using TEN_POWER_MINUS_ONE_FACTORS.
    const primeOrder = {}; // prime -> smallest n

    const lengths = Object.keys(TEN_POWER_MINUS_ONE_FACTORS)
      .map(Number)
      .sort((a, b) => a - b);

    lengths.forEach(len => {
      const primes = TEN_POWER_MINUS_ONE_FACTORS[len];
      primes.forEach(p => {
        if (p > maxDen) return;          // respect "primes up to" input
        if (primeOrder[p] == null) {
          primeOrder[p] = len;           // first time we see p, that's its period
        }
      });
    });

    // 2. Group primes by period length.
    const periodMap = {}; // length -> [primes]
    Object.entries(primeOrder).forEach(([pStr, len]) => {
      const p = Number(pStr);
      if (!periodMap[len]) {
        periodMap[len] = [];
      }
      periodMap[len].push(p);
    });

    // 3. Build sorted rows with a simple "prime factors of 10^n - 1" column.
    const rows = Object.entries(periodMap)
      .map(([len, primes]) => {
        const length = Number(len);
        const tenFactorsArray = TEN_POWER_MINUS_ONE_FACTORS[length] || [];
        return {
          length,
          primes: primes.sort((a, b) => a - b),
          tenPrimeFactors: tenFactorsArray.join(', ')
        };
      })
      .sort((a, b) => a.length - b.length);

    setPeriodCatalog(rows);
    setPeriodStatus('ready');
    setPeriodCatalogCollapsed(false);
  };


  return (
    <div className="denom-page">
      <h1>Decimal Expansions</h1>

      <main className="denom-main">
        {/* Denominator selector */}
        <section className="denom-selector-container">
          {denomCollapsed ? (
            <>
              {/* COLLAPSED PILL */}
              <button
                type="button"
                className="denom-toggle"
                onClick={() => setDenomCollapsed(false)}
              >
                <span className="denom-summary-label">Denominator:</span>
                <span className="denom-summary-value">{denom}</span>

                {factorStr && (
                  <>
                    <span className="denom-summary-sep">·</span>
                    <span className="denom-summary-label">Factors:</span>
                    <span className="denom-summary-value">{factorStr}</span>
                  </>
                )}

                {expansionCount > 0 && (
                  <>
                    <span className="denom-summary-sep">·</span>
                    <span className="denom-summary-label">Expansions:</span>
                    <span className="denom-summary-value">{expansionCount}</span>
                  </>
                )}

                <span className="denom-toggle-icon">▾</span>
              </button>

              {/* RECIPROCAL DISPLAY BELOW PILL */}
              {reciprocalDisplay && (
                <div className="denom-reciprocal-info">
                  <span className="denom-reciprocal-label">Reciprocal:</span>
                  <span className="denom-reciprocal-value">
                    0.{reciprocalDisplay}
                  </span>
                </div>
              )}
            </>
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
                  {expansionKeys.map((expansion, key) => (
                    <ExpansionRow
                      key={key}
                      expansion={expansion}
                      expansionData={expansionData}
                      periodList={periodList}
                      onClickNumerator={handleClickNumerator}
                      isExpanded={expandedRow === expansion}
                      onToggle={() => handleToggleRow(expansion)}
                    />
                  ))}
                </tbody>
              </Table>
            </div>
          </section>
        )}

        {/* Period-length catalog section */}
        <section className="denom-period-catalog">
          <div className="denom-card">
            <button
              type="button"
              className="denom-toggle denom-period-toggle"
              onClick={() => setPeriodCatalogCollapsed(prev => !prev)}
            >
              <span className="denom-summary-label">Prime period-length catalog</span>
              {periodStatus === 'ready' && periodCatalog.length > 0 && (
                <>
                  <span className="denom-summary-sep">·</span>
                  <span className="denom-summary-label">Max denom:</span>
                  <span className="denom-summary-value">{periodMaxDenom}</span>
                </>
              )}
              <span className="denom-toggle-icon">
                {periodCatalogCollapsed ? '▾' : '▴'}
              </span>
            </button>

            {!periodCatalogCollapsed && (
              <div className="denom-period-body">
                <form
                  className="denom-custom-input denom-period-controls"
                  onSubmit={e => {
                    e.preventDefault();
                    buildPeriodCatalog();
                  }}
                >
                  <label>
                    <span className="denom-input-label">Primes up to:</span>
                    <input
                      className="denom-input"
                      type="number"
                      min={3}
                      step={1}
                      value={periodMaxDenom}
                      onChange={e => setPeriodMaxDenom(e.target.value)}
                    />
                    <button className="denom-btn" type="submit">
                      {periodStatus === 'loading' ? 'Building…' : 'Build catalog'}
                    </button>
                  </label>
                </form>

                {periodError && (
                  <div className="denom-error">
                    {periodError}
                  </div>
                )}

                {periodStatus === 'ready' && periodCatalog.length > 0 && (
                  <div className="denom-period-table-wrapper">
                    <Table striped hover size="sm">
                      <thead>
                        <tr>
                          <th>Period length</th>
                          <th>Prime denominators</th>
                          <th>Prime factors of 10^n − 1</th>
                        </tr>
                      </thead>
                      <tbody>
                        {periodCatalog.map(row => (
                          <tr key={row.length}>
                            <td>{row.length}</td>
                            <td>
                              {row.primes.map((p, idx) => (
                                <span key={p}>
                                  <button
                                    className="denom-catalog-prime"
                                    type="button"
                                    onClick={() => showPrimeReciprocal(p)}
                                  >
                                    {p}
                                  </button>
                                  {idx < row.primes.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </td>
                            <td>{row.tenPrimeFactors}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                  </div>
                )}

                {periodStatus === 'ready' && periodCatalog.length === 0 && (
                  <div className="denom-muted">
                    No primes found in this range.
                  </div>
                )}

                {periodStatus === 'idle' && (
                  <div className="denom-muted">
                    Choose a maximum denominator and build the catalog to see which primes
                    have periods of each length.
                  </div>
                )}

                {periodStatus === 'error' && !periodError && (
                  <div className="denom-error">
                    Something went wrong building the catalog.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {modalShow && (
        <MyVerticallyCenteredModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          numeratordata={numeratorData}
        />
      )}

      <InfoModal show={infoShow} onHide={() => setInfoShow(false)} />

      <ReciprocalModal
        show={recipModalShow}
        onHide={() => setRecipModalShow(false)}
        prime={recipModalPrime}
        reciprocalDisplay={recipModalJSX}
      />

    </div>
  );
}

export default Denom;
