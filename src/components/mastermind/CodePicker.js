import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import './mastermind-appsolves.scss';

const CODE_LENGTH = 4;
const INIT_CODE = Array(CODE_LENGTH).fill('');

function containsBlanks(pegs) {
	var withoutBlanks = pegs.filter(item => item !== '');
	return withoutBlanks.length < CODE_LENGTH;
}

function removePegX(current, x) {
	var modified = [...current];
	modified[x] = '';
	return modified;
}

function updateCode(current, toAdd) {
	var modified = [...current];
	var ndx = modified.indexOf('');
	modified[ndx] = toAdd;
	return modified;
}

function CodePicker(props) {
	const [codePegs, setCodePegs] = useState(INIT_CODE);
	const [codeComplete, setCodeComplete] = useState(false);
	const [codeSelected, setCodeSelected] = useState(false);
	const codeRef = useRef();

	useEffect(() => {
	}, []);

	useEffect(() => {
		setCodeSelected(props.codeSelected);
		if (!props.codeSelected) {
			setCodePegs(INIT_CODE);
		}
	}, [props.codeSelected]);

	useEffect(() => {
		let hasBlankCodes = containsBlanks(codePegs);
		setCodeComplete(hasBlankCodes === false);
	});

	const handlePegSelect = e => {
		var el = e.currentTarget;
		var classes = Array.from(el.classList);
		var className = classes.pop();
		var newCode = updateCode(codePegs, className);
		setCodePegs(newCode);
	};

	const handleCodePegClick = e => {
		var el = e.currentTarget;
		var classes = Array.from(el.classList);
		var className = classes.pop();
		el.classList.remove(className);
		var ndx = el.dataset.ndx;
		setCodePegs(removePegX(codePegs, ndx));
	};

	const handleCodeComplete = () => {
		props.chosenCode(codePegs);
	};

	return (
  <div className="code-picker">
    We're assuming you're familiar with the game, so pick a code.

    <div className="float-container">
      <div ref={codeRef} className="peg-wrapper code-selection">
	{ [0, 1, 2, 3].map((ndx, key) => {
		let pegClass = 'peg ' + codePegs[ndx] || 'peg';
	
		return <div key={key} data-ndx={ndx} className={pegClass} onClick={handleCodePegClick}></div>
	  })
	}
      </div>
	  { codeComplete && <div className="selection-complete"><Button className="app-btn" onClick={handleCodeComplete}>Start Solving</Button></div> }
    </div>

	{ !codeSelected && (
    <>
    <div className="float-container">
      <div className="peg-wrapper">
	{ ['red', 'green', 'yellow', 'blue', 'purple', 'black'].map(color => {
    	return <div key={color} className={`peg peg-${color}`} onClick={handlePegSelect}></div>
	  })
	}
      </div>
    </div>
    
    </>
	) }
  </div>

	);
}

export default CodePicker;
