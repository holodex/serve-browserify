var httpError = require('http-errors')
var browserify = require('browserify-incremental')

module.exports = serveBrowserify

function serveBrowserify (files, opts) {
  var b = browserify(files, opts)

  return function serve (req, res, next) {

    function onError (err) {
      next(httpError(500, err.message, err))
    }

    if (req.method.toLowerCase() === 'get') {
      res.setHeader('Content-Type', 'application/javascript')

      b
      .on('error', onError)
      .bundle()
      .on('error', onError)
      .pipe(res)
    } else {
      next(httpError(404))
    }
  }
}

serveBrowserify.args = browserify.args
