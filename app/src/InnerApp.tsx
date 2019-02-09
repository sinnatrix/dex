import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { connect } from 'react-redux'
import TradePage from 'pages/trade/TradePage'
import { loadMarkets } from 'modules/global'
import { getMarkets } from 'selectors'
import history from 'ownHistory'

const connector = connect(
  null,
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
            <Route exact path='/' render={() => <Redirect to={'/WETH/DAI'} />} />
            <Route path='/:baseAssetSymbol/:quoteAssetSymbol' component={TradePage} />
          </Switch>
        </React.Fragment>
      </ConnectedRouter>
    )
  }
}

export default connector(InnerApp)
