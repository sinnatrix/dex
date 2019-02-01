import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { getMarkets } from 'selectors'
import TrendArrow from './TrendArrow'
import { withRouter } from 'react-router-dom'
import { IMarket } from 'types'
import cx from 'classnames'
import { getFormattedMarketPrice, getFormattedMarketVolume } from 'helpers/general'

const connector = connect(
  state => ({
    markets: getMarkets(state)
  })
)

const decorate = jss({
  root: {
    minWidth: '100%',
    display: 'flex',
    flex: 'none',
    flexDirection: 'column',
    fontSize: 14
  },
  marketRow: {
    padding: '0.5em 0',
    borderTop: '1px solid #eee',
    '&:hover': {
      backgroundColor: '#ccc',
      cursor: 'pointer'
    },
    '& img': {
      width: '1.5em',
      height: '1.5em'
    }
  },
  header: {
    color: 'grey',
    padding: '0.25em 0 0.5em 0'
  },
  gridRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  assetPair: {
    flex: 6,
    display: 'flex',
    alignItems: 'center'
  },
  price: {
    flex: 6,
    display: 'flex',
    alignItems: 'center'
  },
  volume: {
    flex: 5,
    display: 'flex',
    alignItems: 'center'
  },
  change24Hours: {
    flex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  trendIcon: {
    fontSize: '1em',
    marginLeft: 5
  }
})

class MarketsList extends React.Component<any> {
  selectMarket (e, market) {
    e.stopPropagation()

    this.props.history.push(market.path)
    this.props.onClose()
  }

  render () {
    const { classes, markets } = this.props

    if (!markets.length) {
      return null
    }

    return (
      <div className={classes.root}>
        <div className={ cx(classes.gridRow, classes.header) }>
          <div className={classes.assetPair}>Pair</div>
          <div className={classes.price}>Price</div>
          <div className={classes.volume}>Volume</div>
          <div className={classes.change24Hours}>24h Change</div>
        </div>
        {markets.map((market: IMarket) => {
          return (
            <div
              className={ cx(classes.gridRow, classes.marketRow) }
              key={market.id}
              onClick={e => this.selectMarket(e, market)}
            >
              <div className={classes.assetPair}>
                <img src={`/token-icons/${market.quoteAsset.symbol}.png`} alt='' />
                {market.name}
              </div>
              <div className={classes.price}>
                { getFormattedMarketPrice(market) }</div>
              <div className={classes.volume}>
                { getFormattedMarketVolume(market) }
              </div>
              <div className={classes.change24Hours}>
                {market.stats.percentChange24Hours}%
                <TrendArrow
                  className={classes.trendIcon}
                  value={market.stats.percentChange24Hours}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}

export default withRouter(connector(decorate(MarketsList)))
