var net = require('net');
var run = require('comandante');
var combiner = require('stream-combiner2');

net.createServer(function(clientStream) {
  handler(clientStream);
}).listen(5000);

function handler(stream) {
  var cmd = run('mplayer', ['-']);
  var stream = combiner(stream, cmd, stream);
  stream.on('end', function() {
    console.log('ended');
    cmd.kill();
  });
  stream.on('error', function(e) {
    console.log('ended due to error ' + e);
    cmd.kill();
  });
}

