import React from 'react'
import jss from 'react-jss'
import {bindActionCreators} from 'redux'
import {loadTokenBalance} from 'modules/index'
import {connect} from 'react-redux'
import ErrorIcon from '@material-ui/icons/Error'
import CircularProgress from '@material-ui/core/CircularProgress'

const connector = connect(
  (state, ownProps) => ({
    balance: state.tokenBalances[ownProps.token.symbol]
  }),
  dispatch => bindActionCreators({loadTokenBalance}, dispatch)
)

const decorate = jss({
  root: {
    borderBottom: '1px solid #999',
    padding: [[5, 0]]
  },
  header: {
    marginBottom: 5,
    display: 'flex'
  },
  symbol: {
    width: 45,
    marginRight: 30
  }
})

class Token extends React.Component {
  state = {
    loaded: false,
    error: false
  }

  async componentDidMount () {
    try {
      await this.props.loadTokenBalance(this.props.token)
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
    const {loaded, error} = this.state
    const {classes, token, balance} = this.props

    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <span className={classes.symbol}>{token.symbol}</span>
          <span className={classes.name}>{token.name}</span>
        </div>
        {loaded
          ? <span>{balance.toFixed(6)}</span>
          : (
            error
              ? <ErrorIcon />
              : <CircularProgress size={20} />
          )
        }
      </div>
    )
  }
}

export default connector(decorate(Token))
