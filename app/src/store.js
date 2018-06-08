import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './modules'
import {send} from './ws'

const store = createStore(
  rootReducer,
  applyMiddleware(
    thunk.withExtraArgument({send})
  )
)

export default store
