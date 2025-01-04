import { logger } from '../utils/logger.js';
import { getIgnorePatterns } from '../utils/ignore.js';
import { shouldIgnoreFile, showFileDiff } from '../utils/diff/index.js';
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

export async function diff(filepath) {
  try {
    // Check if we're in a git repository
    const snapshotPath = path.join('_git', 'snapshot.json');
    if (!fs.existsSync(snapshotPath)) {
      throw new Error('Not a git repository');
    }

    // Read snapshot
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    
    // Get ignore patterns
    const ignorePatterns = getIgnorePatterns();

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
        ignore: ['_git/**', '_git']
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