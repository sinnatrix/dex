import React from 'react'
import { ReactTableDefaults } from 'react-table'
import { TradeHistoryEntity } from 'types'
import { getEtherscanTxUrl, openUrlInNewWindow } from 'modules/global/helpers'

class Row extends React.Component<any> {
  handleClick = () => {
    const tradeHistoryItem: TradeHistoryEntity = this.props.data
    const { network } = this.props
    const url = getEtherscanTxUrl(tradeHistoryItem.transactionHash, network)

    openUrlInNewWindow(url)
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
