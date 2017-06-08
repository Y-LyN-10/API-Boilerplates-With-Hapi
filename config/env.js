const envKey = key => {
  const env = process.env.NODE_ENV || 'development';

  const configuration = {
    host: process.env.HOST,
    port: process.env.PORT || 80,
    jwt_secret: process.env.JWT_SECRET,
    jar_secret: process.env.JAR_SECRET,
    mongo_uri: process.env.MONGO_URI,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET
  };

  return configuration[key];
};

module.exports = envKey;
