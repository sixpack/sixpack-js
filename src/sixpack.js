

// function get_default_sixpack() {
//   return {
//     base_url: "http://localhost:5000",
//     extra_params: {},
//     ip_address: null,
//     user_agent: null,
//     timeout: 1000,
//     persist: true,
//     cookie_name: "sixpack_client_id",
//     cookie_domain: null,
//     ignore_alternates_warning: false,
//     cookie: '',
//   };
// };

// function build_participate_params(extra_params, client_id, ip_address, user_agent, traffic_fraction, experiment_name, alternatives) {
//   var params = Object.assign({}, extra_params, {
//     client_id,
//     experiment: experiment_name,
//     alternatives: alternatives
//   });
//   if (traffic_fraction !== null && !isNaN(traffic_fraction)) {
//     params.traffic_fraction = traffic_fraction;
//   }
//   if (ip_address) {
//     params.ip_address = ip_address;
//   }
//   if (user_agent) {
//     params.user_agent = user_agent;
//   }
//   return params;
// };

// function build_convert_params(extra_params, client_id, ip_address, user_agent, experiment_name, kpi) {
//   var params = Object.assign({}, extra_params, {
//     client_id: client_id,
//     experiment: experiment_name
//   });

//   if (ip_address) {
//     params.ip_address = ip_address;
//   }
//   if (user_agent) {
//     params.user_agent = user_agent;
//   }
//   if (kpi) {
//     params.kpi = kpi;
//   }
//   return params;
// };

// function generate_uuidv4() {
//   // from http://stackoverflow.com/questions/105034
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//     var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
//     return v.toString(16);
//   });
// };

// function is_valid_experiment_name(experiment_name) {
//   return (experiment_name && (EXPERIMENT_REGEX).test(experiment_name));
// };

// function validate_alternatives(alternatives, ignore_alternates_warning) {
//   if (alternatives.length < 2 && ignore_alternates_warning !== true) {
//     return "Must specify at least 2 alternatives";
//   }

//   for (var i = 0; i < alternatives.length; i += 1) {
//     if (!(EXPERIMENT_REGEX).test(alternatives[i])) {
//       return "Bad alternative name: " + alternatives[i];
//     }
//   }
// };

// function _request_uri(endpoint, params) {
//   var query_string = [];
//   var e = encodeURIComponent;
//   for (var key in params) {
//       if (params.hasOwnProperty(key)) {
//           var vals = params[key];
//           if (Object.prototype.toString.call(vals) !== '[object Array]') {
//               vals = [vals];
//           }
//           for (var i = 0; i < vals.length; i += 1) {
//               query_string.push(e(key) + '=' + e(vals[i]));
//           }
//       }
//   }
//   if (query_string.length) {
//       endpoint += '?' + query_string.join('&');
//   }
//   return endpoint;
// };

// module.exports = {
//   get_default_sixpack,
//   build_participate_params,
//   build_convert_params,
//   generate_uuidv4,
//   is_valid_experiment_name,
//   validate_alternatives,
//   _request_uri
// }


export default class Sixpack {
  constructor() {
    this.base_url = "http://localhost:5000";
    this.extra_param = {};
    this.ip_address = null;
    this.user_agent = null;
    this.timeout = 1000;
    this.persist = true;
    this.cookie_name = "sixpack_client_id";
    this.cookie_domain = null;
    this.ignore_alternates_warning = false;
    this.cookie = '';
  }

  updateProperties = ({
    base_url,
    extra_params,
    ip_address,
    user_agent,
    timeout,
    persist,
    cookie_name,
    cookie_domain,
    ignore_alternates_warning,
    cookie,
    client_id,
   }) => {
    this.base_url = base_url || this.base_url;
    this.extra_param = extra_params || this.extra_param;
    this.ip_address = ip_address || this.ip_address;
    this.user_agent = user_agent || this.user_agent;
    this.timeout = timeout || this.timeout;
    this.persist = persist || this.persist;
    this.cookie_name = cookie_name || this.cookie_name;
    this.cookie_domain = cookie_domain || this.cookie_domain;
    this.ignore_alternates_warning = ignore_alternates_warning || this.ignore_alternates_warning;
    this.cookie = cookie || this.cookie;
    this.client_id = client_id;
  }

  generateUuidv4 = () => {
    // from http://stackoverflow.com/questions/105034
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

  // isValidExperimentName = (experiment_name) => {
  //   return (experiment_name && (EXPERIMENT_REGEX).test(experiment_name));
  // };

  // request_uri = (endpoint, params) => {
  //   const queryString = [];
  //   const e = encodeURIComponent;
  //   for (var key in params) {
  //     if (params.hasOwnProperty(key)) {
  //       var vals = params[key];
  //       if (Object.prototype.toString.call(vals) !== '[object Array]') {
  //           vals = [vals];
  //       }
  //       for (var i = 0; i < vals.length; i += 1) {
  //           queryString.push(e(key) + '=' + e(vals[i]));
  //       }
  //     }
  //   }
  //   if (queryString.length) {
  //       endpoint += '?' + queryString.join('&');
  //   }
  //   return endpoint;
  // };
}
