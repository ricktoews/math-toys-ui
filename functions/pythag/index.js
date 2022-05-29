const pythag = require('./controller.js');

exports.handler = async (event) => {
  const { path } = event;
  const corner = path.replace('/api/pythag/', '');
  let result = pythag.getByCorner(corner);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'access-control-allow-origin': '*',
    },
  };

}
