import React, { useState } from 'react';
import '../css/FibonacciLab.scss';

const FibonacciLab = () => {
  // Generate Fibonacci and Lucas sequences up to index 19
  const generateSequences = () => {
    const fib = [0, 1];
    const lucas = [2, 1];
    
    for (let i = 2; i <= 19; i++) {
      fib[i] = fib[i - 1] + fib[i - 2];
      lucas[i] = lucas[i - 1] + lucas[i - 2];
    }
    
    return { fib, lucas };
  };

  const { fib, lucas } = generateSequences();
  const phi = (1 + Math.sqrt(5)) / 2;
  const sqrt5 = Math.sqrt(5);

  const [selectedIndex, setSelectedIndex] = useState(6);
  const [comparisonIndex, setComparisonIndex] = useState(7);

  const handleCenterClick = (index) => {
    if (selectedIndex === index) {
      setSelectedIndex(null);
      setComparisonIndex(null);
    } else {
      setSelectedIndex(index);
      setComparisonIndex(index + 1);
    }
  };

  // Calculate phi info for selected number
  const getPhiInfo = () => {
    if (selectedIndex === null) return null;

    const n = selectedIndex;
    const num = fib[n];
    const phiNExact = (lucas[n] + fib[n] * Math.sqrt(5)) / 2;
    const phiNApprox = Math.pow(phi, n);
    const approx = phiNExact / sqrt5;
    const diff = fib[n] - approx;

    return {
      n,
      num,
      lucas: lucas[n],
      phiNApprox,
      approx,
      diff
    };
  };

  // Calculate product info for the active symmetric distance.
  const getProductInfo = () => {
    if (selectedIndex === null || comparisonIndex === null) return null;

    const x = Math.abs(comparisonIndex - selectedIndex);
    const leftIndex = selectedIndex - x;
    const rightIndex = selectedIndex + x;

    if (leftIndex >= 0 && rightIndex < fib.length) {
      const product = fib[leftIndex] * fib[rightIndex];
      const fxSquare = fib[x] * fib[x];
      return {
        leftIndex,
        rightIndex,
        product,
        x,
        fxSquare
      };
    }

    return null;
  };

  const phiInfo = getPhiInfo();
  const productInfo = getProductInfo();
  const centerSquare = selectedIndex === null
    ? null
    : fib[selectedIndex] * fib[selectedIndex];
  const maxDistance = selectedIndex === null
    ? 0
    : Math.min(selectedIndex, fib.length - 1 - selectedIndex);

  const adjustDistance = (change) => {
    if (!productInfo) return;

    const nextDistance = Math.min(
      maxDistance,
      Math.max(1, productInfo.x + change)
    );

    setComparisonIndex(selectedIndex + nextDistance);
  };

  return (
    <div className="fibonacci-lab-wrapper">
      <div className="math-toy-page-header">
        <h1 className="math-toy-page-title">Fibonacci Lab</h1>
      </div>
      <p className="fib-instructions">
        {selectedIndex === null
          ? 'Scroll the Fibonacci numbers, then choose a center.'
          : 'Adjust the distance or choose a new center below.'}
      </p>

      {selectedIndex !== null && productInfo && (
        <section
          className="fib-relationship-diagram"
          aria-live="polite"
          aria-label={`Fibonacci numbers at indices ${productInfo.leftIndex}, ${selectedIndex}, and ${productInfo.rightIndex}; each outer number is ${productInfo.x} places from the center`}
        >
          <div className="fib-relationship-track">
            <button
              type="button"
              className="fib-distance-control"
              onClick={() => adjustDistance(-1)}
              disabled={productInfo.x <= 1}
              aria-label="Decrease index distance"
            >
              −
            </button>
            <div className="fib-relationship-term endpoint">
              <span className="fib-relationship-index">
                F<sub>{productInfo.leftIndex}</sub>
              </span>
              <span className="fib-relationship-number">
                {fib[productInfo.leftIndex]}
              </span>
            </div>
            <div className="fib-relationship-gap" aria-hidden="true">
              <span className="fib-relationship-dots">
                {productInfo.x > 1 ? '···' : '—'}
              </span>
              <span>{productInfo.x} {productInfo.x === 1 ? 'place' : 'places'}</span>
            </div>

            <button
              type="button"
              className="fib-relationship-term center"
              onClick={() => handleCenterClick(selectedIndex)}
              aria-label={`Clear center F ${selectedIndex} and choose another`}
            >
              <span className="fib-relationship-index">F<sub>{selectedIndex}</sub></span>
              <span className="fib-relationship-number">{fib[selectedIndex]}</span>
            </button>

            <div className="fib-relationship-gap" aria-hidden="true">
              <span className="fib-relationship-dots">
                {productInfo.x > 1 ? '···' : '—'}
              </span>
              <span>{productInfo.x} {productInfo.x === 1 ? 'place' : 'places'}</span>
            </div>
            <div className="fib-relationship-term endpoint">
              <span className="fib-relationship-index">
                F<sub>{productInfo.rightIndex}</sub>
              </span>
              <span className="fib-relationship-number">
                {fib[productInfo.rightIndex]}
              </span>
            </div>
            <button
              type="button"
              className="fib-distance-control"
              onClick={() => adjustDistance(1)}
              disabled={productInfo.x >= maxDistance}
              aria-label="Increase index distance"
            >
              +
            </button>
          </div>

          <div className="fib-comparison-grid">
            <div className="fib-comparison-card outer-product">
              <span className="fib-comparison-label">Outer product</span>
              <span className="fib-comparison-symbolic">
                F<sub>{productInfo.leftIndex}</sub> × F<sub>{productInfo.rightIndex}</sub>
              </span>
              <strong>
                {fib[productInfo.leftIndex]} × {fib[productInfo.rightIndex]} ={' '}
                <span className="fib-value-outer">{productInfo.product}</span>
              </strong>
            </div>
            <div className="fib-comparison-card center-square">
              <span className="fib-comparison-label">Center square</span>
              <span className="fib-comparison-symbolic">
                F<sub>{selectedIndex}</sub><sup>2</sup>
              </span>
              <strong>
                {fib[selectedIndex]}<sup>2</sup> ={' '}
                <span className="fib-value-center">{centerSquare}</span>
              </strong>
            </div>
          </div>

          <div className="fib-difference-result">
            <div className="fib-difference-heading">
              <span className="fib-comparison-label">Difference</span>
              <span className="fib-difference-caption">
                Distance {productInfo.x} {productInfo.x === 1 ? 'place' : 'places'}
                {' → '}F<sub>{productInfo.x}</sub> = {fib[productInfo.x]}
              </span>
            </div>
            <strong>
              {centerSquare >= productInfo.product ? (
                <>
                  <span className="fib-value-center">{centerSquare}</span>
                  {' − '}
                  <span className="fib-value-outer">{productInfo.product}</span>
                </>
              ) : (
                <>
                  <span className="fib-value-outer">{productInfo.product}</span>
                  {' − '}
                  <span className="fib-value-center">{centerSquare}</span>
                </>
              )}
              {' = '}{productInfo.fxSquare}
              {' = '}{fib[productInfo.x]}<sup>2</sup>
            </strong>
          </div>
        </section>
      )}

      <div
        className={`fib-center-picker ${selectedIndex !== null ? 'reference' : ''}`}
        aria-label={
          selectedIndex === null
            ? 'Choose a center Fibonacci number'
            : 'Fibonacci number reference'
        }
      >
        <div className="fib-center-picker-track">
          {fib.map((num, index) => {
            const unavailable = index === 0 || index === fib.length - 1;
            const isCenter = index === selectedIndex;
            const isEndpoint = productInfo &&
              (index === productInfo.leftIndex || index === productInfo.rightIndex);
            const isDistance = productInfo && index === productInfo.x;

            return (
              <div className="fib-center-option" key={index}>
                <div
                  className={[
                    'fib-center-option-term',
                    isCenter ? 'center' : '',
                    isEndpoint ? 'endpoint' : '',
                    isDistance ? 'distance' : ''
                  ].filter(Boolean).join(' ')}
                >
                  <span>F<sub>{index}</sub></span>
                  <strong>{num}</strong>
                </div>
                <button
                  type="button"
                  className="fib-set-center"
                  disabled={unavailable}
                  onClick={() => handleCenterClick(index)}
                  aria-label={
                    unavailable
                      ? `F ${index} equals ${num}, unavailable as a center`
                      : isCenter
                        ? `Clear F ${index} as the center`
                        : `Set F ${index}, which equals ${num}, as the center`
                  }
                >
                  {unavailable ? 'Unavailable' : isCenter ? 'Clear center' : 'Set center'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {false && phiInfo && (
        <>
          <hr className="divider" />
          
          <div className="phi-info">
            <h2>2. φ, Lucas, and Binet's formula</h2>
            <p>Fibonacci number F({phiInfo.n}) = {phiInfo.num}</p>
            <p>
              φ<sup>{phiInfo.n}</sup> = 
              <span className="fraction">
                <span className="numerator">{phiInfo.lucas} + {phiInfo.num}√5</span>
                <span className="denominator">2</span>
              </span>
              {' '}≈ {phiInfo.phiNApprox.toFixed(6)}
            </p>
            <p>
              <span className="fraction">
                <span className="numerator">φ<sup>{phiInfo.n}</sup></span>
                <span className="denominator">√5</span>
              </span>
              {' '}≈ {phiInfo.approx.toFixed(6)} (error: {phiInfo.diff.toFixed(6)})
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
              Here, <code>L(n)</code> is the Lucas sequence and{' '}
              <code>φ = (1 + √5) / 2</code>. We have{' '}
              <code>φ<sup>n</sup> = (L(n) + F(n)√5)/2</code> and{' '}
              <code>F(n) ≈ φ<sup>n</sup>/√5</code>.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default FibonacciLab;
