TelQ
====
Telogical's wrap of RSVP with helper methods and caching.

To use TelQ, require it and start calling the http functions with the options
parameter.  The options object for all TelQ functions require two properties.
```
{
  source: 'The source of the data',
  query: 'The filters for the source data (querystring params, query params, etc)
}
```

The TelQ http functions wrap [request](https://github.com/mikeal/request) so any params that are
needed for other http functions should be included in the options object
```
var q = require('src/TelQ.js');

var options = {
  source: 'http://someapi',
  query: {
      param1Key: 'param1Value',
      param2Key: 'param2Value'
    }
};

var qUrl = q.get(options);

qUrl.then(resolveCallback, rejectCallback);

```

TelQ can also be extended for backend applications to connect to either a mongodb instance or a microsoft sqlserver instance.  The dbMongoose extension wraps [mongoosejs](http://mongoosejs.com).  So for the options.source property you should give an instance of the model you wish to query.  The mongo extenstion also requires the operation you want to execute to be included in the options param.  


```
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
