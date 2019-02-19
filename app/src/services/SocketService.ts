import { delay } from 'helpers/general'

class SocketService {
  socket
  url: string

  messageListeners: any[] = []
  queue: any[] = []

  pingTimeoutFn?: number
  pingTimeoutMs: number = 40000

  constructor (url) {
    this.url = url
  }

  init () {
    if (this.socket) {
      this.socket.removeEventListener('message', this.handleMessage)
      this.socket.removeEventListener('close', this.handleClose)
      this.socket.removeEventListener('open', this.handleOpen)
    }

    this.socket = new WebSocket(this.url)

    this.socket.addEventListener('ping', this.handlePing)
    this.socket.addEventListener('message', this.handleMessage)
    this.socket.addEventListener('close', this.handleClose)
    this.socket.addEventListener('open', this.handleOpen)
  }

  handlePing = () => {
    this.heartbeat()
  }

  handleMessage = message => {
    this.messageListeners.forEach(listener => {
      listener(message)
    })
  }

  handleClose = async () => {
    clearTimeout(this.pingTimeoutFn)
    await delay(1000)
    this.init()
  }

  handleOpen = () => {
    this.heartbeat()

    this.queue.forEach(one => {
      this.socket.send(one)
    })

    this.queue = []
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

  heartbeat () {
    clearTimeout(this.pingTimeoutFn)

    this.pingTimeoutFn = window.setTimeout(this.socket.terminate, this.pingTimeoutMs)
  }
}

export default SocketService
