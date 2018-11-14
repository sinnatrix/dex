import { BigNumber } from '@0x/utils'
import { Web3Wrapper } from '@0x/web3-wrapper'
import { MetamaskSubprovider } from '@0x/subproviders'
import {
  ContractWrappers,
  generatePseudoRandomSalt,
  signatureUtils
} from '0x.js'
import { assetDataUtils } from '@0x/order-utils'
import pick from 'ramda/es/pick'

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

export const delay = ts => new Promise(resolve => setTimeout(resolve, ts))

const getWeb3Wrapper = web3 => {
  return new Web3Wrapper(web3.currentProvider)
}

const getContractWrappers = async web3 => {
  const networkId = await web3.eth.net.getId()
  return new ContractWrappers(web3.currentProvider, { networkId })
}

/**
 * @param order
 * @param baseToken
 * @param quoteToken
 * @returns {{order, price: BigNumber, makerToken: *, takerToken: *, makerAmount: BigNumber, takerAmount: BigNumber}}
 */
export const generateBid = ({ order, baseToken, quoteToken }) => {
  order = convertOrderToDexFormat(order)

  const makerToken = order.makerAssetAddress === baseToken.address ? baseToken : quoteToken
  const takerToken = order.takerAssetAddress === baseToken.address ? baseToken : quoteToken

  const decimalFields = [
    'expirationTimeSeconds',
    'makerFee',
    'makerAssetAmount',
    'salt',
    'takerFee',
    'takerAssetAmount'
  ]

  order = decimalFields.reduce((agg, key) => ({
    ...agg,
    [key]: new BigNumber(order[key])
  }), { ...order })

  const makerAmount = order.makerAssetAmount.dividedBy(
    Math.pow(10, makerToken.decimals)
  )
  const takerAmount = order.takerAssetAmount.dividedBy(
    Math.pow(10, takerToken.decimals)
  )

  let price
  if (order.takerAssetAddress === baseToken.address) {
    price = takerAmount.dividedBy(makerAmount)
  } else {
    price = makerAmount.dividedBy(takerAmount)
  }

  return {
    order,
    price,
    makerToken,
    takerToken,
    makerAmount,
    takerAmount
  }
}

export const getEthBalance = (web3, address) => {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(address, (err, balance) => {
      if (err) {
        reject(err)
        return
      }

      const eth = balance / Math.pow(10, 18)

      resolve(eth)
    })
  })
}

export const getTokenBalance = (web3, walletAddr, tokenAddr) => {
  return new Promise((resolve, reject) => {
    const methodHex = web3.utils.sha3('balanceOf(address)').substr(0, '0x'.length + 8)
    const params = walletAddr.substr(2).padStart(32 * 2, '0')
    const data = methodHex + params

    web3.eth.call({
      to: tokenAddr,
      data
    }, (err, result) => {
      if (err) {
        reject(err)
        return
      }

      // FIXME tech debt
      if (result === '0x') {
        result = 0
      }

      const wei = new BigNumber(result).toString()
      const tokenBalance = parseFloat(web3.utils.fromWei(wei))

      resolve(tokenBalance)
    })
  })
}

export const sendTransaction = (web3, tx) => {
  return new Promise((resolve, reject) => {
    web3.eth.sendTransaction(tx, (err, txHash) => {
      if (err) {
        reject(err)
        return
      }
      resolve(txHash)
    })
  })
}

export const awaitTransaction = async (web3, txHash) => {
  const web3Wrapper = await getWeb3Wrapper(web3)
  let txReceipt = await web3Wrapper.awaitTransactionSuccessAsync(txHash)

  let i = 1
  while (!txReceipt.blockNumber) {
    await delay(100 * i)
    const result = await web3Wrapper.getTransactionReceiptAsync(txHash)
    if (result) {
      txReceipt = result
    }

    i++
  }

  return txReceipt
}

export const setUnlimitedTokenAllowanceAsync = async (web3, account, tokenAddress) => {
  const contractWrappers = await getContractWrappers(web3)

  const txHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    tokenAddress,
    account
  )

  await awaitTransaction(web3, txHash)
}

export const getTokenAllowance = async (web3, account, tokenAddress) => {
  const contractWrappers = await getContractWrappers(web3)

  const allowance = await contractWrappers.erc20Token.getProxyAllowanceAsync(
    tokenAddress,
    account
  )

  return allowance
}

export const getTransaction = async (web3, txHash) => {
  const result = await web3.eth.getTransaction(txHash)
  return result
}

export const setZeroTokenAllowanceAsync = async (web3, account, tokenAddress) => {
  const contractWrappers = await getContractWrappers(web3)

  const txHash = await contractWrappers.erc20Token.setProxyAllowanceAsync(
    tokenAddress,
    account,
    new BigNumber(0)
  )

  await awaitTransaction(web3, txHash)
}

export const makeLimitOrderAsync = async (web3, account, { makerToken, makerAmount, takerToken, takerAmount }) => {
  const makerAddress = account

  const contractWrappers = await getContractWrappers(web3)

  const EXCHANGE_ADDRESS = contractWrappers.exchange.address

  const order = {
    makerAddress: makerAddress.toLowerCase(),
    takerAddress: NULL_ADDRESS,
    senderAddress: NULL_ADDRESS,
    feeRecipientAddress: NULL_ADDRESS,
    // TODO Discovery encoding method, read about tokenId for encodeERC721AssetData
    makerAssetData: assetDataUtils.encodeERC20AssetData(makerToken.address.toLowerCase()),
    takerAssetData: assetDataUtils.encodeERC20AssetData(takerToken.address.toLowerCase()),
    exchangeAddress: EXCHANGE_ADDRESS,
    salt: generatePseudoRandomSalt(),
    makerFee: new BigNumber(0),
    takerFee: new BigNumber(0),
    makerAssetAmount: Web3Wrapper.toBaseUnitAmount(makerAmount, makerToken.decimals),
    takerAssetAmount: Web3Wrapper.toBaseUnitAmount(takerAmount, takerToken.decimals),
    expirationTimeSeconds: new BigNumber(parseInt(Date.now() / 1000 + 3600 * 24, 10)) // Valid for up to a day
  }

  // signed order
  return signatureUtils.ecSignOrderAsync(
    new MetamaskSubprovider(web3.currentProvider),
    order,
    makerAddress
  )
}

export const makeMarketOrderAsync = async (web3, account, ordersToCheck, amount) => {
  const contractWrappers = await getContractWrappers(web3)

  const ordersToFill = []
  for (const order of ordersToCheck) {
    try {
      await contractWrappers.exchange.validateOrderFillableOrThrowAsync(order)
      ordersToFill.push(order)
    } catch (e) {
      console.warn('order: ', order.orderHash, ' is not fillable')
    }
  }

  const amountToFill = Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), 18)

  const fillTxHash = await contractWrappers.exchange.fillOrdersUpToAsync(
    ordersToFill,
    amountToFill,
    true,
    account
  )

  return fillTxHash
}

export const sendWrapWethTx = async (web3, account, wethToken, amount) => {
  const rawTx = {
    to: wethToken.address,
    from: account,
    value: web3.utils.toWei(amount.toString()),
    gas: 21000 * 2
  }

  const txHash = await sendTransaction(web3, rawTx)

  return txHash
}

export const sendUnwrapWethTx = async (web3, account, wethToken, amount) => {
  const contract = new web3.eth.Contract(wethToken.abi, wethToken.address)

  const value = web3.utils.toWei(amount.toString())

  const txHash = await new Promise((resolve, reject) => {
    const rawTx = {
      from: account,
      gas: 21000 * 2
    }
    contract.methods.withdraw(value).send(rawTx, (err, result) => {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      resolve(result)
    })
  })

  return txHash
}

export const convertOrderToSRA2Format = order => ({
  order: pick([
    'makerAddress',
    'takerAddress',
    'feeRecipientAddress',
    'senderAddress',
    'makerAssetAmount',
    'takerAssetAmount',
    'makerFee',
    'takerFee',
    'expirationTimeSeconds',
    'salt',
    'makerAssetData',
    'takerAssetData',
    'exchangeAddress',
    'signature'
  ], order),
  metaData: pick([
    'orderHash',
    'remainingTakerAssetAmount'
  ], order)
})

export const convertOrderToDexFormat = order => {
  const decodedMakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.order.makerAssetData)
  const decodedTakerAssetData = assetDataUtils.decodeAssetDataOrThrow(order.order.takerAssetData)

  return {
    ...order.order,
    ...order.metaData,
    makerAssetAddress: decodedMakerAssetData.tokenAddress,
    takerAssetAddress: decodedTakerAssetData.tokenAddress,
    makerAssetProxyId: decodedMakerAssetData.assetProxyId,
    takerAssetProxyId: decodedTakerAssetData.assetProxyId
  }
}

/**
 *
 * @param web3
 * @param account string Taker Address HexString leaded by 0x
 * @param order {Object} Signed order with metaData
 * @param amount number Will be converted to BigNumber and then to BaseUnitAmount
 * @returns {Promise<void>}
 */
export const fillOrderAsync = async (web3, account, order, amount) => {
  const contractWrappers = await getContractWrappers(web3)

  try {
    await contractWrappers.exchange.validateOrderFillableOrThrowAsync(order)
  } catch (e) {
    console.warn('Order cannot be fulfilled')
    return null
  }

  // TODO remove magic number '18' and get value from database token decimals
  const takerAssetFillAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), 18)

  const fillingResult = await contractWrappers.exchange.fillOrderAsync(
    order,
    takerAssetFillAmount,
    account
  )

  return fillingResult
}
