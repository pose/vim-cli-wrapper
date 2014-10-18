#!/usr/bin/env node

var main = require('./index');

main(process.argv, function (err) {
  if (err) {
    console.error(err);
    return process.exit(1);
  }
  process.exit(0);
});
