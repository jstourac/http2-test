// [4.3. Header Compression and Decompression](https://tools.ietf.org/html/rfc7540#section-4.3)

var http2 = require('http2/lib/protocol/index.js');
    tls = require('tls');

module.exports = function(host, port, log, callback, compressedData) {
  var socket = tls.connect({host: host, port:port});
  var endpoint = new http2.Endpoint(log, 'CLIENT', {}, {
    beforeSerialization: beforeSerialization
  });
  socket.pipe(endpoint).pipe(socket);

  endpoint.on('stream', function(stream) {
    stream.headers({
      ':status': 200
    });
    stream.end('response body');
  });

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

  function beforeSerialization(frame, forward, done) {
    if (frame.type === 'HEADERS') {
      frame.data = compressedData;
    }
    forward(frame);
    done();
  }

  endpoint.on('peerError', function(error) {
    log.debug('Receiving GOAWAY frame');
    if (error === 'COMPRESSION_ERROR') {
      callback();
    } else {
      callback('Inappropriate error code: ' + error);
    }
  });
};
