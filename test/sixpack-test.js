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
});
