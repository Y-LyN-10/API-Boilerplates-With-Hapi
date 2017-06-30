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
* :white_check_mark: Testing with Lab.js (skeleton)
* :white_check_mark: Swagger Documentation

**Branching:**
* Users Model & CRUD 
    - :white_medium_square: with Sequelize & Relational Database (*current* git branch)
        + :white_medium_square: [x] [Setup](http://gitlab.mentormate.bg/yulia.tenincheva/hapi-api-boilerplate/blob/with-sequelize/postgresql-secure-setup.md) configurations, user model, seeder and migrations
        + :white_medium_square: [x] Login/Register with Google Account
        + :white_medium_square: [ ] Registration validation by email
        + :white_medium_square: [ ] reCAPTCHA on user registration / change password pages
        + :white_medium_square: [x] List users with pagination, filters and sorting
        + :white_medium_square: [x] User login/registration with password (hashed & salted)
        + :white_medium_square: [x] Update user's profile & password
        + :white_medium_square: [ ] Link google account with local and vice-versa with different emails
        + :white_medium_square: [ ] Create GitLab CI Flow for this branch
        + :white_medium_square: [ ] Forgot / Reset Password functionality API
        + :white_medium_square: [ ] Send emails forgot password / password changed
        + :white_medium_square: [x] Soft delete user
    - :white_medium_square: with [Hapi Models & MongoDB](http://gitlab.mentormate.bg/yulia.tenincheva/hapi-api-boilerplate/tree/with-mongodb)


**Legend**:
* First column of check-boxes if about that functionality being `fully tested with lab.js`.
Second check-box is indicating if that functionality is implemented and `manually tested`.


**Tip**:
* If you want to contribute and you're wondering where to start from, you can also check the "//TODO"-s in the code. Install [leasot](https://github.com/pgilad/leasot) cli tool and run `npm run todo` to list all tasks.
