import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { minimatch } from 'minimatch';
import { logger } from './logger.js';
import { getIgnorePatterns } from './ignore.js';
import { ensureDir } from './fs.js';
import { getSnapshotPath, GIT_IGNORE_PATTERNS } from './gitPaths.js';

export async function createSnapshot(directory = '.') {
  ensureDir(path.join(directory, '.git'));

  const ignorePatterns = getIgnorePatterns(directory);

  const files = await glob('**/*', { 
    cwd: directory,
    dot: true,
    nodir: true,
    ignore: GIT_IGNORE_PATTERNS
  });

  const snapshot = {};
  
  for (const file of files) {
    const shouldIgnore = ignorePatterns.some(pattern => 
      minimatch(file, pattern, { dot: true })
    );

    if (!shouldIgnore) {
      const fullPath = path.join(directory, file);
      snapshot[file] = fs.readFileSync(fullPath, 'utf-8') || '';
    }
  }

  const snapshotPath = getSnapshotPath();
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  logger.debug(`Created repository snapshot with ${Object.keys(snapshot).length} files`);
  
  return snapshot;
}

export function readSnapshot(directory = '.') {
  const snapshotPath = getSnapshotPath();
  if (!fs.existsSync(snapshotPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
}