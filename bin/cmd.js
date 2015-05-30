#!/usr/bin/env node

var path = require('path');
var defined = require('defined');
var net = require('net');
var fs = require('fs');
var run = require('comandante');
var combiner = require('stream-combiner2');
var through = require('through2');
var tmp = require('tmp');
var mkfifo = require('mkfifo').mkfifoSync;

var HOME = defined(process.env.HOME, process.env.USERDIR);
var DIR = defined(process.env.STREAMBOX_PATH, path.join(HOME, '.config/streambox'));

net.createServer(function(clientStream) {
  handlerOmxplayer(clientStream);
}).listen(5000);

function tempFifo(cb) {
  // Generate a unique tempfile name
  tmp.tmpName(function(err, fifoName) {
    if (err) {
      errorResponse(res, err, "tmp messed up");
    }

    // Create a temporary FIFO to feed video data into. This is necessary
    // because some players (e.g. omxplayer) don't support input from stdin.
    try {
      mkfifo(fifoName, 0755);
    } catch (e) {
      errorResponse(res, e, "mkfifo messed up");
    }
    console.error("Created fifo: " + fifoName);
    var fifo = fs.createWriteStream(fifoName);
    cb(fifoName, fifo);
  });
}

function handlerOmxplayer(clientStream) {
  tempFifo(function(fifoName, fifoStream) {
    var stream = clientStream.pipe(fifoStream);
    var cmd = run('omxplayer', [fifoName]);//.pipe(clientStream);

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

    // cmd.on('end', function() {
    //   console.log('cmd ended');
    //   cmd.kill();
    // });
    // cmd.on('close', function() {
    //   console.log('cmd closed');
    //   cmd.kill();
    // });
    // cmd.on('error', function(e) {
    //   console.log('cmd error: ' + e);
    //   cmd.kill();
    // });
    // cmd.on('finish', function() {
    //   console.log('cmd finish');
    // });
    // cmd.on('pipe', function() {
    //   console.log('cmd pipe');
    // });
    // cmd.on('unpipe', function() {
    //   console.log('cmd unpipe');
    // });
  });
}


function handlerMplayer(clientStream) {
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
