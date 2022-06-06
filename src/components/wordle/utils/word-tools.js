function getGreenYellowPattern(word, guess) {
	var result = Array(word.length);
	result.fill('-');
	var wordLetters = word.split('');
	var guessLetters = guess.split('');

	// Mark Green
	guessLetters.forEach((letter, pos) => {
		if (letter === wordLetters[pos]) {
			result[pos] = 'G';
			guessLetters[pos] = '_';
			wordLetters[pos] = '_';
		}
	});

	// Mark Yellow
	guessLetters.forEach((letter, pos) => {
		if (letter !== '_' && letter !== '-') {
			let ndx = wordLetters.indexOf(letter);
			if (ndx !== -1) {
				result[pos] = 'Y';
				guessLetters[pos] = '-';
				wordLetters[ndx] = '-';
			}
		}
	})

	return result;
}

function checkWord(poolWord, guessWord, pattern) {
	var letterCount = poolWord.length;
	var poolLetters = poolWord.split('');
	var guessLetters = guessWord.split('');
	var isMatch = true;
	for (let i = 0; i < letterCount; i++) {
		let status = pattern[i];

		// Green: the letters in this position must match.
		if (status === 'G') {
			if (poolLetters[i] !== guessLetters[i]) {
				isMatch = false;
			}			
			else {
				poolLetters[i] = '_';
				guessLetters[i] = '_';
			}
		}
	}

	if (isMatch) {
		for (let i = 0; i < letterCount; i++) {
			let status = pattern[i];

			// Yellow: the letter in the guess must match a letter somewhere else in the pool word.
			if (status === 'Y') {
				let ndx = poolLetters.indexOf(guessLetters[i]);
				if (ndx === -1 || ndx === i) {
					isMatch = false;
				}
				else {
					poolLetters[ndx] = '-';
					guessLetters[i] = '-';
				}		
			}
		}
	}

	if (isMatch) {
		for (let i = 0; i < letterCount; i++) {
			let status = pattern[i];

			// Not Green or Yellow: the letter in the guess must not be present in the pool word.
			if (status === '-') {
				let ndx = poolLetters.indexOf(guessLetters[i]);
				if (ndx !== -1) {
					isMatch = false;
				}
			}
		}
	}

	return isMatch;
}

function getFilteredPool(pool, guess, pattern) {
	var filteredPool = [];
	pool.forEach((wordObj, ndx) => {
		if (checkWord(wordObj.word, guess, pattern)) {
			filteredPool.push(wordObj);
		}
	});
	return filteredPool;
}


export { getGreenYellowPattern, checkWord, getFilteredPool };

