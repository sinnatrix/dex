import React from 'react'
import { ReactTableDefaults } from 'react-table'
import { TradeHistoryEntity } from 'types'

class TradeHistoryRow extends React.Component<any> {
  handleClick = () => {
    const tradeHistoryItem: TradeHistoryEntity = this.props.data
    const { network } = this.props
    const url = `https://${network}.etherscan.io/tx/${tradeHistoryItem.transactionHash}`

    const win = window.open(url, '_blank')
    if (win) {
      win.focus()
    }
  }

  render () {
    return (
      <ReactTableDefaults.TrComponent
        {...this.props}
        onClick={this.handleClick}
      />
    )
  }
}

export default TradeHistoryRow
