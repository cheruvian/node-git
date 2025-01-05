import { logger } from '../logger.js';
import { BASE_URL } from '../../github/api.js';

export async function githubFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    logger.error(`GitHub API Error: ${response.status} ${response.statusText}`);
    logger.debug(`Response: ${errorMessage}`);
    
    const error = new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}