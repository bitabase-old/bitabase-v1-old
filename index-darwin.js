const fs = require('fs')
const path = require('path')

const binPaths = [
  path.join(__dirname, './node_modules/sqlite3/lib/binding/node-v72-darwin-x64/node_sqlite3.node'),
  path.join(__dirname, './dist/rqlite-darwin/rqlited')
]
binPaths.forEach(binPath => {
  fs.createReadStream(binPath)
})

const {start} = require('./start')
start({
  rqliteBinPath: path.join(__dirname, './dist/rqlite-darwin/rqlited')
})