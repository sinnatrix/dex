import Web3 from 'web3'
import ganache from 'ganache-cli'
import BlockchainService from '../services/BlockchainService'
import { runMigrationsOnceAsync } from '@0x/migrations'
const wethToken = require('../fixtures/wethToken.json')

export const initWeb3 = (opts = {}) => {
  return new Web3(ganache.provider({
    network_id: 50, // setUnlimitedTokenAllowanceAsync works with fixed set of network ids: https://github.com/0xProject/0x-monorepo/blob/083319786fad31dfde16cb9e06e893bfeb23785d/packages/contract-wrappers/src/schemas/contract_wrappers_public_network_config_schema.ts
    ...opts
  }))
}

export const initWeb3ByBalance = balance => {
  return initWeb3({
    accounts: [
      { balance },
      { balance: 1000 } // at least two for 0x contracts migration
    ],
    gasLimit: 70000000
  })
}

const deployZeroExContracts = async (web3, from) => {
  const txDefaults = {
    from: from.toLowerCase()
  }

  const contractAddresses = await runMigrationsOnceAsync(web3.currentProvider, txDefaults)
  return contractAddresses
}

export const initBlockchainService = async web3 => {
  const accounts = await web3.eth.getAccounts()

  let contractAddresses
  try {
    contractAddresses = await deployZeroExContracts(web3, accounts[0])
  } catch (e) {
    console.error('deployError: ', e)
    throw e
  }

  const blockchainService = new BlockchainService({ web3, contractAddresses })
  await blockchainService.init()

  return blockchainService
}

export const deployWethContract = async (blockchainService, from) => {
  const rawTx = {
    from,
    data: wethToken.code,
    gas: 21000 * 100
  }

  const txHash = await blockchainService.sendTransaction(rawTx)
  const { contractAddress } = await blockchainService.getTransactionReceipt(txHash)
  return contractAddress
}
