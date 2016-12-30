import test from 'ava'
import IO from '../lib/io'
import ioProcess from '../node/process'
import fakePerform from '../lib/fake-perform'

import Task from 'fluture'
import lib from '../lib'


test('happy flow', async (t) => {
  const io = ioProcess.cwd().chain(ioProcess.stdout.write)
  const { put, take } = fakePerform(io)
  const cwd = '/home/foo'

  await take('process.cwd')
  put(cwd)

  const [ loggedCwd ] = await take('process.stdout.write')
  t.is(loggedCwd, cwd)
  put()

  const [ ioError ] = await take('end')
  t.falsy(ioError)
})

test('using `IO.of`', async (t) => {
  const io = IO.of('foo').chain(ioProcess.stdout.write)
  const { put, take } = fakePerform(io)

  const [ loggedString ] = await take('process.stdout.write')
  t.is(loggedString, 'foo')
  put()

  const [ ioError ] = await take('end')
  t.falsy(ioError)
})

test('using `IO.error`', async (t) => {
  const error = new Error('ioError')
  const io = IO.error(error)
  const { take } = fakePerform(io)

  const [ ioError ] = await take('end')
  t.is(ioError, error)
})

test('throwing an io error', async (t) => {
  const io = ioProcess.cwd().chain(ioProcess.stdout.write)
  const { error, take } = fakePerform(io)

  await take('process.cwd')
  const cwdError = new Error('cwd failed')
  error(cwdError)

  const [ ioError ] = await take('end')
  t.is(ioError, cwdError)
})

test('expecting the wrong call', async (t) => {
  const io = ioProcess.cwd().chain(ioProcess.stdout.write)
  const { take } = fakePerform(io)

  const failingTake = take('wrongCall')
  t.throws(
    failingTake,
    'Expected io "wrongCall" call but got "process.cwd" call instead.'
  )
})

test('waiting for a call that doesn\'t come', async (t) => {
  const io = IO.of('foo')
  const { take } = fakePerform(io)

  const failingTake = take('wrongCall')
  t.throws(
    failingTake,
    'Expected io "wrongCall" call but got "end" call instead.'
  )
})

test('catching an io error', async (t) => {
  const io = ioProcess.cwd()
    .catch((error) => IO.of(error.message))
    .chain(ioProcess.stdout.write)
  const { put, error, take } = fakePerform(io)

  await take('process.cwd')
  const cwdError = new Error('cwd failed')
  error(cwdError)

  const [ loggedString ] = await take('process.stdout.write')
  t.is(loggedString, cwdError.message)
  put()

  const [ ioError ] = await take('end')
  t.falsy(ioError)
})


test('catching an io error with custom Task', async (t) => {

  var methodMap = { of: 'of', rejected: 'reject', orElse: 'chainRej' }
  var libCustomTask = lib.create(Task, methodMap)

  var fakePerformCustomTask = libCustomTask.fakePerform
  var IOCustomTask = libCustomTask.IO
  var ioProcessCustomTask = ioProcess.create(Task, methodMap)

  const io = ioProcessCustomTask.cwd()
    .catch((error) => IOCustomTask.of(error.message))
    .chain(ioProcessCustomTask.stdout.write)
  const { put, error, take } = fakePerformCustomTask(io)

  await take('process.cwd')
  const cwdError = new Error('cwd failed')
  error(cwdError)

  const [ loggedString ] = await take('process.stdout.write')
  t.is(loggedString, cwdError.message)
  put()

  const [ ioError ] = await take('end')
  t.falsy(ioError)
})
