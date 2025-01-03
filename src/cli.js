import { program } from 'commander';
import { config } from 'dotenv';
import { clone } from './commands/clone.js';
import { commit } from './commands/commit.js';
import { add } from './commands/add.js';
import { remove } from './commands/remove.js';
import { status } from './commands/status.js';
import { diff } from './commands/diff.js';
import { push } from './commands/push.js';
import { remote } from './commands/remote.js';
import { init } from './commands/init.js';

config();

program
  .name('ghcli')
  .description('GitHub CLI using GitHub API')
  .version('1.0.0');

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
  .option('-d, --directory <dir>', 'Directory to push', '.')
  .action(push);

program
  .command('add')
  .description('Add files to staging')
  .argument('[files...]', 'Files to add')
  .action(add);

program
  .command('remove')
  .description('Remove files')
  .argument('[files...]', 'Files to remove')
  .action(remove);

program
  .command('status')
  .description('Show working tree status')
  .action(status);

program
  .command('diff')
  .description('Show changes between commits, commit and working tree, etc')
  .argument('[filepath]', 'Optional file path to show diff for')
  .action(diff);

program
  .command('commit')
  .description('Commit changes')
  .argument('<message>', 'Commit message')
  .action(commit);

program.parse();