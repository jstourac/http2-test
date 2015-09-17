// [4.3. Header Compression and Decompression](https://tools.ietf.org/html/rfc7540#section-4.3)
//
// ...
//
// A receiver MUST terminate the
// connection with a connection error (Section 5.4.1) of type
// COMPRESSION_ERROR if it does not decompress a header block.
//
// This test sends a single, incomplete header representation in the request header block.

var invalidDataTestCase = require('./invalid-data');

module.exports = function(host, port, log, callback) {
  // representations = [{ name: 'x', value: 'y', index: -1 }];
  var validCompressionData = new Buffer('6001780179', 'hex');
  var length = validCompressionData.length;
  var invalidCompressionData = validCompressionData.slice(0, length - 1);
  invalidDataTestCase(host, port, log, callback, invalidCompressionData);
};
