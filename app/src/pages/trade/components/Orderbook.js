import React from 'react'
import jss from 'react-jss'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { loadOrderbook } from 'modules/index'
import { withRouter } from 'react-router-dom'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import Toolbar from '@material-ui/core/Toolbar'

const connector = connect(
  state => ({
    bids: state.bids,
    asks: state.asks
  }),
  dispatch => bindActionCreators({loadOrderbook}, dispatch)
)

const decorate = jss({
  root: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto'
  },
  row: {
  }
})

class Orderbook extends React.Component {
  componentDidMount () {
    const {marketplace, token} = this.props.match.params
    this.props.loadOrderbook({marketplace, token})
  }

  componentDidUpdate (prevProps) {
    const {marketplace: prevMarketplace, token: prevToken} = prevProps.match.params
    const {marketplace, token} = this.props.match.params

    if (marketplace !== prevMarketplace || token !== prevToken) {
      this.props.loadOrderbook({marketplace, token})
    }
  }

  render () {
    const {classes, bids, asks} = this.props
    return (
      <div className={classes.root}>
        {this.renderOrdersTable(bids, 'Bids')}
        {this.renderOrdersTable(asks, 'Asks')}
      </div>
    )
  }

  renderOrdersTable (orders, title) {
    return (
      <React.Fragment>
        <Toolbar>
          <Typography variant='title'>{title}</Typography>
        </Toolbar>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>price</TableCell>
              <TableCell>selling</TableCell>
              <TableCell>buying</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map(this.renderOrder)}
          </TableBody>
        </Table>
      </React.Fragment>
    )
  }

  renderOrder = order => {
    const {classes} = this.props
    return (
      <TableRow key={order.orderHash} className={classes.row}>
        <TableCell>{order.price}</TableCell>
        <TableCell>{order.makerAmount} {order.makerSymbol}</TableCell>
        <TableCell>{order.takerAmount} {order.takerSymbol}</TableCell>
      </TableRow>
    )
  }
}

export default withRouter(connector(decorate(Orderbook)))
