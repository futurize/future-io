const daggy = require('daggy')
const Task = require('data.task')
const $ = require('./types')

const _IO = daggy.tagged('interpret')


function create (Task, methods) {

Tof = methods.of ? methods.of : 'of'
rejected = methods.rejected ? methods.rejected : 'rejected'
orElse = methods.orElse ? methods.orElse : 'orElse'

const IO = $.def(
  'IO',
  {},
  [$.Function, $.$IO($.a)],
  function (interpret) {
    const _interpret = $.def(
      'interpret',
      {},
      [$.Function, $.$Task($.a)],
      interpret
    )
    return new _IO(_interpret)
  }
)

IO.of = function of (x) {
  return new _IO(
    (interpreter) => Task[Tof](x)
  )
}

IO.error = function error (x) {
  return new _IO(
    (interpreter) => Task[rejected](x)
  )
}

_IO.prototype['@@type'] = 'future-io/IO'

_IO.prototype.toString = () => 'IO'
_IO.prototype.inspect = () => 'IO'

_IO.prototype.chain = method($.def(
  'IO#chain',
  {},
  [$.$IO($.a), $.Function, $.$IO($.b)],
  function chain (io, g) {
    const _g = $.def(
      'f in IO#chain(f)',
      {},
      [$.a, $.$IO($.b)],
      g
    )
    return new _IO(
      (interpreter) => io.interpret(interpreter).chain(
        (x) => _g(x).interpret(interpreter)
      )
    )
  }
))

_IO.prototype.ap = method($.def(
  'IO#ap',
  {},
  [$.$IO($.Function), $.$IO($.a), $.$IO($.b)],
  function ap (io, m) {
    return io.chain((f) => m.map(f))
  }
))

_IO.prototype.map = method($.def(
  'IO#map',
  {},
  [$.$IO($.a), $.Function, $.$IO($.b)],
  function map (io, f) {
    return io.chain((x) => IO.of(f(x)))
  }
))

_IO.prototype.catch = method($.def(
  'IO#catch',
  {},
  [$.$IO($.a), $.Function, $.$IO($.b)],
  function _catch (io, g) {
    const _g = $.def(
      'f in IO#catch(f)',
      {},
      [$.a, $.$IO($.b)],
      g
    )
    return new _IO(
      (interpreter) => io.interpret(interpreter)[orElse](
        (x) => _g(x).interpret(interpreter)
      )
    )
  }
))

_IO.prototype.run = method($.def(
  'IO#run',
  {},
  [$.$IO($.a), $.Function, $.Undefined],
  function run (io, interpreter) {
    const _interpreter = $.def(
      'interpreter',
      {},
      [$.String, $.Function, $.Array($.Any), $.$Task($.a)],
      interpreter
    )
    const noop = () => {}
    // When encountering an error, throw it outside of all contexts.
    const onIoError = (err) => setImmediate(() => { throw err })
    io.interpret(_interpreter).fork(onIoError, noop)
  }
))

return IO

}

// Create a `method` by taking an ordinary function and pre-applying `this` as its first agument.
function method (f) {
  return function () {
    const args = [this].concat(Array.prototype.slice.call(arguments))
    return f.apply(null, args)
  }
}

module.exports = create(Task,{})
module.exports.create = create
