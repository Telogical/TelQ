var tedious = require('tedious');
var _ = require('lodash');

function dbSql(q) {
    'use strict';

    function qDbSql(options) {

        function qExecuteStoredProcedure(resolve, reject) {
            var results = [];
            var connection = new tedious.Connection(options.source);

            function requestCallback(err, rowCount) {
                if (err) {
                    connection.close();
                    reject(new Error('Error with sql execution: ' + err));
                }
                connection.close();
                resolve(results);
            }

            function onConnection(err) {
                if (err) {
                    reject(new Error('Error connecting: ' + err));
                }

                var request = new tedious.Request(options.query, requestCallback);

                _.each(options.params, function(param) {
                    request.addParameter(param.name, param.type, param.value);
                });

                function onRow(columns) {
                    results.push(columns);
                }

                request.on('row', onRow);
                request.on('done', function() {
                    connection.close();
                });

                connection.callProcedure(request);
            }

            connection.on('connect', onConnection);
        }

        function qExecuteStatement(resolve, reject) {
            var results = [];
            var connection = new tedious.Connection(options.source);

            function onRequestError(err, rowCount) {
                if (err) {
                    connection.close();
                    reject(new Error('Error with sql execution'));
                }

                connection.close();
                resolve(results);
            }

            function onRow(columns) {
                var data = {};
                _.each(columns, function(column) {
                    data[column.metadata.colName] = column.value;
                });
                results.push(data);
            }

            function onConnection(err) {
                if (err) {
                    console.log('Error on connection', err);
                    reject(new Error('Error connecting: ' + err));
                }

                var request = new tedious.Request(options.query, onRequestError);
                request.on('row', onRow);
                connection.execSql(request);
            }

            connection.on('connect', onConnection);
        }

        function noServerError(resolve, reject) {
            reject(new Error('No server supplied'));
        }

        if (!options.source) {
            return new q.Promise(noServerError);
        }
        if (options.queryType == 'storedProcedure') {
            return new q.Promise(qExecuteStoredProcedure);
        } else {
            return new q.Promise(qExecuteStatement);
        }

    }

    q.dbSql = qDbSql;

    return q;
}


module.exports = dbSql;