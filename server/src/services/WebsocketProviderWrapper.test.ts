import WebsocketProviderWrapper from './WebsocketProviderWrapper'
import { delay } from '../utils/helpers'
const ganache = require('ganache-cli')
const test = require('tape')
const Web3 = require('web3')
const sinon = require('sinon')

const makeWebsocketProviderWrapper = (port, connectInterval, pingInterval) => {
  return new WebsocketProviderWrapper({
    makeWebsocketProvider: () => new Web3.providers.WebsocketProvider(`http://127.0.0.1:${port}`)
  }, {
    connectInterval,
    pingInterval
  })
}

test('WebsocketProviderWrapper', t => {
  t.test('connect on delayed server start', async t => {
    const server = ganache.server({ network_id: 50, ws: true })

    const PORT = 17123
    const connectInterval = 10

    const wrapper = makeWebsocketProviderWrapper(PORT, connectInterval, 0)

    const onConnectFake = sinon.fake()
    wrapper.onConnect(onConnectFake)

    wrapper.attach()

    await delay(connectInterval * 4)

    server.listen(PORT)

    await delay(connectInterval * 4)

    t.equal(onConnectFake.callCount, 1)

    wrapper.cleanup()
    server.close()

    t.end()
  })

  t.test('reconnect on server close', async t => {
    const server = ganache.server({ network_id: 50, ws: true })

    const PORT = 17123
    const connectInterval = 10

    server.listen(PORT)

    await delay(10)

    const wrapper = makeWebsocketProviderWrapper(PORT, connectInterval, 0)

    const onConnectFake = sinon.fake()
    wrapper.onConnect(onConnectFake)

    wrapper.attach()

    await delay(connectInterval * 3)

    server.close()

    await delay(connectInterval * 3)

    server.listen(PORT)

    await delay(connectInterval * 3)

    t.equal(onConnectFake.callCount, 2)

    wrapper.cleanup()
    server.close()

    t.end()
  })

  t.test('reconnect on server freezing', async t => {
    const server = ganache.server({ network_id: 50, ws: true })
    const PORT = 17123
    server.listen(PORT)

    const server2 = ganache.server({ network_id: 50, ws: true })
    const PORT2 = 17124
    server2.listen(PORT2)

    await delay(10)

    const connectInterval = 10
    const pingInterval = 50

    let port = PORT
    const wrapper = new WebsocketProviderWrapper({
      makeWebsocketProvider: () => new Web3.providers.WebsocketProvider(`http://127.0.0.1:${port}`)
    }, {
      connectInterval,
      pingInterval
    })

    const onConnectFake = sinon.fake()
    wrapper.onConnect(onConnectFake)

    wrapper.attach()

    await delay(connectInterval * 3)

    server.provider.send = () => {}
    port = PORT2

    await delay(pingInterval * 3)

    await delay(pingInterval * 3)

    t.equal(onConnectFake.callCount, 2)

    wrapper.cleanup()
    server.close()
    server2.close()

    t.end()
  })
})
