const rqlite = require('rqlite-fp');

const createBitabaseManager = require('bitabase-manager/server');
const createBitabaseServer = require('bitabase-server/server');
const createBitabaseGateway = require('bitabase-gateway/server');

function start (options) {
  rqlite.start({
    httpAddr: options['rqlite-http-bind'] || '0.0.0.0:4001',
    raftAddr: options['rqlite-raft-bind'] || '0.0.0.0:4002',
    join: options['rqlite-join'],
    storage: options['rqlite-storage'] || '/tmp/rqlite-bitabase',
    silent: false,
    ...options
  }, function () {
    createBitabaseServer({
      bindHost: options['server-bind-host'],
      bindPort: options['server-bind-port'],
      rqliteAddr: 'http://0.0.0.0:4001',
      secret: String(options.secret),
      databasePath: options['server-storage'] || '/tmp/server-bitabase'
    }).start();
  
    createBitabaseGateway({
      bindHost: options['gateway-bind-host'],
      bindPort: options['gateway-bind-port'],
      rqliteAddr: 'http://0.0.0.0:4001',
      secret: String(options.secret)
    }).start();
  
    createBitabaseManager({
      bindHost: options['manager-bind-host'],
      bindPort: options['manager-bind-port'],
      rqliteAddr: 'http://0.0.0.0:4001',
      secret: String(options.secret)
    });
  });
}

module.exports = {
  start
};
