// [5.1. Stream States](https://tools.ietf.org/html/rfc7540#section-5.1)
//
// ...
//
// idle:
//   All streams start in the "idle" state.
//
//   The following transitions are valid from this state:
//
//   *  Sending or receiving a HEADERS frame causes the stream to
//      become "open".  The stream identifier is selected as described
//      in Section 5.1.1.  The same HEADERS frame can also cause a
//      stream to immediately become "half-closed".
//
//   *  Sending a PUSH_PROMISE frame on another stream reserves the
//      idle stream that is identified for later use.  The stream state
//      for the reserved stream transitions to "reserved (local)".
//
//   *  Receiving a PUSH_PROMISE frame on another stream reserves an
//      idle stream that is identified for later use.  The stream state
//      for the reserved stream transitions to "reserved (remote)".
//
//   *  Note that the PUSH_PROMISE frame is not sent on the idle stream
//      but references the newly reserved stream in the Promised Stream
//      ID field.
//
//   Receiving any frame other than HEADERS or PRIORITY on a stream in
//   this state MUST be treated as a connection error (Section 5.4.1)
//   of type PROTOCOL_ERROR.

var http2 = require('http2/lib/protocol/index.js'),
    tls = require('tls');

module.exports = function(host, port, log, callback, frame) {
  var socket = tls.connect({host: host, port: port});
  var endpoint = new http2.Endpoint(log, 'CLIENT', {});
  socket.pipe(endpoint).pipe(socket);
  var stream = endpoint.createStream();

  // Check init state of the stream
  log.debug('Stream state: ' + stream.state);
  if (stream.state !== 'IDLE') {
    callback('Each new stream must start in state IDLE!');
    return;
  }

  // Send given frame
  setImmediate(function () {
    frame.stream = 1;
    stream._writeUpstream(frame);
  });

  if (frame.type === "PRIORITY") {
    // Do check and bind error events -> ok frame, no error expected
    if (stream.state !== 'IDLE') {
      callback('There is not expected state transition when PRIORITY frame has been sent!');
      return;
    }
    stream.on('error', function(error) {
      callback('Received stream error via "error" event but no error expected: ' + error);
    });
    stream.on('connectionError', function(error) {
      callback('Received error via "connectionError" event but no error expected: ' + error);
    });
    stream.on('priority', function(priority) {
        callback();
    });
  } else {
    // Bind error events in appropriate way -> bad frames, PROTOCOL_ERROR expected
    stream.on('error', function(error) {
      callback('Received stream error via "error" event but expected PROTOCOL_ERROR via "connectionError" event');
    });
    stream.on('connectionError', function(error) {
      log.debug('Receiving GOAWAY frame');
      if (error === 'PROTOCOL_ERROR') {
        callback();
      } else {
        callback('Inappropriate error code: ' + error);
      }
    });
  }
};
