import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { routerMiddleware } from 'connected-react-router'
import rootReducer from 'modules'
import history from 'ownHistory'

export default (extra?) => {
  return createStore(
    rootReducer({ history }),
    applyMiddleware(
      thunk.withExtraArgument(extra),
      routerMiddleware(history)
    )
  )
}
