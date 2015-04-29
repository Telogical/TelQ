function dbMongoose(q) {
    'use strict';

    function qDbMongoose(options) {

        var operation = options.operation || 'find',
            query = options.query || {},
            conditions = options.conditions || null,
            model = options.source;

        function qGetDB(resolve, reject) {
            if (!model) {
                reject('no model');
            }

            function dbCallback(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            }

            if (conditions) {
                model[operation](conditions, query, dbCallback);
            } else {
                model[operation](query, dbCallback);
            }
        }

        return new q.Promise(qGetDB);
    }


    q.dbMongoose = qDbMongoose;

    return q;
}

module.exports = dbMongoose;