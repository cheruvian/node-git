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

export async function getGitStatus() {
  validateGitRepo();
  
  const index = readGitIndex();
  const currentFiles = await getCurrentFiles();
  
  // Compare current files with HEAD
  const changes = currentFiles.filter(file => !index.head.includes(file));
  const staged = index.staged || [];

  if (changes.length === 0 && staged.length === 0) {
    logger.info('Working tree clean');
    return { staged: [], unstaged: [] };
  }

  return {
    staged,
    unstaged: changes
  };
}

function validateGitRepo() {
  if (!fs.existsSync('.git')) {
    throw new Error('Not a git repository');
  }
}

function readGitIndex() {
  try {
    const indexFile = path.join('.git', 'index');
    return JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
  } catch {
    return { head: [], staged: [] };
  }
}

async function getCurrentFiles() {
  return glob('**/*', { 
    dot: true,
    nodir: true,
    ignore: GIT_IGNORE_PATTERNS
  });
}