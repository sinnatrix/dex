import { ContractWrappers } from '0x.js'
import BlockchainService from './BlockchainService'
import * as Web3 from 'web3'

class TradeHistoryService {
  blockchainService: BlockchainService
  contractWrappers: ContractWrappers
  contract: any
  provider: any
  web3: any

  constructor ({ blockchainService }) {
    this.blockchainService = blockchainService

    this.contractWrappers = new ContractWrappers(
      this.blockchainService.provider,
      {
        networkId: parseInt(process.env.NETWORK_ID || '', 10)
      }
    )

    this.contract = new this.blockchainService.web3.eth.Contract(
      this.contractWrappers.exchange.abi,
      this.contractWrappers.exchange.address
    )

    this.provider = new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_NODE_URL)
    this.web3 = new Web3(this.provider)
  }

  loadAccountTradeHistoryAsync (address, { fromBlock = 0, toBlock = 'latest'} = {}) {
    return this.contract.getPastEvents(
      'Fill',
      {
        fromBlock,
        toBlock,
        filter: {
          makerAddress: address
        }
      }
    )
  }
}

export default TradeHistoryService
