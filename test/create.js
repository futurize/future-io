import test from 'ava'
import lib from '../lib'
import Task from 'fluture'
import extract from './helpers/extract'
import extractTask from './helpers/extractTask'

({
  IO,
  unsafePerform,
  fakePerform,
  wrapFunction
} = lib.create(Task, { of: 'of', rejected: 'reject', orElse: 'chainRej' }))


test('should work with alternative Task implementation', async (t) => {
  const f1 = wrapFunction('f1', (x) => Task.of(x * 2))
  const f2 = wrapFunction('f2', (x) => Promise.resolve(x + 1))

  const io = f1(1).chain(f2)

  const value1 = await extract(io)
  t.is(value1, 3)

  const rej = wrapFunction('rejected', (x) => Task.reject('rejected'))
  const rejectedTask = extractTask(f1(1).chain(rej))

  const value2 = await rejectedTask.swap().promise()
  t.is(value2, 'rejected')
})
