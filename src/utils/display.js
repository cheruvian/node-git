import chalk from 'chalk';
import { logger } from './logger.js';
import { showFileDiff } from './diff.js';

export function displayChanges(changes, snapshot) {
  const { modified, deleted } = changes;

  if (modified.length > 0) {
    logger.info('\nModified files:');
    modified.forEach(file => {
      logger.info(chalk.red(`  ${file}`));
      showFileDiff(file, snapshot);
    });
  }

  if (deleted.length > 0) {
    logger.info('\nDeleted files:');
    deleted.forEach(file => {
      logger.info(chalk.red(`  ${file}`));
    });
  }
}