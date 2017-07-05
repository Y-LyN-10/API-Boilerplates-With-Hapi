CREATE USER happ WITH PASSWORD 'hopp';
CREATE DATABASE hapi_api_test;
GRANT ALL PRIVILEGES ON DATABASE hapi_api_test to happ;
CREATE DATABASE hapi_api_development;
GRANT ALL PRIVILEGES ON DATABASE hapi_api_development to happ;
CREATE USER happai WITH PASSWORD 'hopp@tr0p';
CREATE DATABASE hapi_api_production;
GRANT ALL PRIVILEGES ON DATABASE hapi_api_production to happai;
