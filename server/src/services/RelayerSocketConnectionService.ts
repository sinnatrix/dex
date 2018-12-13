import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import RelayerRepository from '../repositories/RelayerRepository'
import { IWsRelayer } from '../types'
import { convertOrderToDexFormat } from '../utils/helpers'
import SocketService from './SocketService'
import wsRelayerServerFacade from '../wsRelayerServer/WsRelayerServerFacade'
import OrderRepository from '../repositories/OrderRepository'

const uuidv4 = require('uuid/v4')

export default class RelayerSocketConnectionService {
  networkId: number
  relayerRepository: RelayerRepository
  orderRepository: OrderRepository
  socketServices: SocketService[] = []
  wsRelayerServer: WsRelayerServer
  websocketClientFactory: any

  constructor ({ connection, networkId, wsRelayerServer, websocketClientFactory }) {
    this.networkId = networkId
    this.relayerRepository = connection.getCustomRepository(RelayerRepository)
    this.orderRepository = connection.getCustomRepository(OrderRepository)
    this.wsRelayerServer = wsRelayerServer
    this.websocketClientFactory = websocketClientFactory
  }

  async attach () {
    const relayers = await this.relayerRepository.getAllActiveWithWsEndpoint()
    for (let relayer of relayers) {
      await this.subscribeToOrders(relayer)
    }
  }

  async subscribeToOrders (relayer: IWsRelayer) {
    console.log(`Subscribe to ${relayer.name}`)

    const socketService = this.websocketClientFactory(relayer.sraWsEndpoint)
    socketService.init()

    const message = {
      type: 'subscribe',
      channel: 'orders',
      requestId: uuidv4(),
      payload: {}
    }

    socketService.send(JSON.stringify(message))

    socketService.addMessageListener(this.handleRelayerMessage.bind(this))

    this.socketServices.push(socketService)
  }

  async handleRelayerMessage (message) {
    const { type, channel, payload } = JSON.parse(message.data)

    if (type === 'update' && channel === 'orders') {
      await this.saveOrdersAndPush(payload)
    }
  }

  async saveOrdersAndPush (payload) {
    const recordsToSave = payload.map(convertOrderToDexFormat)
    await this.orderRepository.insertIgnore(recordsToSave)
    wsRelayerServerFacade.pushOrders(this.wsRelayerServer, payload)
  }

  cleanup () {
    this.socketServices.forEach(socketService => {
      socketService.cleanup()
    })
  }
}
