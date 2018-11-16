import React from 'react'
import { connect } from 'react-redux'
import SmartButton from 'material-ui-smart-button'
import axios from 'axios'
import { fillOrder } from 'modules/index'

const connector = connect(
  null,
  { fillOrder }
)

class FillOrderButton extends React.Component {
  handleClick = async () => {
    const { order } = this.props

    await this.props.fillOrder(order)

    await axios.get(`/api/v1/orders/${order.order.orderHash}/refresh`)
  }

  render () {
    return (
      <SmartButton onClick={this.handleClick} variant='contained'>
        Fill
      </SmartButton>
    )
  }
}

export default connector(FillOrderButton)
