import React from 'react'
import jss from 'react-jss'
import { loadTokenAllowance } from 'modules/global'
import { connect } from 'react-redux'
import TokenAllowance from './TokenAllowance'
import TokenHeader from './TokenHeader'
import { getTokenBalance } from 'selectors'

const connector = connect(
  (state, ownProps) => ({
    balance: getTokenBalance(ownProps.token.symbol, state)
  }),
  { loadTokenAllowance }
)

const decorate = jss({
  root: {
    fontSize: 14
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    height: 32
  },
  balance: {
    width: 65,
    marginRight: 20
  }
})

class Token extends React.Component<any> {
  componentDidMount () {
    this.props.loadTokenAllowance(this.props.token)
  }

  render () {
    const { classes, token, balance } = this.props

    return (
      <div className={classes.root}>
        <TokenHeader symbol={token.symbol} name={token.name} />
        <div className={classes.content}>
          <span className={classes.balance}>
            {balance ? balance.toFixed(7) : '0'}
          </span>
          <TokenAllowance token={token} />
        </div>
      </div>
    )
  }
}

export default connector(decorate(Token))
