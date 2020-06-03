node index-darwin.js \
  --rqlite-storage=/tmp/rq2 \
  --rqlite-http-bind=0.0.0.0:4101 \
  --rqlite-raft-bind=0.0.0.0:4102 \
  --manager-bind=0.0.0.0:8181 \
  --gateway-bind=0.0.0.0:8182 \
  --server-bind=0.0.0.0:8100 \
  --rqlite-join=http://0.0.0.0:4001
