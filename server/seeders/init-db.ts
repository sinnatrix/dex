import Token from '../src/entities/Token'
import TokenPair from '../src/entities/TokenPair'
import RelayerRepository from '../src/repositories/RelayerRepository'
import OrderRepository from '../src/repositories/OrderRepository'

const tokens = require('./tokens.json')
const tokenPairs = require('./tokenPairs.json')
const relayers = require('./relayers.json')
const orders = require('./orders.json')

export const up = async connection => {
  const tokensRepo = connection.getRepository(Token)
  await tokensRepo.save(tokens)

  const tokenPairsRepo = connection.getRepository(TokenPair)

  for (let { tokenAAddress, tokenBAddress } of tokenPairs) {
    const tokenA = await tokensRepo.findOne({ address: tokenAAddress })
    const tokenB = await tokensRepo.findOne({ address: tokenBAddress })

    await tokenPairsRepo.save({
      tokenAId: tokenA.id,
      tokenBId: tokenB.id
    })
  }

  await connection.getCustomRepository(RelayerRepository).save(relayers)
  await connection.getCustomRepository(OrderRepository).save(orders)
}

export const down = async () => {}
