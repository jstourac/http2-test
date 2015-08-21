// [6.7. PING](https://tools.ietf.org/html/rfc7540#section-6.7)
// The PING frame (type=0x6) is a mechanism for measuring a minimal
// round-trip time from the sender, as well as determining whether an
// idle connection is still functional.  PING frames can be sent from
// any endpoint.
//
// ...
//
// PING frames are not associated with any individual stream.  If a PING
// frame is received with a stream identifier field value other than
// 0x0, the recipient MUST respond with a connection error
// (Section 5.4.1) of type PROTOCOL_ERROR.
//
// Receipt of a PING frame with a length field value other than 8 MUST
// be treated as a connection error (Section 5.4.1) of type
// FRAME_SIZE_ERROR.
//
// This test should fail with FRAME_SIZE_ERROR as there is given wrong
// size of PING frame.

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
    data: "0123456789" // 10B of data (according to the RFC, expected is exactly 8B)
    //data: new Buffer(10)
  });

  endpoint.on('error', function(error) {
    log.info('Received Error: ' + error);
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
