import React from 'react'
import jss from 'react-jss'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import NativeSelect from '@material-ui/core/NativeSelect'
import { withRouter } from 'react-router-dom'

const tokens = [
  'ZRX',
  'GNT'
]

const decorate = jss({
  root: {}
})

class TokenChooser extends React.Component {
  handleChange = e => {
    const { marketplace = 'WETH' } = this.props.match.params
    this.props.history.push(`/${marketplace}/${e.target.value}`)
  }

  render () {
    const { classes } = this.props
    const { token = 'ZRX' } = this.props.match.params
    return (
      <FormControl className={classes.root}>
        <InputLabel htmlFor='age-native-simple'>Token</InputLabel>
        <NativeSelect value={token} onChange={this.handleChange}>
          {tokens.map(name =>
            <option value={name} key={name}>{name}</option>
          )}
        </NativeSelect>
      </FormControl>
    )
  }
}

export default withRouter(decorate(TokenChooser))
