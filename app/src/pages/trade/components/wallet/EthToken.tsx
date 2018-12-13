import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { loadEthBalance } from 'modules/global'
import WrapEthForm from './WrapEthForm'
import TokenHeader from './TokenHeader'
import TokenBalance from './TokenBalance'

const connector = connect(
  state => ({
    ethBalance: state.global.ethBalance
  }),
  { loadEthBalance }
)

const decorate = jss({
  root: {},
  content: {
    display: 'flex',
    alignItems: 'center',
    height: 32
  }
})

class EthToken extends React.Component<any> {
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

export default connector(decorate(EthToken))
