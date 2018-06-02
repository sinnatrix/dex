const log = require('../utils/log')
// const {ZeroEx} = require('0x.js')
const Web3 = require('web3')

const getProvider = () => new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_NODE_URL)

const sendSignedTx = (web3, signedTx) => {
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

const sendTx = async tx => {
  log.info('tx: ', tx)

  const provider = getProvider()

  // const zeroEx = new ZeroEx(provider, {
  //   networkId: config.KOVAN_NETWORK_ID
  // })

  // const WETH_ADDRESS = zeroEx.etherToken.getContractAddressIfExists() // The wrapped ETH token contract
  // const ZRX_ADDRESS = zeroEx.exchange.getZRXTokenAddress() // The ZRX token contract
  // The Exchange.sol address (0x exchange smart contract)
  // const EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress()

  const web3 = new Web3(provider)

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
    const result = await sendSignedTx(web3, signedTx)
    log.info('ok')
    return result
  } catch (e) {
    log.error('error: ', e)
  }
}

module.exports = {
  sendTx,
  getProvider
}
