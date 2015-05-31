#!/usr/bin/env node

var fs = require('fs');
var defined = require('defined');
var path = require('path');
var net = require('net');
var through = require('through2');

var HOME = defined(process.env.HOME, process.env.USERDIR);
var DIR = defined(
  process.env.STREAMBOX_PATH,
  path.join(HOME, '.config/streambox'),
  path.join(__dirname, '..'));

var endpoints = {};
loadEndpoints(path.join(DIR, 'node_modules'));


// Load installed stream endpoints
function loadEndpoints(endpointsDir) {
  if (!fs.existsSync(endpointsDir)) {
    console.error('No endpoints found. Your server won\'t be able to handle any streams.');
  } else {
    var files = fs.readdirSync(endpointsDir);
    for (var i in files) {
      var name = files[i];
      if (name.indexOf('streambox-') !== 0) {
        continue;
      }
      var jsPath = path.join(endpointsDir, name, 'index');
      if (!fs.existsSync(jsPath + '.js')) {
        continue;
      }
      var endpoint = require(jsPath);
      for (var i in endpoint.endpoints) {
        var endpointName = endpoint.endpoints[i];
        endpoints[endpointName] = endpoint;
        console.error(endpointName + " => " + name + '  (via ' + endpointsDir + ')');
      }
    }
  }
}

net.createServer(function(clientStream) {
  var type = '';

  var foundType = false;
  var stream = clientStream
    .pipe(through(function(chunk, enc, callback) {
      if (!foundType) {
        for (var i=0; i < chunk.length; i++) {
          var chr = String.fromCharCode(chunk[i]);
          if (chr === '\n') {
            foundType = true;
            console.error('Incoming stream type: ' + type);
            createStreamOfType(stream, type);
            this.push(chunk.slice(i+1));
            break;
          } else {
            type += chr;
          }
        }
      } else {
        this.push(chunk);
      }
      callback();
    }));
}).listen(5000);


function createStreamOfType(stream, type) {
  for (var typeString in endpoints) {
    if (!(new RegExp(typeString)).test(type)) {
      continue;
    }
    console.error("Found matching endpoint for " + type);
    return endpoints[typeString](stream);
  }
  console.error("No endpoint for " + type);
}

