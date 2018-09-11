import React from 'react'
import ConnectionWidget from './ConnectionWidget'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Provider } from 'react-redux'
import store from 'store'
import mockStore from 'mockStore'
import Web3Context from 'contexts/Web3Context'
import Web3 from 'web3'
const ganache = require('ganache-cli')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

/* eslint-env jest */

Enzyme.configure({ adapter: new Adapter() })

test('should render metamask link', () => {
  const wrapper = mount(<Provider store={mockStore}><ConnectionWidget /></Provider>)
  expect(
    wrapper.find('[href="https://metamask.io/"]').exists()
  ).toBe(true)
})

test('should render etherscan link', async () => {
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

  expect(
    wrapper.find('EtherscanLink').exists()
  ).toBe(true)
})
