CREATE DATABASE hapi_api_development;
CREATE DATABASE hapi_api_test;
CREATE DATABASE hapi_api_production;
CREATE USER happ WITH PASSWORD 'hopp';
CREATE USER happai WITH PASSWORD 'hopp@tr0p';
GRANT ALL PRIVILEGES ON DATABASE hapi_api_test to happ;
GRANT ALL PRIVILEGES ON DATABASE hapi_api_development to happ;
GRANT ALL PRIVILEGES ON DATABASE hapi_api_production to happai;
