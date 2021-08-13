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
      const r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };
}
