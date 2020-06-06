if (process.env.NODE_ENV === 'development') {
  require('trace');
  require('clarify');
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

    --manager-bind=host:port       Host and port to bind the manager to (default: 0.0.0.0:8081)
    --gateway-bind=host:port       Host and port to bind the gateway to (default: 0.0.0.0:8082)
    --server-bind=host:port        Host and port to bind the server to (default: 0.0.0.0:8000)

  `.trim() + '\n');
}

function main (rqlitePath) {
  if (args.help || args._.length === 2) {
    showHelp();
    console.log(chalk.red('No command specified'));
    process.exit(1);
    return;
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
