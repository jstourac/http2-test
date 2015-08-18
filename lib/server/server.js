//Copyright (c) Akamai Technologies, Inc. See LICENSE.txt for licensing information.

var fs = require('fs');
var path = require('path');
var http2 = require('http2');

// We cache one file to be able to do simple performance tests without waiting for the disk
var cachedFile = fs.readFileSync(path.join(__dirname, 'server.js'));
var cachedUrl = '/server.js';

// The callback to handle requests
function onRequest(request, response) {
  var filename = path.join(__dirname, request.url || '/server.js');

  // Serving server.js from cache. Useful for microbenchmarks.
  if (request.url === cachedUrl) {
    response.end(cachedFile);
  }

  // Reading file from disk if it exists and is safe.
  else if ((filename.indexOf(__dirname) === 0) && fs.existsSync(filename) && fs.statSync(filename).isFile()) {
    response.writeHead('200');

    // If they download the certificate, push the private key too, they might need it.
    if (response.push && request.url === '../res/keys/localhost.crt') {
      var push = response.push('../res/keys/localhost.key');
      push.writeHead(200);
      fs.createReadStream(path.join(__dirname, '../res/keys/localhost.key')).pipe(push);
    }

    fs.createReadStream(filename).pipe(response);
  }

  // Otherwise responding with 404.
  else {
    response.writeHead('404');
    response.end();
  }
}

function Server(port, log) {
  var options = {
    key: fs.readFileSync(path.join(__dirname, '../res/keys/localhost.key')),
    cert: fs.readFileSync(path.join(__dirname, '../res/keys/localhost.crt'))
  };
  this.port = port;
  this.log = log || require('bunyan').createLogger({
      name: 'server',
      level: 'debug',
      serializers: http2.serializers
  });

  // Passing bunyan logger (optional)
  options.log = log;

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  // Creating the server in plain or TLS mode (TLS mode is the default)
  if (process.env.HTTP2_PLAIN) {
    this.server = http2.raw.createServer(options, onRequest);
  } else {
    this.server = http2.createServer(options, onRequest);
  }
}

Server.prototype.start = function(done) {
  this.server.listen(this.port || 8080);
  this.log.debug('Server started');
  done();
};

Server.prototype.stop = function(callback) {
  this.server.close();
};

module.exports = Server;
