import log from '../utils/log'
import * as Web3 from 'web3'

class BlockchainService {
  getProvider () {
    return new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_NODE_URL)
  }

  getWeb3 () {
    const provider = this.getProvider()
    return new Web3(provider)
  }

  async sendSignedTx (web3, signedTx) {
    const method = web3.eth.sendSignedTransaction.method
    const payload = method.toPayload([signedTx.rawTransaction])

    return new Promise((resolve, reject) => {
      method.requestManager.send(payload, (err, result) => {
        if (err) {
          return reject(err)
        }

        resolve(result)
      })
    })
  }

  async sendTx (tx) {
    log.info('tx: ', tx)

    // const zeroEx = new ZeroEx(provider, {
    //   networkId: config.KOVAN_NETWORK_ID
    // })

    // const WETH_ADDRESS = zeroEx.etherToken.getContractAddressIfExists() // The wrapped ETH token contract
    // const ZRX_ADDRESS = zeroEx.exchange.getZRXTokenAddress() // The ZRX token contract
    // The Exchange.sol address (0x exchange smart contract)
    // const EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress()

    const web3 = this.getWeb3()

    let signedTx
    try {
      log.info('signing transaction...')
      signedTx = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY)
      log.info('ok. signedTx: ', signedTx)
    } catch (e) {
      log.error('error: ', e)
      return
    }

    try {
      log.info('sending signed transaction...')
      const result = await this.sendSignedTx(web3, signedTx)
      log.info('ok')
      return result
    } catch (e) {
      log.error('error: ', e)
    }
  }
}

export default BlockchainService
