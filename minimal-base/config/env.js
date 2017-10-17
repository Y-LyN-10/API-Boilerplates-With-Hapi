require('dotenv').config({path: __dirname + '/.env'});

const envKey = key => {
  const env = process.env.NODE_ENV || 'development';
  
  const configuration = {
    host: process.env.HOST || '127.0.0.1',
    port: process.env.PORT || 8080,
    jwt_secret: process.env.JWT_SECRET,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redis_port: process.env.REDIS_PORT || 6379
  };

  return configuration[key];
};

module.exports = envKey;
