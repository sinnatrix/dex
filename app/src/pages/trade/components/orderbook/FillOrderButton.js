import React from 'react'
import { connect } from 'react-redux'
import SmartButton from 'material-ui-smart-button'
import axios from 'axios'
import { fillOrder } from 'modules/index'
import withWeb3 from 'hocs/withWeb3'

const connector = connect(
  null,
  { fillOrder }
)

class FillOrderButton extends React.Component {
  handleClick = async () => {
    const { web3, order } = this.props

    await this.props.fillOrder(web3, order)

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

export default withWeb3(connector(FillOrderButton))
