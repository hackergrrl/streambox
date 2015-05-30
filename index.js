var net = require('net');
var run = require('comandante');
var combiner = require('stream-combiner2');
var through = require('through2');

net.createServer(function(clientStream) {
  handler(clientStream);
}).listen(5000);

function handler(clientStream) {
  var cmd = run('mplayer', ['-cache', '8192', '-']);

  var stream = combiner(clientStream, through(function(data, enc, callback) {
    console.log(data.length);
    this.push(data);
    callback();
  }), cmd, clientStream);

  stream.on('end', function() {
    console.log('ended');
    cmd.kill();
  });
  stream.on('close', function() {
    console.log('closed');
    cmd.kill();
  });
  stream.on('error', function(e) {
    console.log('error: ' + e);
    cmd.kill();
  });
  stream.on('finish', function() {
    console.log('finish');
  });
  stream.on('pipe', function() {
    console.log('pipe');
  });
  stream.on('unpipe', function() {
    console.log('unpipe');
  });
}

