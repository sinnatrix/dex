import React from 'react'
import jss from 'react-jss'
import Panel from 'components/Panel'
import ConnectionWidget from './ConnectionWidget'
import TokensList from './TokensList'

const decorate = jss({
  root: {
    display: 'flex',
    alignItems: 'left',
    flex: 'none',
    flexDirection: 'column',
    padding: 0
  }
})

const Wallet = ({ classes }) =>
  <Panel className={classes.root}>
    <ConnectionWidget />

    <TokensList />
  </Panel>

export default decorate(Wallet)
