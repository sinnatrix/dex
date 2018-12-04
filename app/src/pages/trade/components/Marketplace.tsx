import React from 'react'
import jss from 'react-jss'
import MarketplaceChooser from './MarketplaceChooser'
import TokenChooser from './TokenChooser'
import Panel from 'components/Panel'

const decorate = jss({
  root: {
    display: 'flex',
    flex: 'none'
  },
  wrapper: {
    marginRight: 30
  }
})

const Marketplace = ({ classes }) =>
  <Panel className={classes.root}>
    <div className={classes.wrapper}>
      <MarketplaceChooser />
    </div>
    <div className={classes.wrapper}>
      <TokenChooser />
    </div>
  </Panel>

export default decorate(Marketplace)
