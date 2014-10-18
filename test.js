var assert = require('assert');

var path = require('path');

var mockuire = require('mockuire')(module);

var mockedVims = [

];

var mockedVim = {
  open: function (path, cb) {
    return cb(null);
  }
};

var mockedRemoteVim = {
  ls: function (fn) {
    return fn(null, mockedVims);
  },
  create: function (uuid, fn) {
    return fn(null, mockedVim);
  }
};

function addMockedVim(cwd) {
  mockedVims.push({
    cwd: cwd,
    open: function (path, fn) {
      return fn(null);
    }
  });
}

var mvimWrapper = mockuire('./index', {'remote-vim': mockedRemoteVim});

var TEST_TIMEOUT_MS = 3000;

function test(fn) {
  var done = (function () {
    var timer = setTimeout(function () {
      assert.ok(false, 'Test timeout' + fn);
    }, TEST_TIMEOUT_MS);
    return function () {

      // Clean mocked vims
      mockedVims.splice(0);

      clearTimeout(timer);
    };
  })();

  return fn(done);
}

/* Invalid parameters */
test(function (done) {
  var result = mvimWrapper([], function (err) {
    assert.ok(err);
    done();
  });
});

test(function (done) {
  var result = mvimWrapper(['foo'], function (err) {
    assert.ok(err);
    done();
  });
});

test(function (done) {
  var result = mvimWrapper(['foo', 'bar'], function (err) {
    assert.ok(err);
    done();
  });
});

test(function (done) {
  var result = mvimWrapper(['foo', 'bar', 'lalal', 'zzz'], function (err) {
    assert.ok(err);
    done();
  });
});

/* Create new vim */
test(function (done) {
  var filename = 'file';
  var result = mvimWrapper(['node', 'index.js', filename], function (err, result) {
    assert.ifError(err);

    assert.equal('created', result.result);
    assert.equal(path.join(process.cwd(), filename), result.path);

    done();
  });
});

/* Open in existing vim */
test(function (done) {
  var filename = 'file';
  addMockedVim(process.cwd());
  var result = mvimWrapper(['node', 'index.js', filename], function (err, result) {
    assert.ifError(err);

    assert.equal('opened', result.result);
    assert.equal(path.join(process.cwd(), filename), result.path);

    done();
  });
});

/* Open most specific path when there are multiple matches */
test(function (done) {
  var filename = 'foo2/file';
  var cwd = process.cwd();
  var foo = cwd +  '/foo';
  var foo2 = cwd +  '/foo2';
  addMockedVim(foo);
  addMockedVim(foo2);
  var result = mvimWrapper(['node', 'index.js', filename], function (err, result) {
    assert.ifError(err);

    assert.equal('opened', result.result);
    assert.equal(path.join(process.cwd(), filename), result.path);
    assert.equal(process.cwd() + '/foo2', result.cwd);

    done();
  });
});
