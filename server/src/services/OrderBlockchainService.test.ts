import { BigNumber } from '@0x/utils'
import BlockchainService from './BlockchainService'
import OrderBlockchainService from './OrderBlockchainService'
import { generateSignedOrder, createProviderByBalance, deployZeroExContracts } from '../utils/testUtils'
const test = require('tape')

test('getOrderInfoAsync', async t => {
  const balance = Math.pow(10, 18).toString()
  const provider = createProviderByBalance(balance)

  const blockchainService = new BlockchainService({
    httpProvider: provider,
    wsProvider: provider
  })

  const web3 = blockchainService.httpWeb3
  const accounts = await web3.eth.getAccounts()

  const contractAddresses = await deployZeroExContracts(web3, accounts[0])

  const orderBlockchainService = new OrderBlockchainService({
    blockchainService,
    networkId: provider.options.network_id,
    contractAddresses
  })

  const signedOrder = generateSignedOrder()

  const result = await orderBlockchainService.getOrderInfoAsync(signedOrder)

  t.ok(result.orderTakerAssetFilledAmount instanceof BigNumber)
  t.ok(result.orderHash)
  t.ok(result.orderStatus)

  t.end()
})
