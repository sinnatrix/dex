import * as R from 'ramda'
import WsRelayerServer from './WsRelayerServer'
import { Server, WebSocket } from 'mock-socket'
const test = require('tape')
const uuidv4 = require('uuid/v4')
const sinon = require('sinon')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const serverMock = () => {}

test('WsRelayerServer subscribe', t => {
  const testSubscriptionToCorrectChannel = async (t, channel) => {
    const subscriptionsStorageMock: any = {
      add: sinon.fake()
    }

    const fakeUrl = `ws://${uuidv4()}`
    const websocketServerFactoryMock = () => new Server(fakeUrl)

    const relayerServer = new WsRelayerServer({
      server: serverMock,
      websocketServerFactory: websocketServerFactoryMock
    }, {
      wsRelayerServerSubscriptionsStorage: subscriptionsStorageMock
    })

    relayerServer.attach()

    const message = {
      type: 'subscribe',
      channel,
      requestId: uuidv4(),
      payload: {}
    }

    const socket = new WebSocket(fakeUrl)
    socket.send(JSON.stringify(message))

    await delay(10)

    t.ok(subscriptionsStorageMock.add.calledOnce)

    t.deepEqual(
      R.dissoc('ws', subscriptionsStorageMock.add.lastCall.args[0]),
      R.dissoc('type', message)
    )

    t.end()
  }

  t.test('should subscribe to orders channel', async t => {
    testSubscriptionToCorrectChannel(t, 'orders')
  })

  t.test('should subscribe to tradeHistory channel', async t => {
    testSubscriptionToCorrectChannel(t, 'tradeHistory')
  })

  t.test('should not subscribe to wrong channel', async t => {
    const fakeUrl = `ws://${uuidv4()}`
    const websocketServerFactoryMock = () => new Server(fakeUrl)

    const relayerServer = new WsRelayerServer({
      server: serverMock,
      websocketServerFactory: websocketServerFactoryMock
    })

    relayerServer.attach()

    const message = {
      type: 'subscribe',
      channel: uuidv4(),
      requestId: uuidv4(),
      payload: {}
    }

    const socket = new WebSocket(fakeUrl)

    let receivedMessage
    socket.onmessage = message => {
      receivedMessage = message
    }

    socket.send(JSON.stringify(message))

    await delay(10)

    t.ok(receivedMessage && receivedMessage.data)
    const data = JSON.parse(receivedMessage.data)

    t.deepEqual(data, { code: 100, reason: 'Wrong channel' })

    t.end()
  })
})

test('WsRelayerServer unsubscribe', t => {
  t.test('should unsubscribe from all channels', async t => {
    const subscriptionsStorageMock: any = {
      remove: sinon.fake()
    }

    const fakeUrl = `ws://${uuidv4()}`
    const websocketServerFactoryMock = () => new Server(fakeUrl)

    const relayerServer = new WsRelayerServer({
      server: serverMock,
      websocketServerFactory: websocketServerFactoryMock
    }, {
      wsRelayerServerSubscriptionsStorage: subscriptionsStorageMock
    })

    relayerServer.attach()

    const message = {
      type: 'unsubscribe'
    }

    const socket = new WebSocket(fakeUrl)
    socket.send(JSON.stringify(message))

    await delay(10)

    t.ok(subscriptionsStorageMock.remove.calledOnce)

    const arg = subscriptionsStorageMock.remove.lastCall.args[0]
    t.ok(arg instanceof WebSocket)

    t.end()
  })

  t.test('should unsubscribe from specified requestId', async t => {
    const subscriptionsStorageMock: any = {
      remove: sinon.fake()
    }

    const fakeUrl = `ws://${uuidv4()}`
    const websocketServerFactoryMock = () => new Server(fakeUrl)

    const relayerServer = new WsRelayerServer({
      server: serverMock,
      websocketServerFactory: websocketServerFactoryMock
    }, {
      wsRelayerServerSubscriptionsStorage: subscriptionsStorageMock
    })

    relayerServer.attach()

    const message = {
      type: 'unsubscribe',
      requestId: uuidv4()
    }

    const socket = new WebSocket(fakeUrl)
    socket.send(JSON.stringify(message))

    await delay(10)

    t.ok(subscriptionsStorageMock.remove.calledOnce)

    const callArgs = subscriptionsStorageMock.remove.lastCall.args
    t.ok(callArgs[0] instanceof WebSocket)
    t.equal(callArgs[1], message.requestId)

    t.end()
  })
})

test('WsRelayerServer pushUpdate', t => {
  t.test('should correctly search for subscribers', async t => {
    const subscriptionsStorageMock: any = {
      find: sinon.fake.returns([])
    }

    const fakeUrl = `ws://${uuidv4()}`
    const websocketServerFactoryMock = () => new Server(fakeUrl)

    const relayerServer = new WsRelayerServer({
      server: serverMock,
      websocketServerFactory: websocketServerFactoryMock
    }, {
      wsRelayerServerSubscriptionsStorage: subscriptionsStorageMock
    })

    const channel = 'orders'
    const payload = {}
    const toFilter = {}
    relayerServer.pushUpdate(channel, payload, toFilter)

    t.ok(subscriptionsStorageMock.find.calledOnce)

    const callArgs = subscriptionsStorageMock.find.lastCall.args
    t.equal(callArgs[0], channel)
    t.equal(callArgs[1], toFilter)

    t.end()
  })
})
