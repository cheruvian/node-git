import { logger } from '../utils/logger.js';
import { githubFetch } from '../fetch.js';

export async function getRepo(owner, repo) {
  logger.debug(`Fetching repository info for ${owner}/${repo}...`);
  return githubFetch(`/repos/${owner}/${repo}`);
}

export async function getRepoContents(owner, repo, path = '') {
  logger.debug(`Fetching contents for ${owner}/${repo}/${path}...`);
  return githubFetch(`/repos/${owner}/${repo}/contents/${path}`);
}