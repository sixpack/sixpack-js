var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));

var { expect } = chai;
var { stub } = sinon;

function createSixpackInstance() {
  delete require.cache[require.resolve('../sixpack-browser')]
  return require('../sixpack-browser');
}

describe('Sixpack Browser Client', () => {
  var session

  beforeEach(() => {
    global.document = global.document || {};
    global.window = global.window || {};
    createSixpackInstance();

    session = new window.sixpack.Session({
      cookie: 'user="NDIwNjkxNzE=|4321|s1gn3d"; jdid=s0m3-f4ncy-d3vic3-1d;'
    });

    if (process.env.SIXPACK_BASE_URL) {
      session.base_url = process.env.SIXPACK_BASE_URL;
    }
  });

  afterEach(() => {
    delete global.document;
    delete global.window;
  });

  it('should create sixpack instance in browser', () => {
    global.window = {};
    expect(window.sixpack).to.be.undefined;
    createSixpackInstance();
    expect(window.sixpack).to.be.an('object');
  });

  it('should not create another sixpack instance if exists in browser', () => {
    var globalSixpack = {};
    global.window = { sixpack: globalSixpack };
    createSixpackInstance();

    expect(window.sixpack).to.be.equal(globalSixpack);
  });

  it('should create sixpack instance in browser', () => {
    expect(window.sixpack).to.be.an('object');
  })

  it('should create sixpack instance', () => {
    expect(window.sixpack).to.be.an('object');
  })

  it("should create script and append in body", function (done) {
    var http = require('http');
    var originalGet = http.get;
    var script = {};
    var appendChild = stub();
    var createElement = stub().returns(script)

    window.location = {};
    document.body = document.body || {};
    document.body.appendChild = appendChild;
    document.createElement = createElement;

    try {
      http.get = (options, callback) => {
        receivedHeaders = options.headers;
        return originalGet(options, callback);
      }

      session.participate("show-bieber", ["trolled", "not-trolled"], function(err, resp) {
        if (err) throw err;
        expect(createElement).to.be.calledWithExactly('script');
        expect(appendChild).to.be.calledWithExactly(script);
        done();
      });
    } finally {
      http.get = originalGet;
    }
  });
});
