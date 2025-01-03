#!/usr/bin/env node
import { program } from 'commander';
import { config } from 'dotenv';
import { clone } from './commands/clone.js';
import { status } from './commands/status.js';
import { diff } from './commands/diff.js';
import { push } from './commands/push.js';
import { remote } from './commands/remote.js';
import { init } from './commands/init.js';
import { submodule } from './commands/submodule.js';
import { reset } from './commands/reset.js';

// Load .env file if it exists
config();

program
  .name('git-api')
  .description('GitHub CLI using GitHub API')
  .version(process.env.npm_package_version || '1.0.0');

program
  .command('init')
  .description('Initialize a new git repository')
  .action(init);

program
  .command('clone')
  .description('Clone a repository')
  .argument('<repo>', 'Repository in format owner/repo')
  .action(clone);

program
  .command('remote')
  .description('Manage remote repositories')
  .argument('<command>', 'Command to execute (add, show)')
  .argument('[repo]', 'Repository in format owner/repo')
  .action(remote);

program
  .command('push')
  .description('Push code to remote repository')
  .argument('<message>', 'Commit message')
  .option('-d, --directory <dir>', 'Directory to push', '.')
  .action((message, options) => push(message, options));

program
  .command('status')
  .description('Show working tree status')
  .action(status);

program
  .command('diff')
  .description('Show changes between working tree and snapshot')
  .argument('[filepath]', 'Optional file path to show diff for')
  .action(diff);

program
  .command('reset')
  .description('Reset working tree to last snapshot')
  .argument('[filepath]', 'Optional file path to reset')
  .action(reset);

program
  .command('submodule')
  .description('Manage submodules')
  .argument('<command>', 'Command to execute (add, init, update, status)')
  .argument('[repo]', 'Repository in format owner/repo')
  .option('-p, --path <path>', 'Path where to add the submodule', 'repo')
  .action((command, repo, options) => submodule(command, repo, options));

program.parse();