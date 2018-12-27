import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { connect } from 'react-redux'
import TradePageWrapper from 'pages/trade/TradePageWrapper'
import { loadMarkets } from 'modules/global'
import { getMarkets } from 'selectors'
import history from 'ownHistory'

const connector = connect(
  state => ({
    markets: getMarkets(state)
  }),
  { loadMarkets }
)

class InnerApp extends React.Component<any> {
  componentDidMount () {
    this.props.loadMarkets()
  }

  render () {
    return (
      <ConnectedRouter history={history}>
        <React.Fragment>

          <Switch>
            {this.renderRedirect()}
            <Route path='/:baseAssetSymbol/:quoteAssetSymbol' component={TradePageWrapper} />
          </Switch>
        </React.Fragment>
      </ConnectedRouter>
    )
  }

  renderRedirect () {
    const { markets } = this.props
    if (!markets.length) {
      return null
    }

    const { baseAsset, quoteAsset } = markets[0]
    const redirectTo = `/${baseAsset.symbol}/${quoteAsset.symbol}`

    return (
      <Route exact path='/' render={() => <Redirect to={redirectTo} />} />
    )
  }
}

export default connector(InnerApp)
