import React from 'react'
import jss from 'react-jss'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

const decorate = jss({
  root: {
    fontFamily: 'Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleLink: {
    color: 'rgba(0, 0, 0, 0.87)',
    textDecoration: 'none'
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto'
  },
  menu: {
    display: 'flex',
    alignItems: 'center'
  },
  link: {
    color: 'black',
    marginLeft: 20
  },
  activeLink: {
    textDecoration: 'none'
  },
  '@global': {
    html: {
      height: '100%'
    },
    body: {
      height: '100%'
    },
    '#root': {
      height: '100%'
    }
  }
})

const Layout = ({ classes, children, contentClassName }) => {
  return (
    <div className={classes.root}>
      <AppBar position='static' color='default'>
        <Toolbar className={classes.header}>
          <Typography variant='title' color='inherit'>
            <Link to='/' className={classes.titleLink}>DEX</Link>
          </Typography>
          {/* <div className={classes.menu}>
            <NavLink exact activeClassName={classes.activeLink} className={classes.link} to='/'>trade</NavLink>
            <NavLink activeClassName={classes.activeLink} className={classes.link} to='/orders'>orders</NavLink>
          </div> */}
        </Toolbar>
      </AppBar>

      <div className={cx(classes.content, contentClassName)}>{children}</div>
    </div>
  )
}

export default decorate(Layout)
