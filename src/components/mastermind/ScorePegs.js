import React, { useState, useRef, useEffect } from 'react';

const CODE_LENGTH = 4;
const INIT_SCORE_PEGS = Array(CODE_LENGTH).fill('');

// make array of mastermind score pegs.
// type will be 'black' or 'white'.
function makePegArray(black, white) {
//console.log(`makePegArray: ${black} black, ${white} white`);
	var scorePegs = INIT_SCORE_PEGS.slice(0);
	for (let p = 0; p < CODE_LENGTH; p++) {
		if (p < black) {
			scorePegs[p] = 'black';
		}
		else if (p < black + white) {
			scorePegs[p] = 'white';
		}
	}
//console.log('score pegs', scorePegs);
	return scorePegs;
}

function ScorePegs(props) {
	const [ black, setBlack ] = useState(0);
	const [ white, setWhite ] = useState(0);

	useEffect(() => {
		setBlack(props.black);
		setWhite(props.white);
	}, [props.black, props.white] );

	const pegs = makePegArray(black, white);
//console.log(black, 'black;', white, 'white; pegs this round', pegs);
	return (
	<div className="score-peg-wrapper">
	{ pegs.map((peg, ndx) => {
		var classes = 'score-peg';
		if (peg !== '') {
			// if peg !== '', peg === 'black' or peg === 'white'
			classes += ` score-${peg}`;
		}
		return <div key={ndx} className={classes}></div>
	})}
	</div>
	);
}

export default ScorePegs;
