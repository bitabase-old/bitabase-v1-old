const righto = require('righto')
const rqlite = require('rqlite-fp')
const ip = require('ip');

const createBitabaseManager = require('bitabase-manager/server')
const createBitabaseServer = require('bitabase-server/server')
const createBitabaseGateway = require('bitabase-gateway/server')

function start (options) {
  const stopServer = righto(rqlite.start, {
    httpAddr: 'localhost:4001',
    raftAddr: 'localhost:4002',
    storage: '/tmp/rqlite-bitabase',
    silent: false,
    ...options
  })

  const connection = righto(rqlite.connect, 'http://localhost:4001', righto.after(stopServer))

  const createdTable = righto(rqlite.execute, connection, `
    CREATE TABLE IF NOT EXISTS servers (id INTEGER PRIMARY KEY AUTOINCREMENT, host TEXT)
  `)

  const localIp = ip.address()

  const insertedServer = righto(rqlite.execute, connection, `
    INSERT INTO servers(host) 
    SELECT ? 
    WHERE NOT EXISTS(SELECT 1 FROM servers WHERE host = ?);
  `, [localIp, localIp], righto.after(createdTable))

  const bitabaseServer = createBitabaseServer()
  const bitabaseGateway = createBitabaseGateway({
    rqliteAddress: '127.0.0.1:8001'
  })
  const bitabaseManager = createBitabaseManager({
    rqliteAddress: '127.0.0.1:8001'
  })

  const startedBitabaseManager = righto(bitabaseManager.start, righto.after(insertedServer))
  const startedBitabaseServer = righto(bitabaseServer.start, righto.after(insertedServer))
  const startedBitabaseGateway = righto(bitabaseGateway.start, righto.after(insertedServer))

  startedBitabaseManager(console.log)
  startedBitabaseServer(console.log)
  startedBitabaseGateway(console.log)
}

module.exports = {
  start
}
