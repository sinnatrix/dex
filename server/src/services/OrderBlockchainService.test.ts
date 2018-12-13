import { BigNumber } from '@0x/utils'
import OrderBlockchainService from './OrderBlockchainService'
import { generateSignedOrder, createProviderByBalance, deployZeroExContracts } from '../utils/testUtils'
const test = require('tape')
const Web3 = require('web3')

test('getOrderInfoAsync', async t => {
  const balance = Math.pow(10, 18).toString()
  const provider = createProviderByBalance(balance)

  const web3 = new Web3(provider)
  const accounts = await web3.eth.getAccounts()

  const contractAddresses = await deployZeroExContracts(web3, accounts[0])

  const orderBlockchainService = new OrderBlockchainService({
    networkId: provider.options.network_id,
    contractAddresses,
    websocketProviderWrapper: {} as any,
    httpProvider: provider
  })

  const signedOrder = generateSignedOrder()

  const result = await orderBlockchainService.getOrderInfoAsync(signedOrder)

  t.ok(result.orderTakerAssetFilledAmount instanceof BigNumber)
  t.ok(result.orderHash)
  t.ok(result.orderStatus)

  t.end()
})
