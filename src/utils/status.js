import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { getGitignorePatterns } from './gitignore.js';
import { logger } from './logger.js';

export async function getGitStatus() {
  const gitDir = '.git';
  const indexFile = path.join(gitDir, 'index');
  const stagingDir = path.join(gitDir, 'staging');

  if (!fs.existsSync(gitDir)) {
    throw new Error('Not a git repository');
  }

  // Get current index state
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
  const stagedFiles = index.files || [];

  // Get current working directory files
  const currentFiles = await glob('**/*', { 
    dot: true,
    nodir: true,
    ignore: ['**/node_modules/**', '**/.git/**', ...getGitignorePatterns()]
  });

  return {
    staged: stagedFiles,
    unstaged: currentFiles.filter(file => !stagedFiles.includes(file))
  };
}