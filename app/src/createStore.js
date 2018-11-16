import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './modules'

export default extra => {
  return createStore(
    rootReducer,
    applyMiddleware(
      thunk.withExtraArgument(extra)
    )
  )
}
