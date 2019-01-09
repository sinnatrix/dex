import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { ReactTableDefaults } from 'react-table'
import cx from 'classnames'
import { Paper } from '@material-ui/core'
import Popper from '@material-ui/core/Popper'
import { ETHER_SYMBOL, renderExpiresAt } from 'helpers/general'
import { IDexOrder, IMarket } from 'types'
import { BigNumber } from '@0x/utils'
import { getMarket } from 'selectors'
import compose from 'ramda/es/compose'
import FormattedAmount from '../FormattedAmount'

const decorate = jss({
  popper: {
  },
  paper: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: 14
  },
  column: {
    flex: 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 12px'
  },
  header: {
    color: '#aaa',
    marginBottom: 5
  },
  cell: {
    flex: 1
  }
})

const connector = connect(
  (state, ownProps) => {
    return {
      market: getMarket(ownProps.match.params, state)
    }
  }
)

const renderOrderPriceEth = (order: IDexOrder, market: IMarket): BigNumber =>
  market.quoteAsset.symbol === 'WETH'
    ? order.extra.price
    : market.priceEth

const OrderInfoPopper = ({ classes, order, market, anchorEl }) =>
  <Popper
    id='orderInfo'
    open={true}
    anchorEl={anchorEl}
    placement='left-start'
    className={classes.popper}
  >
    <Paper className={classes.paper}>
      <div className={classes.column}>
        <div className={cx(classes.header, classes.cell)}>Price ETH</div>
        <div className={classes.cell}>
          <FormattedAmount
            value={renderOrderPriceEth(order, market).toFixed(7)}
            ledBy={ETHER_SYMBOL}
          />
        </div>
      </div>
      <div className={classes.column}>
        <div className={cx(classes.header, classes.cell)}>Expires</div>
        <div className={classes.cell}>
          {renderExpiresAt(order)}
        </div>
      </div>
    </Paper>
  </Popper>

export default compose(
  withRouter,
  connector,
  decorate
)(OrderInfoPopper)
