// [4.3. Header Compression and Decompression](https://tools.ietf.org/html/rfc7540#section-4.3)
//
// ...
//
// A receiver MUST terminate the
// connection with a connection error (Section 5.4.1) of type
// COMPRESSION_ERROR if it does not decompress a header block.
//
// This test sends a single, incomplete header field with incremental indexing
// representation in the request header block.

var invalidDataTestCase = require('./invalid-data');

module.exports = function(host, port, log, callback) {
  // expected 2 bytes of data but only one is sent actually
  var validCompressionData = new Buffer('60027879', 'hex');
  var length = validCompressionData.length;
  var invalidCompressionData = validCompressionData.slice(0, length - 1);
  invalidDataTestCase(host, port, log, callback, invalidCompressionData);
};
