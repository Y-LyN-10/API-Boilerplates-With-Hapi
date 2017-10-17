require('dotenv').config({path: __dirname + '/.env'});

const envKey = key => {
  const env = process.env.NODE_ENV || 'development';
  const db  = require('./db');
  
  const configuration = {
    host: process.env.HOST,
    port: process.env.PORT || 80,
    jwt_secret: process.env.JWT_SECRET,
    redis_host: process.env.REDIS_HOST,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    db: Object.assign({}, db[env])
  };

  return configuration[key];
};

module.exports = envKey;
