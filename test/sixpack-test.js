var mocha  = require('mocha');
var expect = require('chai').expect;

describe("Sixpack", function () {
    it("should return an alternative for simple_participate", function (done) {
        var sixpack = require('../index');
        sixpack.simple_participate("show-bieber", ["trolled", "not-trolled"], "mike", function(err, alt) {
            if (err) throw err;
            expect(alt).to.match(/trolled/);
            done();
        });
    });

    it("should auto generate a client_id", function (done) {
        var sixpack = require('../index');
        sixpack.simple_participate("show_bieber", ["trolled", "not-trolled"], function(err, alt) {
            if (err) throw err;
            expect(alt).to.match(/trolled/);
            done();
        });
    });

    it("should return ok for simple_convert", function (done) {
        var sixpack = require('../index');
        sixpack.simple_participate("show-bieber", ["trolled", "not-trolled"], "mike", function(err, alt) {
            if (err) throw err;
            sixpack.simple_convert("show-bieber", "mike", function(err, alt) {
                if (err) throw err;
                expect(alt).to.equal("ok");
                done();
            });
        });
    });

    it("should return ok for multiple converts", function (done) {
        var sixpack = require('../index');
        sixpack.simple_participate("show-bieber", ["trolled", "not-trolled"], "mike", function(err, alt) {
            if (err) throw err;
            sixpack.simple_convert("show-bieber", "mike", function(err, alt) {
                if (err) throw err;
                expect(alt).to.equal("ok");
                sixpack.simple_convert("show-bieber", "mike", function(err, alt) {
                    if (err) throw err;
                    expect(alt).to.equal("ok");
                    done();
                });
            });
        });
    });

    it("should not return ok for simple_convert with new id", function (done) {
        var sixpack = require('../index');
        sixpack.simple_convert("show-bieber", "unknown_id", function(err, alt) {
            // TODO should this be an err?
            if (err) throw err;
            expect(alt).to.equal("failed");
            done();
        });
    });

    it("should not return ok for simple_convert with new experiment", function (done) {
        var sixpack = require('../index');
        sixpack.simple_convert("show-blieber", "mike", function(err, alt) {
            // TODO should this be an err?
            if (err) throw err;
            expect(alt).to.equal("failed");
            done();
        });
    });
});
