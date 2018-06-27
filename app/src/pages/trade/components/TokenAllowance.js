import React from 'react'
import jss from 'react-jss'
import Switch from '@material-ui/core/Switch'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {setUnlimitedTokenAllowance, setZeroTokenAllowance} from 'modules/index'

const connector = connect(
  (state, ownProps) => ({
    allowance: state.tokenAllowances[ownProps.token.symbol]
  }),
  dispatch => bindActionCreators({setUnlimitedTokenAllowance, setZeroTokenAllowance}, dispatch)
)

const decorate = jss({
  root: {}
})

class TokenAllowance extends React.Component {
  handleChange = e => {
    const {token} = this.props
    const {checked} = e.target

    if (checked) {
      this.props.setUnlimitedTokenAllowance(token)
    } else {
      this.props.setZeroTokenAllowance(token)
    }
  }

  render () {
    const {allowance} = this.props
    return (
      <Switch
        value='allowance'
        checked={allowance || false}
        onChange={this.handleChange}
      />
    )
  }
}

export default connector(decorate(TokenAllowance))
