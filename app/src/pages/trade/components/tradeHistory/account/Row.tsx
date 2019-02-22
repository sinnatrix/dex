import React from 'react'
import { ReactTableDefaults } from 'react-table'
import { ITradeHistoryItem } from 'types'

class Row extends React.Component<any> {
  handleClick = () => {
    const tradeHistoryItem: ITradeHistoryItem = this.props.data
    const { network } = this.props

    let url = 'https://'
    if (network !== 'mainnet') {
      url += `${network}.`
    }
    url += `etherscan.io/tx/${tradeHistoryItem.transactionHash}`

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

export default Row
