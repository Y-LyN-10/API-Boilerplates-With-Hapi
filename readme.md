Quick start API with Hapi
===

The goal is to create a production ready boilerplate in Hapi.js covering the most basic functionalities that occur in every project like authentication, registration, user management, caching, environment configurations, documentation, etc... 

:sparkles: Code-reviewers and contributors are highly welcome! Feel free to open an issue to suggest new functionality, report a bug or just ask a question! :sparkles: 

## Build

### Pre-requisites and used versions during development:
- Node.js: v8.1.0
- Redis server: v3.2.9
- MongoDB: v3.4.3
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

Databases are connected in the other two branches.

**Tip:** If you want to contribute and you're wondering where to start from, you can also check the "//TODO"-s in the code. Install [leasot](https://github.com/pgilad/leasot) cli tool and run `npm run todo` to list all tasks.
