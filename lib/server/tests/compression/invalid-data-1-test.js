// [4.3. Header Compression and Decompression](https://tools.ietf.org/html/rfc7540#section-4.3)
//
// ...
//
// A receiver MUST terminate the
// connection with a connection error (Section 5.4.1) of type
// COMPRESSION_ERROR if it does not decompress a header block.
//
// This test sends a single, incomplete header field without indexing
// representation in the request header block.

var invalidDataTestCase = require('./invalid-data');

module.exports = function(host, port, log, callback) {
  invalidDataTestCase(host, port, log, callback, new Buffer('00', 'hex'));
};
