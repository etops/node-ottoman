'use strict';
/*const log = require('why-is-node-running');*/
module.exports.init = function (ottoman) {
    var setupData = {
        couchbaseString: null,
        couchbaseUsername: null,
        couchbasePassword: null
    };
    if (process.env.CNCSTR) {
        setupData.couchbaseString = process.env.CNCSTR;
    }
    else {
        setupData.couchbaseString = 'couchbase://localhost';
        setupData.couchbaseUsername = 'michal';
        setupData.couchbasePassword = 'michal';
    }
    if (setupData.couchbaseString) {
        var couchbase = require('couchbase');
        var cluster = new couchbase.Cluster(setupData.couchbaseString);
        if (!process.env.CNCSTR) {
            cluster.authenticate({
                username: setupData.couchbaseUsername,
                password: setupData.couchbasePassword,
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
                        // Here you can verify that ottoman connections
                        // are not closing when all tests are finished
                        /* setTimeout(function () {
                          log() // logs out active handles that are keeping node running
                        }, 500);*/
                        done();
                    }
                });
            }
        });
        ottoman.bucket = bucket;
    }
    else {
        ottoman.store = new ottoman.MockStoreAdapter();
    }
    return ottoman;
};
module.exports.saveAllModels = function saveAllModels(modelArr, callback) {
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
        });
    })();
};
//# sourceMappingURL=ottomanSetup.js.map