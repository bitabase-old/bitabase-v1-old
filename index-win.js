const fs = require('fs');
const path = require('path');

const main = require('./main');

fs.createReadStream(path.join(__dirname, './node_modules/sqlite3/lib/binding/napi-v3-win32-x64/node_sqlite3.node'));

const fileBuffer = fs.readFileSync(path.join(__dirname, './dist/rqlite-win/rqlited.exe'));
const rqlitePath = 'bitabase-rqlited.exe';
fs.writeFileSync(rqlitePath, fileBuffer);
fs.chmodSync(rqlitePath, '755');

main(rqlitePath);
