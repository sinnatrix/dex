import test from 'tape'
import React from 'react'
import ConnectionWidget from './ConnectionWidget'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import rootReducer from 'modules/index'
import BlockchainService from 'services/BlockchainService'
import { initWeb3ByBalance } from 'helpers/testUtils'
import { createStore, applyMiddleware } from 'redux'
import { delay } from 'helpers/general'

Enzyme.configure({ adapter: new Adapter() })

const initStore = () => {
  const web3 = initWeb3ByBalance(0)
  const blockchainService = new BlockchainService({ web3, contractAddresses: null })

  const store = createStore(rootReducer, applyMiddleware(
    thunk.withExtraArgument({
      blockchainService,
      apiService: {
        getTokens () {
          return []
        }
      }
    })
  ))

  return store
}

test('ConnectionWidget', t => {
  t.test('should render metamask link', async t => {
    const wrapper = mount(
      <Provider store={initStore()}>
        <ConnectionWidget />
      </Provider>
    )

    t.ok(wrapper.find('[href="https://metamask.io/"]').exists())

    await delay(100)
    wrapper.unmount()

    t.end()
  })

  t.test('should render etherscan link', async t => {
    const wrapper = mount(
      <Provider store={initStore()}>
        <ConnectionWidget />
      </Provider>
    )

    await delay(200)
    wrapper.update()

    t.ok(wrapper.find('EtherscanLink').exists())

    await delay(100)
    wrapper.unmount()

    t.end()
  })
})
