import React from 'react'
import jss from 'react-jss'
import {getTokenBalance} from 'helpers'
import {bindActionCreators} from 'redux'
import {setTokenBalance} from 'modules/index'
import {connect} from 'react-redux'

const connector = connect(
  (state, ownProps) => ({
    account: state.account,
    balance: state.tokenBalances[ownProps.token.symbol]
  }),
  dispatch => bindActionCreators({setTokenBalance}, dispatch)
)

const decorate = jss({
  root: {}
})

class TokenBalance extends React.Component {
  state = {
    loaded: false
  }

  async componentDidMount () {
    const {account, token} = this.props

    const balance = await getTokenBalance(account, token.address)

    this.setState({
      loaded: true
    })

    this.props.setTokenBalance(token.symbol, balance)
  }

  render () {
    const {loaded} = this.state
    const {classes, token, balance} = this.props

    if (!loaded || balance === undefined) {
      return null
    }

    return (
      <div className={classes.root}>{token.symbol} {balance.toFixed(6)}</div>
    )
  }
}

export default connector(decorate(TokenBalance))
