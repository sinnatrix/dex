import React from 'react'
import jss from 'react-jss'
import TextField from '@material-ui/core/TextField'
import { connect } from 'react-redux'
import compose from 'ramda/es/compose'
import { makeLimitOrder } from 'modules/orders'
import { BigNumber } from '@0x/utils'
import OrderModeRadio from './OrderModeRadio'
import ProgressButton from 'components/ProgressButton'

const connector = connect(
  state => ({
    marketplaceToken: state.global.marketplaceToken,
    currentToken: state.global.currentToken
  }),
  { makeLimitOrder }
)

const decorate = jss({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 'none'
  },
  button: {
    marginTop: 30
  }
})

class LimitOrderForm extends React.Component<any> {
  state = {
    mode: 'buy',
    amount: 1,
    price: 0.002
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
    })
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
          className={classes.button}
          variant='contained'
          color='secondary'
          onClick={this.handlePlaceOrder}
        >Place order</ProgressButton>
      </div>
    )
  }
}

export default compose(
  connector,
  decorate
)(LimitOrderForm)
