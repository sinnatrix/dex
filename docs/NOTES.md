In the case when we run postgres through `docker-compose` we need to make sure that postgresql.conf has this line:
```
listen_addresses = '*'
```

https://forums.docker.com/t/postgres-solved-fail-to-connect-postgresql-container/46924/2
https://stackoverflow.com/questions/15934364/psql-server-closed-the-connection-unexepectedly