'use strict';

var RSVP = require('rsvp');
var tedious = require('tedious');

var dbSql = {
  dbSql: function(options) {
    function qExecuteStatement(resolve, reject) {
      var connection = new tedious.Connection(options.sqlServer);

      //            connection.on('debug', function(text) {
      //                // If no error, then good to go...
      //                console.log('Debug: ' + text);
      //            });

      connection.on('connect', function(err) {

        if (err) {
          reject('Error connecting: ' + err);
        }

        var requestSql = new tedious.Request(options.query, function(err, rowCount) {
          if (err) {
            connection.close();
            reject('Error with sql execution');
          }

          connection.close();
          resolve('Statement executed successfully');
        });

        connection.execSql(requestSql);
      });
    }

    if (options.sqlServer) {
      return new RSVP.Promise(qExecuteStatement);
    } else {
      return new RSVP.Promise(function(resolve, reject) {
        reject('No server supplied');
      });
    }
  }
};

module.exports = dbSql;
