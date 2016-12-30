const _wrapFunction = require('../lib/wrap-function')

function create (Task, methods) {

var wrapFunction = Task ? _wrapFunction.create(Task, methods) : _wrapFunction;

var stdout = {}
stdout.write = wrapFunction(
  'process.stdout.write',
  process.stdout.write.bind(process.stdout)
)

var stderr = {}
stderr.write = wrapFunction(
  'process.stderr.write',
  process.stderr.write.bind(process.stderr)
)

var argv = wrapFunction(
  'process.argv',
  () => process.argv
)()

var exit = wrapFunction(
  'process.exit',
  process.exit
)

var cwd = wrapFunction(
  'process.cwd',
  process.cwd
)

return {
  stdout : stdout,
  stderr : stderr,
  argv : argv,
  exit : exit,
  cwd : cwd
}

}

module.exports = create()
module.exports.create = create
