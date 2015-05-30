#!/usr/bin/env node

var defined = require('defined');
var path = require('path');
var fs = require('fs');
var net = require('net');
var combiner = require('stream-combiner2');

var HOME = defined(process.env.HOME, process.env.USERDIR);
var DIR = defined(process.env.STREAMBOX_PATH, path.join(HOME, '.config/streambox'));

var machines;
try {
  machines = JSON.parse(fs.readFileSync(path.join(DIR, 'machines')).toString());
} catch (e) {
  console.log('No \'machines\' config file found. Create one in ~/.config/streambox.');
  console.error(e);
  return;
}

var argv = require('minimist')(process.argv.slice(2));

if (argv._.length <= 0) {
  console.log("Machine target argument required.");
  printAvailableMachines();
  return;
}

function printAvailableMachines() {
  console.log('Available machines:');
  for (var i in machines) {
    console.log(' ' + i);
  }
}

var machine = machines[argv._[0]];
if (!machine) {
  printAvailableMachines();
  return;
}
machine.port = machine.port || 5000;

var serverStream = net.connect(machine.port, machine.ip, function() {
  var stream = combiner(process.stdin, serverStream, process.stdout);

  stream.on('error', function(e) {
    console.log('ended due to error ' + e);
  });
  stream.on('end', function(e) {
    console.log('ended');
  });
  stream.on('close', function() {
    console.log('closed');
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
});

