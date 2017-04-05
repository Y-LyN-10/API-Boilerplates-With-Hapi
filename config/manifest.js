const envKey    = require('./env');
const Path      = require('path');
const fs        = require('fs');

const manifest = {
  server: {
    debug: {request: [ 'error' ]},
    cache: {engine: require('catbox-redis')}
  },
  connections: [
    {
      host: envKey('host'),
      port: envKey('port'),
      routes: {
        cors: {
          origin: ['*'],
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
    }, {
      host: envKey('host'),
      port: envKey('securePort'),
      tls: {
        key: fs.readFileSync('config/.keys/key.pem'),
        cert: fs.readFileSync('config/.keys/cert.pem')
     // passphrase: process.env.CERT_PASSPHRASE // if needed for your cert
      },
      routes: {
        cors: {
          origin: ['*'],
          additionalExposedHeaders: [
            'X-RateLimit-Limit',
            'X-RateLimit-Remaining',
            'X-RateLimit-Reset'
          ]
        },
        security: true
      }
    }
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
    plugin: './api/auth',
    options: { routes: { prefix: '/auth' }}
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
