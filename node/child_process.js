const wrapFunction = require('../lib/wrap-function')
const childProcess = require('mz/child_process')

const api = Object.keys(childProcess)

api.forEach((name) => {
  if (typeof childProcess[name] === 'function') {
    exports[name] = wrapFunction('childProcess.' + name, childProcess[name])
  }
})
