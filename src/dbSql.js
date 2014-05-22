'use strict';

var RSVP = require('rsvp');
var tedious = require('tedious');

var dbSql = {
  dbSql: function(options) {
    function qExecuteStatement(resolve, reject) {
      var connection = new tedious.Connection(options.sqlServer);
      var data = 'Statement executed successfully';

      //            connection.on('debug', function(text) {
      //                // If no error, then good to go...
      //                console.log('Debug: ' + text);
      //            });

      connection.on('connect', function(err) {

        if (err) {
          console.log('Error on connection', err);
          reject(new Error('Error connecting: ' + err));
        }

        var request = new tedious.Request(options.query, function(err) {
          if (err) {
            connection.close();
            reject(new Error('Error with sql execution'));
          }

          connection.close();
          resolve(data);
        });

        request.on('row', function(columns) {
          data = {};
          _.each(columns, function(column) {
            data[column.metadata.colName] = column.value;
          });
        });

        connection.execSql(request);
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
