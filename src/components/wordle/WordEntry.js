import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import WordWithControls from './WordWithControls';
import Results from './Results';
import wordFreqPoolJSON from './utils/words.json';
import { getFilteredPool } from './utils/word-tools';

function byFreq(a, b) {
	return +a.freq > +b.freq ? -1 : 1;
}

const wordObjs = wordFreqPoolJSON.words.sort(byFreq);

function WordEntry() {
	const [word, setWord] = useState('');
	const [currentGuess, setCurrentGuess] = useState('');
	const [guesses, setGuesses] = useState([]);
	const [poolSize, setPoolSize] = useState([]);
	const [isPoolEmpty, setIsPoolEmpty] = useState(false);
	const [patterns, setPatterns] = useState([]);
	const [wordFreqPool, setWordFreqPool] = useState(wordObjs);
	const [overlayStatus, setOverlayStatus] = useState('hide');
	const [inProgress, setInProgress] = useState(false);

	useEffect(() => {
	}, []);

	function reset(stat) {
		if (stat !== 'same') {
			setWord('');
		}
		setCurrentGuess('');
		setGuesses([]);
		setPoolSize([]);
		setIsPoolEmpty(false);
		setPatterns([]);
		setWordFreqPool(wordFreqPoolJSON.words);
		setOverlayStatus('hide');
    setInProgress(false);
	}


	function isComplete(pattern) {
		var statuses = pattern.filter(item => item !== 'G');
		return (statuses.length === 0);
	}


	const handleAgainDifferent = () => {
		reset();		
	}

	const handleAgainSame = () => {
		reset('same');		
	}

	const handleWordEntry = e => {
		var el = e.target;
		var capitalized = el.value.toUpperCase();
		setWord(capitalized);
		if (capitalized.length === 5) {
			if (wordFreqPool.map(w=>w.word).indexOf(capitalized) === -1) {
				setWord('');
			}
		}
	}

	const TOP_PCT = .2;
	function pickTopWords(pool) {
		let subsetSize = Math.floor(pool.length * TOP_PCT);
		var subset = pool.slice(0, subsetSize);
		if (subset.length === 0) {
			subset = pool;
		}
console.log('pickTopWords, top 20%', subset.length, ': position of target', word, 'in subset', subset.map(w=>w.word).indexOf(word));
if (subset.length < 10) {
	subset.forEach(item => { console.log(item.word, item.freq); });
}
		var ndx = Math.floor(Math.random() * subset.length);
		return subset[ndx];
	}

	/*
	  Modified to use new function pickTopWords, to take the most popular
	  n percent (currently set at 20%) words from the pool and select a
	  random word from those. This, instead of merely choosing a random
	  word from the entire pool.
	*/
	function pickWord(pool) {
/*
		var poolSize = pool.length;
		var ndx = Math.floor(Math.random() * pool.length);
		var word = pool[ndx].word;
*/
		var wordObj = pickTopWords(pool);
		var word = wordObj.word;
console.log('picked word, frequency', word, wordObj.freq);
		return word;
	}

	const makeGuess = (pool) => {
		var guess = pickWord(pool);
		setCurrentGuess(guess);
		let _guesses = guesses.slice(0);
		_guesses.push(guess);
		setGuesses(_guesses);
		let _poolSize = poolSize.slice(0);
		_poolSize.push(pool.length);
		setPoolSize(_poolSize);
	}

	const submitAttempt = (pattern) => {
		let _patterns = patterns.slice(0);
		_patterns.push(pattern);
		setPatterns(_patterns);
		var filteredPool = getFilteredPool(wordFreqPool, currentGuess, pattern);
		setWordFreqPool(filteredPool);
console.log('submitAttempt isComplete', isComplete(pattern));
		if (isComplete(pattern)) {
			setOverlayStatus('show');
		}
		else if (filteredPool.length > 0) {
			makeGuess(filteredPool);
		}
		else {
			console.log('Something went wrong; no words left.');
			setIsPoolEmpty(true);
		}
	}

	const start = e => {
		console.log('Start picking!', poolSize, guesses);
		makeGuess(wordFreqPool);
		setInProgress(true);
	}

	return (
	<div className="game-layout">
    <div className="col">
    { inProgress === false && <div className="wrap-word-entry">
        <div className="intro">
          <p>Enter a five-letter word. The app will attempt to determine your word by selecting from its list and narrowing down that list based on your feedback, according to Wordle rules. The initial list consists of the five-letter words in the Scrabble dictionary.</p>
        </div>
    	  <div className="word-entry-field">
          <label htmlFor="word">Your word</label>: 
          <input type="text" name="word" id="word" value={word} onChange={handleWordEntry} />
        </div>

	      { isPoolEmpty && (<p>There are simply no words for this. Guessing there was an issue in the Green / Yellow selections.</p>) }

	      { word.length === 5 && (
	      <div className="word-entry">
	        <div id="wrap-target-word">Target word: <span className="target-word">{word}</span></div>
	        { guesses.length === 0 && (
                <div className="wrap-button">
	          Click Start to prompt for the initial guess. <Button className="app-btn" onClick={start}>Start</Button>
                </div>
	        ) }
            </div>
	      ) }

        { wordFreqPool.length < 10 && (
	        <div>{wordFreqPool.map(w=>w.word).join(', ')}</div>
	      ) }
      </div> }
    </div>


          <div className="col">
	    { (word.length === 5 && guesses.length > 0) && (
	    <div className="guess-list">
	    { guesses.map((guess, ndx) => <WordWithControls key={ndx} poolSize={poolSize[ndx]} word={word} guess={guess} submitAttempt={submitAttempt} final={ndx === guesses.length - 1} /> ) }
	    </div>
	    ) }
          </div>


          <div className="col">
          </div>

	{/* Overlay for end of round */}
          <div className={'wrap-overlay ' + overlayStatus}>
            <div className="overlay">
              <p>Completed in {patterns.length} attempts.</p>
	      { guesses.map((word, ndx) => <div key={ndx}>{word}</div>) }
              <br/>
	      <Results patterns={patterns} />
              <div className="wrap-buttons">
                <Button className="app-btn" onClick={handleAgainSame}>Again, Same Word</Button>
                <Button className="app-btn" onClick={handleAgainDifferent}>Again, Different Word</Button>
              </div>
            </div>
          </div>
	{/* End Overlay for end of round */}

	</div>
	);
}

export default WordEntry;
