import * as test from 'tape'

test('global after', t => {
  t.end()

  process.exit()
})
