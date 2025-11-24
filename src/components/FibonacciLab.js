import React, { useState, useRef, useEffect } from 'react';
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

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [colors, setColors] = useState({});
  const containerRef = useRef(null);

  const getRandomPastelColor = () => {
    const r = Math.floor(Math.random() * 128 + 127);
    const g = Math.floor(Math.random() * 128 + 127);
    const b = Math.floor(Math.random() * 128 + 127);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const handleClick = (index) => {
    if (selectedIndex === index) {
      // Toggle off - clicking the same card that's already selected
      setSelectedIndex(null);
      setColors({});
      setHoveredIndex(null);
    } else if (selectedIndex === null) {
      // Select new - no card currently selected
      setSelectedIndex(index);
      setColors({ [index]: getRandomPastelColor() });
    } else {
      // Different card clicked while another is selected - treat as mouseover
      setHoveredIndex(index);
    }
  };

  const handleMouseOver = (index) => {
    if (selectedIndex !== null && selectedIndex !== index) {
      setHoveredIndex(index);
    }
  };

  const handleMouseOut = () => {
    setHoveredIndex(null);
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

  // Calculate product info for hovered number
  const getProductInfo = () => {
    if (selectedIndex === null || hoveredIndex === null) return null;

    const x = Math.abs(hoveredIndex - selectedIndex);
    const leftIndex = selectedIndex - x;
    const rightIndex = selectedIndex + x;

    if (leftIndex >= 0 && rightIndex < fib.length) {
      const product = fib[leftIndex] * fib[rightIndex];
      const fxSquare = fib[x] * fib[x];
      const sign = (selectedIndex - x) % 2 === 0 ? '−' : '+';

      return {
        leftIndex,
        rightIndex,
        product,
        x,
        fxSquare,
        sign
      };
    }

    return null;
  };

  const phiInfo = getPhiInfo();
  const productInfo = getProductInfo();

  // Get position for SVG lines and product display
  const getElementPosition = (index) => {
    if (!containerRef.current) return null;
    const element = containerRef.current.children[index];
    if (!element) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    
    return {
      left: elementRect.left - containerRect.left,
      top: elementRect.top - containerRect.top,
      width: elementRect.width,
      height: elementRect.height,
      centerX: elementRect.left - containerRect.left + elementRect.width / 2
    };
  };

  const renderSVGLines = () => {
    if (!productInfo) return null;

    const leftPos = getElementPosition(productInfo.leftIndex);
    const rightPos = getElementPosition(productInfo.rightIndex);
    const centerPos = getElementPosition(selectedIndex);

    if (!leftPos || !rightPos || !centerPos) return null;

    const svgLeft = Math.min(leftPos.left, rightPos.left);
    const svgWidth = Math.max(
      leftPos.left + leftPos.width,
      rightPos.left + rightPos.width
    ) - svgLeft;

    const lineColor = '#a7f3d0';
    const leftX = leftPos.centerX - svgLeft;
    const rightX = rightPos.centerX - svgLeft;
    const centerX = centerPos.centerX - svgLeft;
    const topY = 0;
    const midY = 20;
    const bottomY = 40;

    return (
      <svg
        style={{
          position: 'absolute',
          top: `${leftPos.top + leftPos.height}px`,
          left: `${svgLeft}px`,
          width: `${svgWidth}px`,
          height: '90px',
          zIndex: 10,
          pointerEvents: 'none'
        }}
        fill="none"
      >
        {/* Left vertical */}
        <path d={`M${leftX},${topY} V${midY}`} stroke={lineColor} strokeWidth="2" />
        
        {/* Right vertical */}
        <path d={`M${rightX},${topY} V${midY}`} stroke={lineColor} strokeWidth="2" />
        
        {/* Horizontal connector */}
        <path d={`M${leftX},${midY} H${rightX}`} stroke={lineColor} strokeWidth="2" />
        
        {/* Center vertical */}
        <path d={`M${centerX},${midY} V${bottomY}`} stroke={lineColor} strokeWidth="2" />
      </svg>
    );
  };

  const renderProductDisplay = () => {
    return null;
  };

  return (
    <div className="fibonacci-lab-wrapper">
      <h1>Fibonacci Lab</h1>
      <p>
        Click a Fibonacci number to "turn it on."
      </p>

      {selectedIndex !== null && (
        <div className="fib-equation-panel">
          F<sub>{selectedIndex}</sub><sup>2</sup> = {fib[selectedIndex] * fib[selectedIndex]}
          {productInfo && (
            <>
              {' • '}
              F<sub>{productInfo.x}</sub><sup>2</sup> = {productInfo.fxSquare}
              {' | '}
              {fib[selectedIndex] * fib[selectedIndex]} {productInfo.sign} {productInfo.fxSquare} = {productInfo.product}
              {' • '}
              F<sub>{selectedIndex}-{productInfo.x}</sub> × F<sub>{selectedIndex}+{productInfo.x}</sub> = {fib[productInfo.leftIndex]} × {fib[productInfo.rightIndex]} = {productInfo.product}
            </>
          )}
        </div>
      )}

      <div className="fib-list-container">
        <div className="fib-list" ref={containerRef}>
          {fib.map((num, index) => {
            const isSelected = selectedIndex === index;
            const isHighlighted = productInfo && 
              (index === productInfo.leftIndex || index === productInfo.rightIndex);
            const isDistance = productInfo && index === productInfo.x;

            return (
              <div
                key={index}
                className={`fib-square ${isHighlighted ? 'highlight' : ''} ${isDistance ? 'highlight-distance' : ''}`}
              >
                <div className="fib-index">{index}</div>
                <div
                  className={`fib-circle ${isSelected ? 'on' : ''}`}
                  style={{
                    backgroundColor: isSelected ? colors[index] : '#f5f5f5'
                  }}
                  onClick={() => handleClick(index)}
                  onMouseOver={() => handleMouseOver(index)}
                  onMouseOut={handleMouseOut}
                >
                  {num}
                </div>
                
                {isSelected && (
                  <div className="square-display">
                    {num}<sup>2</sup> = {num * num}
                  </div>
                )}
                
                {isDistance && (
                  <div className="square-display">
                    {num}<sup>2</sup> = {num * num}
                  </div>
                )}
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
