IO = require('./io')
unsafePerform = require('./unsafe-perform')
fakePerform = require('./fake-perform')
wrapFunction = require('./wrap-function')

function create (Task, methodMap) {
  return {
    IO : IO.create(Task, methodMap),
    unsafePerform : unsafePerform,
    fakePerform : fakePerform.create(Task, methodMap),
    wrapFunction : wrapFunction.create(Task, methodMap)
  }
}

module.exports = {
  IO : IO,
  unsafePerform : unsafePerform,
  fakePerform : fakePerform,
  wrapFunction : wrapFunction,
  create : create
}


