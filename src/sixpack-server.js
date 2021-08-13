import Sixpack from './sixpack';
import SessionServer from './session-server';

class SixpackServer extends Sixpack {
  generateClientId = () => this.generateUuidv4();

  Session = (options) => {
    this.updateProperties(options);

    if (!this.client_id) {
      this.client_id = this.generateClientId();
    }

    return new SessionServer({
      base_url: this.base_url,
      timeout: this.timeout,
      cookie: this.cookie,
      extra_params: this.extra_params,
      client_id: this.client_id,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
    });
  };
}

// eslint-disable-next-line import/prefer-default-export
export const sixpack = new SixpackServer();
