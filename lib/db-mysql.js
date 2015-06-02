

// Retrieve
var config = require('config'),
    mysql      = require('mysql');;

// Get configuration
var dbConfig = config.get("Database");
var param = config.get("Parameters");

var connectionPromise = new Promise(function(fulfill, reject) {

  var connection = mysql.createConnection({
    host     : dbConfig.host,
    user     : dbConfig.user,
    password : dbConfig.password,
    database : dbConfig.database
  });


  connection.connect(function(err) {
    if (err) {
      console.error(err); 
      reject(err); 
    }

    else {
      fulfill(connection);
    }
  });

});


module.exports = {

  saveResults: function(res, searchString) {
    return connectionPromise.then(function(connection) {
      var tabRes = res.map(getValues, searchString);
      return connection.query('INSERT INTO ' + dbConfig.table + ' (userId, name, jobTitle, added, search) VALUES ? ON DUPLICATE KEY UPDATE added=NOW()', [tabRes], function(err, result) {
        if(err) console.error(err);
      });
    })

  },

  getProfiles: function() {
    
    return connectionPromise.then(function(connection) {
      return new Promise(function(fulfill, reject) {
        return connection.query('SELECT * FROM ' + dbConfig.table, [], function(err, result) {
          if(err) reject(err);
          else fulfill(result);
        });

      });
    });

  },

  updateProfileVisitTimestamp: function(userId) {
    return connectionPromise.then(function(connection) {
      return new Promise(function(fulfill, reject) {
        return connection.query('UPDATE ' + dbConfig.table + ' SET visited=NOW() where userId = ?', userId, function(err, result) {
          if(err) reject(err);
          else fulfill(result);
        });
      });
    });
  },

  disconnect: function() {
    return connectionPromise.then(function(connection) {
      connection.end(function(err) {
        console.error('error:' + err);
      });
      connectionPromise = Promise.reject('database has been disconnected');
    });
  }

}


function getValues(tab, searchString) {
  return [tab.userId, tab.name, tab.jobTitle, new Date(), param.searchString];
}

function addTimestamps(el) {
  el.added = Date.now();
  return el;
}