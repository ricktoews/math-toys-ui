const dc = require('./controller.js');

exports.handler = async (event) => {
  const { path } = event;
  const args = path.replace(/\/.*dc\//, '');
  const [denom, num] = args.split('/');
console.log('====> args', args, 'denom', denom, 'num', num);
  let result = dc.getExpansions(denom, num);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'access-control-allow-origin': '*',
    },
  };

}
