import fs from 'fs';
import path from 'path';
import { minimatch } from 'minimatch';

import { glob } from 'glob';
import { logger } from './logger.js';
import { ensureDir } from './fs.js';
import { getGitignorePatterns } from './gitignore.js';
import { getGitPath, GIT_DIR } from './gitPaths.js';
import { GIT_IGNORE_PATTERNS } from "./git/ignore.js";

export async function createSnapshot(directory = '.') {
  // Ensure git directory exists
  ensureDir(path.join(directory, GIT_DIR));

  const ignorePatterns = getGitignorePatterns();

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

  const snapshotPath = getGitPath('snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  logger.debug(`Created repository snapshot with ${Object.keys(snapshot).length} files`);
  
  return snapshot;
}

export function readSnapshot(directory = '.') {
  const snapshotPath = getGitPath('snapshot.json');
  if (!fs.existsSync(snapshotPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
}