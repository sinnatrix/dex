import Joi from 'joi'

export const txMinedSchema = Joi.object().keys({
  hash: Joi.string().required(),
  nonce: Joi.number(),
  blockHash: Joi.string().required(),
  blockNumber: Joi.number().required(),
  transactionIndex: Joi.number().required(),
  from: Joi.string().required(),
  to: Joi.string().allow(null),
  value: Joi.string().required(),
  gas: Joi.number().required(),
  gasPrice: Joi.string().required(),
  input: Joi.string().required()
})

export const signedOrderSchema = Joi.object().keys({
  ecSignature: Joi.object().keys({
    r: Joi.string().required(),
    s: Joi.string().required(),
    v: Joi.number().required()
  }),
  orderHash: Joi.string().required(),
  exchangeContractAddress: Joi.string().required(),
  maker: Joi.string().required(),
  taker: Joi.string().required(),
  makerTokenAddress: Joi.string().required(),
  takerTokenAddress: Joi.string().required(),
  feeRecipient: Joi.string().required(),
  makerTokenAmount: Joi.string().required(),
  takerTokenAmount: Joi.string().required(),
  makerFee: Joi.string().required(),
  takerFee: Joi.string().required(),
  expirationUnixTimestampSec: Joi.string().required(),
  salt: Joi.string().required()
})
