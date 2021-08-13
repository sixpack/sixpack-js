const { sixpack } = require('../../dist/sixpack-server');

const session = sixpack.Session({
  base_url: "http://localhost:8000",
});

session.participate("test-exp", ["alt-one", "alt-two"], function (err, res) {
  if (err) return console.log(err);
  console.log("participate: ", res);

  session.convert("test-exp", function (err, res) {
    if (err) return console.log(err);
    console.log("convert: ", res);
  });
});

