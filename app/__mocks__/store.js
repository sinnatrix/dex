import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const send = () => {}

const mockStore = configureMockStore([
  thunk.withExtraArgument({ send })
])

const store = mockStore()

export default store
