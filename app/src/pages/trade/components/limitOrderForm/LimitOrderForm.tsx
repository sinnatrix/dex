import React from 'react'
import jss from 'react-jss'
import cx from 'classnames'
import TextField from '@material-ui/core/TextField'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import compose from 'ramda/es/compose'
import { makeLimitOrder } from 'modules/orders'
import { BigNumber } from '@0x/utils'
import OrderModeRadio from '../OrderModeRadio'
import ProgressButton from 'components/ProgressButton'
import ExpiresInput from './ExpiresInput'
import { getQuoteAsset, getBaseAsset } from 'selectors'

const connector = connect(
  (state, ownProps) => ({
    marketplaceToken: getQuoteAsset(ownProps.match.params, state),
    currentToken: getBaseAsset(ownProps.match.params, state)
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
  price: {
    marginTop: 10
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
    price: 0.001,
    expires: 86400
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

  handleExpiresChange = expires => {
    this.setState({
      expires
    })
  }

  handlePlaceOrder = async () => {
    const { mode, amount, price, expires } = this.state
    const { makeLimitOrder } = this.props

    await makeLimitOrder({
      type: mode,
      amount: new BigNumber(amount),
      price: new BigNumber(price),
      expires: new BigNumber(
        Math.floor(Date.now() / 1000 + expires)
      )
    }, this.props.match.params)
  }

  render () {
    const { classes } = this.props
    const { marketplaceToken, currentToken } = this.props
    const { mode, amount, price, expires } = this.state

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
          className={classes.price}
          type='number'
          label={`Price (${marketplaceToken.symbol})`}
          value={price}
          onChange={this.handlePriceChange}
        />

        <ExpiresInput
          value={expires}
          onChange={this.handleExpiresChange}
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

export default (compose as any)(
  withRouter,
  connector,
  decorate
)(LimitOrderForm)
