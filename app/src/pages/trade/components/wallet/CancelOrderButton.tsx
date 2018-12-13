import React from 'react'
import { connect } from 'react-redux'
import ProgressButton from 'components/ProgressButton'
import Icon from '@material-ui/icons/Cancel'
import { cancelOrder } from 'modules/orders'

const connector = connect(
  null,
  { cancelOrder }
)

class CancelOrderButton extends React.Component<any> {
  handleClick = async () => {
    const { order } = this.props

    await this.props.cancelOrder(order)
  }

  render () {
    return (
      <ProgressButton onClick={this.handleClick} variant='contained' replaceContent>
        <Icon />
      </ProgressButton>
    )
  }
}

export default connector(CancelOrderButton)
