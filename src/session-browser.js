import Session from "./session";

export default class SessionBrowser extends Session {
  constructor(props) {
    super(props)
    this.generateUuidv4 = props.generateUuidv4;
  }

  participate = (experimentName, alternatives, trafficFraction, force, callback) => {
    if (typeof trafficFraction === "function") {
      callback = trafficFraction;
      trafficFraction = null;
      force = null;
    } else if (typeof trafficFraction === "string") {
      callback = force;
      force = trafficFraction;
      trafficFraction = null;
    }
    if (typeof force === "function") {
      callback = force;
      force = null;
    }

    if (!callback) {
      throw new Error("Callback is not specified");
    }

    if (!this.isValidExperimentName(experimentName)) {
      return callback(new Error("Bad experiment_name"));
    }

    var alternativeError = this.validateAlternatives(alternatives);
    if (alternativeError) {
      return callback(new Error(alternativeError));
    }

    if (force == null) {
      var regex = new RegExp("[\\?&]sixpack-force-" + experimentName + "=([^&#]*)");
      var results = regex.exec(window.location.search);
      if(results != null) {
        force = decodeURIComponent(results[1].replace(/\+/g, " "));
      }
    }
    if (force != null) {
      return callback(null, this.getForcedResult({ force, experimentName }));
    }

    const params = this.buildParticipateParams({
      trafficFraction, experimentName, alternatives
    });

    return this.request(this.base_url + "/participate", params, this.timeout, function(err, res) {
      if (err) {
        res = { status: "failed", error: err, alternative: { name: alternatives[0]} };
      }
      return callback(null, res);
    });
  }

  convert = (experimentName, kpi, callback) => {
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

    if (!this.isValidExperimentName(experimentName)) {
      return callback(new Error("Bad experiment_name"));
    }

    const params = this.buildConvertParams({ experimentName, kpi });

    return this.request(this.base_url + "/convert", params, this.timeout, function(err, res) {
      if (err) {
        res = { status: "failed", error: err };
      }
      return callback(null, res);
    });
  }

  request = (uri, params, timeout, callback) => {
    let timedOut = false;
    const timeoutHandle = setTimeout(function () {
      timedOut = true;
      return callback(new Error("request timed out"));
    }, timeout);

    var suffix = this.generateUuidv4().replace(/-/g, '');
    var cb = "callback" + suffix;
    params.callback = "sixpack." + cb;

    window.sixpack[cb] = function (res) {
      if (!timedOut) {
        clearTimeout(timeoutHandle);
        return callback(null, res);
      }
    }

    var url = this.requestUri(uri, params);
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.async = true;
    document.body.appendChild(script);
  }
}
