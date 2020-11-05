'use strict';
module.exports.init = function () {
  const res = {
    couchbaseString: null,
    couchbaseUsername: null,
    couchbasePassword: null
  };
  if (process.env.CNCSTR) {
    res.couchbaseString = process.env.CNCSTR;
  } else {
    res.couchbaseString = 'couchbase://localhost';
    res.couchbaseUsername = 'michal';
    res.couchbasePassword = 'michal';
  }
  return res;
};
