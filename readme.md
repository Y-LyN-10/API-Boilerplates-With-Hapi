Quick start API with Hapi
===

General idea and todo-list:

**Base features:** (master branch)
* :white_check_mark: Composable plugins with Glue
* :white_check_mark: Good API Logging & Status Monitoring (optional)
* :white_check_mark: Environment Configuration
* :white_check_mark: Authenticate with Google OAuth
* :white_check_mark: Authentication & Authorization with JWT (mocked users db)
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
* :white_medium_square: Users Model & CRUD 
  - :white_medium_square: with Sequelize & Relational Database
  - :white_medium_square: with MongoDB (with-mongodb git branch)
    -:white_check_mark: Google Login
  
* :white_medium_square: Neo4j Graph Database
