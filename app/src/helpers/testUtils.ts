import Web3 from 'web3'
import ganache from 'ganache-cli'
import { runMigrationsOnceAsync } from '@0x/migrations'
import { assetDataUtils } from '@0x/order-utils'
import { orderHashUtils } from '0x.js'
import BlockchainService from 'services/BlockchainService'
import { AssetEntity, IMarket } from 'types'
import { BigNumber } from '@0x/utils'
const Chance = require('chance')
const wethToken = require('fixtures/wethToken.json')

const chance = new Chance()

export const initWeb3 = (opts = {}) => {
  const provider = ganache.provider({
    network_id: 50, // setUnlimitedTokenAllowanceAsync works with fixed set of network ids: https://github.com/0xProject/0x-monorepo/blob/083319786fad31dfde16cb9e06e893bfeb23785d/packages/contract-wrappers/src/schemas/contract_wrappers_public_network_config_schema.ts
    ...opts
  })

  const web3 = new Web3(provider)

  return web3
}

export const initWeb3ByBalance = balance => {
  return initWeb3({
    accounts: [
      { balance },
      { balance: 1000 } // at least two for 0x contracts migration
    ],
    gasLimit: 70000000
  })
}

const deployZeroExContracts = async (web3, from) => {
  const txDefaults = {
    from: from.toLowerCase()
  }

  const contractAddresses = await runMigrationsOnceAsync(web3.currentProvider, txDefaults)
  return contractAddresses
}

export const initBlockchainService = async web3 => {
  const accounts = await web3.eth.getAccounts()

  let contractAddresses
  try {
    contractAddresses = await deployZeroExContracts(web3, accounts[0])
  } catch (e) {
    console.error('deployError: ', e)
    throw e
  }

  const blockchainService = new BlockchainService({ web3, contractAddresses })
  await blockchainService.init()

  return blockchainService
}

export const deployWethContract = async (blockchainService, from) => {
  const rawTx = {
    from,
    data: wethToken.code,
    gas: 21000 * 100
  }

  const txHash = await blockchainService.sendTransaction(rawTx)
  const { contractAddress } = await blockchainService.getTransactionReceipt(txHash)
  return contractAddress
}

const generateHexString = length => '0x' + chance.string({ length, pool: 'abcdef0123456789' })

export const generateAddress = () => generateHexString(40)
export const generateProxyId = () => generateHexString(40)
const generateTokenSymbol = () => chance.string({ length: 5, pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' })
const generateTokenName = () => chance.sentence({ words: 2 }).substr(1)

export const generateERC20Token = (): AssetEntity => {
  const address = generateAddress()
  const proxyId = generateProxyId()
  return {
    abi: {},
    assetData: `${proxyId}${address.slice(2)}`,
    address,
    proxyId,
    decimals: 18,
    maxAmount: new BigNumber('999999999999999999999'),
    minAmount: new BigNumber('1'),
    name: generateTokenName(),
    precision: 8,
    symbol: generateTokenSymbol()
  }
}

export const generateSignedOrder = (...params) => {
  const makerAssetData = assetDataUtils.encodeERC20AssetData(generateAddress())
  const takerAssetData = assetDataUtils.encodeERC20AssetData(generateAddress())

  return {
    makerAssetData,
    takerAssetData,
    makerAddress: generateAddress(),
    takerAddress: '0x0000000000000000000000000000000000000000',
    feeRecipientAddress: '0x0000000000000000000000000000000000000000',
    senderAddress: '0x0000000000000000000000000000000000000000',
    makerAssetAmount: '2000000000000000',
    takerAssetAmount: '1000000000000000000',
    makerFee: '0',
    takerFee: '0',
    expirationTimeSeconds: '1543931584',
    salt: '21848223970004495557684610382298847442980093760216666848435317872291226961471',
    exchangeAddress: generateAddress(),
    signature: generateHexString(132),
    ...params
  }
}

export const generateSRA2Order = (...params) => {
  const signedOrder = generateSignedOrder(params)

  const metaData = {
    orderHash: orderHashUtils.getOrderHashHex(signedOrder as any),
    orderTakerAssetFilledAmount: '0'
  }

  const sra2Order = {
    order: signedOrder,
    metaData
  }

  return sra2Order
}

export const generateMarket = (): IMarket => {
  const baseAsset = generateERC20Token()
  const quoteAsset = generateERC20Token()

  const score = getRandomInt(1, 100)

  return {
    id: `${baseAsset.symbol}-${quoteAsset.symbol}`,
    name: `${baseAsset.symbol}/${quoteAsset.symbol}`,
    path: `/${baseAsset.symbol}-${quoteAsset.symbol}`,
    baseAsset,
    quoteAsset,
    stats: {
      transactionCount: score,
      volume24Hours: new BigNumber(getRandomInt(1, 1000)),
      percentChange24Hours: getRandomArbitrary(0,30),
      ethVolume24Hours: new BigNumber(getRandomInt(1, 1000))
    },
    price: new BigNumber(100),
    priceEth: new BigNumber(1),
    score
  }
}

export const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min

export const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min
