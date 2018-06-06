import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import OrdersPage from 'pages/orders/OrdersPage'
import TradePage from 'pages/trade/TradePage'
import { MuiThemeProvider } from '@material-ui/core/styles'
import { Provider } from 'react-redux'
import theme from './theme'
import store from './store'

class App extends React.Component {
  render () {
    return (
      <React.Fragment>
        <CssBaseline />
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <Router>
              <Switch>
                <Route path='/orders' component={OrdersPage} />
                <Route path='/:marketplace?/:token?' component={TradePage} />
              </Switch>
            </Router>
          </Provider>
        </MuiThemeProvider>
      </React.Fragment>
    )
  }
}

export default App
