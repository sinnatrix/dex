import WsRelayerServer from '../wsRelayerServer/WsRelayerServer'
import RelayerRepository from '../repositories/RelayerRepository'
import { ISRA2Order, IWsRelayer } from '../types'
import { convertOrderToDexFormat } from '../utils/helpers'
import SocketService from './SocketService'
import wsRelayerServerFacade from '../wsRelayerServer/WsRelayerServerFacade'
import OrderRepository from '../repositories/OrderRepository'
import log from '../utils/log'

const uuidv4 = require('uuid/v4')

export default class RelayerSocketConnectionService {
  networkId: number
  relayerRepository: RelayerRepository
  orderRepository: OrderRepository
  socketServices: SocketService[] = []
  wsRelayerServer: WsRelayerServer
  websocketClientFactory: any

  constructor ({
     networkId,
     relayerRepository,
     orderRepository,
     wsRelayerServer,
     websocketClientFactory
  }) {
    this.networkId = networkId
    this.relayerRepository = relayerRepository
    this.orderRepository = orderRepository
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
    log.info(`Subscribing to ${relayer.name}`)

    const socketService = this.websocketClientFactory(relayer.sraWsEndpoint)
    socketService.init()

    const message = {
      type: 'subscribe',
      channel: 'orders',
      requestId: uuidv4(),
      payload: {}
    }

    socketService.send(JSON.stringify(message))
    socketService.addMessageListener(message => this.handleRelayerMessage(relayer, message))
    this.socketServices.push(socketService)
  }

  async handleRelayerMessage (relayer: IWsRelayer, message) {
    const { type, channel, payload: orders } = JSON.parse(message.data)

    if (type === 'update' && channel === 'orders') {
      const ordersToSave = orders.map(order => ({
        relayerId: relayer.id,
        ...convertOrderToDexFormat(order)
      }))

      await this.orderRepository.insertIgnore(ordersToSave)
      wsRelayerServerFacade.pushOrders(this.wsRelayerServer, orders)
    }
  }

  cleanup () {
    this.socketServices.forEach(socketService => {
      socketService.cleanup()
    })
  }
}
