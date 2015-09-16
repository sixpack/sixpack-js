# sixpack-client

Node / Browser library for SeatGeek's Sixpack AB testing framework.

## Installation

Include the "sixpack.js" script. The `sixpack` object will be added to your environment. In the browser do the following:

``` html
<script src="sixpack.js"></script>
```

If you're using sixpack-client with node.js start by installing it:

	$ npm install sixpack-client

then require the "sixpack-client" module:

``` javascript
var sixpack = require("sixpack-client");
```

## Usage

Check out the examples in the `examples` directory for some quick examples for how to use the library. Here's a very basic example in node:

```js
var sixpack = require('sixpack-client');

var session = new sixpack.Session();
session.participate("test-exp", ["alt-one", "alt-two"], function (err, res) {
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
var sixpack = new sixpack.Session({client_id: 12345, base_url: 'http://google.com/sixpack', ip_address: '1.2.2.1', user_agent: 'ChromeBot'});
```

Client ID is a previously generated client id that you've previously stored. IP Address and User Agent are used for bot detection.

## Forcing an Alternative

For debugging / design work it can be useful to force a page to load
using a specific alternative. To force an alternative use the `force`
parameter to `participate()`. If you're using sixpack.js in the
browser you can also just include a query parameter,
e.g. `/your-page?sixpack-force-EXPERIMENT_NAME=ALTERNATIVE_NAME`.


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Write and run tests with `npm test` (requires mocha)
4. Commit your changes (`git commit -am 'Added some feature'`)
5. Push to the branch (`git push origin my-new-feature`)
6. Create new Pull Request
