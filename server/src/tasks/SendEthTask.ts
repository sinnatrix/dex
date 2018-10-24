import log from '../utils/log'

class SendEthTask {
  blockchainService: any

  constructor ({ blockchainService }) {
    this.blockchainService = blockchainService
  }

  async run () {
    const tx = {
      to: '0xA7722A9f1FeD3E2f9f394D6b735f5D3B69F45D2e',
      value: 1,
      gas: 21000
    }

    const result = await this.blockchainService.sendTx(tx)

    log.info(result, 'result')
  }
}

export default SendEthTask
