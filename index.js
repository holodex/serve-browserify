var httpError = require('http-errors')
var browserify = require('browserify-incremental')
var saveStream = require('save-stream')

module.exports = serveBrowserify

function serveBrowserify (files, opts) {
  var b = browserify(files, opts)

  if (files && typeof files.bundle !== 'function' && !opts) {
    opts = files || {}
    files = undefined
  }

  if (opts != null && opts.once == true) {
    return serveOnce(b)
  } else {
    return serveMany(b)
  }
}

function serveMany (b) {
  return function serve (req, res, next) {
    function onError (err) {
      sendError(next, err)
    }

    var bundle = build(b, onError)
    sendBundle(req, res, next, bundle)
  }
}

function serveOnce (b) {
  var err
  function onError (err) {
    err = err
  }

  var savedBundle = build(b, onError).pipe(saveStream())

  return function serve (req, res, next) {
    if (err) {
      return sendError(next, err)
    }

    sendBundle(req, res, next, savedBundle.load())
  }
}

function build (b, onError) {
  return b
    .on('error', onError)
    .bundle()
    .on('error', onError)
}

function sendError (next, err) {
  next(httpError(500, err.message, err))
}

function sendBundle (req, res, next, bundle) {
  if (req.method.toLowerCase() === 'get') {
    res.setHeader('Content-Type', 'application/javascript')

    bundle.pipe(res)
  } else {
    next(httpError(404))
  }
}

serveBrowserify.args = browserify.args
