'use strict';

process.env.NODE_ENV = 'test';

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
  let connections;
  let server;
  
  let registerUser = {
    firstName: 'Hello',
    lastName: 'Test',
    email: 'teST@hapi-api.lab',
    password: 'testTEST1',
    passwordConfirmation: 'testTEST1'
  };

  let testUser = Object.assign({}, registerUser);

  before((done) => {
    // Callback fires once the server is initialized
    // or immediately if the server is already initialized
    LabbableServer.ready((err, serverInstance) => {
      if (err) { return done(err); }

      connections = serverInstance;
      server = connections.select('api');
      
      return done();
    });
  });

  // server is now available to be tested
  lab.it('initializes', (done) => {

    expect(server).to.exist();

    // isInitialized() can be used to check the server's init state
    expect(LabbableServer.isInitialized()).to.equal(true);

    return done();
  });

  lab.it('is up and running', (done) => {
    let accessToken;
    let refreshToken;

    lab.test("should pass the health check", function(done) {
      var options = { method: "GET",  url: "/health" };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(200);
        done.note(`The current time is ${Date.now()}`);
      });
    });

    return done();
  });

  lab.describe('Registration', () => {
      /* Registration
         - Should fail with existing email (use admin user's email, for example)
      */

    lab.test("should fail with empty payload", function(done) {
      var options = {
        method: "POST",
        url: "/api/users"
      };
      
      // server.inject lets you simulate an http request
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(400);
        expect(response.result.statusCode).to.be.equal(400);
        expect(response.result.error).to.be.equal("Bad Request");
        expect(response.result.message).to.be.string;
        expect(response.result.validation.source === 'payload');

        done();
      });
    });

    lab.test("should fail with bad password", function(done) {
      var options = {
        method: "POST",
        url: "/api/users",
        payload: {
          firstName: 'Hello',
          lastName: 'Test',
          email: 'test@hapi-api.lab',
          password: '123456'
        }
      };
      
      // server.inject lets you simulate an http request
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(400);
        expect(response.result.statusCode).to.be.equal(400);
        expect(response.result.error).to.be.equal("Bad Request");
        expect(response.result.message).to.be.string;
        expect(response.result.validation.source === 'payload');
        expect(response.result.validation.keys.indexOf('password') > -1);
        
        done();
      });
    });

    lab.test("should fail with invalid email", function(done) {
      var options = {
        method: "POST",
        url: "/api/users",
        payload: {
          firstName: 'Hello',
          lastName: 'Test',
          email: 'test-hapi-api.lab',
          password: 'testTEST1',
          passwordConfirmation: 'testTEST1'
        }
      };
      
      // server.inject lets you simulate an http request
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(400);
        expect(response.result.statusCode).to.be.equal(400);
        expect(response.result.error).to.be.equal("Bad Request");
        expect(response.result.message).to.be.string;
        expect(response.result.validation.source === 'payload');
        expect(response.result.validation.keys.indexOf('email') > -1);
        
        done();
      });
    });

    lab.test("should create user with correct payload given", function(done) {
      var options = {
        method: "POST",
        url: "/api/users",
        payload: registerUser
      };
      
      // server.inject lets you simulate an http request
      server.inject(options, function(response) {        
        expect(response.statusCode).to.equal(201);
        expect(response.result._id).to.exist();
        expect(response.result.name).to.equal(testUser.firstName + ' ' + testUser.lastName);
        expect(response.result.email).to.equal(testUser.email.toLowerCase());
        
        testUser._id = response.result._id;

        // TODO
        // expect(response.result.password).to.not.exist();
        
        done();
      });
    });

    lab.test("should fail to create user with the same email", function(done) {
      
      var options = {
        method: "POST",
        url: "/api/users",
        payload: registerUser
      };
      
      // server.inject lets you simulate an http request
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(409);
        expect(response.result.statusCode).to.be.equal(409);
        expect(response.result.error).to.be.equal("Conflict");
        expect(response.result.message).to.be.string;

        console.log(response.result);
        
        done();
      });
    });
  });

  lab.describe('Authentication', () => {
    let accessToken;
    let refreshToken;
    
    lab.test.skip("should fail with wrong password", function(done) {
      var options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: 'super.yu@webidscan.com',
          password: 'alabala'
        }
      };
      
      // server.inject lets you simulate an http request
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(400);
        expect(response.result.statusCode).to.be.equal(400);
        expect(response.result.error).to.be.equal("Bad Request");
        expect(response.result.message).to.be.string;
        
        done();
      });
    });

    lab.test.skip("should fail with non-existing user", function(done) {
      var options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: 'super.yulia@webidscan.com',
          password: 'testTEST1'
        }
      };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(400);
        expect(response.result.statusCode).to.be.equal(400);
        expect(response.result.error).to.be.equal("Bad Request");
        expect(response.result.message).to.be.string;
        
        done();
      });
    });
    
    lab.test.skip("should be successful with correct credentials", function(done) {
      // TODO: insert a new user directly to the database during the test
      // Not it's assumed that the user is already seed-ed
      
      var options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: 'super.yu@webidscan.com',
          password: 'testTEST1'
        }
      };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.result.accessToken).to.be.string;
        expect(response.result.refreshToken).to.be.string;

        accessToken = response.result.accessToken;
        refreshToken = response.result.refreshToken;
        
        done();
      });
    });
  });
  
  after((done) => {
    connections.stop(done);
  });
  
});










