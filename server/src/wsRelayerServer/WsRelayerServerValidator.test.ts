import WsRelayerServerValidator from './WsRelayerServerValidator'
import WsRelayerServerError from './WsRelayerServerError'
const test = require('tape')
const uuidv4 = require('uuid/v4')

test('validateChannel', t => {
  const catchErrorForWrongChannel = () => {
    const validator = new WsRelayerServerValidator()
    try {
      validator.validateChannel(uuidv4())
      return null
    } catch (e) {
      return e
    }
  }

  t.test('should throw error on wrong channel', st => {
    const e = catchErrorForWrongChannel()

    st.ok(e instanceof WsRelayerServerError)
    st.deepEqual(e.serialize(), {
      code: 100,
      reason: 'Wrong channel'
    })

    st.end()
  })
})

const catchErrorForWrongNetworkId = channel => {
  const validator = new WsRelayerServerValidator()
  try {
    validator.validateMessage({
      type: 'subscribe',
      requestId: uuidv4(),
      channel,
      payload: {
        networkId: 1000
      }
    })
    return null
  } catch (e) {
    return e
  }
}

const catchErrorForWrongRequestId = channel => {
  const validator = new WsRelayerServerValidator()
  try {
    validator.validateMessage({
      type: 'subscribe',
      requestId: '',
      channel,
      payload: {}
    })
    return null
  } catch (e) {
    return e
  }
}

test('validateMessage', t => {
  t.test('should throw error on wrong networkId for orders channel', t => {
    const e = catchErrorForWrongNetworkId('orders')
    t.ok(e instanceof WsRelayerServerError)

    t.end()
  })

  t.test('should not throw error on wrong networkId for tradeHistory channel', t => {
    const e = catchErrorForWrongNetworkId('tradeHistory')
    t.ok(!e)
    t.end()
  })

  t.test('should throw error on wrong requestId for orders channel', t => {
    const e = catchErrorForWrongRequestId('orders')
    t.ok(e instanceof WsRelayerServerError)
    t.end()
  })

  t.test('should throw error on wrong requestId for tradeHistory channel', t => {
    const e = catchErrorForWrongRequestId('tradeHistory')
    t.ok(e instanceof WsRelayerServerError)
    t.end()
  })

  t.end()
})
