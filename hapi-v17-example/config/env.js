require('dotenv').config({path: __dirname + '/.env'});

const envKey = key => {
  const configuration = {
    // Hostname (default is 'localhost')
    host: process.env.HOST,

    // Application port (default is 8181)
    port: process.env.PORT,

    // Base URL (used when accessing OrgChat)
    baseURL: process.env.BASE_URL,

    // Cookie Secret
    cookieSecret: process.env.COOKIE_SECRET,

    // JWT Secret
    jwtSecret: process.env.JWT_SECRET
  };

  return configuration[key];
};

module.exports = envKey;