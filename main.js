if (process.env.NODE_ENV === 'development') {
  require('async-bugs');
}

const chalk = require('chalk');
const minimist = require('minimist');

const packageJson = require('./package.json');
const args = minimist(process.argv);

function showHelp () {
  console.log(`
  ${chalk.green(chalk.bold('📦 Bitabase'))} ${chalk.green(`- v${packageJson.version}`)}
The scalable, sharded database engine.
https://docs.bitabase.com

The following commands and arguments are available when starting Bitabase

Commands:
  start                            Start the bitabase server stack

    --rqlite-http-bind=host:port   Host and port to bind the rqlite node to (default: 0.0.0.0:4001)
    --rqlite-raft-bind=host:port   Host and port to bind the rqlite node to (default: 0.0.0.0:4002)
    --rqlite-join=host:port        Join an rqlite cluster (default: none, eg: http://0.0.0.0:4001)
    --rqlite-storage=/path         Where to store rqlite transaction log (default: /tmp/rqlite-bitabase)

    --secret                       The secret for internal communication

    --manager-bind-host            Host to bind the manager node on (default: 0.0.0.0)
    --manager-bind-port            Port to bind the manager on (default: 8001)
    --gateway-bind-host            Host to bind the gateway node on (default: 0.0.0.0)
    --gateway-bind-port            Port to bind the gateway on (default: 8002)
    --server-bind-host             Host to bind the data server node on (default: 0.0.0.0)
    --server-bind-port             Port to bind the data server on (default: 8000)
    --server-storage=/path         Where to store server sqlite databases (default: /tmp/server-bitabase)
  `.trim() + '\n');
}

function main (rqlitePath) {
  if (args.help || args._.length === 2) {
    showHelp();
    console.log(chalk.red('No command specified'));
    process.exit(1);
  }

  if (args._[2] === 'start') {
    const { start } = require('./start');
    start({
      ...args,
      rqliteBinPath: rqlitePath
    });
    return;
  }

  showHelp();
  console.log(args);
  console.log(chalk.red(`Unknown command "${args._[2]}"`));
  process.exit(1);
}

module.exports = main;
