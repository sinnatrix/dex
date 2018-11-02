import React from 'react'
import jss from 'react-jss'

const decorate = jss({
  root: {

    padding: 0
  },
  tabRoot: {
    minWidth: '33%'
  }
})

class Order extends React.Component {
  order = this.props.order

  render () {
    return (
      <div>{this.order.orderHash}</div>
    )
  }
}

export default Order
