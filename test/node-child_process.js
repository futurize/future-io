import test from 'ava'
import childProcess from '../node/child_process'
import extract from './helpers/extract'

// librarization of `childProcess` is generic, so we're just testing a single module here.
test('childProcess.spawn', async (t) => {
  const io = childProcess
    .exec('ls ./fixtures')
  const [value] = await extract(io)
  t.deepEqual(value, 'test-module.js\n')
})
