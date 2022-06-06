import React, { useEffect, useRef, useState } from 'react';

function LetterControls(props) {
	const [letter, setLetter] = useState(props.letter);
	const [letterClass, setLetterClass] = useState('letter');

	useEffect(() => {
	}, []);

	function makeLetterClass(status) {
		var ltrCls = status ? `letter letter-${status}` : 'letter';
		setLetterClass(ltrCls);
	}

	setTimeout(() => { console.log('status for', letter, props.status); makeLetterClass(props.status) }, 1000);
	/*
	  Remove letter buttons, as scoring is done by the app.
	*/
	return (
	<div>
	  <div className="wrap-letter-control">
	    <div className="wrap-letter"><div className={letterClass}>{letter}</div></div>
	  </div>
	</div>
	);
}

export default LetterControls;
