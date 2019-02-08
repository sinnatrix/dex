import test from 'tape'
import { txMinedSchema } from 'schemas'
import Joi from 'joi'
import { BigNumber } from '@0x/utils'
import { initWeb3ByBalance, initBlockchainService, initWeb3, deployWethContract } from 'helpers/testUtils'
import BlockchainService from './BlockchainService'
const wethToken = require('fixtures/wethToken.json')

/* eslint-env jest */

test('wrapEth / unwrapWETH', async t => {
  const ethBalance = new BigNumber(10).pow(18).mul(1000)
  const amount = new BigNumber(10).pow(18).mul(500)
  const gas = 21000 * 3

  const web3 = initWeb3ByBalance(ethBalance.toString())
  const [account] = await web3.eth.getAccounts()

  const blockchainService = await initBlockchainService(web3)
  const wethAddress = await deployWethContract(blockchainService, account)
  const wethTokenWithAddress = {
    ...wethToken,
    address: wethAddress
  }
  const accountBalance = {
    ETH: await blockchainService.getEthBalance(account),
    WETH: await blockchainService.getTokenBalance(account, wethAddress)
  }

  await blockchainService.setUnlimitedTokenAllowanceAsync(account, wethAddress)

  const amountToWrap = amount.dividedBy(Math.pow(10, 18))
  const txHashWrap = await blockchainService.sendWrapWethTx(
    account,
    wethTokenWithAddress,
    amountToWrap,
   gas
  )
  await blockchainService.awaitTransaction(txHashWrap)

  const wrappedAccountBalance = {
    ETH: await blockchainService.getEthBalance(account),
    WETH: await blockchainService.getTokenBalance(account, wethAddress)
  }

  t.equal(
    wrappedAccountBalance.WETH.toString(),
    amountToWrap.toString(),
    'wrapETH: New WETH balance equals to wrapped amount'
  )
  t.equal(
    wrappedAccountBalance.ETH < accountBalance.ETH,
    true,
    'wrapETH: ETH balance id decreased'
  )

  const txHashUnwrap = await blockchainService.sendUnwrapWethTx(
    account,
    wethTokenWithAddress,
    amountToWrap,
    gas
  )
  await blockchainService.awaitTransaction(txHashUnwrap)

  const unwrappedAccountBalance = {
    ETH: await blockchainService.getEthBalance(account),
    WETH: await blockchainService.getTokenBalance(account, wethAddress)
  }

  t.equal(
    unwrappedAccountBalance.WETH.toString(),
    '0',
    'unwrapWETH: WETH balance equals to 0'
  )
  t.equal(
    unwrappedAccountBalance.ETH > wrappedAccountBalance.ETH,
    true,
    'unwrapWETH: ETH balance is increased'
  )
  t.equal(
    unwrappedAccountBalance.ETH < accountBalance.ETH,
    true,
    'wrapETH: Final ETH balance less than initial ETH balance'
  )

  t.end()
})

test('getEthBalance', async t => {
  const balance = 1000

  const web3 = initWeb3ByBalance(balance)
  const blockchainService = new BlockchainService({ web3, contractAddresses: undefined })

  const accounts = await blockchainService.getAccounts()
  const balanceInEth = await blockchainService.getEthBalance(accounts[0])

  t.equal(balanceInEth, balance / Math.pow(10, 18))

  t.end()
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

  t.end()
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

  t.end()
})

test('getTokenBalance', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const accounts = await web3.eth.getAccounts()

  const blockchainService = await initBlockchainService(web3)

  const wethAddress = await deployWethContract(blockchainService, accounts[0])

  const result = await blockchainService.getTokenBalance(accounts[0], wethAddress)

  t.equal(result, 0)

  t.end()
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

  t.end()
})

test('getTokenAllowance', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const accounts = await web3.eth.getAccounts()

  const blockchainService = await initBlockchainService(web3)

  const wethAddress = await deployWethContract(blockchainService, accounts[0])

  const allowance = await blockchainService.getTokenAllowance(accounts[0], wethAddress)

  t.equal(allowance.isZero(), true)

  t.end()
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

  t.end()
})

test('makeLimitOrderAsync', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)

  const blockchainService = await initBlockchainService(web3)

  const accounts = await web3.eth.getAccounts()

  const wethAddress = (await deployWethContract(blockchainService, accounts[0])).toLowerCase()
  const wethAddress2 = (await deployWethContract(blockchainService, accounts[0])).toLowerCase()

  const makerToken = {
    ...wethToken,
    address: wethAddress,
    assetData: `${wethToken.proxyId}${wethAddress.slice(2)}`
  }

  const takerToken = {
    ...wethToken,
    address: wethAddress2,
    assetData: `${wethToken.proxyId}${wethAddress2.slice(2)}`
  }

  try {
    const signedOrder = await blockchainService.makeLimitOrderAsync(
      accounts[0],
      {
        makerToken,
        makerAmount: new BigNumber(0.01),
        takerToken,
        takerAmount: new BigNumber(0.01),
        expires: new BigNumber(
          Math.floor(Date.now() / 1000 + 86400)
        )
      }
    )

    t.true(signedOrder.signature)
  } catch (e) {
    console.error('e: ', e)
  }

  t.end()
})
