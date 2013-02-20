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
  console.log(res);
});
```

## Forcing an Alternative

For debugging / design work it can be useful to force a page to load
using a specific alternative. To force an alternative use the `force`
parameter to `participate()`. If you're using sixpack.js in the
browser you can also just include a query parameter,
e.g. `/your-page?sixpack-force-EXPERIMENT_NAME=ALTERNATIVE_NAME`.
