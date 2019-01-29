import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { setUnlimitedTokenAllowance, setZeroTokenAllowance } from 'modules/global'
import { getTokenAllowance } from 'selectors'
import SmartToggleButton from 'components/SmartToggleButton'

const connector = connect(
  (state, ownProps) => ({
    allowance: getTokenAllowance(ownProps.token.symbol, state)
  }),
  { setUnlimitedTokenAllowance, setZeroTokenAllowance }
)

const decorate = jss({
  root: {
    marginTop: -8,
    marginBottom: -8
  }
})

class TokenAllowance extends React.Component<any> {
  handleChange = e => {
    const { token } = this.props
    const { checked } = e.target

    if (checked) {
      return this.props.setUnlimitedTokenAllowance(token)
    } else {
      return this.props.setZeroTokenAllowance(token)
    }
  }

  render () {
    const { allowance, classes } = this.props
    return (
      <SmartToggleButton
        className={classes.root}
        value='allowance'
        checked={allowance || false}
        onChange={this.handleChange}
      />
    )
  }
}

export default connector(decorate(TokenAllowance))
