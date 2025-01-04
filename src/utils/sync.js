import { logger } from './logger.js';
import { getLatestCommit, getLocalCommit, getCommitDiff } from './commits.js';
import { getContent } from '../github/api.js';

export async function syncWithRemote(owner, repo, localFiles, ignorePatterns) {
  const localCommit = getLocalCommit();
  const remoteCommit = await getLatestCommit(owner, repo);

  // If no local commit, get list of all files from remote
  if (!localCommit) {
    logger.info('No local commit found, performing full sync...');
    const contents = await getContent(owner, repo);
    
    const changes = {
      added: contents
        .filter(item => item.type === 'file')
        .map(item => item.path),
      modified: [],
      deleted: []
    };

    return { remoteCommit, changes };
  }

  // Get changes between commits
  const diff = await getCommitDiff(owner, repo, localCommit, remoteCommit);
  
  const changes = {
    added: diff.files.filter(f => f.status === 'added').map(f => f.filename),
    modified: diff.files.filter(f => f.status === 'modified').map(f => f.filename),
    deleted: diff.files.filter(f => f.status === 'removed').map(f => f.filename)
  };

  return { remoteCommit, changes };
}