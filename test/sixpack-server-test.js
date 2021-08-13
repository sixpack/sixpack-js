/* eslint-disable func-names */
import { describe, it, beforeEach } from 'mocha';
import { expect, assert } from 'chai';
import nock from 'nock';
import { sixpack } from '../src/sixpack-server';

const createSession = (props) =>
  sixpack.Session({
    base_url: process.env.SIXPACK_BASE_URL,
    ...props,
  });

describe('Sixpack Server Client', () => {
  const cookie = 'user="NDIwNjkxNzE=|4321|s1gn3d"; jdid=s0m3-f4ncy-d3vic3-1d;';
  let session;

  beforeEach(() => {
    session = createSession({ cookie });
    nock.cleanAll();
  });

  it("should forward 'Cookie' header", (done) => {
    // eslint-disable-next-line global-require
    const http = require('http');
    const originalGet = http.get;
    let receivedHeaders;

    try {
      http.get = (options, callback) => {
        receivedHeaders = options.headers;
        return originalGet(options, callback);
      };
      session.participate(
        'show-bieber',
        ['trolled', 'not-trolled'],
        function (err) {
          if (err) throw err;
          expect(receivedHeaders.Cookie).to.equal(cookie);
          done();
        },
      );
    } finally {
      http.get = originalGet;
    }
  });

  it('should auto generate a client_id', (done) => {
    expect(session.client_id.length).to.equal(36);
    done();
  });

  it('should use external client_id', (done) => {
    const id = 'test';
    session = createSession({ client_id: id });
    expect(session.client_id).to.equal(id);
    done();
  });

  describe('.participate', () => {
    it('should return an alternative for participate', (done) => {
      session.participate(
        'show-bieber',
        ['trolled', 'not-trolled'],
        function (err, resp) {
          if (err) throw err;
          expect(resp.alternative.name).to.match(/trolled/);
          done();
        },
      );
    });

    it('should return error body in status code 500', (done) => {
      const body = 'Internal Server Error';
      nock(session.base_url)
        .get(/\/participate/)
        .reply(500, body);
      session.participate(
        'show-bieber',
        ['trolled', 'not-trolled'],
        function (err, resp) {
          if (err) throw err;
          expect(resp.status).to.equal('failed');
          expect(resp.response).to.equal(body);
          done();
        },
      );
    });

    it('should return error body in status code greater than 500', (done) => {
      const body = 'Bad Gateway';
      nock(session.base_url)
        .get(/\/participate/)
        .reply(502, body);
      session.participate(
        'show-bieber',
        ['trolled', 'not-trolled'],
        function (err, resp) {
          if (err) throw err;
          expect(resp.status).to.equal('failed');
          expect(resp.response).to.equal(body);
          done();
        },
      );
    });

    it('should return error body in malformed JSON response', (done) => {
      const body = 'definitely not a JSON';
      nock(session.base_url)
        .get(/\/participate/)
        .reply(200, body);
      session.participate(
        'show-bieber',
        ['trolled', 'not-trolled'],
        function (err, resp) {
          if (err) throw err;
          expect(resp.status).to.equal('failed');
          expect(resp.response).to.equal(body);
          done();
        },
      );
    });

    it('should return ok for participate with traffic_fraction', (done) => {
      session.participate(
        'show-bieber-fraction',
        ['trolled', 'not-trolled'],
        0.1,
        function (err, resp) {
          if (err) throw err;
          expect(resp.status).to.equal('ok');
          done();
        },
      );
    });

    it('should return forced alternative with participating for participate with force', (done) => {
      session.participate(
        'show-bieber',
        ['trolled', 'not-trolled'],
        'trolled',
        function (err, resp) {
          if (err) throw err;
          expect(resp.alternative.name).to.equal('trolled');
          expect(resp.participating).to.equal(true);
          session.participate(
            'show-bieber',
            ['trolled', 'not-trolled'],
            'not-trolled',
            function (error, response) {
              if (error) throw error;
              expect(response.alternative.name).to.equal('not-trolled');
              expect(response.participating).to.equal(true);
              done();
            },
          );
        },
      );
    });

    it('should return forced alternative with participating for participate with force even if outside alternatives', (done) => {
      session.participate(
        'show-bieber',
        ['trolled', 'not-trolled'],
        'whatever',
        function (err, resp) {
          if (err) throw err;
          expect(resp.alternative.name).to.equal('whatever');
          expect(resp.participating).to.equal(true);
          done();
        },
      );
    });

    it('should return ok and forced alternative with participating for participate with traffic_fraction and force', (done) => {
      session.participate(
        'show-bieber-fraction',
        ['trolled', 'not-trolled'],
        0.1,
        'trolled',
        function (err, resp) {
          if (err) throw err;
          expect(resp.status).to.equal('ok');
          expect(resp.alternative.name).to.equal('trolled');
          expect(resp.participating).to.equal(true);
          session.participate(
            'show-bieber-fraction',
            ['trolled', 'not-trolled'],
            0.1,
            'not-trolled',
            function (error, response) {
              if (error) throw error;
              expect(response.status).to.equal('ok');
              expect(response.alternative.name).to.equal('not-trolled');
              expect(response.participating).to.equal(true);
              done();
            },
          );
        },
      );
    });

    ['$$', undefined, ''].forEach(function (experiment) {
      it(`should not allow bad experiment names like "${experiment}"`, (done) => {
        session.participate(
          experiment,
          ['trolled', 'not-trolled'],
          function (err, alt) {
            assert.equal(alt, null);
            expect(err).instanceof(Error);
            done();
          },
        );
      });
    });

    it('should not allow bad alternative names', (done) => {
      session.participate('show-bieber', ['trolled'], function (err, alt) {
        assert.equal(alt, null);
        expect(err).instanceof(Error);

        session.participate(
          'show-bieber',
          ['trolled', '%%'],
          function (error, alternative) {
            assert.equal(alternative, null);
            expect(error).instanceof(Error);
            done();
          },
        );
      });
    });

    it('should return an error when experiment_name is incorrect', (done) => {
      session.client_id = 'mike';
      session.participate(
        undefined,
        ['trolled', 'not-trolled'],
        function (err) {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.equal('Bad experiment_name');

          session.convert(undefined, function (error) {
            expect(error).to.be.an.instanceof(Error);
            expect(error.message).to.equal('Bad experiment_name');
            done();
          });
        },
      );
    });

    it('should throw an error when callback is undefined', (done) => {
      session.client_id = 'mike';
      expect(() => {
        session.participate('show-bieber', ['trolled', 'not-trolled']);
      }).to.throw(Error, /^Callback is not specified$/);

      done();
    });

    it('should not throw an error if the alternates warning is overridden', (done) => {
      session.ignore_alternates_warning = true;
      session.participate('testing', [], function (err) {
        // eslint-disable-next-line no-unused-expressions
        expect(err).to.be.null;
        done();
      });
    });

    it('should throw an error if the alternates warning is not overridden', (done) => {
      session.participate('testing', [], function (err) {
        expect(err.message).to.match(/^Must specify at least 2 alternatives$/);
        done();
      });
    });
  });

  describe('.convert', () => {
    it('should return ok for convert', (done) => {
      const id = 'mike';
      session.client_id = id;
      session.participate(
        'show-bieber',
        ['trolled', 'not-trolled'],
        function (err) {
          if (err) throw err;
          session.convert('show-bieber', function (error, response) {
            if (error) throw error;
            expect(response.status).to.equal('ok');
            expect(response.client_id).to.equal(id);
            done();
          });
        },
      );
    });

    it('should return ok for multiple converts', (done) => {
      session.client_id = 'mike';
      session.participate(
        'show-bieber',
        ['trolled', 'not-trolled'],
        function (err) {
          if (err) throw err;
          session.convert('show-bieber', function (error, resp) {
            if (error) throw error;
            expect(resp.status).to.equal('ok');
            session.convert('show-bieber', function (error2) {
              if (error2) throw error2;
              expect(resp.status).to.equal('ok');
              done();
            });
          });
        },
      );
    });

    it('should not return ok for convert with new client_id', (done) => {
      session.client_id = 'unknown_idizzle';
      session.convert('show-bieber', function (err, resp) {
        if (err) throw err;
        expect(resp.status).to.equal('failed');
        done();
      });
    });

    it('should not return ok for convert with new experiment', (done) => {
      session = createSession({ client_id: 'mike' });
      session.convert('show-blieber', function (err, resp) {
        // TODO should this be an err?
        if (err) throw err;
        expect(resp.status).to.equal('failed');
        done();
      });
    });

    it('should return ok for convert with kpi', (done) => {
      session.client_id = 'mike';
      session.convert('show-bieber', 'justin-shown', function (err, resp) {
        if (err) throw err;
        expect(resp.status).to.equal('ok');
        done();
      });
    });

    it('should work without using the simple methods', (done) => {
      session.convert('testing', function (err, res) {
        if (err) throw err;
        expect(res.status).equal('failed');

        session.participate('testing', ['one', 'two'], function (err1, res1) {
          if (err1) throw err1;
          const alt1 = res1.alternative.name;
          const old_id = session.client_id;
          session.client_id = sixpack.generateClientId();

          session.convert('testing', function (error, response) {
            if (error) throw error;
            expect(response.status).equal('failed');

            session.participate('testing', ['one', 'two'], function (err3) {
              if (err3) throw err3;
              session.client_id = old_id;

              session.participate(
                'testing',
                ['one', 'two'],
                function (err4, res4) {
                  if (err4) throw err4;
                  expect(res4.alternative.name).to.equal(alt1);
                  done();
                },
              );
            });
          });
        });
      });
    });
  });
});
