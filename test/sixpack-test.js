var mocha  = require('mocha');
var assert = require('chai').assert;
var expect = require('chai').expect;

function createSixpackInstance(on_node) {
    if (!on_node) {
        global.document = global.document || {};
        global.window = global.window || {};
    }
    delete require.cache[require.resolve('../')]
    return require('../');
}

describe("Sixpack in node", function () {
    var sixpack;
    var session;

    beforeEach( () => {
        sixpack = createSixpackInstance(true);
        session = new sixpack.Session({
            cookie: 'user="NDIwNjkxNzE=|4321|s1gn3d"; jdid=s0m3-f4ncy-d3vic3-1d;'
        });

        // Override default base_url when the SIXPACK_BASE_URL
        // environment variable is found.
        if (process.env.SIXPACK_BASE_URL) {
            session.base_url = process.env.SIXPACK_BASE_URL;
        }
    });

    it("should forward 'Cookie' header", function (done) {
        var http = require('http');
        var originalGet = http.get;
        var receivedHeaders;
        try {
            http.get = (url, options, callback) => {
                receivedHeaders = options.headers;
                return originalGet(url, options, callback);
            }
            session.participate("show-bieber", ["trolled", "not-trolled"], function(err, resp) {
                if (err) throw err;
                expect(receivedHeaders['Cookie']).to.equal(
                    'user="NDIwNjkxNzE=|4321|s1gn3d"; jdid=s0m3-f4ncy-d3vic3-1d;'
                );
                done();
            });
        } finally {
            http.get = originalGet;
        }
    });

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

    it("should return forced alternative with participating for participate with force", function (done) {
        session.participate("show-bieber", ["trolled", "not-trolled"], "trolled", function(err, resp) {
            if (err) throw err;
            expect(resp.alternative.name).to.equal("trolled");
            expect(resp.participating).to.equal(true);
            session.participate("show-bieber", ["trolled", "not-trolled"], "not-trolled", function(err, resp) {
                if (err) throw err;
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

    it("should auto generate a client_id", function (done) {
        expect(session.client_id.length).to.equal(36);
        done();
    });

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
        var sixpack = require('../');
        var session = new sixpack.Session({client_id: "mike"});
        session.convert("show-blieber", function(err, resp) {
            // TODO should this be an err?
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

    it("should not allow bad experiment names", function (done) {
        session.participate("%%", ["trolled", "not-trolled"], function(err, alt) {
            assert.equal(alt, null);
            expect(err).instanceof(Error);
            done();
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

    it("should work without using the simple methods", function (done) {
        session.convert("testing", function(err, res) {
            if (err) throw err;
            expect(res.status).equal("failed");

            session.participate("testing", ["one", "two"], function(err, res) {
                if (err) throw err;
                var alt1 = res.alternative.name;
                var old_id = session.client_id;
                session.client_id = sixpack.generate_client_id();

                session.convert("testing", function(err, res) {
                    if (err) throw err;
                    expect(res.status).equal("failed");

                    session.participate("testing", ["one", "two"], function(err, res) {
                        if (err) throw err;
                        session.client_id = old_id;

                        session.participate("testing", ["one", "two"], function(err, res) {
                            if (err) throw err;
                            expect(res.alternative.name).to.equal(alt1);
                            done();
                        });
                    });
                });
            });
        });
    });

    it("should return an error when experiment_name is incorrect", function (done) {
        session.client_id = "mike";
        session.participate(undefined, ["trolled", "not-trolled"], function(err, resp) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal("Bad experiment_name");

            session.convert(undefined, function(err, resp) {
                expect(err).to.be.an.instanceof(Error);
                expect(err.message).to.equal("Bad experiment_name");
                done();
            });
        });
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

    it("should not throw an error if the alternates warning is overridden", function (done) {
        session.ignore_alternates_warning = true;
        session.participate("testing", [], function(err, resp) {
            expect(err).to.be.null;
            done();
        });
    });

    it("should throw an error if the alternates warning is not overridden", function (done) {
        session.participate("testing", [], function(err, resp) {
            expect(err.message).to.match(/^Must specify at least 2 alternatives$/);
            done();
        });
    });
});

describe('Sixpack in browser', () => {
    afterEach(() => {
        delete global.document;
        delete global.window;
    });

    it('should create sixpack instance in browser', () => {
        global.window = {};
        expect(window.sixpack).to.be.undefined;
        createSixpackInstance(false);
        expect(window.sixpack).to.be.an('object');
    });

    it('should not create another sixpack instance if exists in browser', () => {
        var globalSixpack = {};
        global.window = { sixpack: globalSixpack };
        createSixpackInstance(false);

        expect(window.sixpack).to.be.equal(globalSixpack);
    });
});
