Quick start API with Hapi
===

The goal is to create a production ready boilerplate in Hapi.js covering the most basic functionalities that occur in every project like authentication, registration, user management, caching, environment configurations, documentation, etc... but also following the best development and security practices.

:sparkles: Feel free to open an issue to suggest new functionality, report a bug or just ask a question! :sparkles: 

## Build

### Pre-requisites and used versions during development:
- Node.js: v8.1.0
- MongoDB: v3.4.3
- Redis server: v3.2.9
- PostgreSQL: v9.6.3

[![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/npm)


Feature List
===

## General idea and todo-list:

**Base features:** (on *master* branch)
* :white_check_mark: Composable plugins with Glue
* :white_check_mark: Good API Logging & Status Monitoring (optional)
* :white_check_mark: Environment Configuration
* :white_check_mark: Authenticate with Google OAuth
* :white_check_mark: Authentication & Authorization with JWT (mocked users db)
* :white_check_mark: Scoping (user roles & permissions supported)
* :white_check_mark: Caching with Redis
* :white_check_mark: Session management with yar via Redis (mocked users db)
* :white_check_mark: Security Enhancements
  - :white_check_mark: Secure headers (cors, xss, xframe, nosniff, etc...)
  - :white_check_mark: SSL Support
  - :white_check_mark: Limit number of requests
  - :white_check_mark: Limit number of failed login attempts
* :white_check_mark: Eslint Configuration
* :white_check_mark: Testing with Lab.js
* :white_check_mark: Swagger Documentation

**Branching:**
* Users Model & CRUD 
    - :white_medium_square: with Sequelize & Relational Database (*current* git branch)
        + :white_check_mark: [Setup](http://gitlab.mentormate.bg/yulia.tenincheva/hapi-api-boilerplate/blob/with-sequelize/postgresql-secure-setup.md) configurations, user model, seeder and migrations
        + :white_check_mark: Login/Register with Google Account
        + :white_check_mark: List users with pagination, filters and sorting
        + :white_check_mark: User login/registration with password (hashed & salted)
        + :white_check_mark: Update user's profile & password functionality
        + :white_medium_square: Link google account with local and vice-versa
        + :white_check_mark: Soft delete user
    - :white_medium_square: with [Hapi Models & MongoDB](http://gitlab.mentormate.bg/yulia.tenincheva/hapi-api-boilerplate/tree/with-mongodb)
    
* :white_medium_square: Neo4j Graph Database


**Tip:** If you want to contribute and you're wondering where to start from, you can also check the "//TODO"-s in the code. Install [leasot](https://github.com/pgilad/leasot) cli tool and run `npm run todo` to list all tasks.
