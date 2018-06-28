import React from 'react'
import jss from 'react-jss'
import Switch from '@material-ui/core/Switch'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {setUnlimitedTokenAllowance, setZeroTokenAllowance, loadTokenAllowance} from 'modules/index'

const connector = connect(
  (state, ownProps) => ({
    allowance: state.tokenAllowances[ownProps.token.symbol]
  }),
  dispatch => bindActionCreators({setUnlimitedTokenAllowance, setZeroTokenAllowance, loadTokenAllowance}, dispatch)
)

const decorate = jss({
  root: {
    marginTop: -8,
    marginBottom: -8
  }
})

class TokenAllowance extends React.Component {
  componentDidMount () {
    this.props.loadTokenAllowance(this.props.token)
  }

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
    const {allowance, classes} = this.props
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
