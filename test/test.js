var Streamer = require('../mystream');
var stream = require('stream');
var assert = require('assert');
var util = require('util');

describe('MyStream Test', function () {
    this.timeout(0);
    it('Should not create a connection - no params', function (done) {
        assert.throws(() => {
            new Streamer();
        });
        done();
    });

    it('Not Connect to database - missing user', function (done) {
        assert.throws(() => {
            new Streamer(':@ensembldb.ensembl.org/ensembl_archive_73', { highWaterMark: 37 });
        });
        done();
    });

    it('Not Connect to database - missing host', function (done) {
        assert.throws(() => {
            new Streamer('anonymous:@/ensembl_archive_73', { highWaterMark: 37 });
        });
        done();
    });

    it('Not Connect to database - missing database', function (done) {
        assert.throws(() => {
            new Streamer('anonymous:@ensembldb.ensembl.org', { highWaterMark: 37 });
        });
        done();
    });

    it('Stream data from a single table as string input', function (done) {
        var streamer = new Streamer('anonymous:@ensembldb.ensembl.org/ensembl_archive_73', { highWaterMark: 37 });
        var readableStream = streamer.asReadable('species', done);
        readableStream.pipe(process.stdout);
    });

    it('Stream data from a single table as array input', function (done) {
        var streamer = new Streamer('anonymous:@ensembldb.ensembl.org/ensembl_archive_73', { highWaterMark: 37 });
        var readableStream = streamer.asReadable(['species'], done);
        readableStream.pipe(process.stdout);
    });

    it('Stream data from multiple tables', function (done) {
        var streamer = new Streamer('anonymous:@ensembldb.ensembl.org/ensembl_archive_73', { highWaterMark: 37 });
        var readableStream = streamer.asReadable(['species', 'ens_release', 'release_species'], done);
        readableStream.pipe(process.stdout);
    });

    it('Fail to stream data - empty tables array', function (done) {

        assert.throws(() => {
            var streamer = new Streamer('anonymous:@ensembldb.ensembl.org/ensembl_archive_73', { highWaterMark: 37 });
            var readableStream = streamer.asReadable([], done);
        });
        done();
    });

    it('Fail to stream data - empty tables parameter', function (done) {
        assert.throws(() => {
            var streamer = new Streamer('anonymous:@ensembldb.ensembl.org/ensembl_archive_73', { highWaterMark: 37 });
            var readableStream = streamer.asReadable();
        });
        done();
    });

});