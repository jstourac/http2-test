/*
Copyright (c) Akamai Technologies, Inc. See LICENSE.txt for licensing information.

Copyright (c) Microsoft Open Technologies, Inc. See LICENSE.txt for licensing information.
*/

var glob = require('glob').sync,
	expect = require('chai').expect,
	bunyan = require('bunyan'),
	path = require('path'),
	tls = require('tls'),
	fs = require('fs'),
	http2 = require('http2/lib/protocol/index.js');

var Server = require('./server');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Get hostname and port from environment value if set
var env_hostname = process.env.NODE_HTTP2_HOSTNAME;
var env_port = process.env.NODE_HTTP2_PORT;

describe('HTTP/2 server', function() {
	//var tests = glob(__dirname + '/tests/**/*-test.js'),
	var tests = glob(__dirname + '/tests/*/*-test.js'), // We do not want template* tests
		hostname = typeof env_hostname !== 'undefined' ? env_hostname : 'localhost',
		port = typeof env_port !== 'undefined' ? env_port : 8443, //used to be 8080
		log, server;

	function createLogger(name) {
		return bunyan.createLogger({
			name: name,
			streams: [{
				level: 'debug',
				path: __dirname + '/../../test.log'
			}],
			serializers: http2.serializers,
			level: 'info'
		});
	}
	log = createLogger('ServerTest');

//	beforeEach(function(done) {
//                server = new Server(port, log);
//                server.start(done);
//                log.info('Server started');
//      });

	tests.forEach(function(file) {
		it(file, function(done) {
                        var startTest = require(file);
                          startTest(hostname, port, log, function(error) {
                          done(error);
                        });
		});
	});

//	afterEach(function() {
//          server.stop();
//      });
});
