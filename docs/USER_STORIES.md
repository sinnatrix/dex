1. Main page is available (smoke)
2. Wallet is connected with MetaMask  
    1. Connection widget  
        1. I can see my account address and network name as hyperlink to etherscan.io
        2. I can go to etherscan.io by clicking on the link
    2. Tokens 
        1. I see _active_ tab with text 'Tokens'  
        2. I can see my allowances and balances correctly
        3. I can change my allowances via toggle buttons
        4. I can wrap ETH
        5. I can unwrap WETH
    3. Orders
        1. I see tab with text 'ORDERS' 
        2. I can click on ORDERS tab and see no orders or my active orders in table. Tab is _active_ from now
        3. I see sold amount with token symbol, bought amount with token symbol, order expire datetime and cancel button
        4. I can cancel my own order by clicking on the button
            * MetaMask will ask confirmation
            * `svg[role="presentation"]` will disappear, `div[role="progressbar"]` will appear
            * I see row disappear if block is mined
            * I see new history `<tr>` element ontop History and Trade history components with order's amounts and tokens symbols 
    4. History
        1. I can click on HISTORY tab and see empty tab or my filled orders in table. Tab is _active_ from now
        2. I see 3 columns in table: Sold amount with token symbol or '?', Bought amount with token symbol or '?', TX Etherscan hyperlink with network name
        3. I can click on Etherscan hyperlink and go to transaction details in new browser tab
3. Marketplace chooser
    1. I see marketplace token symbol and quote token symbol separated by slash in location address, I see marketplace token symbol and quote token symbol in selectors
    2. TODO I see tokens marketplace symbols related to assetDataA from assetPairs database table, I see tokens marketplace symbols related to assetDataB from assetPairs database table
    3. I can change marketplace token, I see new token symbol in location address
    4. I can change quote token, I see new token symbol in location address
    5. I see orderbook and trade history content reloaded for every token selected 
4. Limit order form
    1. I see _checked_ radio button with value 'buy'
    2. I see _unchecked_ radio button with value 'sell'
    3. I see input field with helper text 'Amount (`<quote token symbol>`)'
    4. I see input field with helper text 'Price (`<marketplace token symbol>`)'
    5. I see button with text 'Place order'
    6. I can place ASK (buy order) with non-empty quote token amount with non empty _price_ in marketplace token amount:
        * MetaMask will ask confirmation
        * I can see new order in wallet ORDERS tab as _first_ row
        * I can see new order in Orderbook (bellow Spread line)
    7. I can place BID (Sell order) with non-empty quote token amount with non empty _price_ in marketplace token amount:
        * MetaMask will ask confirmation
        * I can see new order in wallet ORDERS tab as _first_ row 
        * I can see new order in Orderbook (above Spread line) with my account's address (related to connection widget)
5. Orderbook
    1. I see _active_ ORDERBOOK tab
    2. I see no table or table with header row: price, selling buying, expires, maker, `<empty>`, `<empty>`
    3. I make BID with lowest price, I see new `<tr>` element:
        * with class 'highlight'
        * latest in table or above `#orderbook-spread`
        * I wait 2000 ms and see no `tr.highlight` element
    4. I make ASK order with highest price, I see new `<tr>` element
        * with class highlight
        * first in table or just bellow `#orderbook-spread`
        * I wait 2000 ms and see no `tr.highlight` element
    5. I see BIDS sorted by price _DESC_
    6. I see ASKS sorted by price _DESC_
    7. I see orderbook spread value is equal: highest ASK price minus lowest BID price
    8. I can copy order to clipboard and Fill or Cancel it via https://0xproject.com/portal/fill
        1. Fill
            * I see row disappear from Orderbook and wallet Orders if block is mined
            * I see new history `<tr>` element ontop History and Trade history components with order's amounts and tokens symbols
        2. Cancel
            * I see row disappear from Orderbook and wallet Orders if block is mined
    8. I can fill any orders:
        * `Fill` text will be replaced with icon
        * MetaMask will ask confirmation
        * `<tr>` element with filled order will disappear when block is mined
        * I see new _first_ row in wallet history with amounts and tokens symbols from filled order
        * I see new _first_ row in 'TRADE HISTORY' tab with amounts and tokens symbols from filled order.
6. Trade history
    1. I see inactive tab 'TRADE HISTORY'
    2. I can click on tab and see no table or table with header row: Sold, Bought, Etherscan
    3. I see Sold and Bought amount with token symbols or '?' as replacement for unknown tokens
    4. I can click on Etherscan TX hyperlink and go to transaction details on etherscan.io