import React from 'react'
import jss from 'react-jss'
import ErrorIcon from '@material-ui/icons/Error'
import CircularProgress from '@material-ui/core/CircularProgress'

const decorate = jss({
  root: {}
})

class TokenBalance extends React.Component {
  state = {
    loaded: false,
    error: false
  }

  async componentDidMount () {
    try {
      await this.props.load()
      this.setState({
        loaded: true
      })
    } catch (e) {
      console.error(e)
      this.setState({
        error: true
      })
    }
  }

  render () {
    const { loaded, error } = this.state
    const { balance = 0 } = this.props

    if (loaded) {
      return <span>{balance.toFixed(6)}</span>
    }

    if (error) {
      return <ErrorIcon />
    }

    return <CircularProgress size={20} />
  }
}

export default decorate(TokenBalance)
