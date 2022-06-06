import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import LetterControls from './LetterControls';
import PatternEntry from './PatternEntry';
import { getGreenYellowPattern } from './utils/word-tools';

const statusName = {
	'G': 'green',
	'Y': 'yellow',
	'-': 'gray'
};

function WordWithControls(props) {
	const [letters, setLetters] = useState(props.guess.split(''));
	const [pattern, setPattern] = useState(['-', '-', '-', '-', '-']);
	const [pool, setPool] = useState(props.initialPool);
	const [clearExcept, setClearExcept] = useState();

	useEffect(() => {
		if (props.final) {
			let _p = getGreenYellowPattern(props.word, props.guess);
//			console.log(props.word, props.guess, _p);
			setPattern(_p);
		}
	}, []);


	function nextAttempt() {
		submitPattern();
	}

	function isComplete(p) {
		var statuses = p.filter(item => item !== 'G');
		return statuses.length === 0;
	}


	const submitPattern = e => {
//		var guess = props.guess;
		props.submitAttempt(pattern);
	}
console.log('pattern', pattern);
	return (
    <div className="wrap-word-controls">
      <div className="pool-size">Random selection from {props.poolSize} words</div>
      { letters.map((letter, ndx) => {
          let clear = clearExcept !== ndx;
	      let status = statusName[pattern[ndx]];
          return <LetterControls key={ndx} clear={clear} letter={letter} status={status} />
      })}
	  <Button className="app-btn" onClick={submitPattern}>Next</Button>
    </div>
	);
}

export default WordWithControls;
