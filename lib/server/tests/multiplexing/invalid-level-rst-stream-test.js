// [From the spec](https://tools.ietf.org/html/rfc7540#section-6.4):
//
// RST_STREAM frames MUST be associated with a stream.  If a RST_STREAM
// frame is received with a stream identifier of 0x0, the recipient MUST
// treat this as a connection error (Section 5.4.1) of type
// PROTOCOL_ERROR.

var invalidConnectionLevelFrameTest = require('./invalid-level-data-test.js');

module.exports = function(host, port, log, callback) {
  invalidConnectionLevelFrameTest(host, port, log, callback, {
    type: 'RST_STREAM',
    flags: {},
    error: 'CANCEL'
  });
};
