import test from 'tape-promise/tape'
import React from 'react'
import ConnectionWidget from './ConnectionWidget'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import store from 'store'
import Web3Context from 'contexts/Web3Context'
import Web3 from 'web3'
import moxios from 'moxios'
const ganache = require('ganache-cli')

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

wrappedTest('should render metamask link', t => {
  const mockStore = configureMockStore([
    thunk
  ])

  const store = mockStore()

  const wrapper = mount(<Provider store={store}><ConnectionWidget /></Provider>)

  t.ok(wrapper.find('[href="https://metamask.io/"]').exists())

  wrapper.unmount()
})

wrappedTest('should render etherscan link', async t => {
  const web3 = new Web3(ganache.provider({
    accounts: [
      { balance: 0 }
    ]
  }))

  const wrapper = mount(
    <Provider store={store}>
      <Web3Context.Provider value={web3}>
        <ConnectionWidget />
      </Web3Context.Provider>
    </Provider>
  )

  await delay(200)
  wrapper.update()

  t.ok(wrapper.find('EtherscanLink').exists())

  wrapper.unmount()
})
