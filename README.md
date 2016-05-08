# future-io
[![NPM version](http://img.shields.io/npm/v/future-io.svg?style=flat-square)](https://www.npmjs.com/package/future-io)
[![Build status](http://img.shields.io/travis/futurize/future-io/master.svg?style=flat-square)](https://travis-ci.org/futurize/future-io)
[![Dependencies](https://img.shields.io/david/futurize/future-io.svg?style=flat-square)](https://david-dm.org/futurize/future-io)

A [fantasy-land](https://github.com/fantasyland/fantasy-land) compliant monadic IO library for Node.js.

Building a simple cli that tells you if a number is even can look something like this:

```js
#!/usr/bin/node

const io = require('future-io')
const ioProcess = require('future-io/node/process')

const even = ioProcess.argv
  .map(argv => (parseInt(argv[2]) % 2) === 0)
  .chain(even => ioProcess.stdout.write('Is even: ' + even))

io.unsafePerform(even)
```

# API

## IO-returning functions
To get you started fast this library mimics the interface of the native node modules.
It just returns io's instead of taking callbacks!

Getting complete coverage of all io related functionality in node is still a work in progress.
If you're missing something, please feel free to open an issue or pull request.

At the moment the following modules are exported.
For some recipes demonstrating their use check out the examples directory.

### `future-io/node/console`

### `future-io/node/fs`

### `future-io/node/module`

### `future-io/node/process`

### `future-io/node/child_process`

## performing IO actions

### `unsafePerform :: IO e a -> ()`
This will execute the io.
If the io represents an error value, this function will throw.
If this is not what you want, use `IO.prototype.catch`.

## IO methods
IO implements the [fantasy-land](https://github.com/fantasyland/fantasy-land) Functor, Apply and Monad specifications.

### `IO.of :: a -> IO e a`

### `IO.error :: e -> IO e a`

### `IO.prototype.map :: IO e a ~> (a -> b) -> IO e b`

### `IO.prototype.ap :: IO e (a -> b) ~> IO e a -> IO e b`

### `IO.prototype.chain :: IO e a ~> (a -> IO e b) -> IO e b`

### `IO.prototype.catch :: IO e a ~> (e -> IO f a) -> IO f a`

## Wrapping custom IO functions
Often you'll find the need to define your own io returning functions, or wrap functions provided by a library.
Luckily, this is very simple:

```js
  const io = require('future-io')

  // Wrapping a function performing some side effects in an IO.
  // The `customOperation` function should return a promise, task or plan value.
  const customIO = io.wrapMethod(
    'customOperation',
    customOperation
  )
```

# Testing
Testing code performing a lot of IO is usually pretty painful.
Not so when using future-io!

Simply use `fakePerform` instead of `unsafePerform` to execute your IO actions in tests.
Now you can step through your io functions step by step,
checking the arguments being passed in and choosing values to return.

`fakePerform()` return an object with three methods:
- `take(actionName)`: Proceed until the next action call.
  Assert it has type `actionName`.
  Return a promise containg the arguments the action is being called with as an array
- `put(returnValue)`: Call after a `take` resolves to send a return value.
  Also call this when not returning a value, to ensure execution of the IO continues.
- `error(ioError)`: Like `put`, but returns an error value.

When the io execution finishes, fakePerform triggers a last `end` action.
This action is passed an `ioError`, if one exists, in the first-argument position.


## Example using [ava](https://github.com/sindresorhus/ava) and async/await
```js
import test from 'ava'
import io from 'future-io'
import ioProcess from 'future-io/node/process'

test('logging the current working directory', async t => {
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
```

## Example using [mocha](https://github.com/sindresorhus/ava) and [co](https://github.com/tj/co)
```js
import co from 'co'
import io from 'future-io'
import assert from 'assert'

it('logs the current working directory', co.wrap(function* () {
  const io = ioProcess.cwd().chain(ioProcess.stdout.write)
  const { put, take } = fakePerform(io)
  const cwd = '/home/foo'

  yield take('process.cwd')
  yield put(cwd)

  const [ loggedCwd ] = yield take('process.stdout.write')
  assert.equal(loggedCwd, cwd)
  put()

  const [ ioError ] = yield take('end')
  assert.ifError(ioError)
}))
```
