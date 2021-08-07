
var EXPERIMENT_REGEX = /^[a-z0-9][a-z0-9\-_ ]*$/;

function get_default_sixpack() {
  return {
    base_url: "http://localhost:5000",
    extra_params: {},
    ip_address: null,
    user_agent: null,
    timeout: 1000,
    persist: true,
    cookie_name: "sixpack_client_id",
    cookie_domain: null,
    ignore_alternates_warning: false,
    cookie: '',
  };
};

function build_participate_params(
  extra_params,
  client_id,
  ip_address,
  user_agent,
  traffic_fraction,
  experiment_name,
  alternatives,
){
  var params = Object.assign({}, extra_params, {
    client_id,
    experiment: experiment_name,
    alternatives: alternatives
  });
  if (traffic_fraction !== null && !isNaN(traffic_fraction)) {
    params.traffic_fraction = traffic_fraction;
  }
  if (ip_address) {
    params.ip_address = ip_address;
  }
  if (user_agent) {
    params.user_agent = user_agent;
  }
  return params;
};

function generate_uuidv4() {
  // from http://stackoverflow.com/questions/105034
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
};

function is_valid_experiment_name(experiment_name) {
  return (experiment_name && (EXPERIMENT_REGEX).test(experiment_name));
};

function validate_alternatives(alternatives, ignore_alternates_warning) {
  if (alternatives.length < 2 && ignore_alternates_warning !== true) {
    return "Must specify at least 2 alternatives";
  }

  for (var i = 0; i < alternatives.length; i += 1) {
    if (!(EXPERIMENT_REGEX).test(alternatives[i])) {
      return "Bad alternative name: " + alternatives[i];
    }
  }
};

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

module.exports = {
  get_default_sixpack,
  build_participate_params,
  generate_uuidv4,
  is_valid_experiment_name,
  validate_alternatives,
  _request_uri
}
