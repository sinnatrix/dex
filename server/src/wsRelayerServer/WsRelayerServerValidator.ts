import { validateNetworkId, validateRequiredField } from '../validation'
import { IInputMessage, IValidationError, TChannel } from './types'
import WsRelayerServerError from './WsRelayerServerError'

const validateNetworkIdRule: Function = params => validateNetworkId(params.payload.networkId)
const validateRequestIdRule: Function = params => validateRequiredField('requestId', params.requestId)

const channelsRules = {
  orders: {
    rules: [
      validateNetworkIdRule,
      validateRequestIdRule
    ]
  },
  tradeHistory: {
    rules: [
      validateRequestIdRule
    ]
  }
}

class WsRelayerServerValidator {
  validateMessage (message: IInputMessage) {
    this.validateChannel(message.channel)
    this.validateMessageByRules(message)
  }

  validateChannel (channel: TChannel) {
    if (!channelsRules[channel]) {
      throw new WsRelayerServerError('Wrong channel', 100)
    }
  }

  validateMessageByRules (message: IInputMessage) {
    const rules = channelsRules[message.channel].rules
    const validationErrors: IValidationError[] = rules
      .map(rule =>
        rule({
          payload: message.payload,
          requestId: message.requestId
        })
      )
      .filter(one => !!one)

    if (validationErrors.length) {
      throw new WsRelayerServerError('Validation failed', 100, validationErrors)
    }
  }
}

export default WsRelayerServerValidator
