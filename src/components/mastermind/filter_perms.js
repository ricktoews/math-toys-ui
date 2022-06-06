'use strict';

import { permutations } from './perms.js';

const BLK_CODE_MARKED = '_';
const BLK_GUESS_MARKED = '-';
const WHITE_CODE_MARKED = '*';
const WHITE_GUESS_MARKED = '#';

//----------------------------------------------------------------------
// Adding replaceChar to String prototype.
// Replace a single character within a string.
// ndx: 0-index position of character to replace.
// ch:  character to place at nth position, replacing existing character
//
// This function is useful, since str[n] seems to be read-only.
//----------------------------------------------------------------------
String.prototype.replaceChar = function(ndx, ch) {
        var arr = this.split('');
        arr[ndx] = ch;
        return arr.join('');
}

/*
var permutations = {
    build: build
};
*/
var perms = permutations.build(6, 4);

function score_guess(guess, code) {
console.log('score_guess guess', guess);
        var { guess, code, black } = score_black(guess, code);
        var { guess, code, white } = score_white(guess, code);
        return { black, white };
}

/*
  Score "black" symbols. Correct symbol in correct position.
  Besides tallying matching symbols, this function replaces matched symbols
  with a placeholder (different between code and guess) to remove these matches
  from the guess and code passed to the score_white function.
  Because JavaScript passes string parameters by reference (it seems), the
  local changes in code and guess aren't retained in the parameters and so
  must be explicitly returned.
*/
function score_black(guess, code) {
        var black = 0;
console.log('score_black guess', guess);
        for (let i = 0; i < guess.length; i++) {
                if (guess[i] === code[i]) {
                        black++;
                        guess = guess.replaceChar(i, BLK_GUESS_MARKED);
                        code = code.replaceChar(i, BLK_CODE_MARKED);
                }
        }
        return { guess, code, black };
}


/*
  Score "white" symbols. Correct symbol in incorrect position.
  Note that this function assumes no black symbols present.
*/
function score_white(guess, code) {
        var white = 0;
console.log('score_white guess', guess);
        for (let i = 0; i < guess.length; i++) {
                if (code.indexOf(guess[i]) !== -1) {
                        code = code.replace(guess[i], WHITE_CODE_MARKED);
                        guess = guess.replaceChar(i, WHITE_GUESS_MARKED);
                        white++;
                }
        }
        return { guess, code, white };
}


function check_exact(exact, perm, pattern) {
    var perm = perm.split('');
    var pattern = pattern.split('');
    var pattern_len = pattern.length;
    var count = 0;
    for (let i = 0; i < pattern_len; i++) {
        if (pattern[i] === perm[i]) {
            pattern[i] = '_';
            count += 1;
		}
    }
    if (count === exact) {
        return true;
    } else {
        return false;
    }
}
        

function check_inexact(inexact, perm, pattern) {
    var perm = perm.split('');
    var orig_pattern = pattern;
    var pattern = pattern.split('');
    var pattern_len = pattern.length;
    for (let i = 0; i < pattern_len; i++) {
        if (pattern[i] === perm[i]) {
            perm[i] = '_';
            pattern[i] = '_';
        }
    }
    var count = 0;
    for (let i = 0; i < pattern_len; i++) {
        if (pattern[i] !== '_') {
            if (pattern[i] !== perm[i] && perm.indexOf(pattern[i]) !== -1) {
                let ndx = perm.indexOf(pattern[i]);
                perm[ndx] = '_';
                count++;
            }
        }
    }

    if (count === inexact) {
        return true;
    } else {
        return false;
    }
}

function is_match(exact, inexact, perm, pattern) {
    var exact_match = check_exact(exact, perm, pattern);
    if (exact_match) {
        var inexact_match = check_inexact(inexact, perm, pattern);
    }

    return exact_match && inexact_match;
}

function filter_perms(exact, inexact, pattern) {
    var filtered = [];
    perms.forEach((p) => {
        if (is_match(exact, inexact, p, pattern)) {
            filtered.push(p);
        }
    });

    return filtered;
}

function update_perms(subset) {
	perms = subset;
}

export { score_guess, filter_perms, update_perms };
/*
To test:

var results = filter_perms(2, 2, 'ABCD');
console.log('results from 2, 2, ABCD', results, results.length);

var results = filter_perms(4, 0, 'ABBD');
console.log('results from 4, 0, ABBD', results, results.length);

var results = filter_perms(0, 0, 'AAAB');
console.log('results from 0, 0, AAAB', results, results.length);
*/

