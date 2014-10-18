var path  = require('path');
var fs    = require('fs');

var ls     = require('remote-vim').ls;
var create = require('remote-vim').create;
var uuid   = require('uuid');

function createHelper(filepath, cb) {
  // TODO it would be great if create would generate a
  // name for me.
  return create(uuid(), function (err, vim) {
    if (err) {
      return cb(err);
    }
    // TODO Look for the parent directory
    vim.open(filepath, function (err) {
      if (err) {
        return cb(err);
      }
      return cb(null, {result: 'created', path: filepath});
    });
  });
}

var main = function(argv, cb){
  if (argv.length !== 3) {
    return cb(new Error('Invalid arguments'));
  }

  var filepath = path.join(process.cwd(), argv[2]);

  /* When an existing project exists, it should open files in that project folder. */
  ls(function (err, vims) {
    if (err) {
      return cb(err);
    }

    vims = vims
      .filter(function (vim) { return filepath.indexOf(vim.cwd) === 0; });

    /*
     * When it does not it should start a server
     * in that path with that file opened.
     */
    if (!vims.length) {
      return createHelper(filepath, cb);
    }

    // The vim that matches more the url is the one selected (the more
    // specific path).
    var vim = vims.sort(function (a, b) {
      return b.cwd.length - a.cwd.length;
    })[0];

    // TODO Look for the parent directory
    vim.open(filepath, function (err) {
      if (err) {
        return cb(err);
      }
      return cb(null, {result: 'opened', path: filepath, cwd: vim.cwd});
    });
  });
};

module.exports = main;
