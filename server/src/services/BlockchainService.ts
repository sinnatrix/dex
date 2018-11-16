import log from '../utils/log'
import * as Web3 from 'web3'

class BlockchainService {
  provider: any
  web3: any

  constructor () {
    this.provider = new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_NODE_URL)
    this.web3 = new Web3(this.provider)
  }

  async sendSignedTx (signedTx) {
    const method = this.web3.eth.sendSignedTransaction.method
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

    let signedTx
    try {
      log.info('signing transaction...')
      signedTx = await this.web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY)
      log.info('ok. signedTx: ', signedTx)
    } catch (e) {
      log.error('error: ', e)
      return
    }

    try {
      log.info('sending signed transaction...')
      const result = await this.sendSignedTx(signedTx)
      log.info('ok')
      return result
    } catch (e) {
      log.error('error: ', e)
    }
  }
}

export default BlockchainService
