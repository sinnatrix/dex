
export type TChannel = 'orders' | 'tradeHistory'
type TInputMessageType = 'subscribe' | 'unsubscribe'
type TOutputMessageType = 'update'

export interface ISubscription {
  ws: any
  payload: any
  channel: TChannel
  requestId: string
}

interface IMessage {
  type: string
  channel: TChannel
  requestId: string
  payload: any
}

export interface IInputMessage extends IMessage {
  type: TInputMessageType
}

export interface IOutputMessage extends IMessage {
  type: TOutputMessageType
}

export interface IValidationError {
  field: string
  code: number
  reason: string
}

export interface IErrorMessage {
  reason: string
  code: number
  validationErrors?: IValidationError[]
}
