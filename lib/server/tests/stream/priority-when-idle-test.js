// See ../invalid-frame-when-idle.js

// This frame should be OK to process.

var invalidFrameWhenIdleTest = require('./invalid-frame-when-idle');

module.exports = function(host, port, log, callback) {
  invalidFrameWhenIdleTest(host, port, log, callback, {
    type: 'PRIORITY',
    flags: {},
    priorityDependency: 10,
    priorityWeight: 10,
    exclusiveDependency: 0
  });
};
