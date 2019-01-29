import React from 'react'
import jss from 'react-jss'
import { loadTokenBalance, loadTokenAllowance } from 'modules/global'
import { connect } from 'react-redux'
import TokenAllowance from './TokenAllowance'
import TokenHeader from './TokenHeader'
import TokenBalance from './TokenBalance'
import { getTokenBalance } from 'selectors'

const connector = connect(
  (state, ownProps) => ({
    balance: getTokenBalance(ownProps.token.symbol, state)
  }),
  { loadTokenBalance, loadTokenAllowance }
)

const decorate = jss({
  root: {
    fontSize: 14
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    height: 32
  }
})

class Token extends React.Component<any> {
  loadBalance = () => this.props.loadTokenBalance(this.props.token)

  componentDidMount () {
    this.props.loadTokenAllowance(this.props.token)
  }

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
