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
    BLOCKCHAIN_NODE_URL=https://mainnet.infura.io/v3/<INFURA_PROJECT_ID>
    WS_INFURA_HOST=wss://mainnet.infura.io/ws
    
    LOAD_TRADE_HISTORY_ON_STARTUP=no
    ```
3. Run following commands
    - `yarn task seed` to add assets and assetsPairs for selected network
    - `yarn task loadRelayers` to load relayers info
    - `yarn task loadOrders` to load orders from relayers
4. Start backend and frontend applications