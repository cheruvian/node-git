import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

export function initializeGitDirectory(directory = '.') {
  const gitDir = path.join(directory, '.git');
  
  if (fs.existsSync(gitDir)) {
    logger.debug('Git directory already exists');
    return;
  }

  // Create basic .git directory structure
  const dirs = [
    '.git',
    '.git/objects',
    '.git/refs',
    '.git/refs/heads',
    '.git/refs/tags',
    '.git/info',
    '.git/hooks'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(directory, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      logger.debug(`Created directory: ${fullPath}`);
    }
  });

  // Create basic git config
  const configContent = `[core]
\trepositoryformatversion = 0
\tfilemode = true
\tbare = false
\tlogallrefupdates = true`;

  fs.writeFileSync(path.join(gitDir, 'config'), configContent);
  logger.debug('Created git config file');

  // Create HEAD file pointing to default branch
  fs.writeFileSync(path.join(gitDir, 'HEAD'), 'ref: refs/heads/main\n');
  logger.debug('Created HEAD file');

  // Create description file
  fs.writeFileSync(path.join(gitDir, 'description'), 'Unnamed repository\n');
  logger.debug('Created description file');

  logger.debug('Git directory initialized successfully');
}