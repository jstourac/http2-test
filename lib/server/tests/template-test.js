/*
Copyright (c) Akamai Technologies, Inc. See LICENSE.txt for licensing information.

Copyright (c) Microsoft Open Technologies, Inc. See LICENSE.txt for licensing information.
*/
var http2 = require('http2');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = function(hostname, port, log, callback) {
        var url = 'https://' + hostname + ':' + port + '/server.js';
        var options = require('url').parse(url);
        options.plain = false;
        options.ALPNProtocols = "h2";

        var request = http2.get(options, function(response) {
          log.debug('Client received response!');

          // Print response directly to stdout...
          //response.pipe(process.stdout);

          // Print response into the log...
          var myData;
          response.on('data', function(data) {
              myData += data;
          });
          response.on('end', function() {
              log.debug("Response content: " + myData);
          });
          callback();
        });
};
