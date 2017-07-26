MongoDB Security is a matter of server configuration and can not be forced by the application code.
Please, follow the steps below to enable security on your server: 


## 1. Create MongoDB root user for your system.

*Example:*

``` 
$ mongo
> use admin
> db.createUser({
    user: "root",
    pwd: "password",
    roles: [{ role: "root", db: "admin" }]
});
```

**Don't ever use that user for development or any application code!**
When the authentication is enabled, you will need that user to create other users, grant or revoke access, perform different operations and manage your local database in general.


## 2. Following the principle of least privilege, please create a new users with 'readWrite' role to each database, associated with the project.

*Example:*

```
$ mongo
> use hapi-api-database
> db.createUser({user: "hapiAPI", pwd: "strongPass123", roles: [{role: "readWrite", db: "hapi-api-database"}]});

> use hapi-api-test-db
> db.createUser({user: "hapiAPI", pwd: "strongPass123", roles: [{role: "readWrite", db: "hapi-api-test-db"}]});
```

## 3. Re-start the MongoDB instance with access control (check the exact command for your OS). 
Other options are to change the mongodb/mongod configuration files, setting "auth = true", but research that for your OS.

```
$ sudo mongod --auth --port 27017 
```

Clients that connect to this instance must now authenticate themselves as a MongoDB user.

To authorize, use `db.auth()` function with your root credentials:

*Example:*

```
> db.auth('root', 'password');
```


## 4. Connect to the database with user & password

To authenticate via the application, add your credentials to the mongodb connection string (MONGO_URI) in the `.env` file.
Note the `authMechanism` param.

*Example:*

```
export MONGO_URI=mongodb://hapiAPI:strongPass123@localhost:27017/hapi-api-database?authMechanism=SCRAM-SHA-1
```

## **IMPORTANT**: 
If you are using `Robomongo`, make sure to upgrate to the latest version (1.x.x) and select "`SCRAM-SHA-1`" Auth mechanism, otherwise the authentication will not be successful even with correct credentials.
