import React from 'react'
import jss from 'react-jss'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import NativeSelect from '@material-ui/core/NativeSelect'
import { withRouter } from 'react-router-dom'

const decorate = jss({
  root: {}
})

class MarketplaceChooser extends React.Component {
  handleChange = e => {
    const { token = 'ZRX' } = this.props.match.params
    this.props.history.push(`/${e.target.value}/${token}`)
  }

  render () {
    const { classes } = this.props
    const { marketplace = 'WETH' } = this.props.match.params
    return (
      <FormControl className={classes.root}>
        <InputLabel htmlFor='age-native-simple'>Marketplace</InputLabel>
        <NativeSelect value={marketplace} onChange={this.handleChange}>
          <option value='WETH'>WETH</option>
          <option value='DAI'>DAI</option>
        </NativeSelect>
      </FormControl>
    )
  }
}

export default withRouter(decorate(MarketplaceChooser))
