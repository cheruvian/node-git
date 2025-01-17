import fs from 'fs';
import path from 'path';
import { logger } from '../logger.js';
import { createGitObject, writeGitObject } from './objects.js';
import { GIT_DIR, getGitPath } from '../gitPaths.js';

export function initializeGitRepository(directory = '.') {
  const gitDir = path.join(directory, GIT_DIR);
  
  // Create basic directory structure
  const dirs = [
    'objects',
    'refs/heads',
    'refs/tags',
    'info',
    'hooks'
  ].map(dir => getGitPath(dir));

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Create initial empty tree object
  const objectsDir = getGitPath('objects');
  const emptyTree = createGitObject('tree', '');
  writeGitObject(objectsDir, emptyTree.hash, emptyTree.content);

  // Create initial commit object pointing to empty tree
  const commitContent = `tree ${emptyTree.hash}
author Git User <user@example.com> ${Math.floor(Date.now() / 1000)} +0000
committer Git User <user@example.com> ${Math.floor(Date.now() / 1000)} +0000

Initial commit`;
  const commit = createGitObject('commit', commitContent);
  const commitHash = writeGitObject(objectsDir, commit.hash, commit.content);

  // Update HEAD and main branch reference
  fs.writeFileSync(getGitPath('HEAD'), 'ref: refs/heads/main\n');
  fs.writeFileSync(getGitPath('refs/heads/main'), `${commitHash}\n`);

  // Create basic config
  const configContent = `[core]
\trepositoryformatversion = 0
\tfilemode = true
\tbare = false
\tlogallrefupdates = true`;
  fs.writeFileSync(getGitPath('config'), configContent);

  logger.debug('Git repository initialized with initial commit');
  return commitHash;
}