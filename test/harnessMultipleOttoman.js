'use strict';

var ottoman = require('../lib/ottoman.js');
var H = require('./harness');
var setup = require('./setup.js');

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

  o = setup.init(o);

  return o;
}

module.exports.setupOttoman = setupOttoman;
