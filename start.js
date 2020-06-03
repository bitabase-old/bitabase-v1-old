const righto = require('righto');
const rqlite = require('rqlite-fp');
const ip = require('ip');

const createBitabaseManager = require('bitabase-manager/server');
const createBitabaseServer = require('bitabase-server/server');
const createBitabaseGateway = require('bitabase-gateway/server');

function keepTryingToConnect (address, callback) {
  rqlite.connect(address, function (error, result) {
    if (error) {
      console.log(error);
      console.log(`could not connect to ${address}. trying again in 2 seconds...`);
      setTimeout(() => keepTryingToConnect(address, callback), 2000);
      return;
    }
    callback(null, result);
  });
}

function start (options) {
  const stopServer = righto(rqlite.start, {
    httpAddr: options['rqlite-http-bind'] || '0.0.0.0:4001',
    raftAddr: options['rqlite-raft-bind'] || '0.0.0.0:4002',
    join: options['rqlite-join'],
    storage: options['rqlite-storage'] || '/tmp/rqlite-bitabase',
    silent: false,
    ...options
  });

  const connection = righto(keepTryingToConnect, 'http://' + options['rqlite-http-bind'], righto.after(stopServer));

  const createdTable = righto(rqlite.execute, connection, `
    CREATE TABLE IF NOT EXISTS servers (id INTEGER PRIMARY KEY AUTOINCREMENT, host TEXT)
  `);

  const localIp = ip.address();

  const insertedServer = righto(rqlite.execute, connection, `
    INSERT INTO servers(host) 
    SELECT ? 
    WHERE NOT EXISTS(SELECT 1 FROM servers WHERE host = ?);
  `, [localIp, localIp], righto.after(createdTable));

  const bitabaseServer = createBitabaseServer({
    bind: options['server-bind'] || '0.0.0.0:8080'
  });
  const bitabaseGateway = createBitabaseGateway({
    rqliteAddress: '0.0.0.0:8001',
    bind: options['gateway-bind'] || '0.0.0.0:8082',
    managerUrl: 'http://' + (options['manager-bind'] || '0.0.0.0:8081')
  });

  const startedBitabaseManager = righto(createBitabaseManager, {
    rqliteAddress: '0.0.0.0:8001',
    bind: options['manager-bind'] || '0.0.0.0:8081'
  }, righto.after(insertedServer));
  const startedBitabaseServer = righto(bitabaseServer.start, righto.after(insertedServer));
  const startedBitabaseGateway = righto(bitabaseGateway.start, righto.after(insertedServer));

  startedBitabaseManager(console.log);
  startedBitabaseServer(console.log);
  startedBitabaseGateway(console.log);
}

module.exports = {
  start
};
