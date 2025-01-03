import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

export function initializeGitState(owner, repo, files) {
  const gitDir = path.join('.git');
  const stagingDir = path.join(gitDir, 'staging');
  const indexFile = path.join(gitDir, 'index');

  // Create staging directory
  if (!fs.existsSync(stagingDir)) {
    fs.mkdirSync(stagingDir, { recursive: true });
  }

  // Copy all files to staging
  for (const file of files) {
    const stagingPath = path.join(stagingDir, file);
    fs.mkdirSync(path.dirname(stagingPath), { recursive: true });
    fs.copyFileSync(file, stagingPath);
  }

  // Create index file with initial state
  const index = {
    files,
    remote: {
      owner,
      repo,
      url: `https://github.com/${owner}/${repo}.git`
    }
  };

  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
  logger.debug('Git state initialized');
}