const baseUrl = 'https://arithmo.toewsweb.net:3000';
const netlifyUrl = '/api';

const API = {
    get_phi: netlifyUrl + '/phi/',
    get_pythag_clist: baseUrl + '/pythag_clist/',
    get_pythag_triples: netlifyUrl + '/pythag/',
    get_expansions: netlifyUrl + '/dc/',
    get_by_expansion: baseUrl + '/denom_byexpansion/',
}

async function getPhi(n) {
  let result = await fetch(API.get_phi + n);
  result = await result.json();
  return result;
}

async function getPythagCList(list) {
  let clist = list.join(',');
  let result = await fetch(API.get_pythag_clist + clist);
  result = await result.json();
  return result;
}

async function getPythagTriples(corner) {
  let result = await fetch(API.get_pythag_triples + corner);
  result = await result.json();
  return result;
}

async function getExpansions(denom) {
  let result = await fetch(API.get_expansions + denom);
  result = await result.json();
  return result;
}

async function getDenomByExpansion(denom) {
  let result = await fetch(API.get_by_expansion + denom);
  result = await result.json();
  return result;
}
export { getPhi, getPythagCList, getPythagTriples, getExpansions, getDenomByExpansion }