import React from 'react'
import jss from 'react-jss'
import Panel from 'components/Panel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'
import SmartButton from 'material-ui-smart-button'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import compose from 'ramda/es/compose'
import {makeOrder} from 'modules/index'
import {BigNumber} from '@0xproject/utils'

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

const connector = connect(
  state => ({
    marketplaceToken: state.marketplaceToken,
    currentToken: state.currentToken
  }),
  dispatch => bindActionCreators({makeOrder}, dispatch)
)

class LimitOrderForm extends React.Component {
  state = {
    type: 'buy',
    amount: 1,
    price: 0.002
  }

  handleTypeChange = e => {
    this.setState({
      type: e.target.value
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
    const {type, amount, price} = this.state

    this.props.makeOrder({
      type,
      amount: new BigNumber(amount),
      price: new BigNumber(price)
    })
  }

  render () {
    const {classes} = this.props
    const {marketplaceToken, currentToken} = this.props
    const {type, amount, price} = this.state

    return (
      <Panel className={classes.root}>
        <RadioGroup
          row
          aria-label='mode'
          name='mode'
          value={type}
          onChange={this.handleTypeChange}
        >
          <FormControlLabel value='buy' control={<Radio />} label='Buy' />
          <FormControlLabel value='sell' control={<Radio />} label='Sell' />
        </RadioGroup>

        <TextField type='number' label={`Amount (${currentToken.symbol})`} value={amount} onChange={this.handleAmountChange} />

        <TextField type='number' label={`Price (${marketplaceToken.symbol})`} value={price} onChange={this.handlePriceChange} />

        <SmartButton className={classes.button} variant='raised' color='secondary' onClick={this.handlePlaceOrder}>Place order</SmartButton>
      </Panel>
    )
  }
}

export default compose(
  connector,
  decorate
)(LimitOrderForm)
