Quick start API with Hapi
===

The goal is to create a production ready boilerplate in Hapi.js covering the most basic functionalities that occur in every web project like authentication, registration, user management, caching, environment configurations, documentation, etc... 

:sparkles: Code-reviewers and contributors are highly welcome! Feel free to open an issue to suggest new functionality, report a bug or just ask a question! :sparkles: 

## Build

### Pre-requisites and used versions during development:
- Node.js: v8.x.x
- Redis server: v3.2.x
- MongoDB: v3.4.x
- PostgreSQL: v9.6.x

[![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/npm)

Feature List
===

## General idea and todo-list:

As a base I used the opionated [hapi-api](https://github.com/rjmreis/hapi-api) boilerplate.

For now, there are two major versions of this boilerplate: [with MongoDB](https://github.com/Y-LyN-10/Hapi-API-Boilerplate/tree/with-mongodb) & [with Sequelize](https://github.com/Y-LyN-10/Hapi-API-Boilerplate/tree/with-sequelize) (any supported RDB). If you want to use something else - you can start from the master branch, which has no database attached. 

## How to clone a single branch:
```bash
$ git clone <url> --branch <branch> --single-branch [<folder>]
```

My plan is to *merge* all these variants into one by creating a new db independent service layer.

## Base features
(on *master* branch)

* Composable plugins with Glue
* Good API Logging & Status Monitoring
* Environment Configuration
* Authenticate with Google OAuth
* Authentication & Authorization with JWT (mocked users db)
* Scoping (user roles & permissions supported)
* Caching & Session management with Redis
* Security Enhancements
  - Secure headers (cors, xss, xframe, nosniff, etc...)
  - SSL Support
  - Limit number of requests
  - Limit number of failed login attempts
* Eslint Configuration
* Testing with Lab.js (configuration)
* Swagger Documentation


###
**Tip:** If you want to contribute and you're wondering where to start from, you can also check the "//TODO"-s in the code. Install [leasot](https://github.com/pgilad/leasot) cli tool and run `npm run todo` to list all tasks and ideas.
