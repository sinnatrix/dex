import React from 'react'
import jss from 'react-jss'
import EthToken from './EthToken'
import Token from './Token'
import WethToken from './WethToken'
import { connect } from 'react-redux'
import { getTokensToDisplay, getTokenBySymbol } from 'selectors'
import { loadTokenBalances } from 'modules/global'

const connector = connect(
  state => ({
    tokens: getTokensToDisplay(state),
    wethToken: getTokenBySymbol('WETH', state)
  }),
  { loadTokenBalances }
)

const decorate = jss({
  root: {},
  token: {
    borderTop: '1px solid #ccc',
    padding: [[12, 24]]
  }
})

class TokensList extends React.Component<any> {
  render () {
    const { classes, tokens, wethToken } = this.props

    return (
      <>
        <div className={classes.token}>
          <EthToken />
        </div>

        {!!wethToken && !!wethToken.address &&
          <div className={classes.token}>
            <WethToken token={wethToken}/>
          </div>
        }

        {tokens.map(token =>
          <div key={token.address} className={classes.token}>
            <Token token={token} />
          </div>
        )}
      </>
    )
  }
}

export default connector(decorate(TokensList))
