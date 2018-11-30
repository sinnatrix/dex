import * as WebSocket from 'ws'

export default () => options => new WebSocket.Server(options)
