var mySql = require('mysql');
var sqlString = require('sqlstring');
var Transform = require('stream').Transform;
var os = require('os');

function Streamer(url, config) {

    var self = this;
    this._connection;

    // initialize MySQL configuration object
    this._connectionConfig = initConnectionConfig(url, config);

    // initialize config deafults
    this._config = initConfig(config);

    // create a mySQL connection using the connection config
    this.create = function () {
        return mySql.createConnection(self._connectionConfig);
    }

    // connect to mysql database and if fails throw error
    this.connect = function (callback) {
        self._connection = self.create();
        self._connection.connect(function (err) {
            if (err) throw new Error('Could not connect ' + err);
            if (callback) callback();
        });
    }

    // In transform stream you will only handle one record at a time (and call callback when you are done). 
    // Each record coming into the transform will be an object representing a single row. For this reason the transform (and any other stream processing the data) needs to be defined with option: objectMode: true
    this.stringify = new Transform({
        objectMode: true,
        transform(chunk, enc, next) {
            this.push(JSON.stringify(chunk) + os.EOL);
            next();
        }
    });

    // connect to DB and return readable stream with all selected sets
    this.asReadable = function (sets, callback) {

        if (!sets) {
            throw new Error('sets are required');
        }

        sets = Array.isArray(sets) ? sets : [sets];

        // return Error if no tables are chosen for streaming
        if (sets.length == 0) {
            throw new Error('sets are required');
        }

        // connect to mysql database and if fails throw error
        self.connect();

        // stream back the query to stdout. The highWaterMark defines how large the internal buffer of the stream (i.e. how many records) can become before pausing (will resume when buffer has been reduced through processing records).
        return self._connection.query(queryBuilder(sets))
            .stream({ highWaterMark: self._config.highWaterMark })
            .pipe(self.stringify)
            .on('finish', function () {
                //kill the connection
                self._connection.end(function (err) {
                    if (err) throw new Error('Error when closing ' + err);
                    if (callback) callback();
                });
            });
    };

    // build sanitized query from sets 
    function queryBuilder(sets) {
        var queryBuilder = '';
        for (var i = 0; i < sets.length; i++) {
            var set = sets[i];
            queryBuilder += sqlString.format('SELECT * FROM ??;', [set]);
        }
        return queryBuilder;
    }

    return {
        asReadable: this.asReadable
    };
}

function initConnectionConfig(url, config) {

    var connectionConfig = {}, connectionErrors = [];

    //match url provided with connection paradigm
    var matchedUrl = url.match(/([^:]+):([^@]*)@([^\/]+)\/(.+)/);

    if (!matchedUrl)
        throw new Error('missing parameters');

    connectionConfig.user = matchedUrl[1] || connectionErrors.push('No user');
    connectionConfig.password = matchedUrl[2] || '';
    connectionConfig.host = matchedUrl[3] || connectionErrors.push('No host');
    connectionConfig.database = matchedUrl[4] || connectionErrors.push('No database');

    // set multipleStatement to allow multiple selects in one query - has to true. don't panic, we've handled SQL injection threat.
    connectionConfig.multipleStatements = true;

    // return Error if connection paradigm is missing
    if (connectionErrors.length > 0) {
        throw new Error(connectionErrors.join(','));
    }

    return connectionConfig;
}

function initConfig(config) {

    // for streams operating in object mode, the highWaterMark specifies a total number of objects. The default is 16.
    config.highWaterMark = config.highWaterMark || 16;

    return config;
}

module.exports = Streamer;