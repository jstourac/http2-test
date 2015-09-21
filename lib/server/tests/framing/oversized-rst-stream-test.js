// [From the spec](https://tools.ietf.org/html/rfc7540#section-6.4):
//
// RST_STREAM frames MUST be associated with a stream.  If a RST_STREAM
// frame is received with a stream identifier of 0x0, the recipient MUST
// treat this as a connection error (Section 5.4.1) of type
// PROTOCOL_ERROR.
//
// ...
//
// A RST_STREAM frame with a length other than 4 octets MUST be treated
// as a connection error (Section 5.4.1) of type FRAME_SIZE_ERROR.
//
// This test should fail with FRAME_SIZE_ERROR as there is given wrong
// size of RST_STREAM frame.

var http2 = require('http2/lib/protocol/index.js'),
    tls = require('tls');

module.exports = function(host, port, log, callback) {
  var socket = tls.connect({host: host, port: port});
  var endpoint = new http2.Endpoint(log, 'CLIENT', {});
  socket.pipe(endpoint).pipe(socket);

  endpoint._serializer.write({
    type: 'PING',
    flags: {},
    stream: 0,
    data: "0123456789" // 10B of data (according to the RFC, expected is exactly 4B)
  });

  endpoint.on('error', function(error) {
    log.info('Unexpected error caused by peer: ' + error);
  });

  endpoint.on('peerError', function(error) {
    if (error === 'FRAME_SIZE_ERROR') {
      log.info('Received Error: ' + error);
      callback();
    } else {
      callback('Inappropriate error code: ' + error);
    }
  });

};
