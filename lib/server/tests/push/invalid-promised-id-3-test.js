// [5.1.1. Stream Identifiers](https://tools.ietf.org/html/rfc7540#section-5.1.1)
//
// Streams are identified with an unsigned 31-bit integer.  Streams
// initiated by a client MUST use odd-numbered stream identifiers; those
// initiated by the server MUST use even-numbered stream identifiers.  A
// stream identifier of zero (0x0) is used for connection control
// messages; the stream identifier of zero cannot be used to establish a
// new stream.
//
// ...
//
// [6.6. PUSH_PROMISE](https://tools.ietf.org/html/rfc7540#section-6.6)
//
// ...
//
// A receiver MUST treat the receipt of a PUSH_PROMISE that promises an
// illegal stream identifier (Section 5.1.1) as a connection error
// (Section 5.4.1) of type PROTOCOL_ERROR.  Note that an illegal stream
// identifier is an identifier for a stream that is not currently in the
// "idle" state.
//
// This tests sends a valid ID as promised ID, and then a numerically lower ID as the next promised
// ID. The peer should reset the connection with PROTOCOL_ERROR.

var invalidPromiseIdTest = require('./invalid-promised-id-1-test');

module.exports = function(host, port, log, callback) {
  invalidPromiseIdTest(host, port, log, callback, [9, 7]);
};
