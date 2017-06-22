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
const MongoClient = require('mongodb').MongoClient;

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

  let initialAccessToken;
  let accessToken;
  let refreshToken;
  
  let adminAccessToken;
  let admin;
  
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

    lab.test("should fail with empty payload", function(done) {
      var options = {
        method: "POST",
        url: "/auth/login",
        payload: {}
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

    lab.test("should fail with wrong password", function(done) {
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

        // accessToken will be replaced and invalidated, but let's assume that the first login has been done from another device - this token will be still valid
        initialAccessToken = response.result.accessToken;
        
        accessToken = response.result.accessToken;
        refreshToken = response.result.refreshToken;

        done();
      });
    });

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
        
        done();
      });
    });
    
    lab.test("should fail to login when already logged in", function(done) {
      let options = {
        method: "POST",
        url: "/auth/login",
        headers: {
          Authorization: 'Bearer ' + accessToken
        },
        payload: {
          email: registerUser.email,
          password: registerUser.password
        }
      };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(403);

        // TODO: expect Joi keys blah blah
        
        done();
      });
    });
    
    lab.test("should logout with valid session", function(done) {
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

    lab.test("should fail to logout when not logged in", function(done) {
      let options = {
        method: "GET",
        url: "/auth/logout"
      };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(401);
        done();
      });
      
    });
    
    lab.test("should fail to login with expired refreshToken", function(done) {
      // Generated with app's secret. Have to be changed if the secret is changed!
      let expiredToken = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Inl1bGlhLnRlbmluY2hldmFAbWVudG9ybWF0ZS5jb20iLCJuYW1lIjoiWXVsaWEgVGVuaW5jaGV2YSIsImlkIjoiNTkyNmZjYjZmYmFlMDg0ZTIzMWEzNjZiIiwic2lkIjoiNzg0MWI2NzktZmVlNi00OWZmLWFiYzctZDNhNjYxNTEwZGFmIiwic2NvcGUiOlsiYWRtaW4iXSwiZXhwIjo2MCwiaWF0IjoxNDk4MTQ0MjUyfQ.rk2L8FzxccicaPcoe0s7vwN0Hztvqo7BFJ1tb1hP3zPW4ZkjeWcIv-2tFLqnISistkrpxwvKC11VizPTjdNlnA";

      let options = {
        method: "POST",
        url: "/auth/login",
        payload: { refreshToken: expiredToken }
      };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(401);
        expect(response.result.error).to.equal('Unauthorized');
        expect(response.result.message.indexOf('jwt expired') > -1);
        
        done();
      });
    });
    
    lab.test("should fail with invalid refreshToken", function(done) {
      // It's generated with HS256 Algorithm, instead of HS512 like in the validation function
      let invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Inl1bGlhLnRlbmluY2hldmFAbWVudG9ybWF0ZS5jb20iLCJuYW1lIjoiWXVsaWEgVGVuaW5jaGV2YSIsImlkIjoiNTkyNmZjYjZmYmFlMDg0ZTIzMWEzNjZiIiwic2lkIjoiZDg5ZTFjODItYjc1Yy00NjYyLThlZGItYTg2MDIyYjJjMzJlIiwic1NvcGUiOlsiYWRtaW4iXSwiZXhwIjoxNDk4MTQ4NzQwLjkwNiwiaWF0IjoxNDk4MTQ2MDQwfQ.OxjeaLYtNlwd8bGTY0xbk96v04x3GQ-oV24ZoS_ESSs';

      let options = {
        method: "POST",
        url: "/auth/login",
        payload: { refreshToken: invalidToken }
      };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(401);
        expect(response.result.error).to.equal('Unauthorized');
        expect(response.result.message.indexOf('invalid signature') > -1);
        
        done();
      });
      
    });

    lab.test("should fail with valid refreshToken when user is logged out", function(done) {
      var options = {
        method: "POST",
        url: "/auth/login",
        payload: {refreshToken}
      };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(401);
        expect(response.result.error).to.equal('Unauthorized');
        expect(response.result.message).to.equal('Session expired or has been closed by the user');
        
        done();
      });
    });

  });

  lab.describe('Authenticated user', () => {
    // Should require authentication to list users, view / update / delete user's profile and view / update my profile

    // Should be able to list users with pagination
    // expect(result).to.be.instanceof(Array);
    // expect(result).to.have.length(5);
    // test pagination
    
    // Should be able to see / update user's own profile
    
    // Should be able to change password
    lab.test.skip("should be able to change his password", function(done) {
      // TODO: Session should not exist
      done();
    });

    // Should be able to log in with the new password
    
    // Should require authorization (admin rights) to list / get /update other users

    // Should fail to see his own profile when access token is expired

    // Should return temporary token to restore password

    // Should be able to change the forgotten password with a new one (with valid token)

    // Should be able to login with the new password
    
    // Should authenticate with another (admin) user (insert it to the database directly from here)

    // Should be able to see / update / delete other user's profile
  });

  lab.describe('Admin', () => {
    before((done) => {
      // Connect using MongoClient
      MongoClient.connect(process.env.MONGO_URI, function(err, db) {
        var users = db.collection('users');
        
        // Insert user with admin rights
        users.insert({
          email : "admin@hapi-api.lab",
          name  : "Admin",
          scope: 'admin',
          password : "$2a$08$R7bVYrspDbmKnj/4Z7rYbOliGJs4Fe9EjKh/H5PYLrdjM5Iw.rp0K"
        }, (err, result) => {
          admin = result;
          db.close();
          
          let options = {
            method: "POST",
            url: "/auth/login",
            payload: {
              email: 'admin@hapi-api.lab',
              password: 'testTEST1'
            }
          };
          
          server.inject(options, function(response) {
            adminAccessToken = response.result.accessToken;
            
            done();
          });

        });
      });
    });

    lab.test("should be able to delete another user's profile", function(done) {
      let options = {
        method: 'DELETE',
        url: '/api/users/' + testUser._id,
        headers: {
          Authorization: 'Bearer ' + adminAccessToken
        }
      };
      
      server.inject(options, function(response) {        
        expect(response.statusCode).to.equal(200);

        done();
      });
    });
  });

  lab.describe('Authentication later', () => {
    lab.test("should redirect to given 'next' path on logout", function(done) {
      let options = {
        method: "GET",
        url: "/auth/logout?next=/auth/login",
        headers: {
          Authorization: 'Bearer ' + initialAccessToken
        }
      };
      
      server.inject(options, function(response) {
        expect(response.result).to.equal(null);
        expect(response.statusCode).to.equal(302);
        expect(response.headers.authorization).to.not.exist;
        expect(response.headers.location).to.equal('/auth/login');

        done();
      });
    });
    
    lab.test.skip("should fail when the user is deleted", function(done) {
      let options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: registerUser.email,
          password: registerUser.password
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
    
    lab.test.skip("should fail with correct credentials after 10 login attempts in a minute", function(done) {
      let options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: 'yulia.tenincheva@mentormate.com', //registerUser.email,
          password: 'testTEST1' // registerUser.password
        }
      };
      
      server.inject(options, function(response) {
        expect(response.statusCode).to.equal(429);
        expect(response.result.error).to.equal('Too Many Requests');
        expect(response.result.message).to.equal('Rate limit exceeded');
        expect(response.headers['x-ratelimit-pathlimit']).to.exist;
        expect(response.headers['x-ratelimit-pathlimit']).to.equal(10);
        expect(response.headers['x-ratelimit-pathremaining']).to.equal(-1);
        
        done();
      });
    });
    
  });
  
  after((done) => {
    MongoClient.connect(process.env.MONGO_URI, function(err, db) {
      var users = db.collection('users');
      
      // remove all users
      users.remove({}, (err, result) => {
        db.close();
        connections.stop(done);
      });
    });
  });
});










