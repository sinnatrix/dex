import React from 'react'
import { connect } from 'react-redux'
import ProgressButton from 'components/ProgressButton'
import axios from 'axios'
import { fillOrder } from 'modules/global'

const connector = connect(
  null,
  { fillOrder }
)

class FillOrderButton extends React.Component {
  handleClick = async () => {
    const { order } = this.props

    await this.props.fillOrder(order)

    await axios.get(`/api/v1/orders/${order.metaData.orderHash}/refresh`)
  }

  render () {
    return (
      <ProgressButton onClick={this.handleClick} variant='contained' replaceContent>
        Fill
      </ProgressButton>
    )
  }
}

export default connector(FillOrderButton)
