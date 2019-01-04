import React from 'react'
import jss from 'react-jss'
import TextField from '@material-ui/core/TextField'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import compose from 'ramda/es/compose'
import { makeLimitOrder } from 'modules/orders'
import { BigNumber } from '@0x/utils'
import OrderModeRadio from './OrderModeRadio'
import ProgressButton from 'components/ProgressButton'
import cx from 'classnames'
import { getMarketplaceToken, getCurrentToken } from 'modules/global/selectors'

const connector = connect(
  (state, ownProps) => ({
    marketplaceToken: getMarketplaceToken(ownProps.match.params, state),
    currentToken: getCurrentToken(ownProps.match.params, state)
  }),
  { makeLimitOrder }
)

const decorate = jss(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 'none'
  },
  button: {
    marginTop: 30
  },
  sell: {
    backgroundColor: [theme.custom.bidColor.main, '!important']
  },
  buy: {
    backgroundColor: [theme.custom.askColor.main, '!important']
  }
}))

class LimitOrderForm extends React.Component<any> {
  state = {
    mode: 'buy',
    amount: 1,
    price: 0.001
  }

  handleModeChange = mode => {
    this.setState({
      mode
    })
  }

  handleAmountChange = e => {
    this.setState({
      amount: e.target.value
    })
  }

  handlePriceChange = e => {
    this.setState({
      price: e.target.value
    })
  }

  handlePlaceOrder = async () => {
    const { mode, amount, price } = this.state
    const { makeLimitOrder } = this.props

    await makeLimitOrder({
      type: mode,
      amount: new BigNumber(amount),
      price: new BigNumber(price)
    }, this.props.match.params)
  }

  render () {
    const { classes } = this.props
    const { marketplaceToken, currentToken } = this.props
    const { mode, amount, price } = this.state

    return (
      <div className={classes.root}>
        <OrderModeRadio
          mode={mode}
          onChange={this.handleModeChange}
        />

        <TextField
          type='number'
          label={`Amount (${currentToken.symbol})`}
          value={amount}
          onChange={this.handleAmountChange}
        />

        <TextField
          type='number'
          label={`Price (${marketplaceToken.symbol})`}
          value={price}
          onChange={this.handlePriceChange}
        />

        <ProgressButton
          className={cx(classes.button, classes[this.state.mode])}
          variant='contained'
          color='secondary'
          onClick={this.handlePlaceOrder}
        >Place {this.state.mode} order</ProgressButton>
      </div>
    )
  }
}

export default compose(
  withRouter,
  connector,
  decorate
)(LimitOrderForm)
