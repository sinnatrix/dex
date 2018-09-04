import React from 'react'
import jss from 'react-jss'
import Switch from '@material-ui/core/Switch'
import { connect } from 'react-redux'
import { setUnlimitedTokenAllowance, setZeroTokenAllowance, loadTokenAllowance } from 'modules/index'
import withWeb3 from 'hocs/withWeb3'

const connector = connect(
  (state, ownProps) => ({
    allowance: state.tokenAllowances[ownProps.token.symbol]
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
    const { web3, token, loadTokenAllowance } = this.props

    loadTokenAllowance(web3, token)
  }

  handleChange = e => {
    const { web3, token } = this.props
    const { checked } = e.target

    if (checked) {
      this.props.setUnlimitedTokenAllowance(web3, token)
    } else {
      this.props.setZeroTokenAllowance(web3, token)
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

export default withWeb3(connector(decorate(TokenAllowance)))
