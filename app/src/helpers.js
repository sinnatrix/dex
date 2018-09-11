import { BigNumber } from '@0xproject/utils'
import { Web3Wrapper } from '@0xproject/web3-wrapper'
import { ContractWrappers } from '0x.js'

export const delay = ts => new Promise(resolve => setTimeout(resolve, ts))

const getWeb3Wrapper = web3 => {
  return new Web3Wrapper(web3.currentProvider)
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
  const networkId = await web3.eth.net.getId()
  const contractWrappers = new ContractWrappers(web3.currentProvider, { networkId })

  const txHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    tokenAddress,
    account
  )

  await awaitTransaction(web3, txHash)

  delay(200)
}

export const getTokenAllowance = async (web3, account, tokenAddress) => {
  const networkId = await web3.eth.net.getId()
  const contractWrappers = new ContractWrappers(web3.currentProvider, { networkId })

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
  const networkId = await web3.eth.net.getId()
  const contractWrappers = new ContractWrappers(web3.currentProvider, { networkId })

  const txHash = await contractWrappers.erc20Token.setProxyAllowanceAsync(
    tokenAddress,
    account,
    new BigNumber(0)
  )

  await awaitTransaction(web3, txHash)

  delay(200)
}
