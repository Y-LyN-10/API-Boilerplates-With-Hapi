PostgreSQL Secure Setup
===

This document is just a draft.

```bash
[yten@ytenincheva-pc hapi-api-boilerplate]$ su postgres
Password: 
[postgres@ytenincheva-pc hapi-api-boilerplate]$ psql
could not change directory to "/home/yten/projects/hapi-api-boilerplate": Permission denied
psql (9.6.3)
Type "help" for help.

postgres=# CREATE USER happ WITH PASSWORD 'hopp';
CREATE ROLE

postgres=# CREATE DATABASE hapi_api_development;
CREATE DATABASE
postgres=# GRANT ALL PRIVILEGES ON DATABASE hapi_api_development to happ;
GRANT

postgres=# CREATE DATABASE hapi_api_test;
CREATE DATABASE
postgres=# GRANT ALL PRIVILEGES ON DATABASE hapi_api_test to happ;
GRANT

postgres=# CREATE USER happai WITH PASSWORD 'hopp@tr0p';
CREATE ROLE
postgres=# CREATE DATABASE hapi_api_production;
CREATE DATABASE
postgres=# GRANT ALL PRIVILEGES ON DATABASE hapi_api_production to happai;
GRANT
postgres=# \q
```

### Install `sequelize-cli`

```
sequelize db:migrate
sequelize db:seed
```
