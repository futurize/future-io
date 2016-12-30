// extract :: IO e a -> Promise { name :: String, args :: Array *, error :: e, value :: a }
function extractTask (io) {
  const interpreter = (name, f, args) => f.apply(null, args)
  return io.interpret(interpreter)
}

module.exports = extractTask
