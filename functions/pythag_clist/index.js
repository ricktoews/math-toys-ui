const pythag = require('./controller.js');

exports.handler = async (event) => {
  const { path } = event;
  const cListString = path.replace(/\/.*pythag_clist\//, '');
  const cList = cListString.split(',');
  let result = pythag.getTriples(cList);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'access-control-allow-origin': '*',
    },
  };

}
