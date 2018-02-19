const envKey = require('./env');
const Path   = require('path');

const manifest = {
  server: {
    debug: {
      request: ['error', 'log' /*, 'wreck' */]
    },
    host: envKey('host'),
    port: envKey('port'),
    // tls: {
    //   key: fs.readFileSync('config/.keys/key.pem'),
    //   cert: fs.readFileSync('config/.keys/cert.pem')
    // }, 
    routes: {
      cors: {
        origin: [ '*' ],
        additionalExposedHeaders: [
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset'
        ]
      },
      files: {
        relativeTo: Path.join(__dirname, '/../public')
      },
      security: true // sets common security headers
    },
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true
    },
    // defaults
    state: {
      strictHeader: true,
      ignoreErrors: false,
      isSecure: true,
      isHttpOnly: true,
      isSameSite: 'Strict',
      encoding: 'none'
    }
  },
  register: {
    plugins: [
      'inert',
      'vision', {
        plugin: 'hapi-auth-cookie'
      }, {
        plugin: './plugins/session',
        options: {
          cookieSecret: envKey('cookieSecret')
        }
      }, {
        plugin: './api/v1/auth/',
        options: {}
      }, {
        plugin: 'good',
        options: {
          ops: false,
          reporters: { 
            console: [{
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [{ log: '*', response: '*', request: '*'}]
            }, {
              module: 'good-console'
            }, 'stdout']
          }
        }
      }
    ]
  }
};

if (process.env.NODE_ENV !== 'production') {
  // Display the routes table on startup
  // I rewrote it for Hapi 17 compatibility ^.^
  manifest.register.plugins.push({
      plugin: 'blipp',
      options: {
          showAuth: true
      }
  });

  // Enable Swagger Documentation
  manifest.register.plugins.push({
    plugin: './plugins/swagger',
    options: {
        info: {
          'title': 'API Documentation',
          'description': `(${process.env.NODE_ENV} environment)`,
          'version': require('./../package').version
        },
        securityDefinitions: {
          Bearer: {
            type: 'apiKey',
            name: 'Authorization',
              in: 'header'
          }
        }
      }
  });
}

module.exports = manifest;
