import React from 'react'
import Order from './Order'
import { connect } from 'react-redux'
import { loadUserOrdersByMakerAddress } from 'modules/index'

const connector = connect(
  state => ({
    userOrders: state.userOrders,
    account: state.account
  }),
  { loadUserOrdersByMakerAddress }
)
class OrdersList extends React.Component {
  componentDidMount () {
    this.props.loadUserOrdersByMakerAddress(this.props.account)
  }

  render () {
    return (
      this.props.userOrders.map((order, i) => <Order order={order} key={i} />)
    )
  }
}

export default connector(OrdersList)
