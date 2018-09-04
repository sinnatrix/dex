import React from 'react'
import jss from 'react-jss'
import TextField from '@material-ui/core/TextField'
import SmartButton from 'material-ui-smart-button'
import { connect } from 'react-redux'
import compose from 'ramda/es/compose'
import { makeLimitOrder } from 'modules/index'
import { BigNumber } from '@0xproject/utils'
import OrderModeRadio from './OrderModeRadio'
import withWeb3 from 'hocs/withWeb3'

const connector = connect(
  state => ({
    marketplaceToken: state.marketplaceToken,
    currentToken: state.currentToken
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

class LimitOrderForm extends React.Component {
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
    const { web3, makeLimitOrder } = this.props

    await makeLimitOrder(web3, {
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

        <SmartButton
          className={classes.button}
          variant='raised'
          color='secondary'
          onClick={this.handlePlaceOrder}
        >Place order</SmartButton>
      </div>
    )
  }
}

export default compose(
  withWeb3,
  connector,
  decorate
)(LimitOrderForm)
