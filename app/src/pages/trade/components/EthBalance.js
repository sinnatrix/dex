import React from 'react'
import jss from 'react-jss'
import ErrorIcon from '@material-ui/icons/Error'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {loadEthBalance} from 'modules/index'
import WrapEthForm from './WrapEthForm'

const connector = connect(
  state => ({
    ethBalance: state.ethBalance
  }),
  dispatch => bindActionCreators({loadEthBalance}, dispatch)
)

const decorate = jss({
  root: {
    marginBottom: 10
  }
})

class EthBalance extends React.Component {
  state = {
    loaded: false,
    error: false
  }

  async componentDidMount () {
    try {
      this.props.loadEthBalance()
      this.setState({
        loaded: true
      })
    } catch (e) {
      this.setState({
        error: true
      })
    }
  }

  render () {
    const {classes, ethBalance} = this.props
    const {loaded, error} = this.state
    return (
      <div className={classes.root}>
        <div>ETH</div>
        <div>
          {loaded
            ? ethBalance.toFixed(6)
            : (
              error
                ? <ErrorIcon />
                : 'error'
            )
          }
        </div>
        <WrapEthForm />
      </div>
    )
  }
}

export default connector(decorate(EthBalance))
