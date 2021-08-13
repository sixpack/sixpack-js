/* eslint-disable func-names */
import { describe, it, beforeEach } from 'mocha';
import { expect, assert } from 'chai';
import { stub } from 'sinon';
import { JSDOM } from 'jsdom';
import { sixpack } from '../src/sixpack-browser';

const createSession = (props) =>
  sixpack.Session({
    base_url: process.env.SIXPACK_BASE_URL,
    ...props,
  });

describe('Sixpack Browser Client', () => {
  const cookie = 'user="NDIwNjkxNzE=|4321|s1gn3d"; jdid=s0m3-f4ncy-d3vic3-1d;';
  let session;

  beforeEach(() => {
    const dom = new JSDOM(
      '<!DOCTYPE html><html><head></head><body></body></html>',
      {
        url: 'file://.',
        runScripts: 'dangerously',
        resources: 'usable',
      },
    );
    global.window = dom.window;
    global.document = dom.window.document;

    window.sixpack = sixpack;

    session = createSession({ cookie });
  });

  afterEach(() => {
    delete global.document;
    delete global.window;
  });

  it('should create sixpack instance in browser', () => {
    expect(window.sixpack).to.be.an('object');
  });

  it('should not create another sixpack instance if exists in browser', () => {
    const globalSixpack = {};
    global.window = { sixpack: globalSixpack };

    expect(window.sixpack).to.be.equal(globalSixpack);
  });

  it('should create sixpack instance in browser', () => {
    expect(window.sixpack).to.be.an('object');
  });

  it('should create script and append in body', (done) => {
    // eslint-disable-next-line global-require
    const http = require('http');
    const originalGet = http.get;
    const script = {};
    const appendChild = stub();
    const createElement = stub().returns(script);

    window.location = {};
    document.body = document.body || {};
    document.body.appendChild = appendChild;
    document.createElement = createElement;

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
          expect(createElement).to.be.calledWithExactly('script');
          expect(appendChild).to.be.calledWithExactly(script);
          done();
        },
      );
    } finally {
      http.get = originalGet;
    }
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

    it('should auto generate a client_id', (done) => {
      session = new window.sixpack.Session({
        cookie_domain: 'jusbrasil.com.br',
        cookie,
      });
      expect(session.client_id.length).to.equal(36);
      done();
    });

    it('should auto generate a client_id when not persist', (done) => {
      session = new window.sixpack.Session({
        persist: false,
        cookie,
      });
      expect(session.client_id.length).to.equal(36);
      done();
    });

    it('should use external client_id', (done) => {
      const id = 'test';
      session = createSession({ client_id: id });
      expect(session.client_id).to.equal(id);
      done();
    });

    it('should throw an error when callback is undefined', (done) => {
      session.client_id = 'mike';
      expect(() => {
        session.participate('show-bieber', ['trolled', 'not-trolled']);
      }).to.throw(Error, /^Callback is not specified$/);

      done();
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
          session.convert('show-bieber', function (error, resp) {
            if (error) throw error;
            expect(resp.status).to.equal('ok');
            expect(resp.client_id).to.equal(id);
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
            session.convert('show-bieber', function (error2, response) {
              if (error2) throw error2;
              expect(response.status).to.equal('ok');
              done();
            });
          });
        },
      );
    });

    ['$$', undefined, ''].forEach(function (experiment) {
      it(`should not allow bad experiment names like "${experiment}"`, (done) => {
        session.convert(experiment, function (err, alt) {
          assert.equal(alt, null);
          expect(err).instanceof(Error);
          done();
        });
      });
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
      session.client_id = 'mike';
      session.convert('show-blieber', function (err, resp) {
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
  });
});
