var test = require('tape')
var fs = require('fs')
var mocks = require('node-mocks-http')

var sendBrowserify = require('../')

test('should send bundles', function (t) {
  var req = mocks.createRequest({
    method: 'GET'
  })
  var res = mocks.createResponse({
    eventEmitter: require('events').EventEmitter
  })
  var send = sendBrowserify({
    entries: [__dirname + '/fixtures/prebundle.js'],
    fullPaths: false
  })

  send(req, res, function (err) {
    t.error(err, 'should not error')
    t.end()
  })

  t.equal(res.statusCode, 200, 'status is correct')
  t.equal(res.get('Content-Type'), 'application/javascript', 'content type is correct')
  res.on('end', function () {
    t.equal(
      res._getData(),
      fs.readFileSync(__dirname + '/fixtures/postbundle.js').toString(),
      'bundle is correct'
    )
    t.end()
  })
})

test('should only bundle once if opt.once', function (t) {
  var send = sendBrowserify({
    entries: [__dirname + '/fixtures/prebundle.js'],
    fullPaths: false,
    once: true
  })

  testBundle(function () {
    var done
    testBundle(function () {
      done = true
      t.ok(done, 'bundle already cached')
    })
    setTimeout(function () {
      t.ok(done, 'should have finished bundle by now')
      t.end()
    }, 10)
  })

  function testBundle (cb) {
    var req = mocks.createRequest({
      method: 'GET'
    })
    var res = mocks.createResponse({
      eventEmitter: require('events').EventEmitter
    })
    send(req, res, function (err) {
      t.error(err, 'should not error')
    })
    res.on('end', function () {
      cb()
    })
  }
})
