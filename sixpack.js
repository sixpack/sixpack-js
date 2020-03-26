(function () {
    // Object.assign polyfill from https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
    Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:function(e){"use strict";if(void 0===e||null===e)throw new TypeError("Cannot convert first argument to object");for(var r=Object(e),t=1;t<arguments.length;t++){var n=arguments[t];if(void 0!==n&&null!==n){n=Object(n);for(var o=Object.keys(Object(n)),a=0,c=o.length;c>a;a++){var i=o[a],b=Object.getOwnPropertyDescriptor(n,i);void 0!==b&&b.enumerable&&(r[i]=n[i])}}}return r}});

    // check if on node
    var on_node = typeof window === "undefined";

    var sixpack = (!on_node && window.sixpack) ? window.sixpack : {
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
    if (!on_node) {
        window.sixpack = sixpack;
    }

    function generate_uuidv4() {
        // from http://stackoverflow.com/questions/105034
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    sixpack.generate_client_id = function () {
        var client_id = generate_uuidv4();
        if (!on_node && this.persist) {
            var cookie_value = this.cookie_name + "=" + client_id + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
            if (this.cookie_domain) {
              cookie_value += '; domain=' + this.cookie_domain;
            }
            document.cookie = cookie_value;
        }
        return client_id;
    };

    sixpack.persisted_client_id = function() {
        // http://stackoverflow.com/questions/5639346/shortest-function-for-reading-a-cookie-in-javascript
        var result;
        return (result = new RegExp('(?:^|; )' + encodeURIComponent(this.cookie_name) + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null;
    };

    sixpack.Session = function (options) {
        Object.assign(this, sixpack, options);

        if (!this.client_id) {
            if (this.persist && !on_node) {
                var persisted_id = this.persisted_client_id();
                this.client_id = persisted_id !== null ? persisted_id : this.generate_client_id();
            } else {
                this.client_id = this.generate_client_id();
            }
        }
        if (!on_node) {
            this.user_agent = this.user_agent || (window && window.navigator && window.navigator.userAgent);
        }
    };

    sixpack.Session.prototype = {
        participate: function(experiment_name, alternatives, traffic_fraction, force, callback) {
            if (typeof traffic_fraction === "function") {
                callback = traffic_fraction;
                traffic_fraction = null;
                force = null;
            }
            else if (typeof traffic_fraction === "string") {
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

            if (!experiment_name || !(/^[a-z0-9][a-z0-9\-_ ]*$/).test(experiment_name)) {
                return callback(new Error("Bad experiment_name"));
            }

            if (alternatives.length < 2 && this.ignore_alternates_warning !== true) {
                return callback(new Error("Must specify at least 2 alternatives"));
            }

            for (var i = 0; i < alternatives.length; i += 1) {
                if (!(/^[a-z0-9][a-z0-9\-_ ]*$/).test(alternatives[i])) {
                    return callback(new Error("Bad alternative name: " + alternatives[i]));
                }
            }
            var params = Object.assign({}, this.extra_params, {
                client_id: this.client_id,
                experiment: experiment_name,
                alternatives: alternatives
            });
            if (!on_node && force == null) {
                var regex = new RegExp("[\\?&]sixpack-force-" + experiment_name + "=([^&#]*)");
                var results = regex.exec(window.location.search);
                if(results != null) {
                    force = decodeURIComponent(results[1].replace(/\+/g, " "));
                }
            }
            if (traffic_fraction !== null && !isNaN(traffic_fraction)) {
                params.traffic_fraction = traffic_fraction;
            }
            if (force != null) {
                return callback(null, {"status": "ok", "alternative": {"name": force}, "experiment": {"version": 0, "name": experiment_name}, "client_id": this.client_id, "participating": true});
            }
            if (this.ip_address) {
                params.ip_address = this.ip_address;
            }
            if (this.user_agent) {
                params.user_agent = this.user_agent;
            }
            return _request(this.base_url + "/participate", params, this.timeout, this.cookie, function(err, res) {
                if (err) {
                    res = {status: "failed",
                           error: err,
                           alternative: {name: alternatives[0]}};
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

            if (!experiment_name || !(/^[a-z0-9][a-z0-9\-_ ]*$/).test(experiment_name)) {
                return callback(new Error("Bad experiment_name"));
            }

            var params = Object.assign({}, this.extra_params, {
                client_id: this.client_id,
                experiment: experiment_name
            });
            if (this.ip_address) {
                params.ip_address = this.ip_address;
            }
            if (this.user_agent) {
                params.user_agent = this.user_agent;
            }
            if (kpi) {
                params.kpi = kpi;
            }
            return _request(this.base_url + "/convert", params, this.timeout, this.cookie, function(err, res) {
                if (err) {
                    res = {status: "failed",
                           error: err};
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

        if (!on_node) {
            var suffix = generate_uuidv4().replace(/-/g, '');
            var cb = "callback" + suffix;
            params.callback = "sixpack." + cb;
            sixpack[cb] = function (res) {
                if (!timed_out) {
                    clearTimeout(timeout_handle);
                    return callback(null, res);
                }
            }
        }
        var url = _request_uri(uri, params);
        if (!on_node) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = true;
            document.body.appendChild(script);
        } else {
            const httpModule = url.startsWith('https') ? 'https' : 'http';
            var http = require(httpModule);
            var req = http.get(url, { headers: { 'Cookie': cookie } }, function(res) {
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
        }
    };

    var _request_uri = function(endpoint, params) {
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

    // export module for node or environments with module loaders, such as webpack
    if (typeof module !== "undefined" && typeof require !== "undefined") {
        module.exports = sixpack;
    }
})();
