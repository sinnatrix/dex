import React from 'react'
import jss from 'react-jss'
import Panel from 'components/Panel'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import TextField from '@material-ui/core/TextField'
import SmartButton from 'material-ui-smart-button'
import {withRouter} from 'react-router-dom'
import {ZeroEx} from '0x.js'
import axios from 'axios'
import {BigNumber} from '@0xproject/utils'

const decorate = jss({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  button: {
    marginTop: 30
  }
})

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
    const {marketplace, token} = this.props.match.params

    const {type} = this.state
    const amount = parseFloat(this.state.amount)
    const price = parseFloat(this.state.price)

    let data

    if (type === 'buy') {
      data = {
        takerSymbol: token,
        takerAmount: amount,
        makerSymbol: marketplace,
        makerAmount: price * amount
      }
    } else {
      data = {
        takerSymbol: marketplace,
        takerAmount: price * amount,
        makerSymbol: token,
        makerAmount: amount
      }
    }

    const {data: makerToken} = await axios(`/api/v1/token/by-symbol/${data.makerSymbol}`)
    const {data: takerToken} = await axios(`/api/v1/token/by-symbol/${data.takerSymbol}`)

    const makerAddress = window.web3js.eth.accounts[0]

    const networkId = parseInt(window.web3.version.network, 10)

    const zeroEx = new ZeroEx(window.web3.currentProvider, {networkId})

    const EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress()

    const order = {
      maker: makerAddress,
      taker: ZeroEx.NULL_ADDRESS,
      feeRecipient: ZeroEx.NULL_ADDRESS,
      makerTokenAddress: makerToken.address,
      takerTokenAddress: takerToken.address,
      exchangeContractAddress: EXCHANGE_ADDRESS,
      salt: ZeroEx.generatePseudoRandomSalt(),
      makerFee: new BigNumber(0),
      takerFee: new BigNumber(0),
      makerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(data.makerAmount), makerToken.decimals),
      takerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(data.takerAmount), takerToken.decimals),
      expirationUnixTimestampSec: new BigNumber(parseInt(Date.now() / 1000 + 3600 * 24, 10)) // Valid for up to a day
    }

    const orderHash = ZeroEx.getOrderHashHex(order)

    const shouldAddPersonalMessagePrefix = window.web3.currentProvider.constructor.name === 'MetamaskInpageProvider'
    let ecSignature
    try {
      ecSignature = await zeroEx.signOrderHashAsync(orderHash, makerAddress, shouldAddPersonalMessagePrefix)
    } catch (e) {
      console.error('e: ', e)
      return
    }

    const signedOrder = {
      ...order,
      orderHash,
      ecSignature
    }

    axios.post('/api/v1/orders', signedOrder)
  }

  render () {
    const {classes} = this.props
    const {marketplace, token} = this.props.match.params
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

        <TextField type='number' label={`Amount (${token})`} value={amount} onChange={this.handleAmountChange} />

        <TextField type='number' label={`Price (${marketplace})`} value={price} onChange={this.handlePriceChange} />

        <SmartButton className={classes.button} variant='raised' color='secondary' onClick={this.handlePlaceOrder}>Place order</SmartButton>
      </Panel>
    )
  }
}

export default withRouter(decorate(LimitOrderForm))
