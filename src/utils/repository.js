import { logger } from './logger.js';
import { getRepo } from '../github/api.js';
import { getLatestCommit } from './commits.js';
import { writeConfig } from './config.js';
import { createSnapshot } from './snapshot.js';
import { ensureDir } from './fs.js';

export async function initializeRepository(owner, repo, options = {}) {
  logger.info(`Initializing repository ${owner}/${repo}...`);
  
  // Verify repository exists
  await getRepo(owner, repo);
  
  // Create _git directory
  ensureDir('_git');
  
  // Get commit hash (specified or latest)
  const commitHash = options.commit || await getLatestCommit(owner, repo);
  logger.info(`Target commit: ${commitHash}`);
  
  // Initialize config with remote info and commit hash
  const config = {
    remote: {
      origin: {
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}.git`
      }
    },
    lastCommit: commitHash
  };
  writeConfig(config);

  // Create initial snapshot
  await createSnapshot('.');
  
  return { commitHash };
}