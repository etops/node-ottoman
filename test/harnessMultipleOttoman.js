'use strict';

var ottoman = require('../lib/ottoman.js');
var H = require('./harness');

// Some helpers
function _saveAllModels(modelArr, callback) {
  var i = 0;
  (function __doOne() {
    if (i >= modelArr.length) {
      callback(null);
      return;
    }

    modelArr[i].save(function (err) {
      if (err) {
        callback(err);
        return;
      }

      i++;
      __doOne();
    })
  })();
}
module.exports.saveAll = _saveAllModels;

module.exports.uniqueId = H.uniqueId;

function setupOttoman(namespace, models, types) {
  var o = new ottoman.Ottoman({
    namespace: namespace,
    models: models,
    types: types
  });
  o.StoreAdapter = ottoman.StoreAdapter;
  o.StoreAdapter.Couchbase = ottoman.CbStoreAdapter;
  o.StoreAdapter.Mock = ottoman.MockStoreAdapter;
  o.CbStoreAdapter = o.StoreAdapter.Couchbase;
  o.MockStoreAdapter = o.StoreAdapter.Mock;
  o.Consistency = ottoman.StoreAdapter.SearchConsistency;

  // TODO change me to a better solution
  let couchbaseString = null;
  if (process.env.CNCSTR) {
    couchbaseString = process.env.CNCSTR;
  } else {
    couchbaseString = 'couchbase://localhost';
  }
  // Open a connection
  if (couchbaseString) {
    var couchbase = require('couchbase');

    var cluster = new couchbase.Cluster(couchbaseString);
    if (!process.env.CNCSTR) {
      cluster.authenticate({
        username: 'michal',
        password: 'michal',
      });
    }
    var bucket = cluster.openBucket();


    var seenKeys = [];
    var _bucketInsert = bucket.insert.bind(bucket);
    bucket.insert = function (key, value, options, callback) {
      seenKeys.push(key);
      return _bucketInsert(key, value, options, callback);
    };
    var _bucketUpsert = bucket.upsert.bind(bucket);
    bucket.upsert = function (key, value, options, callback) {
      seenKeys.push(key);
      return _bucketUpsert(key, value, options, callback);
    };
    var _bucketReplace = bucket.replace.bind(bucket);
    bucket.replace = function (key, value, options, callback) {
      seenKeys.push(key);
      return _bucketReplace(key, value, options, callback);
    };
    after(function (done) {
      if (seenKeys.length === 0) {
        return done();
      }

      var remain = seenKeys.length;
      for (var i = 0; i < seenKeys.length; ++i) {
        bucket.remove(seenKeys[i], function () {
          remain--;
          if (remain === 0) {
            seenKeys = [];
            done();
          }
        });
      }
    });

    o.bucket = bucket;
  } else {
    o.store = new ottoman.MockStoreAdapter();
  }

  return o;
}

module.exports.setupOttoman = setupOttoman;
