const phi = require('./controller.js');

exports.handler = async (event) => {
  const { path } = event;
  const power = path.replace('/api/phi/', '');
  let result = phi.getPhiData(power);
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };

}
