const fs = require('fs')
const path = require('path')

fs.createReadStream(path.join(__dirname, './node_modules/sqlite3/lib/binding/node-v72-darwin-x64/node_sqlite3.node'))

const fileBuffer = fs.readFileSync(path.join(__dirname, './dist/rqlite-darwin/rqlited'))
const rqlitePath = '/tmp/bitabase-rqlited'
fs.writeFileSync(rqlitePath, fileBuffer)
fs.chmodSync(rqlitePath, '755');

const {start} = require('./start')
start({
  rqliteBinPath: rqlitePath
})
