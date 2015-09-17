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
// Since PUSH_PROMISE reserves a stream, ignoring a PUSH_PROMISE frame
// causes the stream state to become indeterminate.  A receiver MUST
// treat the receipt of a PUSH_PROMISE on a stream that is neither
// "open" nor "half-closed (local)" as a connection error
// (Section 5.4.1) of type PROTOCOL_ERROR.  However, an endpoint that
// has sent RST_STREAM on the associated stream MUST handle PUSH_PROMISE
// frames that might have been created before the RST_STREAM frame is
// received and processed.
//
// A receiver MUST treat the receipt of a PUSH_PROMISE that promises an
// illegal stream identifier (Section 5.1.1) as a connection error
// (Section 5.4.1) of type PROTOCOL_ERROR.  Note that an illegal stream
// identifier is an identifier for a stream that is not currently in the
// "idle" state.
//
// The PUSH_PROMISE frame can include padding.  Padding fields and flags
// are identical to those defined for DATA frames (Section 6.1).
//
// This test sends 0 as promised stream ID. The peer should reset the connection with
// PROTOCOL_ERROR.

var http2 = require('http2/lib/protocol/index.js'),
    tls = require('tls');

module.exports = function(host, port, log, callback, ids) {
  var socket = tls.connect({host: host, port: port});
  var endpoint = new http2.Endpoint(log, 'CLIENT', {}, { beforeCompression: beforeCompression });
  socket.pipe(endpoint).pipe(socket);

  ids = ids || [0];

  function beforeCompression(frame, forward, done) {
    if (frame.type === 'PUSH_PROMISE') {
      frame.promised_stream = ids.shift();
    }
    forward(frame);
    done();
  }

  var scheme = 'https',
      path   = '/server.js';
  var url = require('url').parse( scheme + '://' + host + ':' + port + path);

  var stream = endpoint.createStream();
  stream.headers({
    ':method': 'GET',
    ':scheme': scheme,
    ':authority': url.hostname,
    ':path': url.path + (url.hash || '')
  });
  ids.forEach(function() {
    stream.promise({
      ':method': 'GET',
      ':scheme': 'https',
      ':authority': 'localhost',
      ':path': 'promised-resource-' + Math.round(Math.random() * 1000),
    });
  });

  endpoint.on('error', function(error) {
    log.info('Unexpected error caused by peer: ' + error);
  });

  endpoint.on('peerError', function(error) {
    log.debug('Receiving GOAWAY frame');
    if (error === 'PROTOCOL_ERROR') {
      callback();
    } else {
      callback('Not appropriate error code: ' + error);
    }
  });
};
