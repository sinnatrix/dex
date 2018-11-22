import React from 'react'
import jss from 'react-jss'
import TextField from '@material-ui/core/TextField'
import ProgressButton from 'components/ProgressButton'
import { connect } from 'react-redux'
import { unwrapWeth } from 'modules/index'

const connector = connect(
  null,
  { unwrapWeth }
)

const decorate = jss({
  root: {
    display: 'flex',
    marginBottom: 2
  },
  button: {
    marginLeft: 10
  }
})

class UnwrapWethForm extends React.Component {
  state = {
    value: ''
  }

  handleChange = e => {
    this.setState({
      value: e.target.value
    })
  }

  handleClick = async () => {
    const amount = parseFloat(this.state.value || 0, 10)

    const { unwrapWeth } = this.props

    await unwrapWeth(amount)

    this.setState({
      value: ''
    })
  }

  render () {
    const { classes } = this.props
    const { value } = this.state
    return (
      <div className={classes.root}>
        <TextField value={value} onChange={this.handleChange} />
        <ProgressButton variant='contained' onClick={this.handleClick} className={classes.button}>Unwrap</ProgressButton>
      </div>
    )
  }
}

export default connector(decorate(UnwrapWethForm))
