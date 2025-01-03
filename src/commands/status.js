import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { logger } from '../utils/logger.js';
import { getIgnorePatterns } from '../utils/ignore.js';

export async function status() {
  try {
    const snapshotPath = path.join('_git', 'snapshot.json');
    if (!fs.existsSync(snapshotPath)) {
      throw new Error('Not a git repository');
    }

    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    const snapshotFiles = Object.keys(snapshot);

    // Get ignore patterns
    const ignorePatterns = getIgnorePatterns();

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