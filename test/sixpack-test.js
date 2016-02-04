var mocha  = require('mocha');
var assert = require('chai').assert;
var expect = require('chai').expect;

describe("Sixpack", function () {
    it("should return an alternative for participate", function (done) {
        var sixpack = require('../');
        var session = new sixpack.Session;
        session.participate("show-bieber", ["trolled", "not-trolled"], function(err, resp) {
            if (err) throw err;
            expect(resp.alternative.name).to.match(/trolled/);
            done();
        });
    });

    it("should return ok for participate with traffic_fraction", function (done) {
        var sixpack = require('../');
        var session = new sixpack.Session;
        session.participate("show-bieber-fraction", ["trolled", "not-trolled"], 0.1, function(err, resp) {
            if (err) throw err;
            expect(resp.status).to.equal("ok");
            done();
        });
    });

    it("should return forced alternative for participate with force", function (done) {
        var sixpack = require('../');
        var session = new sixpack.Session;
        session.participate("show-bieber", ["trolled", "not-trolled"], "trolled", function(err, resp) {
            if (err) throw err;
            expect(resp.alternative.name).to.equal("trolled");
            session.participate("show-bieber", ["trolled", "not-trolled"], "not-trolled", function(err, resp) {
                if (err) throw err;
                expect(resp.alternative.name).to.equal("not-trolled");
                done();
            });
        });
    });

    it("should return ok and forced alternative for participate with traffic_fraction and force", function (done) {
        var sixpack = require('../');
        var session = new sixpack.Session;
        session.participate("show-bieber-fraction", ["trolled", "not-trolled"], 0.1, "trolled", function(err, resp) {
            if (err) throw err;
            expect(resp.status).to.equal("ok");
            expect(resp.alternative.name).to.equal("trolled");
            session.participate("show-bieber-fraction", ["trolled", "not-trolled"], 0.1, "not-trolled", function(err, resp) {
                if (err) throw err;
                expect(resp.status).to.equal("ok");
                expect(resp.alternative.name).to.equal("not-trolled");
                done();
            });
        });
    });

    it("should auto generate a client_id", function (done) {
        var sixpack = require('../');
        var session = new sixpack.Session;
        expect(session.client_id.length).to.equal(36);
        done();
    });

    it("should return ok for convert", function (done) {
        var sixpack = require('../');
        var session = new sixpack.Session({client_id: "mike"});
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
        var sixpack = require('../');
        var session = new sixpack.Session({client_id: "mike"});
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
        var sixpack = require('../');
        var session = new sixpack.Session({client_id: "unknown_idizzle"})
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
        var sixpack = require('../');
        var session = new sixpack.Session({client_id: "mike"});
        session.convert("show-bieber", "justin-shown", function(err, resp) {
            if (err) throw err;
            expect(resp.status).to.equal("ok");
            done();
        });
    });

    it("should not allow bad experiment names", function (done) {
        var sixpack = require('../');
        var session = new sixpack.Session();
        session.participate("%%", ["trolled", "not-trolled"], function(err, alt) {
            assert.equal(alt, null);
            expect(err).instanceof(Error);
            done();
        });
    });

    it("should not allow bad alternative names", function (done) {
        var sixpack = require('../');
        var session = new sixpack.Session();
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
        var sixpack = require('../');
        var session = new sixpack.Session();
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
        var sixpack = require('../');
        var session = new sixpack.Session({client_id: "mike"});

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
        var sixpack = require('../');
        var session = new sixpack.Session({client_id: "mike"});

        expect(function() {
            session.participate("show-bieber", ["trolled", "not-trolled"]);
        }).to.throw(
            Error, /^Callback is not specified$/
        );

        done();
    });
});
