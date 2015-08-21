// [6.3. PRIORITY](https://tools.ietf.org/html/rfc7540#section-6.3):
//
//     PRIORITY frame is received with a stream identifier of 0x0, the
//     recipient MUST respond with a connection error (Section 5.4.1) of
//     type PROTOCOL_ERROR.

var invalidConnectionLevelFrameTest = require('./invalid-level-data-test.js');

module.exports = function(host, port, log, callback) {
  invalidConnectionLevelFrameTest(host, port, log, callback, {
    type: 'PRIORITY',
    flags: {},
    priorityDependency: 10,
    priorityWeight: 10,
    exclusiveDependency: 0
  });
};
