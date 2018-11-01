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
  ecSignature: Joi.string(),
  orderHash: Joi.string().required(),
  exchangeAddress: Joi.string().required(),
  maker: Joi.string().required(),
  taker: Joi.string().required(),
  makerAssetAddress: Joi.string().required(),
  takerAssetAddress: Joi.string().required(),
  feeRecipientAddress: Joi.string().required(),
  makerAssetAmount: Joi.string().required(),
  takerAssetAmount: Joi.string().required(),
  makerFee: Joi.string().required(),
  takerFee: Joi.string().required(),
  expirationTimeSeconds: Joi.string().required(),
  salt: Joi.string().required()
})
