var tmp = require('tmp');
var mkfifo = require('mkfifo').mkfifoSync;
var fs = require('fs');

module.exports = function(cb) {

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
};
