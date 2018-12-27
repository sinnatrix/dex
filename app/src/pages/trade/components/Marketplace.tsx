import React from 'react'
import jss from 'react-jss'
import cx from 'classnames'
import Panel from 'components/Panel'
import { connect } from 'react-redux'
import { getMarket } from 'selectors'
import TrendArrow from './TrendArrow'
import Popper from '@material-ui/core/Popper'
import MarketsList from './MarketsList'
import { withRouter } from 'react-router-dom'
import { Paper } from '@material-ui/core'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { getFormattedMarketPrice, getFormattedMarketEthPrice } from 'helpers/general'
import ArrowRight from '@material-ui/icons/KeyboardArrowRight'

const connector = connect(
  (state, ownProps) => ({
    market: getMarket(ownProps.match.params, state)
  })
)

const decorate = jss({
  root: {
    display: 'flex',
    flex: 'none',
    cursor: 'pointer',
    padding: 0,
    '&:hover $rightColumn': {
      backgroundColor: '#ccc'
    }
  },
  leftColumn: {
    flex: 1,
    flexDirection: 'column',
    textAlign: 'center',
    padding: '10px 0 10px 10px'
  },
  logo: {
    width: '4rem',
    height: '4rem',
    marginBottom: 5
  },
  percentChange: {
    color: 'gray',
    marginBottom: 6
  },
  trendIcon: {
    fontSize: 16
  },
  rightColumn: {
    flex: 3,
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px'
  },
  marketName: {
    flex: 1,
    fontSize: 18,
    cursor: 'pointer',
    position: 'relative'
  },
  corner: {
    position: 'absolute',
    top: -2,
    right: 0
  },
  priceTitle: {
    fontSize: 12,
    marginBottom: 8,
    color: 'grey'
  },
  pricesRow: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  price: {
    display: 'flex',
    alignItems: 'flex-start',
    marginRight: 10,
    fontSize: 12
  },
  quotePrice: {
    '& img': {
      width: 19,
      marginRight: 1,
      marginLeft: -6
    }
  },
  ethPrice: {
    color: '#999'
  },
  popper: {
    zIndex: 1000
  },
  paper: {
    left: 0,
    padding: 15,
    width: 500,
    maxWidth: 500,
    overflow: 'auto'
  },
  arrow: {
    position: 'absolute',
    fontSize: 7,
    left: 0,
    marginLeft: '-0.9em',
    height: '3em',
    width: '1em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '1em 1em 1em 0',
      borderColor: `transparent #eee transparent transparent`,
      position: 'absolute',
      left: -1
    },
    '&::after': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '1em 1em 1em 0',
      borderColor: `transparent #fff transparent transparent`,
      position: 'absolute',
      top: 0,
      left: 1
    },
    top: 20
  }
})

class Marketplace extends React.Component<any> {
  state = {
    anchorEl: null,
    open: false,
    arrowRef: null
  }

  handleArrowRef = node => {
    this.setState({
      arrowRef: node
    })
  }

  toggleMarkets = event => {
    const { currentTarget } = event

    this.setState({
      anchorEl: currentTarget,
      open: !this.state.open
    })
  }

  handleClickAway () {
    this.setState({
      open: false
    })
  }

  render () {
    const { classes, market } = this.props
    const { anchorEl, open, arrowRef } = this.state
    const id = open ? 'marketsList' : null

    if (!market) {
      return null
    }

    return (
      <Panel className={classes.root} onClick={this.toggleMarkets}>
        <div className={classes.leftColumn}>
          <img
            className={classes.logo}
            src={`/token-icons/${market.baseAsset.symbol}.png`}
            alt=''
          />
          <div className={classes.percentChange}>
            {market.stats.percentChange24Hours.toFixed(2)}%
          </div>
          <TrendArrow className={classes.trendIcon} value={market.stats.percentChange24Hours} />
        </div>
        <div className={classes.rightColumn}>
          <div className={classes.marketName}>
            {market.name}
            <ArrowRight className={classes.corner} />
          </div>
          <div className={classes.priceTitle}>Price</div>
          <div className={classes.pricesRow}>
            <span className={cx(classes.price, classes.quotePrice)}>
              { getFormattedMarketPrice(market) }
            </span>
            <span className={cx(classes.price, classes.ethPrice)}>
              { getFormattedMarketEthPrice(market) }
            </span>
          </div>
        </div>
        <Popper
          id={id as any}
          open={open}
          anchorEl={anchorEl}
          placement='right-start'
          modifiers={{
            arrow: {
              enabled: true,
              element: arrowRef
            }
          }}
          className={classes.popper}
        >
          <span className={classes.arrow} ref={this.handleArrowRef} />
          <Paper className={classes.paper}>
            <ClickAwayListener onClickAway={this.handleClickAway.bind(this)}>
              <MarketsList />
            </ClickAwayListener>
          </Paper>
        </Popper>
      </Panel>
    )
  }
}

export default withRouter(connector(decorate(Marketplace)))
