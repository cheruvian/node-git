import { logger } from '../logger.js';
import fs from 'fs';

export function validateRepoPath(repoPath, options = { checkExists: false }) {
  if (!repoPath) {
    throw new Error('Repository path is required');
  }

  const [owner, repo] = repoPath.split('/');
  if (!owner || !repo) {
    throw new Error('Invalid repository format. Use owner/repo');
  }

  if (options.checkExists && fs.existsSync(repo)) {
    throw new Error(`Directory ${repo} already exists`);
  }

  return { owner, repo };
}

export function validateGitRepository() {
  if (!fs.existsSync('_git')) {
    throw new Error('Not a git repository');
  }
}