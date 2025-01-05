import fs from 'fs';
import { glob } from 'glob';
import { logger } from '../utils/logger.js';
import { writeFile } from '../utils/fs.js';
import { readSnapshot } from '../utils/snapshot.js';
import { getGitignorePatterns, isIgnored } from '../utils/patterns/gitignore.js';

export async function reset(filepath) {
  try {
    // Check if we're in a git repository
    if (!fs.existsSync('_git')) {
      throw new Error('Not a git repository');
    }

    // Read snapshot
    const snapshot = readSnapshot();
    if (Object.keys(snapshot).length === 0) {
      throw new Error('No snapshot found');
    }

    // Get ignore patterns
    const ignorePatterns = getGitignorePatterns();

    if (filepath) {
      // Reset single file
      await resetFile(filepath, snapshot);
    } else {
      // Reset all files
      await resetAllFiles(snapshot, ignorePatterns);
    }

    logger.success('Reset completed successfully');
  } catch (error) {
    logger.error(`Reset failed: ${error.message}`);
    process.exit(1);
  }
}

async function resetFile(filepath, snapshot) {
  const ignorePatterns = getGitignorePatterns();
  
  if (isIgnored(filepath, ignorePatterns)) {
    logger.debug(`Skipping ignored file: ${filepath}`);
    return;
  }

  if (!(filepath in snapshot)) {
    throw new Error(`File ${filepath} not found in snapshot`);
  }

  writeFile(filepath, snapshot[filepath]);
  logger.info(`Reset ${filepath}`);
}

async function resetAllFiles(snapshot, ignorePatterns) {
  // Get all current files
  const currentFiles = await glob('**/*', { 
    dot: true,
    nodir: true,
    ignore: ignorePatterns
  });

  // Reset files from snapshot
  for (const [file, content] of Object.entries(snapshot)) {
    if (!isIgnored(file, ignorePatterns)) {
      writeFile(file, content);
      logger.info(`Reset ${file}`);
    }
  }

  // Remove files that don't exist in snapshot
  for (const file of currentFiles) {
    if (!(file in snapshot) && !isIgnored(file, ignorePatterns)) {
      fs.unlinkSync(file);
      logger.info(`Removed ${file}`);
    }
  }
}