if (process.env.NODE_ENV === 'development') {
  require('trace')
  require('clarify')
}

const chalk = require('chalk');
const minimist = require('minimist');

const packageJson = require('./package.json');
const args = minimist(process.argv);

function main (rqlitePath) {
  if (args.help) {
    console.log(`
${chalk.green(chalk.bold('📦 Bitabase'))} ${chalk.green(`- v${packageJson.version}`)}
The scalable, sharded database engine.
https://docs.bitabase.com

The following arguments are available when starting Bitabase

Arguments:
  --rqlite-bind=host:port        Host and port to bind the rqlite node to (default: 0.0.0.0:4002)
  --rqlite-join=host:port        Join an rqlite cluster (default: none)
  --rqlite-storage=/path         Where to store rqlite transaction log (default: /tmp/rqlite-bitabase)

  --manager-bind=host:port       Host and port to bind the manager to (default: 0.0.0.0:8081)
  --gateway-bind=host:port       Host and port to bind the gateway to (default: 0.0.0.0:8082)
  --server-bind=host:port        Host and port to bind the server to (default: 0.0.0.0:8000)

`.trim() + '\n');
    return;
  }

  const { start } = require('./start');
  start({
    ...args,
    rqliteBinPath: rqlitePath
  });
}

module.exports = main;
