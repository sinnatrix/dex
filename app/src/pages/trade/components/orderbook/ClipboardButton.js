import React from 'react'
import jss from 'react-jss'
import IconButton from '@material-ui/core/IconButton'
import CopyIcon from '@material-ui/icons/FileCopy'

const copyToClipboard = str => {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

const decorate = jss({
  root: {},
  button: {
    width: 32,
    height: 32
  },
  icon: {
    width: 18,
    height: 18
  }
})

class ClipboardButton extends React.Component {
  handleClick = () => {
    const { order } = this.props
    copyToClipboard(JSON.stringify({
      signedOrder: order.order.data,
      metadata: {
        makerToken: {
          name: order.makerToken.name,
          symbol: order.makerToken.symbol,
          decimals: order.makerToken.decimals
        },
        takerToken: {
          name: order.takerToken.name,
          symbol: order.takerToken.symbol,
          decimals: order.takerToken.decimals
        }
      }
    }))
  }

  render () {
    const { classes } = this.props
    return (
      <IconButton className={classes.root} onClick={this.handleClick} classes={{ root: classes.button }}>
        <CopyIcon classes={{ root: classes.icon }} />
      </IconButton>
    )
  }
}

export default decorate(ClipboardButton)
