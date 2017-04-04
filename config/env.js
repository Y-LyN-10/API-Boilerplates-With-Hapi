const envKey = key => {
  const env = process.env.NODE_ENV || 'development';

  const configuration = {
    host: process.env.HOST,
    port: process.env.PORT,
    jwt_secret: process.env.JWT_SECRET
  };

  return configuration[key];
};

module.exports = envKey;
