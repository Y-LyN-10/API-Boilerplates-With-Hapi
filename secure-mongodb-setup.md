MongoDB Security is a matter of server configuration and can not be forced by the application code.
Please, follow the steps below to enable security on your server: 

1. Create MongoDB root user for your system.

Example:

```
> use admin
> db.createUser({
    user: "root",
    pwd: "password",
    roles: [{ role: "root", db: "admin" }]
    }); 
```

In future (after you restart mongodb and enable auth), you will have to authorize in order to perform different operations. To do that, use 'db.auth()' function with your root credentials:

Example:

```> db.auth('root', 'password'); ```

2. Add user for the particular project / database. It is not a good practice to use the root user to connect to a single database, so we need another user.

Example:

```
db.createUser({ user: "happyAdmin", pwd: "adminpassword", roles: [{ role: "userAdmin", db: "hapi-api-database" }]});
```

3. Re-start the MongoDB instance with access control

``` $ sudo mongod --auth --port 27017 ```

Clients that connect to this instance must now authenticate themselves as a MongoDB user


4. Add your credentials to the mongodb URI. Note the authMechanism & authSource params

Example:

```
export MONGO_URI=mongodb://happyAadmin:adminpassword@localhost:27017/hapi-api-database?authMechanism=SCRAM-SHA-1&authSource=db
```

**IMPORTANT**: If you are using Robomongo, make sure to upgrate to the latest version (1.x.x) and select "SCRAM-SHA-1" Auth mechanism, otherwise the authentication will not be successful even with correct credentials.
