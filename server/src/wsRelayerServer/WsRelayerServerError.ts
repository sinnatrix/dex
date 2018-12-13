import { IErrorMessage, IValidationError } from './types'

class WsRelayerServerError extends Error {
  code: number
  validationErrors?: any[]

  constructor (message: string, code: number, validationErrors?: IValidationError[]) {
    super(message)
    this.code = code
    this.validationErrors = validationErrors

    Error.captureStackTrace(this, WsRelayerServerError)
  }

  serialize (): IErrorMessage {
    const result: IErrorMessage = {
      code: this.code,
      reason: this.message
    }

    if (this.validationErrors) {
      result.validationErrors = this.validationErrors
    }

    return result
  }
}

export default WsRelayerServerError
