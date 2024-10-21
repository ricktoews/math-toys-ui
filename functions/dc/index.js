const dc = require('./controller.js');

exports.handler = async (event) => {
  const { path } = event;
console.log('====> dc path', path);
  const denom = path.replace(/\/.*dc\//, '');
  let result = dc.getExpansions(denom);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'access-control-allow-origin': '*',
    },
  };

}
