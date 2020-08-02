const fs = require('fs');
const path = require('path');

const main = require('./main');

fs.createReadStream(path.join(__dirname, './node_modules/sqlite3/lib/binding/napi-v3-linux-x64/node_sqlite3.node'));

const fileBuffer = fs.readFileSync(path.join(__dirname, './dist/rqlite-linux/rqlited'));
const rqlitePath = '/tmp/bitabase-rqlited';
fs.writeFileSync(rqlitePath, fileBuffer);
fs.chmodSync(rqlitePath, '755');

main(rqlitePath);
