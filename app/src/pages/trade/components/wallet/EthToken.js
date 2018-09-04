import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { loadEthBalance } from 'modules/index'
import WrapEthForm from './WrapEthForm'
import TokenHeader from './TokenHeader'
import TokenBalance from './TokenBalance'
import withWeb3 from 'hocs/withWeb3'

const connector = connect(
  state => ({
    ethBalance: state.ethBalance
  }),
  (dispatch, ownProps) => ({
    loadEthBalance () {
      return dispatch(loadEthBalance(ownProps.web3))
    }
  })
)

const decorate = jss({
  root: {},
  content: {
    display: 'flex',
    alignItems: 'center',
    height: 32
  }
})

class EthToken extends React.Component {
  render () {
    const { classes, ethBalance } = this.props
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

export default withWeb3(connector(decorate(EthToken)))
