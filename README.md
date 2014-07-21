TelQ
====
Telogical's wrap of RSVP with helper methods and caching.

To use TelQ, require it and start calling the http functions with the options
parameter.  The options object for all TelQ functions require two properties.

```js
{
  url: 'The source of the data',
  params: 'The filters for the source data (querystring params, query params, etc)
}
```

##Basic Usage

The TelQ http functions wrap [request](https://github.com/mikeal/request) so any params that are
needed for other http functions should be included in the options object

```js
var q = require('src/TelQ.js');

var options = {
  url: 'http://someapi',
  params: {
      param1Key: 'param1Value',
      param2Key: 'param2Value'
    }
};

var qUrl = q.get(options);

qUrl.then(resolveCallback, rejectCallback);
```

##Resources

All top level (eg it is a resource, such as dbSql, or db Mongoose) plugins input options should conform to this schema:

```js
{
  source: 'The source of the data',
  query: 'The filters for the source data (querystring params, query params, etc)
}

```

###DbMongoose

TelQ can also be extended for backend applications to connect to either a mongodb instance or a microsoft sqlserver instance.  The dbMongoose extension wraps [mongoosejs](http://mongoosejs.com).  So for the options.source property you should give an instance of the model you wish to query.  The mongo extenstion also requires the operation you want to execute to be included in the options param.  

```js
var q = require('src/TelQ.js');
var dbMongoose = require('src/dbMongoose.js');

q.use(dbMongoose);

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var Cat = mongoose.model('Cat', { name: String });

var options = {
  source: Cat,
  query: {
    name: 'Mittens'
  },
  operation: 'find'
};

var qDb = q.dbMongoose(options);
qDb.then(resolveCallback, rejectCallback);
```

###DbSql

The dbSql extension wraps [tedious](https://github.com/pekim/tedious).  The options.source property should be an object with the address of the sql instance you wish to connect to, username, password, and an object with the queried databases.  Also you will include the string query you wish to execute.  If you are executing a read query the data will be passed back through the data parameter of the success callback.

```js
var q = require('src/TelQ.js');
var dbSql = require('src/dbSql.js');

q.use(dbSql);

var options = {
    source: {
        server: 'address of server',
        userName: 'User',
        password: 'Password',
        query_databases: {pets: 'Pets'}
    },
    query: 'SELECT * FROM Cats'
};

var qSql = q.dbSql(options);

qSql.then(resolveCallback, rejectCallback);
```
#Plugin Creation

At some point you might decide to extend TelQ to encapsulate some domain process or resource. 
A plugin is function that takes q as its only parameter , with functions that take a single options object.

```js

function someResource(q) {

    function operationUno(opts) {
        var defer = q.defer();
    
        //async stuff
        q.resolve('uno!');
        
        return defer.promise();
    }
    
    function operationDos(opts){
        
        return q.resolve('dos!');
    }

    q.domainVernacular  = {
        operationUno: operationUno,
        operationDos: operationDos
    
    };

    return q;
}

module.exports = someResource;

```

if the q plugin is top level (eg it is a resource, such as dbSql, or db Mongoose), then the options should conform to this schema:

```js
{
  source: 'The source of the data',
  query: 'The filters for the source data (querystring params, query params, etc)
}

```

if the q plugin is domain level, then the domain concerns will dictate the object schema. These should reside in the `telogical` namespace.
to prevent stomping on other plugins being fluently configured use

```js

q.telogical = q.telogical || {};

```
at the top of the plugin.












