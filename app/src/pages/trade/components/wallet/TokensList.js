import React from 'react'
import jss from 'react-jss'
import EthToken from './EthToken'
import Token from './Token'
import WethToken from './WethToken'
import { connect } from 'react-redux'

const connector = connect(
  state => ({
    account: state.account,
    tokens: state.tokens
  })
)

const decorate = jss({
  root: {},
  token: {
    borderTop: '1px solid #ccc',
    padding: [[12, 24]]
  }
})

const TokensList = ({ classes, tokens, account }) => {
  if (tokens.length === 0 || !account) {
    return null
  }

  const wethToken = tokens.find(one => one.symbol === 'WETH')
  if (!wethToken) {
    return null
  }

  return (
    <React.Fragment>
      <div className={classes.token}>
        <EthToken />
      </div>

      <div className={classes.token}>
        <WethToken token={wethToken} />
      </div>

      {tokens.filter(token => token.symbol !== 'WETH').map(token =>
        <div key={token.address} className={classes.token}>
          <Token token={token} />
        </div>
      )}
    </React.Fragment>
  )
}

export default connector(decorate(TokensList))
