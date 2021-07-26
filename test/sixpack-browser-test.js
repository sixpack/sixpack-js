var expect = require('chai').expect;

function createSixpackInstance() {
  global.document = global.document || {};
  global.window = global.window || {};

  delete require.cache[require.resolve('../sixpack-browser')]
  return require('../sixpack-browser');
}

describe('Sixpack Browser Client', () => {
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
