const $ = require('sanctuary-def')
const a = $.TypeVariable('a')
const b = $.TypeVariable('b')
const $IO = $.UnaryType(
  'future-io/IO',
  (x) => x && x['@@type'] === 'future-io/IO',
  () => []
)
const $Task = $.UnaryType(
  'Task',
  (x) => x && typeof x.fork === 'function',
  () => []
)
const env = $.env.concat([
  $IO,
  $Task
])
const def = $.create({ checkTypes: true, env })

module.exports = Object.assign({ def, a, b, $IO, $Task }, $)
