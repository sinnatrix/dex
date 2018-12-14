import { delay } from '../utils/helpers'
import * as WebSocket from 'ws'
import log from '../utils/log'

class SocketService {
  socket
  url: string

  messageListeners: any[] = []
  queue: any[] = []

  constructor (url: string) {
    this.url = url
  }

  init () {
    this.cleanup()

    this.socket = new WebSocket(this.url)

    this.socket.addEventListener('message', this.handleMessage)
    this.socket.addEventListener('close', this.handleClose)
    this.socket.addEventListener('open', this.handleOpen)
    this.socket.addEventListener('error', this.handleError)
  }

  cleanup () {
    if (this.socket) {
      this.socket.removeEventListener('message', this.handleMessage)
      this.socket.removeEventListener('close', this.handleClose)
      this.socket.removeEventListener('open', this.handleOpen)
      this.socket.removeEventListener('error', this.handleError)

      this.socket.close()
    }
  }

  handleMessage = message => {
    this.messageListeners.forEach(listener => {
      listener(message)
    })
  }

  handleClose = async () => {
    await delay(1000)
    this.init()
  }

  handleOpen = () => {
    this.queue.forEach(one => {
      this.socket.send(one)
    })

    this.queue = []
  }

  handleError = (e) => {
    log.error(`Cannot establish websocket connection with ${this.url}: ${e.message}`)
    this.cleanup()
  }

  addMessageListener (listener) {
    this.messageListeners.push(listener)
  }

  send (message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message)
    } else {
      this.queue.push(message)
    }
  }
}

export default SocketService
