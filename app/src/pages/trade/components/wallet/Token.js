import React from 'react'
import jss from 'react-jss'
import { loadTokenBalance } from 'modules/global'
import { connect } from 'react-redux'
import TokenAllowance from './TokenAllowance'
import TokenHeader from './TokenHeader'
import TokenBalance from './TokenBalance'

const connector = connect(
  (state, ownProps) => ({
    balance: state.global.tokenBalances[ownProps.token.symbol]
  }),
  { loadTokenBalance }
)

const decorate = jss({
  root: {},
  content: {
    display: 'flex',
    alignItems: 'center',
    height: 32
  }
})

class Token extends React.Component {
  loadBalance = () => this.props.loadTokenBalance(this.props.token)

  render () {
    const { classes, token, balance } = this.props

    return (
      <div className={classes.root}>
        <TokenHeader symbol={token.symbol} name={token.name} />
        <div className={classes.content}>
          <TokenBalance balance={balance} load={this.loadBalance} />
          <TokenAllowance token={token} />
        </div>
      </div>
    )
  }
}

export default connector(decorate(Token))
