import test from 'tape-promise/tape'
import { txMinedSchema } from '../schemas'
import Joi from 'joi'
import { BigNumber } from '@0x/utils'
import { initWeb3ByBalance, initBlockchainService, initWeb3, deployWethContract } from 'helpers/testUtils'
import BlockchainService from 'services/BlockchainService'
const wethToken = require('../fixtures/wethToken.json')

/* eslint-env jest */

test('getEthBalance', async t => {
  const balance = 1000

  const web3 = initWeb3ByBalance(balance)
  const blockchainService = new BlockchainService({ web3 })

  const accounts = await blockchainService.getAccounts()
  const balanceInEth = await blockchainService.getEthBalance(accounts[0])

  t.equal(balanceInEth, balance / Math.pow(10, 18))
})

test('sendTransaction', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3({
    accounts: [
      { balance },
      { balance: 0 }
    ]
  })

  const blockchainService = await initBlockchainService(web3)

  const accounts = await web3.eth.getAccounts()

  const rawTx = {
    to: accounts[1],
    from: accounts[0],
    value: web3.utils.toWei('1', 'wei'),
    gas: 21000 * 2
  }

  await blockchainService.sendTransaction(rawTx)

  const balanceInEth = await blockchainService.getEthBalance(accounts[1])
  t.equal(balanceInEth, 1 / Math.pow(10, 18))
})

test('awaitTransaction', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3({
    accounts: [
      { balance }
    ],
    blockTime: 0.5 // seconds
  })

  const blockchainService = await initBlockchainService(web3)

  const accounts = await web3.eth.getAccounts()

  const rawTx = {
    to: accounts[1],
    from: accounts[0],
    value: web3.utils.toWei('1', 'wei'),
    gas: 21000 * 3
  }

  const txHash = await blockchainService.sendTransaction(rawTx)

  let txInfo = await blockchainService.getTransaction(txHash)
  t.equal(txInfo, null)

  await blockchainService.awaitTransaction(txHash)

  txInfo = await blockchainService.getTransaction(txHash)

  const validation = Joi.validate(txInfo, txMinedSchema)
  t.equal(validation.error, null)
})

test('getTokenBalance', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const accounts = await web3.eth.getAccounts()

  const blockchainService = await initBlockchainService(web3)

  const wethAddress = await deployWethContract(blockchainService, accounts[0])

  const result = await blockchainService.getTokenBalance(accounts[0], wethAddress)

  t.equal(result, 0)
})

test('setUnlimitedTokenAllowanceAsync', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const blockchainService = await initBlockchainService(web3)
  const accounts = await blockchainService.getAccounts()

  const wethAddress = await deployWethContract(blockchainService, accounts[0])

  await blockchainService.setUnlimitedTokenAllowanceAsync(accounts[0], wethAddress)
  const isUnlimited = await blockchainService.isUnlimitedTokenAllowance(accounts[0], wethAddress)

  t.equal(isUnlimited, true)
})

test('getTokenAllowance', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const accounts = await web3.eth.getAccounts()

  const blockchainService = await initBlockchainService(web3)

  const wethAddress = await deployWethContract(blockchainService, accounts[0])

  const allowance = await blockchainService.getTokenAllowance(accounts[0], wethAddress)

  t.equal(allowance.isZero(), true)
})

test('setZeroTokenAllowanceAsync', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const accounts = await web3.eth.getAccounts()

  const blockchainService = await initBlockchainService(web3)

  const wethAddress = await deployWethContract(blockchainService, accounts[0])

  await blockchainService.setZeroTokenAllowanceAsync(accounts[0], wethAddress)
  const allowance = await blockchainService.getTokenAllowance(accounts[0], wethAddress)

  t.equal(allowance.isZero(), true)
})

test('makeLimitOrderAsync', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)

  const blockchainService = await initBlockchainService(web3)

  const accounts = await web3.eth.getAccounts()

  const wethAddress = await deployWethContract(blockchainService, accounts[0])
  const wethAddress2 = await deployWethContract(blockchainService, accounts[0])

  const makerToken = {
    ...wethToken,
    address: wethAddress
  }

  const takerToken = {
    ...wethToken,
    address: wethAddress2
  }

  try {
    const signedOrder = await blockchainService.makeLimitOrderAsync(
      accounts[0],
      {
        makerToken,
        makerAmount: new BigNumber(0.01),
        takerToken,
        takerAmount: new BigNumber(0.01)
      }
    )

    t.true(signedOrder.signature)
  } catch (e) {
    console.error('e: ', e)
  }
})
