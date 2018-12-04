import React from 'react'
import { connect } from 'react-redux'
import ProgressButton from 'components/ProgressButton'
import { fillOrder } from 'modules/orders'

const connector = connect(
  null,
  { fillOrder }
)

class FillOrderButton extends React.Component {
  handleClick = async () => {
    const { order } = this.props
    await this.props.fillOrder(order)
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
