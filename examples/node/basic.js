var sixpack = require('../../');

var session = new sixpack.Session();
session.participate("test-exp", ["alt-one", "alt-two"], function (err, res) {
  if (err) return console.log(err);
  console.log(res);
});
