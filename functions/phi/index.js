const phi = require('./controller.js');

exports.handler = async (event) => {
  const { path } = event;
  const power = path.replace(/\/.*phi\//, '');
  let result = phi.getPhiData(power);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'access-control-allow-origin': '*',
    },
  };

}
