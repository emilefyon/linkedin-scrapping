

// Retrieve
var config = require('config'),
    MongoClient = require('mongodb').MongoClient;

// Get configuration
var dbConfig = config.get("Database");

var dbPromise = new Promise(function(fulfill, reject) {
  MongoClient.connect("mongodb://localhost:27017/" + dbConfig.db, function(err, db) {
    if (err) return reject(err);
    else fulfill(db);
  });
});


module.exports = {

  saveResults: function(res) {

    return dbPromise.then(function(db) {
      var collection = db.collection(dbConfig.usersCollection);
      collection.insert(res.map(addTimestamps));
    })

  },

  getProfiles: function() {
    
    return dbPromise.then(function(db) {
      return new Promise(function(fulfill, reject) {
        var collection = db.collection(dbConfig.usersCollection);
        collection.find().toArray(function(err, items) {
          if (err) reject(err);
          else fulfill(items);
        });
      });
    })

  },

  updateProfileVisitTimestamp: function(userId) {
    return dbPromise.then(function(db) {
      var collection = db.collection(dbConfig.usersCollection);
      console.log("test");
      collection.update({_id: userId}, {$set: {visited: Date.now()}});
    });
  },

  disconnect: function() {
    return dbPromise.then(function(db) {
      db.close();
      dbPromise = Promise.reject('database has been disconnected');
    });
  }

}


function addTimestamps(el) {
  el.added = Date.now();
  return el;
}