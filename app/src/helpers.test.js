import test from 'tape-promise/tape'
import Web3 from 'web3'
import Chance from 'chance'
import ganache from 'ganache-cli'
import {
  getEthBalance,
  getTokenBalance,
  sendTransaction,
  awaitTransaction,
  getTransaction,
  setUnlimitedTokenAllowanceAsync,
  getTokenAllowance,
  isUnlimitedTokenAllowance,
  setZeroTokenAllowanceAsync,
  makeLimitOrderAsync
} from './helpers'
import { txMinedSchema } from './schemas'
import Joi from 'joi'
import { BigNumber } from '@0x/utils'

const wethToken = require('./fixtures/wethToken.json')

const initWeb3 = (opts = {}) => {
  return new Web3(ganache.provider({
    network_id: 50, // setUnlimitedTokenAllowanceAsync works with fixed set of network ids: https://github.com/0xProject/0x-monorepo/blob/083319786fad31dfde16cb9e06e893bfeb23785d/packages/contract-wrappers/src/schemas/contract_wrappers_public_network_config_schema.ts
    ...opts
  }))
}

const initWeb3ByBalance = balance => {
  return initWeb3({
    accounts: [
      { balance },
      { balance: 1 } // at least two for 0x contracts migration
    ],
    gasLimit: 70000000
  })
}

const deployWethContract = async (web3, from) => {
  const rawTx = {
    from,
    data: wethToken.code,
    gas: 21000 * 100
  }

  const txHash = await sendTransaction(web3, rawTx)
  const { contractAddress } = await web3.eth.getTransactionReceipt(txHash)
  return contractAddress
}

/* eslint-env jest */

test('getEthBalance', async t => {
  const chance = new Chance()
  const balance = chance.integer({ min: 0, max: 10000 })

  const web3 = initWeb3ByBalance(balance)

  const accounts = await web3.eth.getAccounts()

  const balanceInEth = await getEthBalance(web3, accounts[0])

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
  const accounts = await web3.eth.getAccounts()

  const rawTx = {
    to: accounts[1],
    from: accounts[0],
    value: web3.utils.toWei('1', 'wei'),
    gas: 21000 * 2
  }

  await sendTransaction(web3, rawTx)

  const balanceInEth = await getEthBalance(web3, accounts[1])
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
  const accounts = await web3.eth.getAccounts()

  const rawTx = {
    to: accounts[1],
    from: accounts[0],
    value: web3.utils.toWei('1', 'wei'),
    gas: 21000 * 3
  }

  const txHash = await sendTransaction(web3, rawTx)

  let txInfo = await getTransaction(web3, txHash)
  t.equal(txInfo, null)

  await awaitTransaction(web3, txHash)

  txInfo = await getTransaction(web3, txHash)

  const validation = Joi.validate(txInfo, txMinedSchema)
  t.equal(validation.error, null)
})

test('getTokenBalance', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const accounts = await web3.eth.getAccounts()

  const wethAddress = await deployWethContract(web3, accounts[0])

  const result = await getTokenBalance(web3, accounts[0], wethAddress)

  t.equal(result, 0)
})

test('setUnlimitedTokenAllowanceAsync', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const accounts = await web3.eth.getAccounts()

  const wethAddress = await deployWethContract(web3, accounts[0])

  await setUnlimitedTokenAllowanceAsync(web3, accounts[0], wethAddress)
  const isUnlimited = await isUnlimitedTokenAllowance(web3, accounts[0], wethAddress)

  t.equal(isUnlimited, true)
})

test('getTokenAllowance', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const accounts = await web3.eth.getAccounts()

  const wethAddress = await deployWethContract(web3, accounts[0])

  const allowance = await getTokenAllowance(web3, accounts[0], wethAddress)

  t.equal(allowance.isZero(), true)
})

test('setZeroTokenAllowanceAsync', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const accounts = await web3.eth.getAccounts()

  const wethAddress = await deployWethContract(web3, accounts[0])

  await setZeroTokenAllowanceAsync(web3, accounts[0], wethAddress)

  const allowance = await getTokenAllowance(web3, accounts[0], wethAddress)
  t.equal(allowance.isZero(), true)
})

test('makeLimitOrderAsync', async t => {
  const balance = Math.pow(10, 18).toString()

  const web3 = initWeb3ByBalance(balance)
  const accounts = await web3.eth.getAccounts()

  const wethAddress = await deployWethContract(web3, accounts[0])
  const wethAddress2 = await deployWethContract(web3, accounts[0])

  const makerToken = {
    ...wethToken,
    address: wethAddress
  }

  const takerToken = {
    ...wethToken,
    address: wethAddress2
  }

  try {
    const signedOrder = await makeLimitOrderAsync(
      web3,
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
    console.log('e: ', e)
  }
})
