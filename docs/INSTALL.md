# Installation
1. Clone repository
2. Add .env file under server directory and replace fake data from example with real settings
    ```
    PORT=7001
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=qwerty
    POSTGRES_DB=dex_kovan

    NETWORK_ID=1
    BLOCKCHAIN_NODE_URL=https://api.infura.io/v1/jsonrpc/mainnet
    WS_INFURA_HOST=wss://mainnet.infura.io/ws
    ```
    For test blockchain network Kovan replace last 3 lines with the next ones
    ```
    NETWORK_ID=42
    BLOCKCHAIN_NODE_URL=https://api.infura.io/v1/jsonrpc/kovan
    WS_INFURA_HOST=wss://kovan.infura.io/ws
    ```
## Data setup
Before you start anything else please fill database with initial data. Follow the steps bellow.  
Run these commands inside the 'server' directory.
### Init Tokens and markets
Tokens and markets are synonyms for Assets and Asset Pairs.  
For now assets and its pairs are stored as JSON and will be updated manually.
```bash
yarn task seed
```
### Load Tokens icons
Load mainnet's token icons from RadarRelay and store it in `app/public/token-icons` 
```bash
yarn task loadTokenIcons
```
The command above will install assets and assetPairs for the current network.
### Load relayers
Importing relayers is needed for orders exchange.  
To import relayers for the network we set above, run next command
```bash
yarn task loadRelayers
```
### Load orders
Load orders from every possible relayer for current network.  
Task uses `/orders` endpoint to get data.
```bash
yarn task loadOrders
```
### Check active order (cron task)
Get all fillable orders from database and check its status in blockchain, then update database.
That command runs every 5 minutes.  
You can run command manually:
```bash
yarn task checkActiveOrders
```
### Load trading history (cron task
Load FILL events from blockchain.  
That command runs every 10 minutes and ask blockchain for last 1000 blocks from the first.
Before startup you may need to load previous trading history.  
```bash
yarn task loadTradeHistory --fromBlock=<startBlockNunber> --toBlock=<endBlockNumber>
```
Both numbers are included: \[startBlockNumber, endBlockNumber\]
Latest number of mined block can be found here: [mainnet](https://etherscan.io/), [kovan](https://kovan.etherscan.io/) 

**How cron task works**
Before task start, we calculate fromBlock and toBlock parameters:
- fromBlock is equal latest completed loadTradeHistory task + 1
- toBlock is equal (fromBlock + 1000) or latest mined block number from blockchain

## Run development environment
1. `yarn dev` backend
2. `yarn start` application

## Run production environment
1. `yarn start` backend
2. `yarn build` to build application bundle