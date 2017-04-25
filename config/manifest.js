const envKey = require('./env');
const Path   = require('path');
const fs     = require('fs');

const manifest = {
  server: {
    debug: {request: [ 'error' ]},
    cache: {
      engine: require('catbox-redis'),
      name: 'session',
      host: '127.0.0.1',
      port: 6379
    }
  },
  connections: [{
    host: envKey('host'),
    port: envKey('port'),
    routes: {
      cors: {
        origin: [ '*' ],
        additionalExposedHeaders: [
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset'
        ]
      },
      security: true
    },
    router: {stripTrailingSlash: true},
    labels: [ 'api' ]
  },
   //              {
   //  host: envKey('host'),
   //  port: envKey('securePort'),
   //  tls: {
   //    key: fs.readFileSync('config/.keys/key.pem'),
   //    cert: fs.readFileSync('config/.keys/cert.pem')

   // // passphrase: process.env.CERT_PASSPHRASE // if needed for your cert
   //  },
   //  routes: {
   //    cors: {
   //      origin: [ '*' ],
   //      additionalExposedHeaders: [
   //        'X-RateLimit-Limit',
   //        'X-RateLimit-Remaining',
   //        'X-RateLimit-Reset'
   //      ]
   //    },
   //    security: true
   //  },
   //  router: {stripTrailingSlash: true}
   //              }
               ],
  registrations: [{
    plugin: {
      register: './plugins/redis',
      options: {
        partition: 'cache',
        host: '127.0.0.1', // default
        port: 6379,      // default
        password: ''
      }
    }
  }, {
    plugin: {
      register: 'yar',
      options: {
        maxCookieSize: 0, // force server-side storage
        cache: { cache: 'session' },
        cookieOptions: {
          password: process.env.JAR_SECRET,  // cookie password
          isSecure: false               // allow non HTTPS
        }
      }
    }
  }, {
    plugin: {
      register: 'hapi-rate-limit',
      options: {
        userLimit: 500,
        userCache: {
          expiresIn: 1000 * 60 * 5 // 5 minutes
        },
        pathLimit: false,
        pathCache: {
          expiresIn: 1000 * 60 // 1 min
        }
      }
    }
  }, {
    plugin: {
      register: 'hapi-auth-jwt2',
      options: {}
    }
  },{
    plugin: {
      register: './plugins/auth',
      options: {
        secret: envKey('jwt_secret')
      }
    }
  }, {
    plugin: {
      // Attention: the provided example API key is configured for localhost:8181 only
      register: "hapi-auth-google",
      options: {
        REDIRECT_URL: '/auth/google',
        config: {
          description: 'Google Auth Callback',
          notes: 'Handled by hapi-auth-google plugin',
          tags: ['api', 'auth', 'plugin']
        },
        handler: require('.././plugins/google-oauth'),
        scope: ['https://www.googleapis.com/auth/plus.profile.emails.read',
                'https://www.googleapis.com/auth/plus.login'],
        BASE_URL: process.env.BASE_URL
      }
    }
  }, {
    plugin: './api/users',
    options: { routes: { prefix: '/api/users' }}
  }, {
    plugin: {
      register: 'good',
      options: {
        ops: false,
        reporters: {
          console: [{
            module: 'good-console'
          }, 'stdout']
        }
      }
    }
  }]
};

if (process.env.NODE_ENV !== 'production') {

  // Display the routes table on startup
  manifest.registrations.push({
    'plugin': {
      'register': 'blipp',
      'options': {}
    }
  });

  /*

  // App Status Monitoring. Works with a signle connection only.
  // Run 'npm install hapijs-status-monitor --save' before using

  manifest.registrations.push({
    plugin: {
      register: 'hapijs-status-monitor',
      options: {
        title: 'WebIDScan API',
        connectionLabel: 'api'
      }
    }
  });

  */

  // Enable Swagger Documentation
  manifest.registrations.push({
    plugin: {
      register: './plugins/swagger',
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
    }
  });
}

module.exports = manifest;
