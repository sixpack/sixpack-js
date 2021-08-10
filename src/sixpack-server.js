var get_default_sixpack = require('./sixpack-commom').get_default_sixpack;
var build_participate_params = require('./sixpack-commom').build_participate_params;
var build_convert_params = require('./sixpack-commom').build_convert_params;
var generate_uuidv4 = require('./sixpack-commom').generate_uuidv4;
var is_valid_experiment_name = require('./sixpack-commom').is_valid_experiment_name;
var validate_alternatives = require('./sixpack-commom').validate_alternatives;
var _request_uri = require('./sixpack-commom')._request_uri;

(function () {

  var sixpack = get_default_sixpack();

  sixpack.generate_client_id = function () {
    return generate_uuidv4();
  };

  sixpack.Session = function (options) {
    Object.assign(this, sixpack, options);

    if (!this.client_id) {
      this.client_id = this.generate_client_id();
    }
  };

  sixpack.Session.prototype = {
    participate: function(experiment_name, alternatives, traffic_fraction, force, callback) {
      if (typeof traffic_fraction === "function") {
        callback = traffic_fraction;
        traffic_fraction = null;
        force = null;
      } else if (typeof traffic_fraction === "string") {
        callback = force;
        force = traffic_fraction;
        traffic_fraction = null;
      }
      if (typeof force === "function") {
        callback = force;
        force = null;
      }

      if (!callback) {
        throw new Error("Callback is not specified");
      }

      if (!is_valid_experiment_name(experiment_name)) {
        return callback(new Error("Bad experiment_name"));
      }

      var alternative_error = validate_alternatives(alternatives, this.ignore_alternates_warning);
      if (alternative_error) {
        return callback(new Error(alternative_error));
      }

      if (force != null) {
        return callback(null, {"status": "ok", "alternative": {"name": force}, "experiment": {"version": 0, "name": experiment_name}, "client_id": this.client_id, "participating": true});
      }

      var params = build_participate_params(
        this.extra_params, this.client_id, this.ip_address, this.user_agent, traffic_fraction, experiment_name, alternatives
      );

      return _request(this.base_url + "/participate", params, this.timeout, this.cookie, function(err, res) {
        if (err) {
          res = { status: "failed", error: err, alternative: { name: alternatives[0] } };
        }
        return callback(null, res);
      });
    },
    convert: function(experiment_name, kpi, callback) {
      if (typeof kpi === 'function') {
        callback = kpi;
        kpi = null;
      }

      if (!callback) {
        callback = function(err) {
          if (err && console && console.error) {
            console.error(err);
          }
        }
      }

      if (!is_valid_experiment_name(experiment_name)) {
        return callback(new Error("Bad experiment_name"));
      }

      var params = build_convert_params(
        this.extra_params, this.client_id, this.ip_address, this.user_agent, experiment_name, kpi
      );

      return _request(this.base_url + "/convert", params, this.timeout, this.cookie, function(err, res) {
        if (err) {
          res = { status: "failed", error: err };
        }
        return callback(null, res);
      });
    }
  };

  var _request = function(uri, params, timeout, cookie, callback) {
    var timed_out = false;
    var timeout_handle = setTimeout(function () {
      timed_out = true;
      return callback(new Error("request timed out"));
    }, timeout);

    var url = _request_uri(uri, params);
    var httpModule = url.startsWith('https') ? 'https' : 'http';
    var http = eval('require')(httpModule); // using eval to skip webpack bundling and warnings

    var parsedUrl = new URL(url);
    var options = {
      protocol: parsedUrl.protocol,
      port: parsedUrl.port,
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search, 
      headers: { Cookie: cookie }
    }

    var req = http.get(options, function(res) {
      var body = "";
      res.on('data', function(chunk) {
        return body += chunk;
      });

      return res.on('end', function() {
        var data = { status: 'failed', response: body };

        if (res.statusCode < 500) {
          try {
            data = JSON.parse(body);
          } catch (err) {
            console.error(err);
          }
        }

        if (!timed_out) {
          clearTimeout(timeout_handle);
          return callback(null, data);
        }
      });
    });

    req.on('error', function(err) {
      if (!timed_out) {
        clearTimeout(timeout_handle);
        return callback(err);
      }
    });
  };

  module.exports = sixpack;
})();