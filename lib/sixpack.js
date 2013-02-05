(function () {
    var sixpack = {host: "localhost", port: 5000};

    // check for node module loader
    var on_node = false;
    if (typeof module !== "undefined" && typeof require !== "undefined") {
        on_node = true;
        module.exports = sixpack;
    } else {
        window["sixpack"] = sixpack;
    }

    sixpack.simple_participate = function (experiment_name, alternatives, client_id, force, callback) {
        if (typeof client_id === "function") {
            callback = client_id;
            client_id = null;
        } else if (typeof force === "function") {
            callback = force;
            force = null;
        }

        var session = new sixpack.Session(client_id);
        session.participate(experiment_name, alternatives, force, function (err, res) {
            if (on_node) {
                return callback(err, res && res.alternative);
            } else {
                return callback(err.alternative);
            }
        });
    };

    sixpack.simple_convert = function (experiment_name, client_id, callback) {
        var session = new sixpack.Session(client_id);
        session.convert(experiment_name, function (err, res) {
            if (on_node) {
                return callback(err, res && res.status);
            } else {
                return callback(err.status);
            }
        });
    }

    sixpack.generate_client_id = function () {
        // from http://stackoverflow.com/questions/105034
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    sixpack.Session = function (client_id, host, port) {
        this.client_id = client_id || sixpack.generate_client_id();
        this.host = host || sixpack.host;
        this.port = port || sixpack.port;
    };

    sixpack.Session.prototype = {
        participate: function(experiment_name, alternatives, force, callback) {
            if (typeof force === "function") {
                callback = force;
                force = null;
            }

            if (!experiment_name.match(/^[a-z0-9][a-z0-9\-_ ]*/)) {
                return callback(new Error("Bad experiment_name"));
            }

            if (alternatives.length < 2) {
                return callback(new Error("Must specify at least 2 alternatives"));
            }

            for (var i = 0; i < alternatives.length; i += 1) {
                if (!alternatives[i].match(/^[a-z0-9][a-z0-9\-_ ]*/)) {
                    return callback(new Error("Bad alternative name: " + alternatives[i]));
                }
            }
            var params = {client_id: this.client_id,
                          experiment: experiment_name,
                          alternatives: alternatives};
            if (force != null && _in_array(alternatives, force)) {
                params.force = force;
            }
            return _request("/participate", params, callback);
        },
        convert: function(experiment_name, callback) {
            var params = {client_id: this.client_id,
                          experiment: experiment_name};
            return _request("/convert", params, callback);
        }
    };

    var counter = 0;

    var _request = function(endpoint, params, callback) {
        if (!on_node) {
            var cb = "callback" + (++counter);
            params.callback = "sixpack." + cb
            sixpack[cb] = callback;
        }
        var url = _request_uri(endpoint, params);
        if (!on_node) {
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = true;
            document.body.appendChild(script);
        } else {
            var http = require('http');
            var req = http.get(url, function(res) {
                var body = "";
                res.on('data', function(chunk) {
                    return body += chunk;
                });
                return res.on('end', function() {
                    var data;
                    if (res.statusCode == 500) {
                        data = {status: "failed", response: body};
                    } else {
                        data = JSON.parse(body);
                    }
                    return callback(null, data);
                });
            });
            req.on('error', function(err) {
                return callback(err);
            });
        }
    };

    var _request_uri = function(endpoint, params) {
        endpoint = "http://" + sixpack.host + ":" + sixpack.port + endpoint;
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

    var _in_array = function(a, v) {
        for(var i = 0; i < a.length; i++) {
            if(a[i] === v) {
                return true;
            }
        }
        return false;
    };
})();
