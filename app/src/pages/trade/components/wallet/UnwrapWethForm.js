import React from 'react'
import jss from 'react-jss'
import TextField from '@material-ui/core/TextField'
import SmartButton from 'material-ui-smart-button'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {unwrapWeth} from 'modules/index'

const connector = connect(
  null,
  dispatch => bindActionCreators({unwrapWeth}, dispatch)
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

    await this.props.unwrapWeth(amount)

    this.setState({
      value: ''
    })
  }

  render () {
    const {classes} = this.props
    const {value} = this.state
    return (
      <div className={classes.root}>
        <TextField value={value} onChange={this.handleChange} />
        <SmartButton variant='raised' onClick={this.handleClick} className={classes.button}>Unwrap</SmartButton>
      </div>
    )
  }
}

export default connector(decorate(UnwrapWethForm))
