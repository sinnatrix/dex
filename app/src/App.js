import React from 'react'
import jss from 'react-jss'
import CssBaseline from '@material-ui/core/CssBaseline'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import OrdersList from 'components/OrdersList'
import Order from 'components/Order'

const decorate = jss({
  root: {
    fontFamily: 'Roboto, sans-serif'
  },
  header: {
    textAlign: 'center',
    backgroundColor: '#222',
    padding: 1,
    color: 'white'
  },
  title: {
    fontSize: '1.5em',
    letterSpacing: 5
  },
  content: {
    marginTop: 20,
    display: 'flex'
  }
})

class App extends React.Component {
  render () {
    const {classes} = this.props
    return (
      <React.Fragment>
        <CssBaseline />
        <Router>
          <div className={classes.root}>
            <header className={classes.header}>
              <h1 className={classes.title}>DEX</h1>
            </header>

            <div className={classes.content}>
              <OrdersList />
              <Route path='/orders/:hash' component={Order} />
            </div>
          </div>
        </Router>
      </React.Fragment>
    )
  }
}

export default decorate(App)
