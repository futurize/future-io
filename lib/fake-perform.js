const Channel = require('./channel')
const Task = require('data.task')
const $ = require('./types')


function create (Task) {

function fakePerform (io) {
  const callChannel = new Channel()
  const resultChannel = new Channel()

  const interpreter = (name, run, args) => {
    return new Task((reject, resolve) => {
      callChannel.put({ name, args })
        .then(() => resultChannel.take())
        .then((result) =>
          result.error ? reject(result.error) : resolve(result.value)
        )
    })
  }

  io.interpret(interpreter).fork(
    (err) => callChannel.put({ name: 'end', args: [err] }),
    () => callChannel.put({ name: 'end', args: [] })
  )

  function take (type) {
    const stack = (new Error()).stack
    return callChannel.take().then(call => {
      if (call.name === type) {
        return call.args
      } else {
        return Promise.reject(errorWithStack(
          `Expected io "${type}" call but got "${call.name}" call instead.`,
          stack
        ))
      }
    })
  }

  function put (value) {
    resultChannel.put({ value })
  }

  function error (error) {
    resultChannel.put({ error })
  }

  return { take, put, error }
}

function errorWithStack (msg, stack) {
  const error = new Error(msg)
  error.stack = stack
  return error
}

return $.def(
  'fakePerform',
  {},
  [$.$IO($.a), $.Object],
  fakePerform
)

}

module.exports = create(Task)
module.exports.create = create
