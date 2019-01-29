import * as WebSocket from 'ws'
import { createContainer, asValue, asClass } from 'awilix'
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
import JobRepository from './repositories/JobRepository'
import AssetRepository from './repositories/AssetRepository'
import AssetPairRepository from './repositories/AssetPairRepository'
import MarketService from './services/MarketService'
import JobService from './services/JobService'
import CronService from './services/CronService'
import CheckActiveOrdersTask from './tasks/CheckActiveOrdersTask'
import FillOrderTask from './tasks/FillOrderTask'
import LoadOrderbookTask from './tasks/LoadOrderbookTask'
import LoadOrdersTask from './tasks/LoadOrdersTask'
import LoadRelayersTask from './tasks/LoadRelayersTask'
import LoadTokenIconsTask from './tasks/LoadTokenIconsTask'
import LoadTradeHistoryTask from './tasks/LoadTradeHistoryTask'
import SeedTask from './tasks/SeedTask'
import SendEthTask from './tasks/SendEthTask'
import ValidateOrderTask from './tasks/ValidateOrderTask'

const Web3 = require('web3')

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
    container: asValue(container),
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
    jobRepository: asValue(connection.getCustomRepository(JobRepository)),
    marketService: asClass(MarketService).singleton(),
    jobService: asClass(JobService).singleton(),
    cronService: asClass(CronService).singleton(),
    checkActiveOrdersTask: asClass(CheckActiveOrdersTask),
    fillOrderTask: asClass(FillOrderTask),
    loadOrderbookTask: asClass(LoadOrderbookTask),
    loadOrdersTask: asClass(LoadOrdersTask),
    loadRelayersTask: asClass(LoadRelayersTask),
    loadTokenIconsTask: asClass(LoadTokenIconsTask),
    loadTradeHistoryTask: asClass(LoadTradeHistoryTask),
    seedTask: asClass(SeedTask),
    sendEthTask: asClass(SendEthTask),
    validateOrderTask: asClass(ValidateOrderTask)
  })

  return container
}

export default createAppContainer
