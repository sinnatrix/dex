import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { getMarket } from 'selectors'
import Panel from 'components/Panel'
import Token from './wallet/Token'

const connector = connect(
  (state, ownProps) => ({
    market: getMarket(ownProps.match.params, state)
  })
)

class MarketplaceAllowances extends React.Component<any> {
  render () {
    const { market } = this.props

    if (!market) {
      return null
    }

    return (
      <Panel>
        <Token token={market.baseAsset} />
        <hr />
        <Token token={market.quoteAsset} />
      </Panel>
    )
  }
}

export default withRouter(connector(MarketplaceAllowances))
