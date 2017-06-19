'use strict';

process.env.NODE_ENV='test';

const Code = require('code');
const expect = Code.expect;

module.exports = function(lab, server) {
  let accessToken;
  let refreshToken;

  // Should return 200 status code (health check - API is up and running)

  /* Registration
     - Should fail with bad password
     - Should fail with no names
     - Should fail with invalid email address
     - Should create user with correct credentials (local strategy)
     - Should hash the password
     - Should not return the hashed password
     - Should fail with existing email (use admin user's email, for example)
  */

  /* Authentication  */
  
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

  // Should be able to change password
  
  lab.test.skip("should log out with valid accessToken", function(done) {
    // TODO: Session should not exist
    done();
  });

  // Should invalidate access token after logging out

  // Should require authentication to list users, view / update / delete user's profile and view / update my profile
  
  // Should be able to log in with the new password 

  // Should fail to login when already logged in

  lab.test.skip("should be successful with valid refreshToken", function(done) {
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

  // Should be able to see / update user's own profile
  
  // Should require authorization (admin rights) to list / get /update other users

  // Should fail to see his own profile when access token is expired

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

  // Should return temporary token to restore password

  // Should be able to change the forgotten password with a new one (with valid token)

  // Should be able to login with the new password
  
  // Should authenticate with Google + (these is a test admin account)

  // Should be able to see / update / delete other user's profile

  // Should not be able to login when the profile is banned
};
