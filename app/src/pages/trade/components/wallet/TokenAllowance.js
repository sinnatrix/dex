import React from 'react'
import jss from 'react-jss'
import Switch from '@material-ui/core/Switch'
import { connect } from 'react-redux'
import { setUnlimitedTokenAllowance, setZeroTokenAllowance, loadTokenAllowance } from 'modules/global'

const connector = connect(
  (state, ownProps) => ({
    allowance: state.global.tokenAllowances[ownProps.token.symbol]
  }),
  { setUnlimitedTokenAllowance, setZeroTokenAllowance, loadTokenAllowance }
)

const decorate = jss({
  root: {
    marginTop: -8,
    marginBottom: -8
  }
})

class TokenAllowance extends React.Component {
  componentDidMount () {
    const { token, loadTokenAllowance } = this.props

    loadTokenAllowance(token)
  }

  handleChange = e => {
    const { token } = this.props
    const { checked } = e.target

    if (checked) {
      this.props.setUnlimitedTokenAllowance(token)
    } else {
      this.props.setZeroTokenAllowance(token)
    }
  }

  render () {
    const { allowance, classes } = this.props
    return (
      <Switch
        className={classes.root}
        value='allowance'
        checked={allowance || false}
        onChange={this.handleChange}
      />
    )
  }
}

export default connector(decorate(TokenAllowance))
