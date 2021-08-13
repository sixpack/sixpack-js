const EXPERIMENT_REGEX = /^[a-z0-9][a-z0-9\-_ ]*$/;

export default class Session {
  constructor({
    base_url,
    timeout,
    cookie,
    extra_params,
    client_id,
    ip_address,
    user_agent,
    ignore_alternates_warning,
  }) {
    this.base_url = base_url;
    this.timeout = timeout;
    this.cookie = cookie;
    this.extra_params = extra_params;
    this.client_id = client_id;
    this.ip_address = ip_address;
    this.user_agent = user_agent;
    this.ignore_alternates_warning = ignore_alternates_warning;
  }

  buildParticipateParams = ({
    trafficFraction,
    experimentName,
    alternatives,
  }) => {
    const params = {
      ...this.extra_params,
      client_id: this.client_id,
      experiment: experimentName,
      alternatives,
    };

    if (trafficFraction !== null && !Number.isNaN(trafficFraction)) {
      params.traffic_fraction = trafficFraction;
    }
    if (this.ip_address) {
      params.ip_address = this.ip_address;
    }
    if (this.user_agent) {
      params.user_agent = this.user_agent;
    }
    return params;
  };

  buildConvertParams = ({ experimentName, kpi }) => {
    const params = {
      ...this.extra_params,
      client_id: this.client_id,
      experiment: experimentName,
    };
    if (this.ip_address) {
      params.ip_address = this.ip_address;
    }
    if (this.user_agent) {
      params.user_agent = this.user_agent;
    }
    if (kpi) {
      params.kpi = kpi;
    }
    return params;
  };

  isValidExperimentName = (experimentName) => {
    return experimentName && EXPERIMENT_REGEX.test(experimentName);
  };

  validateAlternatives = (alternatives) => {
    if (alternatives.length < 2 && this.ignore_alternates_warning !== true) {
      return 'Must specify at least 2 alternatives';
    }

    for (let i = 0; i < alternatives.length; i += 1) {
      if (!EXPERIMENT_REGEX.test(alternatives[i])) {
        return `Bad alternative name: ${alternatives[i]}`;
      }
    }
    return null;
  };

  requestUri = (endpoint, params) => {
    const queryString = [];
    const e = encodeURIComponent;
    // eslint-disable-next-line no-restricted-syntax
    for (const key in params) {
      // eslint-disable-next-line no-prototype-builtins
      if (params.hasOwnProperty(key)) {
        let vals = params[key];
        if (Object.prototype.toString.call(vals) !== '[object Array]') {
          vals = [vals];
        }
        for (let i = 0; i < vals.length; i += 1) {
          queryString.push(`${e(key)}=${e(vals[i])}`);
        }
      }
    }
    let uri = endpoint;
    if (queryString.length) {
      uri += `?${queryString.join('&')}`;
    }
    return uri;
  };

  getForcedResult = ({ force, experimentName }) => ({
    status: 'ok',
    alternative: { name: force },
    experiment: { version: 0, name: experimentName },
    client_id: this.client_id,
    participating: true,
  });
}
