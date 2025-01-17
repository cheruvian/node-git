import chalk from 'chalk';
import fs from 'fs';
import { glob } from 'glob';
import { logger } from '../utils/logger.js';
import { getCommitInfo } from '../utils/status/commitInfo.js';
import { getGitignorePatterns, isIgnored } from '../utils/patterns/gitignore.js';
import { displayCommitInfo } from '../utils/status/display.js';
import { getSnapshotPath } from '../utils/gitPaths.js';

export async function status() {
  try {
    const snapshotPath = getSnapshotPath();
    if (!fs.existsSync(snapshotPath)) {
      throw new Error('Not a git repository');
    }

    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    const snapshotFiles = Object.keys(snapshot);

    // Get ignore patterns
    const ignorePatterns = getGitignorePatterns();

    // Get all files except ignored ones
    const currentFiles = await glob('**/*', { 
      dot: true,
      nodir: true,
      ignore: ignorePatterns
    });

    const modified = [];
    const added = [];
    const deleted = [];

    // Check for modified and deleted files
    for (const file of snapshotFiles) {
      if (!currentFiles.includes(file)) {
        deleted.push(file);
      } else {
        const content = fs.readFileSync(file, 'utf-8');
        if (content !== snapshot[file]) {
          modified.push(file);
        }
      }
    }

    // Check for new files
    for (const file of currentFiles) {
      if (!snapshotFiles.includes(file)) {
        added.push(file);
      }
    }

    // Display commit info
    const commitInfo = getCommitInfo();
    displayCommitInfo(commitInfo);

    // Display status
    if (modified.length === 0 && added.length === 0 && deleted.length === 0) {
      console.log(chalk.green('\nWorking tree clean'));
      return;
    }

    if (modified.length > 0) {
      console.log(chalk.bold('\nModified files:'));
      modified.forEach(file => console.log(chalk.red(`  ${file}`)));
    }

    if (added.length > 0) {
      console.log(chalk.bold('\nNew files:'));
      added.forEach(file => console.log(chalk.green(`  ${file}`)));
    }

    if (deleted.length > 0) {
      console.log(chalk.bold('\nDeleted files:'));
      deleted.forEach(file => console.log(chalk.red(`  ${file}`)));
    }

    console.log();
  } catch (error) {
    logger.error(`Status failed: ${error.message}`);
    process.exit(1);
  }
}