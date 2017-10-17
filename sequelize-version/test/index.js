'use strict';

require('dotenv').config(__dirname + '/../config/.env');

const exec = require('child_process').execSync;

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

// seed the database
const userSeeder = require('../db/seeders/users');

describe('Server', () => {
  let connections;
  let server;

  let adminUser = userSeeder.users[0];
  let adminAccessToken;
  
  let randomUser = userSeeder.users[Math.floor((Math.random() * 100) + 1)];
  console.log('Testing with:\n', randomUser, '\n');
  
  let newUser = {
    name: 'Hello Test',
    email: 'teST@hapi-api.lab',
    password: 'testTEST1',
    passwordConfirmation: 'testTEST1'
  };

  let createdUser = Object.assign({}, newUser);

  // Seed hapi_api_test database
  try {
    // exec("sequelize db:seed:undo:all --env=test", {encoding: 'utf8'});
    // exec("sequelize db:migrate:undo:all --env=test", {encoding: 'utf8'});
    exec("sequelize db:migrate --env=test", {encoding: 'utf8'});
    exec('sequelize db:seed:all --env=test', {encoding: 'utf8'});
  } catch(err) {
    console.log('Error seeding the database', err);
    process.exit(1);
  }
  
  let initialAccessToken;
  let accessToken;
  let refreshToken;
  
  before((done) => {
    // Callback fires once the server is initialized
    // or immediately if the server is already initialized
    LabbableServer.ready((err, serverInstance) => {
      if (err) { return done(err); }

      connections = serverInstance;
      server = connections.select('api');

      done();
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

  lab.describe('\nAuthentication', () => {

    lab.test("should fail with wrong password", function(done) {
      var options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: randomUser.email,
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
          email: randomUser.email,
          password: randomUser.password
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
          email: randomUser.email,
          password: randomUser.password
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
    
    // Should return temporary token to restore password

    // Should be able to change the forgotten password with a new one (with valid token)

    // Should be able to login with the new password
    
    // Should authenticate with another (admin) user (insert it to the database directly from here)

  });

  lab.describe('\nAPI', () => {
    before((done) => {
      let options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: adminUser.email,
          password: adminUser.password
        }
      };
      
      server.inject(options, function(response) {
        adminAccessToken = response.result.accessToken;
        done();
      });
    });
    
    lab.describe('POST /api/users', () => {
      
      lab.test("should fail to create user with empty payload", function(done) {
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
      
      lab.test("should fail to create user with bad password", function(done) {
        var options = {
          method: "POST",
          url: "/api/users",
          payload: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
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

      lab.test("should fail to create user with invalid email", function(done) {
        var options = {
          method: "POST",
          url: "/api/users",
          payload: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: 'test-hapi-api.lab',
            password: newUser.password,
            passwordConfirmation: newUser.passwordConfirmation
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
          payload: newUser
        };
        
        // server.inject lets you simulate an http request
        server.inject(options, function(response) {          
          expect(response.statusCode).to.equal(201);
          expect(response.result.id).to.exist();
          expect(response.result.firstName).to.equal(newUser.firstName);
          expect(response.result.lastName).to.equal(newUser.lastName);
          expect(response.result.email).to.equal(newUser.email.toLowerCase());
          expect(response.result.createdAt).to.exist();
          expect(response.result.password).to.not.exist();
          
          createdUser.id = response.result.id;
          
          done();
        });
      });

      lab.test("should fail to create user with the same email", function(done) {
        
        var options = {
          method: "POST",
          url: "/api/users",
          payload: newUser
        };
        
        // server.inject lets you simulate an http request
        server.inject(options, function(response) {
          expect(response.statusCode).to.equal(400);
          expect(response.result.statusCode).to.be.equal(400);
          expect(response.result.message).to.be.string;
          expect(response.result.message).to.be.equal('Validation error');
          expect(response.result.errors[0].message).to.be.equal('email must be unique');
          
          done();
        });
      });
      
    });

    lab.describe('GET /api/users', () => {
      
      lab.test.skip("should require authentication", function(done) {
        done();
      });

      lab.test.skip("should require authorization", function(done) {
        done();
      });

      lab.test.skip("should list users with default settings", function(done) {
        /* Check:
           - isArray
           - has pagination
           - has limit
           ...
        */
        done();
      });
      
      lab.test.skip("should list users with pagination", function(done) {
        done();
      });
      
      lab.test.skip("should list users with sorting", function(done) {
        done();
      });

      lab.test.skip("should list users with query", function(done) {
        done();
      });

      lab.test.skip("should list users with filter", function(done) {
        done();
      });

    });

    lab.describe('GET /api/users/profile', () => {});

    lab.describe('PUT /api/users/profile', () => {});

    lab.describe('PUT /api/users/password', () => {
      
      lab.test.skip("should be able to change user's own password", function(done) {
        // TODO: Session should not exist
        done();
      });
      
    });

    lab.describe('GET /api/users/{id}', () => {
      // Should require authorization (admin rights) to list / get /update other users
    });

    lab.describe('PUT /api/users/{id}', () => {});

    lab.describe('DELETE /api/users/{id}', () => {
      lab.test("should be able to delete another user's profile", function(done) {
        let options = {
          method: 'DELETE',
          url: '/api/users/' + createdUser.id,
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

  });

  lab.describe('\nAuthentication', () => {
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

    lab.test("should fail when the user is deleted", function(done) {
      let options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: createdUser.email,
          password: createdUser.password
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

    // Should be able to log in with changed password
    
    lab.test("should fail with correct credentials after 10 login attempts in a minute", function(done) {
      let user = userSeeder.users[1];
      
      let options = {
        method: "POST",
        url: "/auth/login",
        payload: {
          email: user.email,
          password: user.password
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
    done();
  });
});
