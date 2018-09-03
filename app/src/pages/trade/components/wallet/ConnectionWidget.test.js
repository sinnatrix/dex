import React from 'react'
import ConnectionWidget from './ConnectionWidget'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Provider } from 'react-redux'
import store from 'store'

/* eslint-env jest */

Enzyme.configure({ adapter: new Adapter() })

test('should render metamask link', () => {
  const wrapper = mount(<Provider store={store}><ConnectionWidget /></Provider>)
  expect(
    wrapper.find('[href="https://metamask.io/"]').exists()
  ).toBe(true)
})
