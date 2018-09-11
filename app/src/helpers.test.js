import Web3 from 'web3'
import Chance from 'chance'
import ganache from 'ganache-cli'
import { getEthBalance, getTokenBalance, sendTransaction, awaitTransaction, getTransaction } from './helpers'
import { txMinedSchema } from './schemas'
import Joi from 'joi'

const wethToken = require('./fixtures/wethToken.json')

/* eslint-env jest */

test('getEthBalance', async () => {
  const chance = new Chance()
  const balance = chance.integer({ min: 0, max: 10000 })

  const web3 = new Web3(ganache.provider({
    accounts: [
      { balance }
    ]
  }))
  const accounts = await web3.eth.getAccounts()

  const balanceInEth = await getEthBalance(web3, accounts[0])

  expect(balanceInEth).toBe(balance / Math.pow(10, 18))
})

test('sendTransaction', async () => {
  const balance = Math.pow(10, 18).toString()

  const web3 = new Web3(ganache.provider({
    accounts: [
      { balance },
      { balance: 0 }
    ]
  }))
  const accounts = await web3.eth.getAccounts()

  const rawTx = {
    to: accounts[1],
    from: accounts[0],
    value: web3.utils.toWei('1', 'wei'),
    gas: 21000 * 2
  }

  await sendTransaction(web3, rawTx)

  const balanceInEth = await getEthBalance(web3, accounts[1])
  expect(balanceInEth).toBe(1 / Math.pow(10, 18))
})

test('awaitTransaction', async () => {
  const balance = Math.pow(10, 18).toString()

  const web3 = new Web3(ganache.provider({
    accounts: [
      { balance }
    ],
    blockTime: 0.5 // seconds
  }))
  const accounts = await web3.eth.getAccounts()

  const rawTx = {
    to: accounts[1],
    from: accounts[0],
    value: web3.utils.toWei('1', 'wei'),
    gas: 21000 * 3
  }

  const txHash = await sendTransaction(web3, rawTx)

  let txInfo = await getTransaction(web3, txHash)
  expect(txInfo).toBe(null)

  await awaitTransaction(web3, txHash)

  txInfo = await getTransaction(web3, txHash)

  const validation = Joi.validate(txInfo, txMinedSchema)
  expect(validation.error).toBe(null)
})

test('getTokenBalance', async () => {
  const balance = Math.pow(10, 18).toString()

  const web3 = new Web3(ganache.provider({
    accounts: [
      { balance }
    ]
  }))
  const accounts = await web3.eth.getAccounts()

  const rawTx = {
    from: accounts[0],
    data: wethToken.code,
    gas: 21000 * 100
  }

  const txHash = await sendTransaction(web3, rawTx)
  const { contractAddress } = await web3.eth.getTransactionReceipt(txHash)

  const result = await getTokenBalance(web3, accounts[0], contractAddress)

  expect(result).toBe(0)
})
