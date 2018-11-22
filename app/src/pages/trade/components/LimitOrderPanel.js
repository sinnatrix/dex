import React from 'react'
import jss from 'react-jss'
import Panel from 'components/Panel'
import LimitOrderForm from './LimitOrderForm'

const decorate = jss({
  root: {
    paddingBottom: 10
  }
})

const LimitOrderPanel = ({ classes }) => {
  return (
    <Panel className={classes.root}>
      <LimitOrderForm />
    </Panel>
  )
}

export default decorate(LimitOrderPanel)
