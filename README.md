# sixpack-client

Node / Browser library for the SeatGeek's Sixpack AB testing framework.

## Installation

Include the "lib/sixpack.js" script. The `sixpack` object will be added to your environment. In the browser do the following:

``` html
<script src="sixpack.js"></script>
```

or if you're using sixpack-client with node.js

	$ npm -g install sixpack-client

Then require the "sixpack" module:

``` javascript
var sixpack = require("sixpack");
```

## Usage

Check out the examples in the `examples` directory for some quick examples for how to use the library. Note that when using in the browser callbacks only take a single parameter: the response. When using in node they take two: an error and response.
