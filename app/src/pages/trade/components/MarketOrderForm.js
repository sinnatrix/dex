import React from 'react'
import jss from 'react-jss'
import TextField from '@material-ui/core/TextField'
import SmartButton from 'material-ui-smart-button'
import OrderModeRadio from './OrderModeRadio'
import { makeMarketOrder } from 'modules/index'
import { connect } from 'react-redux'
import withWeb3 from 'hocs/withWeb3'

const connector = connect(
  state => ({
    marketplaceToken: state.marketplaceToken,
    currentToken: state.currentToken
  }),
  { makeMarketOrder }
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

class MarketOrderForm extends React.Component {
  state = {
    mode: 'buy',
    amount: 1
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

  handlePlaceOrder = async () => {
    const { mode, amount } = this.state
    const { web3, makeMarketOrder } = this.props

    try {
      await makeMarketOrder(web3, {
        type: mode,
        amount
      })
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  render () {
    const { classes, marketplaceToken, currentToken } = this.props
    const { amount, mode } = this.state

    const symbol = mode === 'buy' ? marketplaceToken.symbol : currentToken.symbol

    return (
      <div className={classes.root}>
        <OrderModeRadio
          mode={mode}
          onChange={this.handleModeChange}
        />

        <TextField
          type='number'
          label={`Amount (${symbol})`}
          value={amount}
          onChange={this.handleAmountChange}
        />

        <SmartButton
          variant='raised'
          color='secondary'
          className={classes.button}
          onClick={this.handlePlaceOrder}
        >Place order</SmartButton>
      </div>
    )
  }
}

export default withWeb3(connector(decorate(MarketOrderForm)))
