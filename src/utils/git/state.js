import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { logger } from '../logger.js';

const GIT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '.git',
  '.git/**/*',
  'package-lock.json'
];

export async function initializeGitState(owner, repo) {
  const gitDir = path.join('.git');
  const indexFile = path.join(gitDir, 'index');

  // Get all tracked files
  const files = await glob('**/*', { 
    dot: true,
    nodir: true,
    ignore: GIT_IGNORE_PATTERNS
  });
  
  // Create initial index state
  const index = {
    files,
    remote: { owner, repo, url: `https://github.com/${owner}/${repo}.git` },
    head: files,
    staged: []
  };

  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
  logger.debug('Git state initialized with clean working tree');
}