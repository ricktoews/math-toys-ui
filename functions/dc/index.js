const dc = require('./controller.js');

exports.handler = async (event) => {
  const { path } = event;
  const args = path.replace(/\/.*dc\//, '');
  const [denom, num] = args.split('/');
  let result;
  if (num) {
    result = dc.getSingleExpansion(num, denom);
  } else {
    result = dc.getExpansions(denom);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'access-control-allow-origin': '*',
    },
  };

}
