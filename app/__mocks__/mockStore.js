import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([
  thunk
])

const store = mockStore()

export default store
