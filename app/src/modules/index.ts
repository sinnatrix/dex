import { combineReducers } from 'redux'
import global from './global/reducer'
import orders from './orders/reducer'
import tradeHistory from './tradeHistory/reducer'
import subscriptions from './subscriptions/reducer'

const reducer = combineReducers({
  global,
  orders,
  tradeHistory,
  subscriptions
} as any)

export default reducer
