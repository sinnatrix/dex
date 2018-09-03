import React from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

class OrdersList extends React.Component {
  state = {
    orders: []
  }

  async componentDidMount () {
    const { data: orders } = await axios.get('/api/relayer/v0/orders')

    this.setState({
      orders
    })
  }

  render () {
    return (
      <div style={{ width: 700 }}>
        <header>Orders</header>
        <div>
          {this.state.orders.map(this.renderOneOrder)}
        </div>
      </div>
    )
  }

  renderOneOrder = (order, index) =>
    <div key={index}>
      <Link to={`/orders/${order.data.orderHash}`}>
        {order.data.orderHash}
      </Link>
    </div>
}

export default OrdersList
