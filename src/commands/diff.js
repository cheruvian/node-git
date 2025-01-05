import fs from 'fs';
import { glob } from 'glob';
import { logger } from '../utils/logger.js';
import { getGitignorePatterns } from '../utils/patterns/gitignore.js';
import { shouldIgnoreFile, showFileDiff } from '../utils/diff/index.js';
import { getSnapshotPath } from '../utils/gitPaths.js';

export async function diff(filepath) {
  try {
    const snapshotPath = getSnapshotPath();
    if (!fs.existsSync(snapshotPath)) {
      throw new Error('Not a git repository');
    }

    // Read snapshot
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    
    // Get ignore patterns
    const ignorePatterns = getGitignorePatterns();

    if (filepath) {
      // Single file diff
      if (!shouldIgnoreFile(filepath, ignorePatterns)) {
        showFileDiff(filepath, snapshot);
      }
    } else {
      // Get all files in working directory and snapshot
      const workingFiles = await glob('**/*', {
        dot: true,
        nodir: true,
        ignore: ignorePatterns
      });

      // Combine and deduplicate files
      const allFiles = [...new Set([
        ...workingFiles,
        ...Object.keys(snapshot)
      ])];

      // Show diffs for non-ignored files
      for (const file of allFiles) {
        if (!shouldIgnoreFile(file, ignorePatterns)) {
          showFileDiff(file, snapshot);
        }
      }
    }
  } catch (error) {
    logger.error(`Diff failed: ${error.message}`);
    process.exit(1);
  }
}