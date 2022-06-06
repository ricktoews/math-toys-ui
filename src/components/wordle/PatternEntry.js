import React, { useEffect, useState } from 'react';

function PatternEntry(props) {
	const [squares, setSquares] = useState(['-','-','-','-','-']);

	useEffect(() => {
		setSquares(props.pattern);
	}, [props.pattern]);

	const setEvaluation = data => {
	}

	return (
	<div className="wrap-pattern-entry">

	  <div className="pattern">
	    {squares.map((square, ndx) => {
	      let squareClass = 'gray';
	      if (square === 'G') { squareClass = 'green'; }
	      else if (square === 'Y') { squareClass = 'yellow'; }
	      return <div key={ndx} className={'square square-' + squareClass}></div>
	    })}
	  </div>

	  {props.final && (
	    <div className="wrap-submit">
              <button onClick={props.submitPattern}>Enter</button>
	    </div>
	  )}

	</div>
	);
}

export default PatternEntry;

