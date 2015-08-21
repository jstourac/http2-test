// [6.6. PUSH_PROMISE](https://tools.ietf.org/html/rfc7540#section-6.6):
//
// ... A receiver MUST treat the receipt of a PUSH_PROMISE that promises an
// illegal stream identifier (Section 5.1.1) as a connection error
// (Section 5.4.1) of type PROTOCOL_ERROR.  Note that an illegal stream
// identifier is an identifier for a stream that is not currently in the
// "idle" state.

var invalidConnectionLevelFrameTest = require('./invalid-level-data-test.js');

module.exports = function(host, port, log, callback) {
  invalidConnectionLevelFrameTest(host, port, log, callback, {
    type: 'PUSH_PROMISE',
    flags: {},
    headers: {
      ':method': 'GET',
      ':scheme': 'https',
      ':host': 'localhost',
      ':path': '/pushed.html'
    },
    promised_stream: 12
  });
};
