var mystream = require('../mystream');
var stream = require('stream');
var assert = require('assert');
var util = require('util');

describe('MyStream Test', function () {

    it('Should not create a connection - no params', function (done) {
        assert.throws(() => { 
            new mystream.connect();
         });
        done();
    });

    it('Not Connect to database - missing user', function (done) {
        assert.throws(() => { 
            new mystream.connect(':@ensembldb.ensembl.org/ensembl_archive_73', { highWaterMark: 37 });
         });
        done();
    });

    it('Not Connect to database - missing host', function (done) {
        assert.throws(() => { 
            new mystream.connect('anonymous:@/ensembl_archive_73', { highWaterMark: 37 });
         });
        done();
    });

    it('Not Connect to database - missing database', function (done) {
        assert.throws(() => { 
            new mystream.connect('anonymous:@ensembldb.ensembl.org', { highWaterMark: 37 });
         });
        done();
    });

    it('Stream data from a single table as string input', function (done) {
        var conn = new mystream.connect('anonymous:@ensembldb.ensembl.org/ensembl_archive_73', { highWaterMark: 37 });
        var readableStream = conn.Streamer.sets('species', done);
        readableStream.pipe(process.stdout);
    });

    it('Stream data from a single table as array input', function (done) {
        var conn = new mystream.connect('anonymous:@ensembldb.ensembl.org/ensembl_archive_73', { highWaterMark: 37 });
        var readableStream = conn.Streamer.sets(['species'], done);  
        readableStream.pipe(process.stdout);
    });

    it('Stream data from multiple tables with default multipleStatements true', function (done) {
        var conn = new mystream.connect('anonymous:@ensembldb.ensembl.org/ensembl_archive_73', { highWaterMark: 37 });
        var readableStream = conn.Streamer.sets(['species', 'ens_release', 'release_species'], done);  
        readableStream.pipe(process.stdout);
    });

    it('Fail to stream data - empty tables array', function (done) {
        var conn = new mystream.connect('anonymous:@ensembldb.ensembl.org/ensembl_archive_73', { multipleStatements: false, highWaterMark: 37 });
        assert.throws(() => { 
            conn.Streamer.sets([], done);
         });
        done();
    });

    it('Fail to stream data - empty tables parameter', function (done) {
        var conn = new mystream.connect('anonymous:@ensembldb.ensembl.org/ensembl_archive_73', { multipleStatements: false, highWaterMark: 37 });
        assert.throws(() => { 
            conn.Streamer.sets();
         });
         done();
    });

});