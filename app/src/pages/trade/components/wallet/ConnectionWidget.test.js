import test from 'tape-promise/tape'
import React from 'react'
import ConnectionWidget from './ConnectionWidget'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import moxios from 'moxios'
import rootReducer from 'modules/index'
import { initWeb3ByBalance, initBlockchainService } from 'helpers/test'
import { createStore, applyMiddleware } from 'redux'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

Enzyme.configure({ adapter: new Adapter() })

const wrappedTest = (title, cb) =>
  test(`ConnectionWidget | ${title}`, async t => {
    // import and pass your custom axios instance to this method
    moxios.install()

    await cb(t)

    // import and pass your custom axios instance to this method
    moxios.uninstall()
  })

wrappedTest('should render metamask link', async t => {
  const mockStore = configureMockStore([
    thunk
  ])

  const store = mockStore()

  const wrapper = mount(<Provider store={store}><ConnectionWidget /></Provider>)

  t.ok(wrapper.find('[href="https://metamask.io/"]').exists())

  await delay(100)
  wrapper.unmount()
})

wrappedTest('should render etherscan link', async t => {
  const web3 = initWeb3ByBalance(0)
  const blockchainService = await initBlockchainService(web3)

  const store = createStore(rootReducer, applyMiddleware(
    thunk.withExtraArgument({ blockchainService })
  ))

  const wrapper = mount(
    <Provider store={store}>
      <ConnectionWidget />
    </Provider>
  )

  await delay(200)
  wrapper.update()

  t.ok(wrapper.find('EtherscanLink').exists())

  await delay(100)
  wrapper.unmount()
})
