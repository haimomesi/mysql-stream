mystream-mysql
==============

Stream multiple MySQL tables easily using [mysql](https://github.com/mysqljs/mysql) API

## Installation
```bash
  npm install -g mysql-stream 
```

### Usage

```javascript
var mystream = require( "mystream" );

//open connection with options
var streamer = new Streamer('user:{password}@host{:port}/database', options);

// return a readable stream
var readableStream = streamer.asReadable(['table1','table2'], done);

// example usage #1
readableStream
  .on("data", function (data) {
    console.log(data);
  });

// example usage #2
readableStream.pipe(process.stdout);
```

### API

###### Streamer( url, config )

* `url` a MySQL connection url string
* `config` contains `highWaterMark` for now, which specifies a total number of objects. default is 16.
* Returns an object with a Streamer 

Creates a mysql connection. Uses the [mysql.createConnection](https://github.com/mysqljs/mysql) arguments.

###### asReadable( tableNames )

* `tableNames` represents table names to include in the stream. could be either a string or an array
* Returns an ReadableStream 

Opens a MySQL connection. Uses the [mysql.stream](https://github.com/mysqljs/mysql) function, and transforms it using ObjectMode.

