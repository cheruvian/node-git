#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { loadEnv } from './utils/env.js';
import { clone } from './commands/clone.js';
import { status } from './commands/status.js';
import { diff } from './commands/diff.js';
import { push } from './commands/push.js';
import { pull } from './commands/pull.js';
import { remote } from './commands/remote.js';
import { init } from './commands/init.js';
import { submodule } from './commands/submodule.js';
import { reset } from './commands/reset.js';
import { attach } from './commands/attach.js';

// Load .env file if it exists
loadEnv();

yargs(hideBin(process.argv))
  .scriptName('git')
  .usage('$0 <cmd> [args]')
  .command('init', 'Initialize a new git repository', {}, init)
  .command('clone <repo>', 'Clone a repository', (yargs) => {
    return yargs.positional('repo', {
      describe: 'Repository in format owner/repo',
      type: 'string'
    });
  }, clone)
  .command('attach <repo>', 'Initialize current directory and clone repository into it', (yargs) => {
    return yargs
      .positional('repo', {
        describe: 'Repository in format owner/repo',
        type: 'string'
      })
      .option('commit', {
        alias: 'c',
        describe: 'Specific commit hash to attach to',
        type: 'string'
      })
      .option('reset', {
        alias: 'r',
        describe: 'Reset working tree after attaching',
        type: 'boolean',
        default: false
      });
  }, attach)
  .command('remote <command> [repo]', 'Manage remote repositories', (yargs) => {
    return yargs
      .positional('command', {
        describe: 'Command to execute (add, show)',
        type: 'string'
      })
      .positional('repo', {
        describe: 'Repository in format owner/repo',
        type: 'string'
      });
  }, remote)
  .command('push <message>', 'Push code to remote repository', (yargs) => {
    return yargs
      .positional('message', {
        describe: 'Commit message',
        type: 'string'
      })
      .option('directory', {
        alias: 'd',
        describe: 'Directory to push',
        default: '.',
        type: 'string'
      });
  }, (argv) => push(argv.message, { directory: argv.directory }))
  .command('pull', 'Pull latest changes from remote repository', (yargs) => {
    return yargs
      .option('force', {
        alias: 'f',
        describe: 'Force pull even with local changes',
        type: 'boolean',
        default: false
      })
      .option('dry-run', {
        describe: 'Show what would be pulled without making changes',
        type: 'boolean',
        default: false
      });
  }, pull)
  .command('status', 'Show working tree status', {}, status)
  .command('diff [filepath]', 'Show changes between working tree and snapshot', (yargs) => {
    return yargs.positional('filepath', {
      describe: 'Optional file path to show diff for',
      type: 'string'
    });
  }, diff)
  .command('reset [filepath]', 'Reset working tree to last snapshot', (yargs) => {
    return yargs.positional('filepath', {
      describe: 'Optional file path to reset',
      type: 'string'
    });
  }, reset)
  .command('submodule <command> [repo]', 'Manage submodules', (yargs) => {
    return yargs
      .positional('command', {
        describe: 'Command to execute (add, init, update, status)',
        type: 'string'
      })
      .positional('repo', {
        describe: 'Repository in format owner/repo',
        type: 'string'
      })
      .option('path', {
        alias: 'p',
        describe: 'Path where to add the submodule',
        default: 'repo',
        type: 'string'
      });
  }, (argv) => submodule(argv.command, argv.repo, { path: argv.path }))
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .help()
  .argv;