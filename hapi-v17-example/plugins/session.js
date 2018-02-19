exports.register = function (server, pluginOptions) {
  // Official example from https://github.com/hapijs/hapi-auth-cookie
  // TODO: re-write this
  const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
  server.app.cache = cache;

  server.auth.strategy('session', 'cookie', {
    password: 'password-should-be-32-characters',
    cookie: 'sid-example',
    redirectTo: '/login',
    isSecure: false,
    validateFunc: async (request, session) => {
      const cached = await cache.get(session.sid);
      const out = {
          valid: !!cached
      };

      if (out.valid) {
          out.credentials = cached.account;
      }

      return out;
    }
  });

  server.auth.default('session');
};

exports.name = 'hapi-auth-cookie-config';
