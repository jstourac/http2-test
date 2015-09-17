// [From the spec](https://tools.ietf.org/html/rfc7540#section-6.8):
//
// The GOAWAY frame applies to the connection, not a specific stream. An
// endpoint MUST treat a GOAWAY frame with a stream identifier other than
// 0x0 as a connection error (Section 5.4.1) of type PROTOCOL_ERROR.

var http2 = require('http2/lib/protocol/index.js'),
    tls   = require('tls');

module.exports = function(host, port, log, callback, frame) {
  var socket = tls.connect({host: host, port:port});
  var endpoint = new http2.Endpoint(log, 'CLIENT', {});
  socket.pipe(endpoint).pipe(socket);

  var scheme = 'https',
      path   = '/server.js';
  var url = require('url').parse( scheme + '://' + host + ':' + port + path);

  var stream = endpoint.createStream();
  stream.headers({
    ':method': 'GET',
    ':scheme': scheme,
    ':path': url.path + (url.hash || '')
  });

  setImmediate(function() {
    frame = frame || {
      type: 'GOAWAY',
      flags: {},
      last_stream: 1,
      error: 'NO_ERROR'
    };
    frame.stream = 1; // stream.id is undefined at this point
    log.debug({ frame: frame }, 'Sending stream-level ' + frame.type + ' frame');
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
