/*
Copyright (c) Akamai Technologies, Inc. See LICENSE.txt for licensing information.

Copyright (c) Microsoft Open Technologies, Inc. See LICENSE.txt for licensing information.
*/
var http2 = require('http2');
var fs = require('fs');
var path = require('path');

// We use self signed certs in the example code so we ignore cert errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = function(hostname, port, log, callback) {
        var url = 'https://' + hostname + ':' + port + '/server.js';
        var options = require('url').parse(url);
        options.plain = false;
        options.ALPNProtocols = "h2";
        var push_count = 0;
        var finished = 0;

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
            finish();
          });
        });

        // Receiving push streams from server
        request.on('push', function(pushRequest) {
          var filename = path.join(__dirname, '/push-' + push_count);
          push_count += 1;
          console.error('Receiving pushed resource: ' + pushRequest.url + ' -> ' + filename);
          pushRequest.on('response', function(pushResponse) {
            pushResponse.pipe(fs.createWriteStream(filename)).on('finish', finish);
          });
        });

        // Quitting after both the response and the associated pushed resources have arrived
        function finish() {
          finished += 1;
          if (finished === (1 + push_count)) {
            callback();
          }
        }
};
