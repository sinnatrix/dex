import log from '../utils/log'

class SendEthTask {
  transactionBlockchainService: any

  constructor ({ transactionBlockchainService }) {
    this.transactionBlockchainService = transactionBlockchainService
  }

  async run () {
    const tx = {
      to: '0xA7722A9f1FeD3E2f9f394D6b735f5D3B69F45D2e',
      value: 1,
      gas: 21000
    }

    const result = await this.transactionBlockchainService.sendTx(tx)

    log.info(result, 'result')
  }
}

export default SendEthTask
