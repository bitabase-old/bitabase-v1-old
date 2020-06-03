node index-darwin.js \
  --rqlite-storage=/tmp/rq1 \
  --rqlite-http-bind=0.0.0.0:4001 \
  --rqlite-raft-bind=0.0.0.0:4002 \
  --manager-bind=0.0.0.0:8081 \
  --gateway-bind=0.0.0.0:8082 \
  --service-bind=0.0.0.0:8000
