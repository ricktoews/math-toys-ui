const denom_calc = require('./dc/index.js');

exports.handler = async (event) => {
  const { path } = event;
  const denom = path.replace('/api/dc/', '');
  let result = denom_calc.getExpansions(denom);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };

}
