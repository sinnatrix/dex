import React from 'react'
import jss from 'react-jss'
import {connect} from 'react-redux'
import {getEthBalance} from 'helpers'
import {bindActionCreators} from 'redux'
import {setEthBalance} from 'modules/index'

const connector = connect(
  state => ({
    account: state.account,
    balance: state.ethBalance
  }),
  dispatch => bindActionCreators({setEthBalance}, dispatch)
)

const decorate = jss({
  root: {}
})

class EthBalance extends React.Component {
  state = {
    loaded: false,
    balance: 0
  }

  async componentDidMount () {
    const balance = await getEthBalance(this.props.account)

    this.setState({
      loaded: true
    })

    this.props.setEthBalance(balance)
  }

  render () {
    const {loaded} = this.state
    if (!loaded) {
      return null
    }
    const {classes, balance} = this.props
    return (
      <div className={classes.root}>ETH {balance.toFixed(6)}</div>
    )
  }
}

export default connector(decorate(EthBalance))
