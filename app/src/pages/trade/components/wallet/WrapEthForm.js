import React from 'react'
import jss from 'react-jss'
import TextField from '@material-ui/core/TextField'
import { connect } from 'react-redux'
import { wrapEth } from 'modules/index'
import SmartButton from 'material-ui-smart-button'
import withWeb3 from 'hocs/withWeb3'

const connector = connect(
  null,
  { wrapEth }
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

class WrapEthForm extends React.Component {
  state = {
    value: ''
  }

  handleChange = e => {
    this.setState({
      value: e.target.value
    })
  }

  handleClick = async () => {
    const amount = parseFloat(this.state.value, 10)

    const { web3, wrapEth } = this.props

    await wrapEth(web3, amount)

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
        <SmartButton variant='raised' onClick={this.handleClick} className={classes.button}>Wrap</SmartButton>
      </div>
    )
  }
}

export default withWeb3(connector(decorate(WrapEthForm)))
