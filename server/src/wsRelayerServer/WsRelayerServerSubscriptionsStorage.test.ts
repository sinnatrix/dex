import WsRelayerServerSubscriptionsStorage from './WsRelayerServerSubscriptionsStorage'
import WsRelayerServerSubscription from './WsRelayerServerSubscription'
const test = require('tape')
const uuidv4 = require('uuid/v4')

test('add', t => {
  t.test('should add subscription', t => {
    const storage = new WsRelayerServerSubscriptionsStorage()
    const subscription = new WsRelayerServerSubscription({} as any)

    storage.add(subscription)

    t.equal(storage.getAll()[0], subscription)

    t.end()
  })
})

test('remove', t => {
  t.test('should remove subscriptions by ws instance', t => {
    const storage = new WsRelayerServerSubscriptionsStorage()
    const ws: any = {}
    const ws2: any = {}

    const subscription1: any = new WsRelayerServerSubscription({ ws } as any)
    const subscription2: any = new WsRelayerServerSubscription({ ws: ws2 } as any)

    storage.add(subscription1)
    storage.add(subscription1)
    storage.add(subscription2)

    storage.remove(ws)

    t.deepEqual(storage.getAll(), [ subscription2 ])

    t.end()
  })

  t.test('should remove subscriptions by ws instance and requestId', t => {
    const storage = new WsRelayerServerSubscriptionsStorage()
    const ws: any = {}
    const ws2: any = {}

    const requestId = uuidv4()
    const requestId2 = uuidv4()

    const subscription1: any = new WsRelayerServerSubscription({ ws, requestId } as any)
    const subscription2: any = new WsRelayerServerSubscription({ ws, requestId: requestId2 } as any)
    const subscription3: any = new WsRelayerServerSubscription({ ws: ws2, requestId } as any)
    const subscription4: any = new WsRelayerServerSubscription({ ws: ws2, requestId: requestId2 } as any)

    storage.add(subscription1)
    storage.add(subscription2)
    storage.add(subscription3)
    storage.add(subscription4)

    storage.remove(ws, requestId)

    t.deepEqual(storage.getAll(), [
      subscription2,
      subscription3,
      subscription4
    ])

    t.end()
  })
})

test('find', t => {
  t.test('should search by channel and data', t => {
    const storage = new WsRelayerServerSubscriptionsStorage()

    const channel = uuidv4()
    const channel2 = uuidv4()

    const key = uuidv4()

    const subscription1: any = new WsRelayerServerSubscription({
      channel,
      payload: { key }
    } as any)

    const subscription2: any = new WsRelayerServerSubscription({
      channel,
      payload: { key: uuidv4() }
    } as any)

    const subscription3: any = new WsRelayerServerSubscription({
      channel: channel2,
      payload: { key }
    } as any)

    const subscription4: any = new WsRelayerServerSubscription({
      channel: channel2,
      payload: { key: uuidv4() }
    } as any)

    storage.add(subscription1)
    storage.add(subscription2)
    storage.add(subscription3)
    storage.add(subscription4)

    const result = storage.find(channel, [ { key } ])

    t.deepEqual(result, [ subscription1 ])

    t.end()
  })
})
