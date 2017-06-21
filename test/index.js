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

  let accessToken;
  let refreshToken;

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
        
        done();
      });
    });
  });

  lab.describe('Authentication', () => {
    
    lab.test.skip("should fail with wrong password", function(done) {
      var options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: registerUser.email,
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

    lab.test("should fail with non-existing user", function(done) {
      var options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: 'non-existing@user44sgfd5fd.com',
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
    
    lab.test("should be successful with correct credentials", function(done) {
      let options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: registerUser.email,
          password: registerUser.password
        }
      };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.result.accessToken).to.be.string;
        expect(response.result.refreshToken).to.be.string;
        expect(response.headers.authorization).to.exist;
        expect(response.headers.authorization.indexOf('Bearer') > -1);
        
        accessToken = response.result.accessToken;
        refreshToken = response.result.refreshToken;

        done();
      });
    });

    lab.test("should log out with valid accessToken", function(done) {
      let options = {
        method: "GET",
        url: "/auth/logout",
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      };
      
      server.inject(options, function(response) {
        expect(response.result).to.equal(null);
        expect(response.statusCode).to.equal(302);
        expect(response.headers.authorization).to.not.exist;
        expect(response.headers.location).to.not.exist;
        
        done();
      });
    });

    lab.test("should redirect to login after logout", function(done) {
      let options = {
        method: "GET",
        url: "/auth/logout?next=/auth/login",
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      };
      
      server.inject(options, function(response) {
        console.log(response.headers);
        
        expect(response.result).to.equal(null);
        expect(response.statusCode).to.equal(302);
        expect(response.headers.authorization).to.not.exist;
        expect(response.headers.location).to.equal('/auth/login');

        done();
      });
    });

    // Should invalidate access token after logging out

    // Should require authentication to list users, view / update / delete user's profile and view / update my profile
    // expect(result).to.be.instanceof(Array);
    // expect(result).to.have.length(5);
    // test pagination
    
    // Should be able to log in with the new password 

    // Should fail to login when already logged in

    lab.test("should be successful with valid refreshToken", function(done) {
      var options = {
        method: "POST",
        url: "/auth/login",
        payload: {refreshToken}
      };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(200);
        expect(response.result.accessToken).to.be.string;
        expect(response.result.refreshToken).to.be.string;

        accessToken = response.result.accessToken;
        refreshToken = response.result.refreshToken;

        // TODO: Session should be created with user id
        
        done();
      });
    });

    lab.test.skip("should fail to login with expired refreshToken", function(done) {
      // TODO: Set timeout probably or hard-code expired token
      // TODO: Session should not exist
      done();
    });

    lab.test.skip("should fail with invalid refreshToken", function(done) {
      // TODO: Generate some string
      // TODO: Session should not exist
      done();
    });

    lab.test.skip("should fail even with valid refreshToken when user is logged out", function(done) {
      // TODO: Session should not exist
      done();
    });

    lab.test.skip("should fail when no payload is sent in the request", function(done) {
      // will fail with Joi and never reach the "No payload provided" line in the handler
      done();
    });

    // Should fail with correct credentials after 3 wrong login attempts

  });

  lab.describe('User', () => {
    // Should be able to change password
    lab.test.skip("should be able to change password", function(done) {
      // TODO: Session should not exist
      done();
    });
   
    // Should be able to see / update user's own profile
    
    // Should require authorization (admin rights) to list / get /update other users

    // Should fail to see his own profile when access token is expired

    // Should return temporary token to restore password

    // Should be able to change the forgotten password with a new one (with valid token)

    // Should be able to login with the new password
    
    // Should authenticate with another (admin) user (insert it to the database directly from here)

    // Should be able to see / update / delete other user's profile

    lab.test("should delete user's profile", function(done) {
      let options = {
        method: 'DELETE',
        url: '/api/users/' + testUser._id,
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      };
      
      server.inject(options, function(response) {        
        expect(response.statusCode).to.equal(200);

        done();
      });
    });

    // Should not be able to login when the profile is banned
  });
  
  after((done) => {
    connections.stop(done);
  });
  
});










