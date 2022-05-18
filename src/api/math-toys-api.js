const baseUrl = 'https://arithmo.toewsweb.net:3000';
const API = {
    get_phi: baseUrl + '/phi/',
    get_pythag_clist: baseUrl + '/pythag_clist/',
    get_pythag_triples: baseUrl + '/pythag/'
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

export { getPhi, getPythagCList, getPythagTriples }