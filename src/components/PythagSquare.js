import { useEffect, useState, useRef } from 'react';

const makePythagLabel = (label, value, triple, format = 'square') => {
  let labelJSX = (
    <span className="pythag-side">
      <span className="pythag-label">
        {label}
        <span className="exponent">2</span>
      </span>
      = {value}x{value} = {value * value}
    </span>
  );

  if (label === 'a' && format === 'wrap') {
    let [a, b, c] = triple;
    let corner = c - b;
    labelJSX = (
      <span className="pythag-side">
        <span className="pythag-label">
          {label}
          <span className="exponent">2</span>
        </span>
        ={' '}
        <span data-animate="a-corner-label">
          {corner}
          <span className="exponent">2</span>
        </span>{' '}
        +{' '}
        <span data-animate="a-side-label">
          {b}x{corner}
        </span>{' '}
        +{' '}
        <span data-animate="a-top-label">
          {b}x{corner}
        </span>{' '}
        = {a * a}
      </span>
    );
  }
  return labelJSX;
};

const highlightAParts = (area, state) => {
  let label = document.querySelector(`[data-animate="a-${area}-label"]`);
  if (!label) return;

  if (state) {
    label.classList.add(`a-${area}-label`);
  } else {
    label.classList.remove(`a-${area}-label`);
  }
};


function PythagSquare(props) {
  const [mode, setMode] = useState('wrap');
  const [cArea, setCArea] = useState(200);
  const [triple, setTriple] = useState(props.triple);
  const [unified, setUnified] = useState(false);
  const unifyTimeoutRef = useRef(null);

  const [a, b, c] = triple;

  const [aLabel, setALabel] = useState(
    makePythagLabel('a', a, triple, 'wrap')
  );
  const [bLabel, setBLabel] = useState(makePythagLabel('b', b, triple));
  const [cLabel, setCLabel] = useState(makePythagLabel('c', c, triple));

  const cWrapRef = useRef(null);

  // measured spacing between adjacent squares
  const [step, setStep] = useState({ dx: 0, dy: 0 });

  useEffect(() => {
    if (props.illus) {
      setCArea(100);
    }
  }, [props.illus]);

  useEffect(() => {
    setTriple(props.triple);
  }, [props.triple[2]]); // only when c changes

  useEffect(() => {
    highlightAParts('corner', mode === 'wrap');
    highlightAParts('side', mode === 'wrap');
    highlightAParts('top', mode === 'wrap');
  }, [mode]);


  // Measure actual spacing between neighboring a-squares
  useEffect(() => {
    if (!cWrapRef.current) return;

    const container = cWrapRef.current;
    const movable = container.querySelectorAll('.a-square.movable');
    if (movable.length < 2) return;

    const rects = Array.from(movable).map((el) => ({
      el,
      rect: el.getBoundingClientRect(),
    }));

    const first = rects[0].rect;
    const approxCell = Math.floor(cArea / triple[2]);

    let dx = null;
    let dy = null;

    rects.forEach(({ rect }) => {
      if (rect === first) return;

      // same row (within half a cell), to the right
      if (
        Math.abs(rect.top - first.top) < approxCell / 2 &&
        rect.left > first.left
      ) {
        const d = rect.left - first.left;
        if (dx === null || d < dx) dx = d;
      }

      // same column (within half a cell), below
      if (
        Math.abs(rect.left - first.left) < approxCell / 2 &&
        rect.top > first.top
      ) {
        const d = rect.top - first.top;
        if (dy === null || d < dy) dy = d;
      }
    });

    if (dx && dy) {
      setStep((prev) => {
        if (
          Math.abs(prev.dx - dx) < 0.5 &&
          Math.abs(prev.dy - dy) < 0.5
        ) {
          return prev;
        }
        return { dx, dy };
      });
    }
  }, [cArea, triple]);

  useEffect(() => {
    // clear any previous timer
    if (unifyTimeoutRef.current) {
      clearTimeout(unifyTimeoutRef.current);
      unifyTimeoutRef.current = null;
    }

    if (mode === 'square') {
      const MOVE_DURATION = 800;  // ms, must match CSS transform duration
      const EXTRA_DELAY = 500;    // ms, how long they sit before turning gray
      const totalDelay = MOVE_DURATION + EXTRA_DELAY;

      // start square mode with original colors
      setUnified(false);

      unifyTimeoutRef.current = setTimeout(() => {
        setUnified(true); // now they fade to gray
      }, totalDelay);
    } else {
      // as soon as we go back to wrap, drop the unified gray
      setUnified(false);
    }

    return () => {
      if (unifyTimeoutRef.current) {
        clearTimeout(unifyTimeoutRef.current);
        unifyTimeoutRef.current = null;
      }
    };
  }, [mode]);


  const handleAClicked = () => {
    if (mode === 'square') {
      setALabel(makePythagLabel('a', a, triple, 'wrap'));
    } else {
      setALabel(makePythagLabel('a', a, triple));
    }
    setMode(mode === 'square' ? 'wrap' : 'square');
  };

  function drawASquare(triple) {
    const [a, b, c] = triple;
    const corner = c - b;
    const cellSize = Math.floor(cArea / c);
    const side = cellSize + 'px';

    const stepX = step.dx || cellSize;
    const stepY = step.dy || cellSize;

    let wraparoundRows = [];
    let index = 0; // counts squares that belong to a^2

    for (let row = 0; row < c; row++) {
      let cols = [];
      for (let col = 0; col < c; col++) {
        // part of b^2 only
        if (row >= corner && col >= corner) {
          cols.push(
            <div
              key={`${row}-${col}`}
              style={{ width: side, height: side }}
              className="a-square no-show"
            ></div>
          );
          continue;
        }

        let area = '';
        if (row < corner && col < corner) {
          area = 'corner';
        } else if (row < corner) {
          area = 'top';
        } else if (col < corner) {
          area = 'side';
        }

        const destRow = Math.floor(index / a);
        const destCol = index % a;

        const style = {
          width: side,
          height: side,
          '--tx': `${(destCol - col) * stepX}px`,
          '--ty': `${(destRow - row) * stepY}px`,
        };

        const areaClass = area ? `a-${area}-square` : '';

        cols.push(
          <div
            key={`${row}-${col}`}
            style={style}
            data-animate={`a-${area}-square`}
            className={`a-square movable ${areaClass} ${unified ? 'a-unified' : ''}`}
          ></div>
        );


        index++;
      }
      wraparoundRows.push(cols);
    }

    return (
      <div
        onClick={handleAClicked}
        className={`a-wrapper ${mode === 'square' ? 'square-mode' : 'wrap-mode'
          }`}
      >
        {wraparoundRows.map((row, key) => (
          <div key={key} className="a-row-wrapper">
            {row}
          </div>
        ))}
      </div>
    );
  }

  function drawBSquare(triple) {
    const [a, b, c] = triple;
    const side = Math.floor(cArea / c) + 'px';
    const sqStyle = { width: side, height: side };

    let rows = [];
    for (let row = 0; row < b; row++) {
      let cols = [];
      for (let col = 0; col < b; col++) {
        cols.push(
          <div
            key={`${row}-${col}`}
            style={sqStyle}
            className="b-square"
          ></div>
        );
      }
      rows.push(cols);
    }
    return (
      <div className="b-wrapper">
        {rows.map((row, key) => (
          <div key={key} className="b-row-wrapper">
            {row}
          </div>
        ))}
      </div>
    );
  }

  function drawCSquare(triple) {
    const c = triple[2];
    const side = Math.floor(cArea / c) + 'px';
    const sqStyle = { width: side, height: side };

    let cRows = [];
    let aSquare = drawASquare(triple);
    let bSquare = drawBSquare(triple);

    for (let row = 0; row < c; row++) {
      let cCols = [];
      for (let col = 0; col < c; col++) {
        cCols.push(
          <div
            key={`${row}-${col}`}
            style={sqStyle}
            className="c-square"
          ></div>
        );
      }
      cRows.push(cCols);
    }

    return (
      <div className="pythag-square-wrapper">
        <div className="a-label">{aLabel}</div>
        <div className="pythag-square-cols">
          <div className="pythag-square-col">
            <div ref={cWrapRef} className="c-wrapper">
              {bSquare}
              {aSquare}
              {cRows.map((row, key) => (
                <div key={key} className="c-row-wrapper">
                  {row}
                </div>
              ))}
            </div>
          </div>
          <div className="pythag-square-col">
            <div className="b-label">{bLabel}</div>
          </div>
        </div>
        <div className="c-label">{cLabel}</div>
      </div>
    );
  }

  const cSquare = drawCSquare(triple);
  return <div>{cSquare}</div>;
}

export default PythagSquare;
