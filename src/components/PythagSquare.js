import { useEffect, useState, useRef } from 'react';


function PythagSquare(props) {
  const [mode, setMode] = useState('wrap');
  const [cArea, setCArea] = useState(200);
  const [triple, setTriple] = useState(props.triple);
  const [captionOpen, setCaptionOpen] = useState(false);
  const [unified, setUnified] = useState(false);
  const unifyTimeoutRef = useRef(null);

  const [a, b, c] = triple;

  const cWrapRef = useRef(null);

  // measured spacing between adjacent squares
  const [step, setStep] = useState({ dx: 0, dy: 0 });

  useEffect(() => {
    if (props.illus) {
      setCArea(100);
    }
  }, [props.illus]);

  useEffect(() => {
    if (props.highlightedArea !== 'a') {
      setMode('wrap');
    }
    setCaptionOpen(false);
  }, [props.highlightedArea]);

  useEffect(() => {
    setTriple(props.triple);
  }, [props.triple[2]]); // only when c changes

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


  const setArrangement = (nextMode) => {
    setMode(nextMode);
  };

function drawASquare(triple) {
  const [a, b, c] = triple;
  const corner = c - b;
  const cellSize = Math.floor(cArea / c);
  const side = cellSize + 'px';

  const stepX = step.dx || cellSize;
  const stepY = step.dy || cellSize;

  // First pass: collect all a^2 squares and their positions
  // index is 1..a^2 in row-major order over the wraparound region
  let aCells = []; // { row, col, index, area }
  let index = 0;

  for (let row = 0; row < c; row++) {
    for (let col = 0; col < c; col++) {
      // b^2 region (bottom-right): not part of a^2
      if (row >= corner && col >= corner) continue;

      // classify which part of a^2 this cell belongs to
      let area = '';
      if (row < corner && col < corner) {
        area = 'corner';
      } else if (row < corner) {
        area = 'top';
      } else if (col < corner) {
        area = 'side';
      }

      index += 1;
      aCells.push({ row, col, index, area });
    }
  }

  // Partition into "stay" and "move"
  const stays = [];
  const moves = [];
  for (const cell of aCells) {
    if (cell.row < a && cell.col < a) {
      stays.push(cell);
    } else {
      moves.push(cell);
    }
  }

  // Destinations inside the a x a block
  const destByIndex = {};
  const destTaken = new Set();

  // Stays: keep their current positions
  for (const cell of stays) {
    const key = `${cell.row},${cell.col}`;
    destTaken.add(key);
    destByIndex[cell.index] = { row: cell.row, col: cell.col };
  }

  // Collect free target cells within the a x a square
  const freeTargets = [];
  for (let r = 0; r < a; r++) {
    for (let cCol = 0; cCol < a; cCol++) {
      const key = `${r},${cCol}`;
      if (!destTaken.has(key)) {
        freeTargets.push({ row: r, col: cCol });
      }
    }
  }

  // Assign each mover to the next free target (row-major order)
  moves.forEach((cell, i) => {
    const target = freeTargets[i];
    destByIndex[cell.index] = { row: target.row, col: target.col };
  });

  // For quick lookup by position during render
  const aCellByPos = new Map();
  for (const cell of aCells) {
    aCellByPos.set(`${cell.row},${cell.col}`, cell);
  }

  // Second pass: build the actual grid, using destByIndex for transforms
  let wraparoundRows = [];

  for (let row = 0; row < c; row++) {
    let cols = [];
    for (let col = 0; col < c; col++) {
      // non-a^2 region (pure b^2)
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

      const cell = aCellByPos.get(`${row},${col}`);
      const dest = destByIndex[cell.index];

      const style = {
        width: side,
        height: side,
        '--tx': `${(dest.col - col) * stepX}px`,
        '--ty': `${(dest.row - row) * stepY}px`,
      };

      const areaClass = cell.area ? `a-${cell.area}-square` : '';

      cols.push(
        <div
          key={`${row}-${col}`}
          style={style}
          data-animate={`a-${cell.area}-square`}
          className={`a-square movable ${areaClass}`}
        ></div>
      );
    }
    wraparoundRows.push(cols);
  }

  return (
    <div
      className={`a-wrapper ${
        mode === 'square' ? 'square-mode' : 'wrap-mode'
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
    const [, b, c] = triple;
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
    <div
      className={`pythag-square-wrapper ${
        props.highlightedArea ? `has-highlight highlight-${props.highlightedArea}` : ''
      } ${props.highlightedArea === 'c' ? 'c-decomposing' : ''}`}
    >
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
        </div>
      </div>
    );
  }

  const cSquare = drawCSquare(triple);
  const corner = c - b;
  const captions = {
    a: mode === 'wrap'
      ? `${a * a} cells shown as a ${corner}² corner and two ${b}×${corner} strips.`
      : `The same ${a * a} cells rearranged into a ${a}×${a} square.`,
    b: `${b * b} cells form a ${b}×${b} square.`,
    c: `${c * c} cells form a ${c}×${c} square: ${a * a} from a² and ${b * b} from b².`,
  };

  return (
    <div>
      <div className="pythag-square-stage">
        {cSquare}
        {captions[props.highlightedArea] && captionOpen && (
          <div
            id="pythag-area-explanation"
            className="pythag-arrangement-caption"
            role="tooltip"
            aria-live="polite"
          >
            {captions[props.highlightedArea]}
          </div>
        )}
        {captions[props.highlightedArea] && (
          <button
            type="button"
            className="pythag-explanation-toggle"
            aria-label={`${captionOpen ? 'Hide' : 'Show'} explanation for ${props.highlightedArea} squared`}
            aria-expanded={captionOpen}
            aria-controls="pythag-area-explanation"
            onClick={() => setCaptionOpen((open) => !open)}
          >
            i
          </button>
        )}
      </div>
      {props.highlightedArea === 'a' && (
        <div className="pythag-arrangement-control">
          <div className="pythag-arrangement-heading">Arrangement of a²</div>
          <div className="pythag-arrangement-options" role="group" aria-label="Arrange the a squared area">
            <button
              type="button"
              className={mode === 'wrap' ? 'active' : ''}
              aria-pressed={mode === 'wrap'}
              onClick={() => setArrangement('wrap')}
            >
              Around b²
            </button>
            <button
              type="button"
              className={mode === 'square' ? 'active' : ''}
              aria-pressed={mode === 'square'}
              onClick={() => setArrangement('square')}
            >
              As a² square
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PythagSquare;
