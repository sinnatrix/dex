const Web3 = require('web3')
const log = require('../utils/log').default.child({ file: 'WebsocketProviderWrapper' })

class WebsocketProviderWrapper {
  provider
  makeWebsocketProvider
  connected: boolean = false

  connectInterval: number
  pingInterval: number

  connectIntervalTimer: any
  pingIntervalTimer: any

  onConnectListeners: Function[] = []
  onEndListeners: Function[] = []

  constructor ({ makeWebsocketProvider }, { connectInterval = 5000, pingInterval = 10000 } = {}) {
    this.makeWebsocketProvider = makeWebsocketProvider
    this.connectInterval = connectInterval
    this.pingInterval = pingInterval
  }

  cleanup () {
    clearInterval(this.connectIntervalTimer)
    clearInterval(this.pingIntervalTimer)

    this.onConnectListeners = []
    this.onEndListeners = []
    this.resetProvider()
  }

  resetProvider () {
    if (!this.provider) {
      return
    }

    this.provider.removeAllListeners('connect')
    this.provider.removeAllListeners('end')
    this.provider.removeAllListeners('error')

    this.provider.disconnect()
  }

  attach () {
    this.connect()

    this.pollConnect()
    this.pollPing()
  }

  pollConnect () {
    this.connectIntervalTimer = setInterval(() => {
      if (!this.isConnected()) {
        log.info('Trying to reconnect...')
        this.connect()
      }
    }, this.connectInterval)
  }

  pollPing () {
    if (!this.pingInterval) {
      return
    }

    this.pingIntervalTimer = setInterval(async () => {
      if (!this.isConnected()) {
        return
      }

      await this.pingWithTimeout()
    }, this.pingInterval)
  }

  async pingWithTimeout () {
    const timeout = ms => new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id)
        const error = `Ping timed out in ${ms}ms.`
        reject(error)
      }, ms)
    })

    try {
      await Promise.race([
        timeout(this.pingInterval / 2),
        this.ping()
      ])
    } catch (e) {
      log.warn('ping timeout')
      this.connected = false
    }
  }

  async ping () {
    const web3 = new Web3(this.provider)
    await web3.eth.getBlockNumber()
  }

  connect () {
    this.resetProvider()

    this.provider = this.makeWebsocketProvider()

    this.provider.on('connect', () => {
      this.connected = true
      log.info('connect event')

      this.onConnectListeners.forEach(listener => {
        listener()
      })
    })

    this.provider.on('end', e => {
      this.connected = false
      log.error('wsProvider end. reason: ', e.reason)

      this.onEndListeners.forEach(listener => {
        listener()
      })
    })

    this.provider.on('error', e => {
      // console.error(e)
      log.error('wsProvider error')
    })
  }

  onConnect (listener) {
    if (this.isConnected()) {
      process.nextTick(listener)
    } else {
      this.onConnectListeners.push(listener)
    }
  }

  onEnd (listener) {
    this.onEndListeners.push(listener)
  }

  isConnected () {
    return this.connected
  }

  getProvider () {
    if (!this.isConnected()) {
      return null
    }

    return this.provider
  }
}

export default WebsocketProviderWrapper
