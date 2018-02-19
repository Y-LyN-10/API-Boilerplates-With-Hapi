exports.register = function (server, pluginOptions) {  
  const cache = server.cache({
    segment: 'sessions',
    expiresIn: 3 * 24 * 60 * 60 * 1000
  });
  
  server.method('authenticate', async function(token, account) {
    account.scope = (account.rank === 3) ? 'admin' : 'user';

    try {
      await cache.set(token, { account: account }, 0);      
      return false;
    } catch (err) {
      request.server.log(['error', 'auth'], err);
      return err;
    }
  });  

  server.state('token', {
    ttl: null,
    isSecure: true,
    isHttpOnly: true,
    encoding: 'base64json',
    clearInvalid: true, // remove invalid cookies
    strictHeader: true  // don't allow violations of RFC 6265
  });

  //Setup the social Google+ login strategy
  server.auth.strategy('session', 'cookie', {
    password: pluginOptions.cookieSecret || process.env.COOKIE_SECRET, // cookie secret, min 32 chars long
    cookie: 'connect.sid', // default cookie name
    clearInvalid: true,
    redirectTo: '/', // if 'next' param is given
    redirectOnTry: false,
    isSecure: false, // required for non-https applications
    ttl: 24 * 60 * 60 * 1000,
    validateFunc: async function (request, session) {
      const cached = await cache.get(session.sid);
      const out = { valid: !!cached };

      if (out.valid) {
        out.credentials = cached.account;
      }

      return out;
    }
  });

  server.auth.default('session');
};

exports.name = 'hapi-auth-cookie-config';
