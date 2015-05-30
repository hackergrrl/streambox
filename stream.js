var net = require('net');

var serverStream = net.connect(5000, 'localhost', function() {
  process.stdin.pipe(serverStream).pipe(process.stdout);
});
