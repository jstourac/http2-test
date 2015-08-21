// [6.2. HEADERS](https://tools.ietf.org/html/rfc7540#section-6.2):
//
// HEADERS frames MUST be associated with a stream.  If a HEADERS frame
// is received whose stream identifier field is 0x0, the recipient MUST
// respond with a connection error (Section 5.4.1) of type
// PROTOCOL_ERROR.

var invalidConnectionLevelFrameTest = require('./invalid-level-data-test.js');

module.exports = function(host, port, log, callback) {
  invalidConnectionLevelFrameTest(host, port, log, callback, {
    type: 'HEADERS',
    flags: {},
    headers: {
      ':status': 200
    }
  });
};
