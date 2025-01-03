import { logger } from '../utils/logger.js';
import { fetchWithRetry } from '../utils/http.js';

const BASE_URL = 'https://api.github.com';

export async function getRepo(owner, repo) {
  logger.debug(`Fetching repository info for ${owner}/${repo}...`);
  return fetchWithRetry(`${BASE_URL}/repos/${owner}/${repo}`);
}

export async function getContent(owner, repo, path = '') {
  logger.debug(`Fetching contents for ${owner}/${repo}/${path}...`);
  return fetchWithRetry(`${BASE_URL}/repos/${owner}/${repo}/contents/${path}`);
}