import { logger } from '../utils/logger.js';
import { githubFetch } from './fetch.js';
import { createCommit } from './commits.js';
import { downloadContents } from './content.js';

export const BASE_URL = 'https://api.github.com';

export async function getRepo(owner, repo) {
  logger.debug(`Fetching repository info for ${owner}/${repo}...`);
  return githubFetch(`/repos/${owner}/${repo}`);
}

export async function getContent(owner, repo, path = '', ref = '') {
  logger.debug(`Fetching contents for ${owner}/${repo}/${path}...`);
  const query = ref ? `?ref=${ref}` : '';
  return githubFetch(`/repos/${owner}/${repo}/contents/${path}${query}`);
}

export { createCommit, downloadContents };