import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { connect } from 'react-redux'
import TradePage from 'pages/trade/TradePage'
import { loadMarkets, loadNetwork } from 'modules/global'
import history from 'ownHistory'
import { DEFAULT_MARKET_PATH } from 'modules/global/helpers'

const connector = connect(
  null,
  { loadMarkets, loadNetwork }
)

class InnerApp extends React.Component<any> {
  componentDidMount () {
    this.props.loadMarkets()
    this.props.loadNetwork()
  }

  render () {
    return (
      <ConnectedRouter history={history}>
        <React.Fragment>
          <Switch>
            <Route
              path='/:baseAssetSymbol/:quoteAssetSymbol'
              render={props => <TradePage {...props} />}
            />
            <Redirect to={DEFAULT_MARKET_PATH} />
          </Switch>
        </React.Fragment>
      </ConnectedRouter>
    )
  }
}

export default connector(InnerApp)
