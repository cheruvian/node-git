import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { minimatch } from 'minimatch';
import { logger } from './logger.js';
import { getIgnorePatterns } from './ignore.js';
import { ensureDir } from './fs.js';

export async function createSnapshot(directory = '.') {
  // Ensure _git directory exists
  ensureDir(path.join(directory, '_git'));

  // Get ignore patterns
  const ignorePatterns = getIgnorePatterns(directory);

  // Get all files except those in _git directory
  const files = await glob('**/*', { 
    cwd: directory,
    dot: true,
    nodir: true,
    ignore: ['_git/**', '_git']
  });

  const snapshot = {};
  
  // Process each file
  for (const file of files) {
    // Check if file matches any ignore pattern
    const shouldIgnore = ignorePatterns.some(pattern => 
      minimatch(file, pattern, { dot: true })
    );

    // Only include file if it's not ignored
    if (!shouldIgnore) {
      const fullPath = path.join(directory, file);
      snapshot[file] = fs.readFileSync(fullPath, 'utf-8') || '';
    }
  }

  const snapshotPath = path.join(directory, '_git', 'snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  logger.debug(`Created repository snapshot with ${Object.keys(snapshot).length} files`);
  
  return snapshot;
}

export function readSnapshot(directory = '.') {
  const snapshotPath = path.join(directory, '_git', 'snapshot.json');
  if (!fs.existsSync(snapshotPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
}