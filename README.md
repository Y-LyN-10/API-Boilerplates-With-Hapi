Quick start API with [Hapi](https://github.com/hapijs/hapi)
===

The goal is to create a production ready boilerplate(s) in Hapi.js (v16) covering the most basic functionalities that occur in every web project like authentication, registration, user management, caching, environment configurations, documentation, etc... 

:sparkles: Code-reviewers and contributors are highly welcome! Feel free to open an issue to suggest new functionality, report a bug or just ask a question! :sparkles: 

## Build

### Pre-requisites and/or used versions during development:
- Node.js: v8.x.x
- Redis server: v3.2.x
- MongoDB: v3.4.x
- PostgreSQL: v9.6.x

[![npm version](https://badge.fury.io/js/npm.svg)](https://badge.fury.io/js/npm)

Feature List
===

## General idea and todo-list:

As a base I used the opionated [hapi-api](https://github.com/rjmreis/hapi-api) boilerplate.

For now, there are three versions of this boilerplate: [with MongoDB](https://github.com/Y-LyN-10/API-Boilerplates-With-Hapi/tree/master/mongodb-version) & [with Sequelize](https://github.com/Y-LyN-10/API-Boilerplates-With-Hapi/tree/master/sequelize-version) (any supported RDB). If you want to use something else - you can start from the [minimal-base](https://github.com/Y-LyN-10/API-Boilerplates-With-Hapi/tree/master/minimal-base) example which has no database attached. 

My plan is (eventually) to *merge* all these versions into one by creating a new db independent service layer.

###
**Tip:** If you want to contribute and you're wondering where to start from, you can also check the "//TODO"-s in the code. Install [leasot](https://github.com/pgilad/leasot) cli tool and run `npm run todo` to list all tasks and ideas.
