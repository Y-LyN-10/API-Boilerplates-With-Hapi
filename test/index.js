'use strict';

process.env.NODE_ENV='test';

const Code = require('code');
const Boom = require('boom');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

// shotcust to avoid repeating 'lab':
const describe = lab.describe;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;

// Test the server
const LabbableServer = require("../server.js");

describe('Server', () => {
  let server;

  before((done) => {
    // Callback fires once the server is initialized
    // or immediately if the server is already initialized
    LabbableServer.ready((err, serverInstance) => {
      if (err) { return done(err); }

      server = serverInstance;

      return done();
    });
  });

  // server is now available to be tested
  lab.it('initializes', (done) => {

    expect(server).to.exist();

    // isInitialized() can be used to check the server's init state
    expect(LabbableServer.isInitialized()).to.equal(true);

    server.stop(done);
  });
});
