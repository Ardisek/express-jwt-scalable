# expressjs, jwt, scalable architecture with async queue
The purpose of this project is to show how to build scalable NodeJS architucture based on ExpressJS framework and most scalable database MongoDB with JWT authentication. Simple NodeJS cluster configuration with Mongodb and creating simple types of statistic.

## Installing

Install with:

```
$ npm i
```

After install:

```
1. Need to create first test user, payload added in user.model file
2. Login as created user /authenticate with payload added in user.model file
3. Need to generate list of orders, payload and further instruction in order.model file
4. Now we should have 1 user and 100 orders generated for him ;)
5. To authenticate rquest we need to add to our x-access-token header, token from response from step 2.
```

Run with (dev mode):

```
$ npm run start-dev
```

## Routes
App's routes are defined in main component `routes/index.js`.
```

## Usage
```
After running npm run start-dev, where cluster will be created:
Open another shell console and run command:
$ node app_queue.js
New Node app will be created on 3001 port and will be checking in 5 sec interval statistic queue collection.
When new statistic for recalculating will be found, worker will start calculating statistics and saving them in statistics collection.
To generate such mechanism we have post hook in mongoose which adds new document to statistics queue collection, so we need to POST paylod of the order to /order url.
```

## TODO
```
1. Replication can be added to Mongo DB for making read operations only on secondary database, and save only on primary not to use to much memory and cpu consumption during reading big data records.
2. Implement priority queue.
3. Implement "watch" mechanism on statistic queue collection.
```
