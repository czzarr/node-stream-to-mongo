var Writable = require('stream').Writable;
var util = require('util');
var MongoClient = require('mongodb').MongoClient;

util.inherits(StreamToMongo, Writable);

module.exports = StreamToMongo;

function StreamToMongo(options) {
  if(!(this instanceof StreamToMongo)) {
    return new StreamToMongo(options);
  }
  Writable.call(this, { objectMode: true });
  this.options = options;
}


StreamToMongo.prototype._write = function (obj, encoding, done) {
  var self = this;

  // Custom action definition
  var action = this.options.action || function insert (obj, cb) {
    this.collection.insert(obj, {w: 1}, cb);
  };

  if (!this.db) {
    MongoClient.connect(this.options.db, function (err, db) {
      if (err) throw err;
      self.db = db;
      self.on('finish', function () {
        self.db.close();
      });
      self.collection = db.collection(self.options.collection);
      action.call(self, obj, done);
    });
  } else {
    action.call(self, obj, done);
  }
};
