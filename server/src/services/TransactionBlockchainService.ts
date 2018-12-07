import log from '../utils/log'
const Web3 = require('web3')

class TransactionBlockchainService {
  httpProvider: any

  constructor ({ httpProvider }) {
    this.httpProvider = httpProvider
  }

  async sendTx (tx) {
    const signedTx = await this.signTx(tx)
    return this.sendSignedTx(signedTx)
  }

  async signTx (tx) {
    const web3 = new Web3(this.httpProvider)
    log.info('signing transaction...')
    const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY)
    log.info('ok. signedTx: ', signedTx)

    return signedTx
  }

  async sendSignedTx (signedTx) {
    log.info('sending signed transaction...')
    const web3 = new Web3(this.httpProvider)
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

}

export default TransactionBlockchainService
