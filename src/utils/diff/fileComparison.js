import { createPatch } from 'diff';
import { minimatch } from 'minimatch';
import chalk from 'chalk';
import fs from 'fs';
import { isIgnored } from '../patterns/gitignore.js';

export function shouldIgnoreFile(filepath, ignorePatterns) {
  return isIgnored(filepath, ignorePatterns);
}

export function showFileDiff(filepath, snapshot) {
  if (!filepath) return;
  
  // Get snapshot content (empty string if not in snapshot)
  const snapshotContent = snapshot[filepath] ?? '';
  
  // Handle case where file exists in working directory
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    if (!stats.isFile()) {
      return;
    }

    // Read current content
    const currentContent = fs.readFileSync(filepath, 'utf-8');
    
    // Handle new empty files
    if (!(filepath in snapshot) && currentContent === '') {
      console.log(chalk.green(`\nNew empty file: ${filepath}`));
      return;
    }

    // Skip if contents are identical (including empty files)
    if (currentContent === snapshotContent) {
      return;
    }

    // Show diff
    const patch = createPatch(filepath, snapshotContent, currentContent);
    displayDiff(filepath, patch);
  } else if (filepath in snapshot) {
    // File was in snapshot but deleted
    console.log(chalk.red(`\nDeleted: ${filepath}`));
  }
}

function displayDiff(filepath, patch) {
  console.log(chalk.bold(`\nDiff for ${filepath}:`));
  
  const lines = patch.split('\n').slice(4); // Skip diff header
  lines.forEach(line => {
    if (line.startsWith('+')) {
      console.log(chalk.green(line));
    } else if (line.startsWith('-')) {
      console.log(chalk.red(line));
    } else {
      console.log(line);
    }
  });
}