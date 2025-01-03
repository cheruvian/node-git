import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { createPatch } from 'diff';
import { logger } from '../utils/logger.js';

export async function diff(filepath) {
  try {
    const snapshotPath = path.join('_git', 'snapshot.json');
    if (!fs.existsSync(snapshotPath)) {
      throw new Error('Not a git repository');
    }

    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));

    if (filepath) {
      showFileDiff(filepath, snapshot);
    } else {
      for (const file of Object.keys(snapshot)) {
        if (fs.existsSync(file)) {
          showFileDiff(file, snapshot);
        }
      }
    }
  } catch (error) {
    logger.error(`Diff failed: ${error.message}`);
    process.exit(1);
  }
}

function showFileDiff(filepath, snapshot) {
  if (!fs.existsSync(filepath)) {
    console.log(chalk.red(`File ${filepath} was deleted`));
    return;
  }

  const currentContent = fs.readFileSync(filepath, 'utf-8');
  const snapshotContent = snapshot[filepath] || '';
  
  if (currentContent === snapshotContent) {
    return; // Skip files with no changes
  }

  const patch = createPatch(filepath, snapshotContent, currentContent);
  console.log(chalk.bold(`\nDiff for ${filepath}:`));
  
  patch.split('\n').forEach(line => {
    if (line.startsWith('+')) {
      console.log(chalk.green(line));
    } else if (line.startsWith('-')) {
      console.log(chalk.red(line));
    } else {
      console.log(line);
    }
  });
}