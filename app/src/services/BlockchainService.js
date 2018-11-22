import { ContractWrappers, generatePseudoRandomSalt, signatureUtils } from '0x.js'
import { MetamaskSubprovider } from '@0x/subproviders'
import { assetDataUtils } from '@0x/order-utils'
import { BigNumber } from '@0x/utils'
import { Web3Wrapper } from '@0x/web3-wrapper'
import { delay } from 'helpers/general'

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

class BlockchainService {
  web3
  contractAddresses
  contractWrappers
  web3Wrapper

  constructor ({ web3, contractAddresses }) {
    this.web3 = web3
    this.contractAddresses = contractAddresses
    this.web3Wrapper = new Web3Wrapper(web3.currentProvider)
  }

  async init () {
    await this.initContractWrappers()
  }

  async initContractWrappers () {
    const networkId = await this.web3.eth.net.getId()

    let config = {
      networkId
    }

    if (this.contractAddresses) {
      config = {
        ...config,
        contractAddresses: this.contractAddresses
      }
    }

    this.contractWrappers = new ContractWrappers(this.web3.currentProvider, config)
  }

  enable () {
    return this.web3.currentProvider.enable()
  }

  async getAccounts () {
    return this.web3.eth.getAccounts()
  }

  async getNetworkId () {
    return this.web3.eth.net.getId()
  }

  async getNetworkName () {
    const networkNamesByIds = {
      1: 'mainnet',
      42: 'kovan',
      50: 'test'
    }

    const networkId = await this.getNetworkId()

    return networkNamesByIds[networkId]
  }

  async getEthBalance (address) {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBalance(address, (err, balance) => {
        if (err) {
          reject(err)
          return
        }

        const eth = balance / Math.pow(10, 18)

        resolve(eth)
      })
    })
  }

  getTokenBalance (walletAddr, tokenAddr) {
    return new Promise((resolve, reject) => {
      const methodHex = this.web3.utils.sha3('balanceOf(address)').substr(0, '0x'.length + 8)
      const params = walletAddr.substr(2).padStart(32 * 2, '0')
      const data = methodHex + params

      this.web3.eth.call({
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
        const tokenBalance = parseFloat(this.web3.utils.fromWei(wei))

        resolve(tokenBalance)
      })
    })
  }

  async awaitTransaction (txHash) {
    let txReceipt = await this.web3Wrapper.awaitTransactionSuccessAsync(txHash)

    let i = 1
    while (!txReceipt.blockNumber) {
      await delay(100 * i)
      const result = await this.web3Wrapper.getTransactionReceiptAsync(txHash)
      if (result) {
        txReceipt = result
      }

      i++
    }

    return txReceipt
  }

  async sendTransaction (tx) {
    return new Promise((resolve, reject) => {
      this.web3.eth.sendTransaction(tx, (err, txHash) => {
        if (err) {
          reject(err)
          return
        }
        resolve(txHash)
      })
    })
  }

  async getTransactionReceipt (tx) {
    return this.web3.eth.getTransactionReceipt(tx)
  }

  async setUnlimitedTokenAllowanceAsync (account, tokenAddress) {
    const txHash = await this.contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      tokenAddress,
      account
    )

    await this.awaitTransaction(txHash)
  }

  async getTokenAllowance (account, tokenAddress) {
    const allowance = await this.contractWrappers.erc20Token.getProxyAllowanceAsync(
      tokenAddress,
      account
    )

    return allowance
  }

  async isUnlimitedTokenAllowance (account, tokenAddress) {
    const allowance = await this.getTokenAllowance(account, tokenAddress)
    return this.contractWrappers.erc20Token.UNLIMITED_ALLOWANCE_IN_BASE_UNITS.toString() === allowance.toString()
  }

  getTransaction (txHash) {
    return this.web3.eth.getTransaction(txHash)
  }

  async setZeroTokenAllowanceAsync (account, tokenAddress) {
    const txHash = await this.contractWrappers.erc20Token.setProxyAllowanceAsync(
      tokenAddress,
      account,
      new BigNumber(0)
    )

    await this.awaitTransaction(txHash)
  }

  async makeLimitOrderAsync (account, { makerToken, makerAmount, takerToken, takerAmount }) {
    const makerAddress = account

    const EXCHANGE_ADDRESS = this.contractWrappers.exchange.address

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

    const provider = process.env.NODE_ENV === 'test'
      ? this.web3.currentProvider
      : new MetamaskSubprovider(this.web3.currentProvider)

    // signed order
    return signatureUtils.ecSignOrderAsync(
      provider,
      order,
      makerAddress
    )
  }

  async makeMarketOrderAsync (account, ordersToCheck, amount) {
    const ordersToFill = []
    for (const order of ordersToCheck) {
      try {
        await this.contractWrappers.exchange.validateOrderFillableOrThrowAsync(order)
        ordersToFill.push(order)
      } catch (e) {
        console.warn('order: ', order.orderHash, ' is not fillable')
      }
    }

    const amountToFill = Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), 18)

    const fillTxHash = await this.contractWrappers.exchange.fillOrdersUpToAsync(
      ordersToFill,
      amountToFill,
      true,
      account
    )

    return fillTxHash
  }

  async sendWrapWethTx (account, wethToken, amount) {
    const rawTx = {
      to: wethToken.address,
      from: account,
      value: this.web3.utils.toWei(amount.toString()),
      gas: 21000 * 2
    }

    const txHash = await this.sendTransaction(rawTx)

    return txHash
  }

  async sendUnwrapWethTx (account, wethToken, amount) {
    const contract = new this.web3.eth.Contract(wethToken.abi, wethToken.address)

    const value = this.web3.utils.toWei(amount.toString())

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

  /**
   *
   * @param web3
   * @param account string Taker Address HexString leaded by 0x
   * @param order {Object} Signed order with metaData
   * @param amount number Will be converted to BigNumber and then to BaseUnitAmount
   * @returns {Promise} txHash
   */
  async fillOrderAsync (account, order, amount) {
    try {
      await this.contractWrappers.exchange.validateOrderFillableOrThrowAsync(order)
    } catch (e) {
      console.warn('Order cannot be fulfilled')
      return null
    }

    // TODO remove magic number '18' and get value from database token decimals
    const takerAssetFillAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), 18)

    return this.contractWrappers.exchange.fillOrderAsync(
      order,
      takerAssetFillAmount,
      account
    )
  }
}

export default BlockchainService
