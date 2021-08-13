/* eslint-disable no-console */
/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
import Session from './session';

export default class SessionServer extends Session {
  participate = (
    experimentName,
    alternatives,
    trafficFraction,
    force,
    callback,
  ) => {
    if (typeof trafficFraction === 'function') {
      callback = trafficFraction;
      trafficFraction = null;
      force = null;
    } else if (typeof trafficFraction === 'string') {
      callback = force;
      force = trafficFraction;
      trafficFraction = null;
    }
    if (typeof force === 'function') {
      callback = force;
      force = null;
    }

    if (!callback) {
      throw new Error('Callback is not specified');
    }

    if (!this.isValidExperimentName(experimentName)) {
      return callback(new Error('Bad experiment_name'));
    }

    const alternativeError = this.validateAlternatives(alternatives);
    if (alternativeError) {
      return callback(new Error(alternativeError));
    }

    if (force != null) {
      return callback(null, this.getForcedResult({ force, experimentName }));
    }

    const params = this.buildParticipateParams({
      trafficFraction,
      experimentName,
      alternatives,
    });

    return this.request(
      `${this.base_url}/participate`,
      params,
      this.timeout,
      this.cookie,
      function (err, res) {
        if (err) {
          res = {
            status: 'failed',
            error: err,
            alternative: { name: alternatives[0] },
          };
        }
        return callback(null, res);
      },
    );
  };

  convert = (experimentName, kpi, callback) => {
    if (typeof kpi === 'function') {
      callback = kpi;
      kpi = null;
    }

    if (!callback) {
      callback = function (err) {
        if (err && console && console.error) {
          console.error(err);
        }
      };
    }

    if (!this.isValidExperimentName(experimentName)) {
      return callback(new Error('Bad experiment_name'));
    }

    const params = this.buildConvertParams({ experimentName, kpi });

    return this.request(
      `${this.base_url}/convert`,
      params,
      this.timeout,
      this.cookie,
      function (err, res) {
        if (err) {
          res = { status: 'failed', error: err };
        }
        return callback(null, res);
      },
    );
  };

  request = (uri, params, timeout, cookie, callback) => {
    let timedOut = false;
    const timeoutHandle = setTimeout(function () {
      timedOut = true;
      return callback(new Error('request timed out'));
    }, timeout);

    const url = this.requestUri(uri, params);
    const httpModule = url.startsWith('https') ? 'https' : 'http';
    // eslint-disable-next-line no-eval
    const http = eval('require')(httpModule); // using eval to skip webpack bundling and warnings

    const parsedUrl = new URL(url);
    const options = {
      protocol: parsedUrl.protocol,
      port: parsedUrl.port,
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: { Cookie: cookie },
    };

    const req = http.get(options, function (res) {
      let body = '';
      res.on('data', function (chunk) {
        // eslint-disable-next-line no-return-assign
        return (body += chunk);
      });

      // eslint-disable-next-line consistent-return
      return res.on('end', function () {
        let data = { status: 'failed', response: body };

        if (res.statusCode < 500) {
          try {
            data = JSON.parse(body);
          } catch (err) {
            console.error(err);
          }
        }

        if (!timedOut) {
          clearTimeout(timeoutHandle);
          return callback(null, data);
        }
      });
    });

    // eslint-disable-next-line consistent-return
    req.on('error', function (err) {
      if (!timedOut) {
        clearTimeout(timeoutHandle);
        return callback(err);
      }
    });
  };
}
