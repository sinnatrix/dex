const Token = require('../src/entities/Token')
const TokenPair = require('../src/entities/TokenPair')
const Order = require('../src/entities/Order')
const Relayer = require('../src/entities/Relayer')

const tokens = require('./tokens.json')
const tokenPairs = require('./tokenPairs.json')
const relayers = require('./relayers.json')
const orders = require('./orders.json')

exports.up = async connection => {
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

  await connection.getRepository(Relayer).save(relayers)
  await connection.getRepository(Order).save(orders)
}

exports.down = async () => {
}
