
function generate_uuidv4() {
  // from http://stackoverflow.com/questions/105034
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function _request_uri(endpoint, params) {
  var query_string = [];
  var e = encodeURIComponent;
  for (var key in params) {
      if (params.hasOwnProperty(key)) {
          var vals = params[key];
          if (Object.prototype.toString.call(vals) !== '[object Array]') {
              vals = [vals];
          }
          for (var i = 0; i < vals.length; i += 1) {
              query_string.push(e(key) + '=' + e(vals[i]));
          }
      }
  }
  if (query_string.length) {
      endpoint += '?' + query_string.join('&');
  }
  return endpoint;
};

module.exports = { generate_uuidv4, _request_uri }
