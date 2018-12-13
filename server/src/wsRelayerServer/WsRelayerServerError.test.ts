import WsRelayerServerError from './WsRelayerServerError'
const test = require('tape')

test('should be correct instance on throw', t => {
  try {
    throw new WsRelayerServerError('some error', 1000)
  } catch (e) {
    t.ok(e instanceof WsRelayerServerError)
  }

  t.end()
})

test('should preserve correct message and code properties and serialize should return message and code', t => {
  const reason = 'some error'
  const code = 100012
  try {
    throw new WsRelayerServerError(reason, code)
  } catch (e) {
    t.equal(e.code, code)
    t.equal(e.message, reason)
    t.deepEqual(e.serialize(), { reason, code })
  }
  t.end()
})

test('serialize result should contain validation errors if they were passed', t => {
  const reason = 'some error'
  const code = 100072
  const validationErrors = [
    {
      field: 'some field',
      code: 1234,
      reason: 'some reason'
    }
  ]

  try {
    throw new WsRelayerServerError(reason, code, validationErrors)
  } catch (e) {
    t.equal(e.validationErrors, validationErrors)
    t.deepEqual(e.serialize(), { reason, code, validationErrors })
  }
  t.end()
})
