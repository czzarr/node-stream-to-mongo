var fs = require('fs');
var chai = require('chai');
var MongoClient = require('mongodb').MongoClient;
var StreamToMongo = require('../');
var parser = require('JSONStream').parse('rows.*.id')
var options = { db: 'mongodb://localhost:27017/test-stream', collection: 'docs' }
var collection = options.collection;
var streamToMongo = new StreamToMongo(options);

chai.should();

describe('Stream to Mongo', function () {
  it('should insert docs into Mongo', function (done) {
    fs.createReadStream('test/all_npm.json')
      .pipe(parser)
      .pipe(streamToMongo);
    streamToMongo.on('finish', function() {
      MongoClient.connect(options.db, function (err, db) {
        db.collection(options.collection).count(function (err, count) {
          count.should.equal(4028);
          done();
        });
      });
    });
  });
});

after(function(done) {
  MongoClient.connect(options.db, function (err, db) {
    db.collection(collection).drop(done);
  });
});
