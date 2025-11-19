import { useEffect, useState, useRef } from 'react';

const makePythagLabel = (label, value, triple, format = 'square') => {
  let labelJSX = <span className="pythag-side">
    <span className="pythag-label">{label}<span className="exponent">2</span></span>
    = {value}x{value} = {value * value}
  </span>

  if (label === 'a' && format === 'wrap') {
    let [a, b, c] = triple;
    let corner = c - b;
    labelJSX = <span className="pythag-side">
      <span className="pythag-label">{label}<span className="exponent">2</span></span>
      = <span data-animate="a-corner-label">{corner}<span className="exponent">2</span></span> +
      <span data-animate="a-side-label">{b}x{corner}</span> + <span data-animate="a-top-label">{b}x{corner}</span> = {a * a}
    </span>
  }
  return labelJSX;
}

const highlightAParts = (area, state) => {
  if (state) {
    let squares = document.querySelectorAll(`[data-animate="a-${area}-square"]`);
    squares.forEach(s => s.classList.add(`a-${area}-square`));
    let label = document.querySelector(`[data-animate="a-${area}-label"]`);
    label?.classList?.add(`a-${area}-label`);

  } else {
    let squares = document.querySelectorAll(`.a-${area}-square`);
    squares.forEach(s => s.classList.remove(`a-${area}-square`));
    let label = document.querySelector(`[data-animate="a-${area}-label"]`);
    label?.classList?.remove(`a-${area}-label`);

  }
}

function PythagSquare(props) {
  const [mode, setMode] = useState('wrap');
  const [cArea, setCArea] = useState(200);

  //console.log('Pythagorean Square triple', props.triple);
  const [a, b, c] = props.triple;
  const [triple, setTriple] = useState(props.triple);
  const [aLabel, setALabel] = useState(makePythagLabel('a', a, props.triple));
  const [bLabel, setBLabel] = useState(makePythagLabel('b', b, props.triple));
  const [cLabel, setCLabel] = useState(makePythagLabel('c', c, props.triple));

  const cWrapRef = useRef(null);

  useEffect(() => {
    if (props.illus) {
      setCArea(100);
    }
  }, []);

  useEffect(() => {
    console.log('PythagSquare', props.triple);
    setTriple(props.triple);
  }, [props.triple[2]]);

  useEffect(() => {
    highlightAParts('corner', mode === 'wrap');
    highlightAParts('side', mode === 'wrap');
    highlightAParts('top', mode === 'wrap');
  }, [mode]);

  const handleAClicked = e => {
    if (mode === 'square') { // changing to wrap
      setALabel(makePythagLabel('a', a, triple, 'wrap'));
    } else {
      setALabel(makePythagLabel('a', a, triple));
    }
    setMode(mode === 'square' ? 'wrap' : 'square');
  }

  function drawASquare(triple) {
    let [a, b, c] = triple;
    let corner = c - b;
    const side = Math.floor(cArea / c) + 'px';
    const sqStyle = { width: side, height: side };

    let wraparoundRows = [];
    // Build wrap-around
    for (let row = 0; row < c; row++) {
      let cols = [];
      for (let col = 0; col < c; col++) {
        if (row >= corner && col >= corner) {
          cols.push(<div style={sqStyle} className="a-square no-show"></div>);
        } else if (row < corner && col < corner) {
          cols.push(<div style={sqStyle} data-animate="a-corner-square" className="a-square"></div>);
        } else if (row < corner) {
          cols.push(<div style={sqStyle} data-animate="a-top-square" className="a-square"></div>);
        } else if (col < corner) {
          cols.push(<div style={sqStyle} data-animate="a-side-square" className="a-square"></div>);
        }
      }
      wraparoundRows.push(cols);
    }

    let rows = [];
    // Build square
    for (let row = 0; row < a; row++) {
      let cols = [];
      for (let col = 0; col < a; col++) {
        if (row >= corner && col >= corner) {
          cols.push(<div style={sqStyle} className="a-square movable"></div>);
        } else {
          cols.push(<div style={sqStyle} className="a-square"></div>);
        }
      }
      rows.push(cols);
    }

    const aRows = (mode === 'square') ? rows : wraparoundRows;
    let code = (<div onClick={handleAClicked} className="a-wrapper">
      {aRows.map((row, key) => {
        return <div key={key} className="a-row-wrapper">{row.map((square) => {
          return square;
        })}</div>
      })}
    </div>)

    return code;
  }

  function drawBSquare(triple) {
    const [a, b, c] = triple;
    const side = Math.floor(cArea / c) + 'px';
    const sqStyle = { width: side, height: side };

    let rows = [];
    for (let row = 0; row < b; row++) {
      let cols = [];
      for (let col = 0; col < b; col++) {
        cols.push(<div style={sqStyle} className="b-square"></div>);
      }
      rows.push(cols);
    }
    let code = (<div className="b-wrapper">
      {rows.map((row, key) => {
        return <div key={key} className="b-row-wrapper">{row.map(square => {
          return square;
        })}</div>
      })}
    </div>)

    return code;
  }

  function drawCSquare(triple) {
    let c = triple[2];
    const side = Math.floor(cArea / c) + 'px';
    const sqStyle = { width: side, height: side };

    let cRows = [];
    let aSquare = drawASquare(triple);
    let bSquare = drawBSquare(triple);
    for (let row = 0; row < c; row++) {
      let cCols = [];
      for (let col = 0; col < c; col++) {
        cCols.push(<div style={sqStyle} className="c-square"></div>);
      }
      cRows.push(cCols);
    }
    let code = (<div className="pythag-square-wrapper">
      <div className="a-label">{aLabel}</div>
      <div className="pythag-square-cols">
        <div className="pythag-square-col">
          <div ref={cWrapRef} className="c-wrapper">
            {bSquare}
            {aSquare}
            {cRows.map((row, key) => {
              return <div key={key} className="c-row-wrapper">{row.map(square => {
                return square;
              })}</div>
            })}
          </div>
        </div>
        <div className="pythag-square-col">
          <div className="b-label">{bLabel}</div>
        </div>
      </div>
      <div className="c-label">{cLabel}</div>
    </div>)

    return code;
  }

  let cSquare = drawCSquare(triple);
  //console.log('Pythagorean Square, about to return HTML', triple);
  return (<div>
    {cSquare}
  </div>);
}

export default PythagSquare;