const awsUrl = 'https://4dl83sd9wg.execute-api.us-east-1.amazonaws.com';
const netlifyUrl = 'https://math-toys.netlify.app/.netlify/functions';
const nodeLocal = 'http://localhost:3001/api';
const mathtoysApi = 'https://mathtoys.toews-api.com/api';

const baseUrl = mathtoysApi;

const API = {
  get_phi: baseUrl + '/phi/',
  get_pythag_clist: baseUrl + '/pythag_clist/',
  get_pythag_triples: baseUrl + '/pythag/',
  get_expansions: baseUrl + '/dc/',
  post_expansions: baseUrl + '/dc',
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

async function postExpansions(denom) {
  const result = await fetch(API.post_expansions, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ denom }),
  });

  if (!result.ok) {
    throw new Error(`Server returned ${result.status}`);
  }

  return await result.json();
}


async function getDenomByExpansion(denom) {
  let result = await fetch(API.get_by_expansion + denom);
  result = await result.json();
  return result;
}
export { getPhi, getPythagCList, getPythagTriples, getExpansions, postExpansions, getDenomByExpansion }