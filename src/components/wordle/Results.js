import React from 'react';

function Results(props) {
	return (
	<div className="wrap-patterns">
	{props.patterns.map((squares, ndx1) => {

	  return (<div key={ndx1} className="pattern">
	    {squares.map((square, ndx2) => {
	      let squareClass = 'gray';
	      if (square === 'G') { squareClass = 'green'; }
	      else if (square === 'Y') { squareClass = 'yellow'; }
	      return <div key={ndx2} className={'square square-' + squareClass}></div>
	    })}
	  </div>)

	} ) }
	</div>
	);
}

export default Results;
