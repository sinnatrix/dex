import { BigNumber } from '@0xproject/utils'
import { Web3Wrapper } from '@0xproject/web3-wrapper'
import { ContractWrappers, orderHashUtils, generatePseudoRandomSalt, signatureUtils, SignerType } from '0x.js'

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

console.log('SignerType: ', SignerType)

export const delay = ts => new Promise(resolve => setTimeout(resolve, ts))

const getWeb3Wrapper = web3 => {
  return new Web3Wrapper(web3.currentProvider)
}

const getContractWrappers = async web3 => {
  const networkId = await web3.eth.net.getId()
  return new ContractWrappers(web3.currentProvider, { networkId })
}

export const generateBid = ({ order, baseToken, quoteToken }) => {
  const makerToken = order.data.makerTokenAddress === baseToken.address ? baseToken : quoteToken
  const takerToken = order.data.takerTokenAddress === baseToken.address ? baseToken : quoteToken

  const decimalFields = [
    'expirationUnixTimestampSec',
    'makerFee',
    'makerTokenAmount',
    'salt',
    'takerFee',
    'takerTokenAmount'
  ]

  const orderData = decimalFields.reduce((agg, key) => {
    return {
      ...agg,
      [key]: new BigNumber(order.data[key])
    }
  }, { ...order.data })
  order = { ...order, data: orderData }

  const makerAmount = order.data.makerTokenAmount.dividedBy(
    Math.pow(10, makerToken.decimals)
  )
  const takerAmount = order.data.takerTokenAmount.dividedBy(
    Math.pow(10, takerToken.decimals)
  )

  let price
  if (order.data.takerTokenAddress === baseToken.address) {
    price = takerAmount.dividedBy(makerAmount)
  } else {
    price = makerAmount.dividedBy(takerAmount)
  }

  const bid = {
    order,
    price,
    maker: order.data.maker,
    makerToken,
    takerToken,
    makerAmount,
    takerAmount
  }

  return bid
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
  await web3Wrapper.awaitTransactionMinedAsync(txHash)
}

export const setUnlimitedTokenAllowanceAsync = async (web3, account, tokenAddress) => {
  const contractWrappers = await getContractWrappers(web3)

  const txHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    tokenAddress,
    account
  )

  await awaitTransaction(web3, txHash)

  delay(200)
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

  delay(200)
}

export const makeLimitOrderAsync = async (web3, account, { makerToken, makerAmount, takerToken, takerAmount }) => {
  const makerAddress = account

  const contractWrappers = await getContractWrappers(web3)
  // console.log('contractWrappers: ', contractWrappers)

  // console.log('contractWrappers.erc20Token: ', contractWrappers.erc20Token)
  // console.log('contractWrappers.exchange: ', contractWrappers.exchange)

  const EXCHANGE_ADDRESS = contractWrappers.exchange.getContractAddress()

  const order = {
    makerAddress: makerAddress.toLowerCase(),
    takerAddress: NULL_ADDRESS,
    senderAddress: NULL_ADDRESS,
    feeRecipientAddress: NULL_ADDRESS,
    makerAssetData: makerToken.address.toLowerCase(),
    takerAssetData: takerToken.address.toLowerCase(),
    exchangeAddress: EXCHANGE_ADDRESS,
    salt: generatePseudoRandomSalt(),
    makerFee: new BigNumber(0),
    takerFee: new BigNumber(0),
    makerAssetAmount: Web3Wrapper.toBaseUnitAmount(makerAmount, makerToken.decimals),
    takerAssetAmount: Web3Wrapper.toBaseUnitAmount(takerAmount, takerToken.decimals),
    expirationTimeSeconds: new BigNumber(parseInt(Date.now() / 1000 + 3600 * 24, 10)) // Valid for up to a day
  }

  const orderHash = orderHashUtils.getOrderHashHex(order)

  const isMetamask = web3.currentProvider.constructor.name === 'MetamaskInpageProvider'
  const signatureType = isMetamask ? SignerType.Metamask : SignerType.Default

  const ecSignature = await signatureUtils.ecSignOrderHashAsync(web3.currentProvider, orderHash, makerAddress, signatureType)

  const signedOrder = {
    ...order,
    orderHash,
    ecSignature
  }

  return signedOrder
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
