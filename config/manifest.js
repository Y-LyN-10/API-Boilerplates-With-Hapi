const envKey = require('./env');
const Path   = require('path');
const fs     = require('fs');

const Sequelize = require('sequelize');

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
    port: envKey('port') || 80,
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
  }, {
    host: envKey('host'),
    port: 443,
    tls: {
      key: fs.readFileSync('config/.keys/key.pem'),
      cert: fs.readFileSync('config/.keys/cert.pem')
      // passphrase: process.env.CERT_PASSPHRASE // if needed for your cert
    },
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
    router: {stripTrailingSlash: true}
  }],
  registrations: [{
    plugin: {
      register: 'hapi-sequelize',
      options: {
        name: 'hapidb',
        models: [ './db/models/*.js' ],
        // sync: true, // will drop the Users table and re-create it.
        // forceSync: true,
        debug: true,
        sequelize: new Sequelize({
          database: envKey('db').database,
          username: envKey('db').username,
          password: envKey('db').password,
          dialect:  envKey('db').dialect,
          logging:  () => envKey('db').logging, // should be a function or false
          host: envKey('db').host || envKey('host'),
          seederStorage: 'sequelize'
        })
      }
    }
  }, {
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
        BASE_URL:'http://' + envKey('host') + ':80'
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

// hapi-auth-google can be registered only once, so if we have SSL connection, it's better to used it
const sslConn = manifest.connections.find((conn) => conn.tls);
if(sslConn){
  manifest.registrations.map((r) => {
    if(r.plugin.register === 'hapi-auth-google') {
      return r.plugin.options.BASE_URL = 'https://' + sslConn.host + ':' + sslConn.port;
    }
  });
}

// App Status Monitoring. Works with a signle connection only.
// Run 'npm install hapijs-status-monitor --save' before using
if(manifest.connections.length === 1) {
  manifest.registrations.push({
    plugin: {
      register: 'hapijs-status-monitor',
      options: {
        title: 'Example API Monitor',
        connectionLabel: 'api'
      }
    }
  });
}
  
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
