import fs from 'fs';
import { glob } from 'glob';
import { getGitignorePatterns } from './patterns/gitignore.js';
import { getGitPath } from './gitPaths.js';

export async function getGitStatus() {
  const indexFile = getGitPath('index');

  if (!fs.existsSync(indexFile)) {
    throw new Error('Not a git repository');
  }

  // Get current index state
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
  const stagedFiles = index.files || [];

  // Get current working directory files
  const currentFiles = await glob('**/*', { 
    dot: true,
    nodir: true,
    ignore: getGitignorePatterns()
  });

  return {
    staged: stagedFiles,
    unstaged: currentFiles.filter(file => !stagedFiles.includes(file))
  };
}