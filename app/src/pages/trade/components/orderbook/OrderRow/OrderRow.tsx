import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { ReactTableDefaults } from 'react-table'
import OrderInfoPopper from './OrderInfoPopper'

class OrderRow extends React.Component<any> {
  state = {
    anchorEl: null
  }

  showOrderInfo = event => {
    const { currentTarget } = event

    this.setState({
      anchorEl: currentTarget
    })
  }

  hideOrderInfo = () => {
    this.setState({
      anchorEl: null
    })
  }

  render () {
    const { anchorEl } = this.state

    return (
      <>
        <ReactTableDefaults.TrComponent
          {...this.props}
          onMouseEnter={this.showOrderInfo}
          onMouseLeave={this.hideOrderInfo}
        />
        {!!anchorEl &&
          <OrderInfoPopper
            anchorEl={anchorEl}
            order={this.props.data}
          />
        }
      </>
    )
  }
}

export default OrderRow
