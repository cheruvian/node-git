import { logger } from './logger.js';
import { getContent, getRepo } from '../github/api.js';
import { getLatestCommit, getLocalCommit, getCommitDiff } from './commits.js';

function categorizeFileChanges(files) {
  const changes = {
    added: [],
    modified: [],
    deleted: [],
    renamed: []
  };

  for (const file of files) {
    switch (file.status) {
      case 'added':
        changes.added.push(file.filename);
        break;
      case 'modified':
        changes.modified.push(file.filename);
        break;
      case 'removed':
        changes.deleted.push(file.filename);
        break;
      case 'renamed':
        changes.renamed.push({
          from: file.previous_filename,
          to: file.filename
        });
        break;
    }
  }

  return changes;
}

export async function syncWithRemote(owner, repo, snapshot, ignorePatterns) {
  const localCommit = getLocalCommit();
  const remoteCommit = await getLatestCommit(owner, repo);
  
  logger.debug(`Comparing commits: ${localCommit} -> ${remoteCommit}`);

  // If no local commit, get list of all files from remote
  if (!localCommit) {
    logger.info('No local commit found, performing full sync...');
    const contents = await getContent(owner, repo, '', remoteCommit);
    
    const changes = {
      added: contents
        .filter(item => item.type === 'file')
        .map(item => item.path),
      modified: [],
      deleted: []
    };

    return { remoteCommit, changes };
  }

  if (localCommit === remoteCommit) {
    logger.info('Already up to date');
    return { remoteCommit, changes: null };
  }

  // Get changes between commits
  const diff = await getCommitDiff(owner, repo, localCommit, remoteCommit);
  logger.debug(`Found ${diff.files?.length || 0} changed files`);

  const changes = categorizeFileChanges(diff.files || []);

  // Filter out ignored files
  if (ignorePatterns?.length) {
    const shouldInclude = (file) => !ignorePatterns.some(pattern => 
      pattern === file || pattern.includes(file)
    );
    
    changes.added = changes.added.filter(shouldInclude);
    changes.modified = changes.modified.filter(shouldInclude);
    changes.deleted = changes.deleted.filter(shouldInclude);
    changes.renamed = changes.renamed.filter(({ from, to }) => 
      shouldInclude(from) && shouldInclude(to)
    );
  }

  return { remoteCommit, changes };
}