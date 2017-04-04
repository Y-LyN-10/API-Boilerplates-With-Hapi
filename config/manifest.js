const envKey    = require('./env');
const Path      = require('path');
const fs        = require('fs');

const manifest = {
  server: {
    debug: {request: ['error']},
    cache: {engine: require('catbox-memory')}
  },
  connections: [
    {
      host: envKey('host'),
      port: envKey('port'),
      routes: {
        cors: true,
        security: true,
        additionalExposedHeaders: [
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset'
        ]
      },
      router: {stripTrailingSlash: true},
      labels: [ 'api' ]
    }
  ],
  registrations: [
    {
      plugin: {
        register: 'hapi-rate-limit',
        options: {
          userLimit: 500,
          userCache: {
            expiresIn: 1000 * 60 * 5 // 5 minutes
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
    }
  ]
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
