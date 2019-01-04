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
  input: Joi.string().required(),
  v: Joi.string(),
  r: Joi.string(),
  s: Joi.string()
})

export const signedOrderSchema = Joi.object().keys({
  senderAddress: Joi.string(),
  makerAddress: Joi.string(),
  takerAddress: Joi.string(),
  makerFee: Joi.string(),
  takerFee: Joi.string(),
  makerAssetAmount: Joi.string(),
  takerAssetAmount: Joi.string(),
  makerAssetData: Joi.string(),
  takerAssetData: Joi.string(),
  salt: Joi.string().required(),
  exchangeAddress: Joi.string().required(),
  feeRecipientAddress: Joi.string().required(),
  expirationTimeSeconds: Joi.string().required(),
  signature: Joi.string()
})
