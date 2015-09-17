// [From the spec](https://tools.ietf.org/html/rfc7540#section-6.1):
//
// DATA frames MUST be associated with a stream.  If a DATA frame is
// received whose stream identifier field is 0x0, the recipient MUST
// respond with a connection error (Section 5.4.1) of type
// PROTOCOL_ERROR.

var http2 = require('http2/lib/protocol/index.js'),
    tls = require('tls');

module.exports = function(host, port, log, callback, frame) {
  var socket = tls.connect({host: host, port:port});
  var endpoint = new http2.Endpoint(log, 'CLIENT', {});
  socket.pipe(endpoint).pipe(socket);

  setImmediate(function () {
    frame = frame || {
      type: 'DATA',
      flags: {},
      data: new Buffer(10)
    };
    frame.stream = 0;
    log.debug({ frame: frame }, 'Sending connection-level ' + frame.type + ' frame');
    endpoint._compressor.write(frame);
  });

  endpoint.on('error', function(error) {
    log.info('Unexpected error caused by peer: ' + error);
  });

  endpoint.on('peerError', function(error) {
    log.debug('Receiving GOAWAY frame');
    if (error === 'PROTOCOL_ERROR') {
      callback();
    } else {
      callback('Inappropriate error code: ' + error);
    }
  });
};
