import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import global from './global/reducer'
import orders from './orders/reducer'
import tradeHistory from './tradeHistory/reducer'
import subscriptions from './subscriptions/reducer'

const createReducer = ({ history }) => combineReducers({
  global,
  orders,
  tradeHistory,
  subscriptions,
  router: connectRouter(history)
} as any)

export default createReducer
