#!/usr/bin/env node

var path = require('path');
var defined = require('defined');
var net = require('net');

var HOME = defined(process.env.HOME, process.env.USERDIR);
var DIR = defined(process.env.STREAMBOX_PATH, path.join(HOME, '.config/streambox'));

// Load installed stream endpoints
// ...

net.createServer(function(clientStream) {
}).listen(5000);

