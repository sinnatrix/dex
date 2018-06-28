import React from 'react'
import jss from 'react-jss'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {loadEthBalance} from 'modules/index'
import WrapEthForm from './WrapEthForm'
import TokenHeader from './TokenHeader'
import TokenBalance from './TokenBalance'

const connector = connect(
  state => ({
    ethBalance: state.ethBalance
  }),
  dispatch => bindActionCreators({loadEthBalance}, dispatch)
)

const decorate = jss({
  root: {},
  content: {
    display: 'flex',
    alignItems: 'center',
    height: 32
  }
})

class EthBalance extends React.Component {
  render () {
    const {classes, ethBalance} = this.props
    return (
      <div className={classes.root}>
        <TokenHeader symbol='ETH' name='Ethereum' />
        <div className={classes.content}>
          <TokenBalance balance={ethBalance} load={this.props.loadEthBalance} />
        </div>
        <WrapEthForm />
      </div>
    )
  }
}

export default connector(decorate(EthBalance))
