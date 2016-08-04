# sixpack-client

Node / browser client library for SeatGeek's [Sixpack](https://github.com/seatgeek/sixpack) A/B testing framework.

## Installation

Include the "sixpack.js" script. The `sixpack` object will be added to your environment. In the browser do the following:

``` html
<script src='sixpack.js'></script>
```

If you're using sixpack-client with node.js start by installing it with [npm](https://www.npmjs.com):

```sh
npm install sixpack-client
```

then require the "sixpack-client" module:

``` javascript
var sixpack = require('sixpack-client');
```

## Usage

Check out the examples in the `examples` directory for some quick examples for how to use the library. Here's a very basic example in node:

```js
var sixpack = require('sixpack-client');

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

- `base_url`. Base URL of the sixpack-server.
- `client_id`. ID of the specific client.
- `ignore_alternates_warning`. Allow sixpack-js to send a `participate` request which contains no alternates.
- `timeout`. Number of milliseconds to wait for a response from sixpack-server before returning a timeout response.

### Forcing an Alternative

For debugging / design work it can be useful to force a page to load
using a specific alternative. To force an alternative use the `force`
parameter to `participate()`. If you're using sixpack.js in the
browser you can also just include a query parameter,
e.g. `/your-page?sixpack-force-EXPERIMENT_NAME=ALTERNATIVE_NAME`.

## Tests

A number of _end-to-end_ tests are located in `./test/sixpack-test.js`. They use [mocha](https://mochajs.org) as the testing framework and [chai](http://chaijs.com) as the assertion library, and require a running [sixpack-server](https://github.com/seatgeek/sixpack#getting-started).

Run the tests with:
```sh
npm run test
```

### Sixpack server location

The tests assume the [sixpack-server](https://github.com/seatgeek/sixpack) server is running and located at `http://localhost:5000`. To use a different location, _e.g._ for a Docker [container](https://github.com/ainoya/docker-sixpack), run tests with the following pattern:
```sh
SIXPACK_BASE_URL=http://docker:5000 npm run test
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Write and run tests with `npm test` (see [Tests](#tests) above for more information)
4. Commit your changes (`git commit -am 'Added some feature'`)
5. Push to the branch (`git push -u origin my-new-feature`)
6. Create new pull request
