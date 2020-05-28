const chalk = require('chalk');
const minimist = require('minimist');

const packageJson = require('./package.json');
const args = minimist(process.argv);

function main (rqlitePath) {
  if (args.help) {
    console.log(`
${chalk.green(chalk.bold('📦 Bitabase'))} ${chalk.green(`- v${packageJson.version}`)}
The scalable, shared database engine server.
https://docs.bitabase.com

The following arguments are available when starting Bitabase

Arguments:
  --rqlite-addr                  Connect to an existing rqlite node

  --rqlite-bind=host:port        Start a new rqlite node
  --rqlite-storage=/path         Where to store rqlite transaction log
  --rqlite-silent                Suppress rqlite logging to stdout

  --manager-bind=host:port       Host and port to bind the manager to
  --gateway-bind=host:port       Host and port to bind the gateway to
  --server-bind=host:port        Host and port to bind the server to
`.trim());
    return;
  }

  const { start } = require('./start');
  start({
    ...args,
    rqliteBinPath: rqlitePath
  });
}

module.exports = main;
