var sixpack = require('../../dist/sixpack-server');

var session = new sixpack.Session({
  base_url: "http://localhost:8000",
});
session.participate("test-exp", ["alt-one", "alt-two"], function (err, res) {
  if (err) return console.log(err);
  console.log(res);
});
