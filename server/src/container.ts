import * as WebSocket from 'ws'
import WsRelayerServer from './wsRelayerServer/WsRelayerServer'
import V1OwnController from './controllers/V1OwnController'
import V2RelayerController from './controllers/V2RelayerController'
import WebsocketProviderWrapper from './services/WebsocketProviderWrapper'
import TransactionBlockchainService from './services/TransactionBlockchainService'
import OrderBlochainService from './services/OrderBlockchainService'
import TradeHistoryService from './services/TradeHistoryService'
import OrderService from './services/OrderService'
import SocketService from './services/SocketService'
import RelayerService from './services/RelayerService'
import RelayerSocketConnectionService from './services/RelayerSocketConnectionService'
import RelayerRepository from './repositories/RelayerRepository'
import OrderRepository from './repositories/OrderRepository'
import TradeHistoryRepository from './repositories/TradeHistoryRepository'
import AssetRepository from './repositories/AssetRepository'
import AssetPairRepository from './repositories/AssetPairRepository'
import MarketService from './services/MarketService'

const Web3 = require('web3')
const { createContainer, asValue, asClass } = require('awilix')

const makeHttpProvider = () => {
  return new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_NODE_URL as string)
}

const makeWebsocketProvider = () => {
  return new Web3.providers.WebsocketProvider(process.env.WS_INFURA_HOST as string)
}

const websocketServerFactory = options => new WebSocket.Server(options)

const websocketClientFactory = (url: string): SocketService => new SocketService(url)

const createAppContainer = ({ connection }) => {
  const container = createContainer()

  container.register({
    connection: asValue(connection),
    networkId: asValue(parseInt(process.env.NETWORK_ID as string, 10)),
    wsRelayerServer: asClass(WsRelayerServer).singleton(),
    v1OwnController: asClass(V1OwnController).singleton(),
    v2RelayerController: asClass(V2RelayerController).singleton(),
    contractAddresses: asValue(undefined),
    httpProvider: asValue(makeHttpProvider()),
    makeWebsocketProvider: asValue(makeWebsocketProvider),
    websocketProviderWrapper: asClass(WebsocketProviderWrapper).singleton(),
    transactionBlockchainService: asClass(TransactionBlockchainService).singleton(),
    orderBlockchainService: asClass(OrderBlochainService).singleton(),
    tradeHistoryService: asClass(TradeHistoryService).singleton(),
    websocketServerFactory: asValue(websocketServerFactory),
    websocketClientFactory: asValue(websocketClientFactory),
    orderService: asClass(OrderService).singleton(),
    relayerService: asClass(RelayerService).singleton(),
    relayerSocketConnectionService: asClass(RelayerSocketConnectionService).singleton(),
    relayerRepository: asValue(connection.getCustomRepository(RelayerRepository)),
    orderRepository: asValue(connection.getCustomRepository(OrderRepository)),
    tradeHistoryRepository: asValue(connection.getCustomRepository(TradeHistoryRepository)),
    assetRepository: asValue(connection.getCustomRepository(AssetRepository)),
    assetPairRepository: asValue(connection.getCustomRepository(AssetPairRepository)),
    marketService: asClass(MarketService).singleton()
  })

  return container
}

export default createAppContainer
