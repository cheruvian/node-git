import { logger } from './logger.js';
import { getLatestCommit, getLocalCommit, updateLocalCommit, getCommitDiff } from './commits.js';
import { syncFiles } from './fileSync.js';

export async function syncWithRemote(owner, repo, localFiles, ignorePatterns) {
  const localCommit = getLocalCommit();
  const remoteCommit = await getLatestCommit(owner, repo);

  // If no local commit, treat all files as new
  if (!localCommit) {
    logger.info('No local commit found, performing full sync...');
    return { remoteCommit };
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