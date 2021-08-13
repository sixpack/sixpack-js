import Sixpack from './sixpack';
import SessionBrowser from './session-browser';

class SixpackBrowser extends Sixpack {
  Session = (options) => {
    this.updateProperties(options);

    if (!this.client_id) {
      if (this.persist) {
        const persistedId = this.persistedClientId();
        this.client_id =
          persistedId !== null ? persistedId : this.generateClientId();
      } else {
        this.client_id = this.generateClientId();
      }
    }

    this.user_agent =
      this.user_agent ||
      (window && window.navigator && window.navigator.userAgent);

    return new SessionBrowser({
      base_url: this.base_url,
      timeout: this.timeout,
      cookie: this.cookie,
      extra_params: this.extra_params,
      client_id: this.client_id,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      generateUuidv4: this.generateUuidv4,
    });
  };

  persistedClientId = () => {
    // http://stackoverflow.com/questions/5639346/shortest-function-for-reading-a-cookie-in-javascript
    const result = new RegExp(
      `(?:^|; )${encodeURIComponent(this.cookie_name)}=([^;]*)`,
    ).exec(document.cookie);
    return result ? result[1] : null;
  };

  generateClientId = () => {
    const clientId = this.generateUuidv4();
    if (this.persist) {
      let cookieValue = `${this.cookie_name}=${clientId}; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/`;
      if (this.cookie_domain) {
        cookieValue += `; domain=${this.cookie_domain}`;
      }
      document.cookie = cookieValue;
    }
    return clientId;
  };
}

// eslint-disable-next-line import/prefer-default-export
export const sixpack = new SixpackBrowser();
