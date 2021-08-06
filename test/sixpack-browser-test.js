var chai = require('chai');
var sinon = require('sinon');
var jsdom = require("jsdom");

chai.use(require('sinon-chai'));
var { expect, assert } = chai;
var { stub } = sinon;

const createSixpackInstance = () => {
  delete require.cache[require.resolve('../sixpack-browser')]
  return require('../sixpack-browser');
}

describe('Sixpack Browser Client', () => {
  var session

  beforeEach(() => {
    var dom = new jsdom.JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      url: "file://.",
      runScripts: "dangerously",
      resources: "usable"
    });
    global.window = dom.window;
    global.document = dom.window.document;

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

  it('should create sixpack instance in browser', function () {
    global.window = {};
    expect(window.sixpack).to.be.undefined;
    createSixpackInstance();
    expect(window.sixpack).to.be.an('object');
  });

  it('should not create another sixpack instance if exists in browser', function () {
    var globalSixpack = {};
    global.window = { sixpack: globalSixpack };
    createSixpackInstance();

    expect(window.sixpack).to.be.equal(globalSixpack);
  });

  it('should create sixpack instance in browser', function () {
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

  describe('.participate', () => {
    it("should return an alternative for participate", function (done) {
      session.participate("show-bieber", ["trolled", "not-trolled"], function(err, resp) {
        if (err) throw err;
        expect(resp.alternative.name).to.match(/trolled/);
        done();
      });
    });

    it("should return ok for participate with traffic_fraction", function (done) {
      session.participate("show-bieber-fraction", ["trolled", "not-trolled"], 0.1, function(err, resp) {
        if (err) throw err;
        expect(resp.status).to.equal("ok");
        done();
      });
    });

    it("should return ok and forced alternative with participating for participate with traffic_fraction and force", function (done) {
      session.participate("show-bieber-fraction", ["trolled", "not-trolled"], 0.1, "trolled", function(err, resp) {
        if (err) throw err;
        expect(resp.status).to.equal("ok");
        expect(resp.alternative.name).to.equal("trolled");
        expect(resp.participating).to.equal(true);
        session.participate("show-bieber-fraction", ["trolled", "not-trolled"], 0.1, "not-trolled", function(err, resp) {
          if (err) throw err;
          expect(resp.status).to.equal("ok");
          expect(resp.alternative.name).to.equal("not-trolled");
          expect(resp.participating).to.equal(true);
          done();
        });
      });
    });

    it("should return forced alternative with participating for participate with force even if outside alternatives", function (done) {
      session.participate("show-bieber", ["trolled", "not-trolled"], "whatever", function(err, resp) {
        if (err) throw err;
        expect(resp.alternative.name).to.equal("whatever");
        expect(resp.participating).to.equal(true);
        done();
      });
    });

    it("should auto generate a client_id", function (done) {
      expect(session.client_id.length).to.equal(36);
      done();
    });

    it("should throw an error when callback is undefined", function (done) {
      session.client_id = "mike";
      expect(function() {
        session.participate("show-bieber", ["trolled", "not-trolled"]);
      }).to.throw(
        Error, /^Callback is not specified$/
      );

      done();
    });

    ['$$', undefined, ''].forEach(function(experiment) {
      it(`should not allow bad experiment names like "${experiment}"`, function (done) {
        session.participate(experiment, ["trolled", "not-trolled"], function(err, alt) {
          assert.equal(alt, null);
          expect(err).instanceof(Error);
          done();
        });
      });
    });
  
    it("should not allow bad alternative names", function (done) {
      session.participate("show-bieber", ["trolled"], function(err, alt) {
        assert.equal(alt, null);
        expect(err).instanceof(Error);

        session.participate("show-bieber", ["trolled", "%%"], function(err, alt) {
          assert.equal(alt, null);
          expect(err).instanceof(Error);
          done();
        });
      });
    });
  })

  describe('.convert', () => {
    it("should return ok for convert", function (done) {
      session.client_id = "mike";
      session.participate("show-bieber", ["trolled", "not-trolled"], function(err, resp) {
        if (err) throw err;
        session.convert("show-bieber", function(err, resp) {
          if (err) throw err;
          expect(resp.status).to.equal("ok");
          done();
        });
      });
    });

    it("should return ok for multiple converts", function (done) {
      session.client_id = "mike";
      session.participate("show-bieber", ["trolled", "not-trolled"], function(err, alt) {
        if (err) throw err;
        session.convert("show-bieber", function(err, resp) {
          if (err) throw err;
          expect(resp.status).to.equal("ok");
          session.convert("show-bieber", function(err, alt) {
            if (err) throw err;
            expect(resp.status).to.equal("ok");
            done();
          });
        });
      });
    });

    it("should not return ok for convert with new client_id", function (done) {
      session.client_id = "unknown_idizzle";
      session.convert("show-bieber", function(err, resp) {
        if (err) throw err;
        expect(resp.status).to.equal("failed");
        done();
      });
    });

    it("should not return ok for convert with new experiment", function (done) {
      session.client_id = "mike";
      session.convert("show-blieber", function(err, resp) {
        if (err) throw err;
        expect(resp.status).to.equal("failed");
        done();
      });
    });

    it("should return ok for convert with kpi", function (done) {
      session.client_id = "mike";
      session.convert("show-bieber", "justin-shown", function(err, resp) {
        if (err) throw err;
        expect(resp.status).to.equal("ok");
        done();
      });
    });
  });
});
