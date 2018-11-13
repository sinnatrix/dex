import React from 'react'
import connect from 'react-redux/es/connect/connect'
import { awaitTransaction, fillOrderAsync, convertOrderToSRA2Format } from 'helpers'
import withWeb3 from 'hocs/withWeb3'
import axios from 'axios'

const connector = connect(
  state => ({
    account: state.account
  })
)

class FillOrderButton extends React.Component {
  state = {
    isOrderSent: false,
    isTransactionCompleted: null
  }

  handleClick = async () => {
    const { web3, order, account } = this.props
    // Loader start
    const txHash = await fillOrderAsync(
      web3,
      account,
      convertOrderToSRA2Format(order),
      order.takerAssetAmount
    )
    this.state.isOrderSent = true
    if (txHash) {
      this.state.isTransactionCompleted = await awaitTransaction(web3, txHash)

      await axios.get(`/api/v1/orders/${order.orderHash}/refresh`)
    }
    // Loader stop
  }

  render () {
    return (
      <button onClick={this.handleClick}>
        Fill
      </button>
    )
  }
}

export default withWeb3(connector(FillOrderButton))
