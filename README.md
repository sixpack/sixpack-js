# @azure-iot/sixpack-js

Azure IoT fork of the Node/browser library for [SeatGeek's](https://seatgeek.com) [Sixpack](http://sixpack.seatgeek.com) A/B testing framework.


## Developer Setup

__1. Install [Node](https://nodejs.org)__

The best way to install Node is with [nvm](https://github.com/creationix/nvm):
```sh
curl https://raw.github.com/creationix/nvm/master/install.sh | sh
```

Once nvm is installed, restart the terminal and run the following:
```sh
nvm install stable
```

Alternatively, use the [default](https://nodejs.org/en/) installation path.

__2. Download this package__

Download with:
```sh
git clone this_repo_url
```

See [Installation](#installation) below for further information.

__3. `npm install`__

This downloads and installs all dependencies required to support this library.


## Usage

Check out the examples in the `examples` directory for some quick examples for how to use the library. Here's a basic example in node:
```js
var sixpack = require('@azure-iot/sixpack-js');

var session = new sixpack.Session();
session.participate('test-exp', ['alt-one', 'alt-two'], function (err, res) {
  if (err) throw err;
  alt = res.alternative.name
  if (alt == 'alt-one') {
    console.log('default: ' + alt);
  } else {
    console.log(alt);
  }
});
```

When instantiating the session object you can pass optional params `client_id`, `base_url`, `ip_address`, `user_agent`
```js
var sixpack = new sixpack.Session({
    client_id: 12345,
    base_url: 'http://google.com/sixpack',
    ip_address: '1.2.2.1',
    user_agent: 'ChromeBot'
});
```

Client ID is a previously generated client id that you've previously stored. IP Address and User Agent are used for bot detection.

### Options
A number of options can be passed to a sixpack `session`. A few are highlighted below.

- `base_url`. Base URL of the sixpack-web server.
- `client_id`. ID of the specific client. Recommended storage/retrieval methods include cookie-passing or [passport's](http://passportjs.org) `req.user.id`.
- `force_json`. Ignore context and always return a JSON response.
- `ignore_alternates_warning`. Allow sixpack-js to send a `participate` request which contains no alternates.
- `timeout`. Number of milliseconds to wait for a response from sixpack-web server before returning a timeout response.

### Forcing an Alternative
For debugging / design work it can be useful to force a page to load
using a specific alternative. To force an alternative use the `force`
parameter to `participate()`. If you're using sixpack.js in the
browser you can also just include a query parameter,
e.g. `/your-page?sixpack-force-EXPERIMENT_NAME=ALTERNATIVE_NAME`.


## Installation

Download with [npm](https://www.npmjs.com):
```sh
npm install @azure-iot/sixpack-js
```

### Browser
Include the 'sixpack.js' script. The `sixpack` object will be added to your environment.
``` html
<script src="sixpack.js"></script>
```

### Node
Require the `sixpack-js` module:
``` javascript
var sixpack = require('@azure-iot/sixpack-js');
```


## Tests

A number of _end-to-end_ tests are located in `./test/sixpack-test.js`. They use [mocha](https://mochajs.org) as the testing framework and [chai](http://chaijs.com) as the assertion library.

Run the tests with:
```sh
npm run test
```

### Sixpack server location
The tests assume the [sixpack-web](https://github.com/seatgeek/sixpack) server is running and located at `http://localhost:5000`. To use a different location, _e.g._ for a Docker container, run tests with the following pattern:
```sh
SIXPACK_BASE_URL=http://docker:5000 npm run test
```


## Contributing

1. Fork it
2. Go through [Developer Setup](#developer-setup) above
2. Create your feature branch (`git checkout -b _githubUsername-my-new-feature`)
3. Write and run tests with `npm run test` (requires a running sixpack-web server)
4. Commit your changes (`git commit -am 'Added some feature'`)
5. Push to the branch (`git push origin _githubUsername-my-new-feature`)
6. Create new pull request
