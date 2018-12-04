import { assetDataUtils } from '@0x/order-utils'
import { runMigrationsOnceAsync } from '@0x/migrations'
import { convertSignedOrderWithStringsToSignedOrder } from './helpers'
const Chance = require('chance')
const ganache = require('ganache-cli')

const chance = new Chance()

const generateHexString = length => '0x' + chance.string({ length, pool: 'abcdef0123456789' })

export const generateAddress = () => generateHexString(40)

export const generateSignedOrder = (...params) => {
  const makerAssetData = assetDataUtils.encodeERC20AssetData(generateAddress())
  const takerAssetData = assetDataUtils.encodeERC20AssetData(generateAddress())

  const signedOrderWithStrings = {
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
    salt: chance.string({ length: 40, pool: '0123456789' }),
    exchangeAddress: generateAddress(),
    signature: generateHexString(132),
    ...params
  }

  return convertSignedOrderWithStringsToSignedOrder(signedOrderWithStrings)
}

export const createProvider = (opts) => {
  return ganache.provider({
    network_id: 50,
    ...opts
  })
}

export const createProviderByBalance = balance => {
  return createProvider({
    accounts: [
      { balance },
      { balance: 1000 } // at least two for 0x contracts migration
    ],
    gasLimit: 70000000
  })
}

export const deployZeroExContracts = async (web3, from) => {
  const txDefaults = {
    from: from.toLowerCase()
  }

  const contractAddresses = await runMigrationsOnceAsync(web3.currentProvider, txDefaults)
  return contractAddresses
}
