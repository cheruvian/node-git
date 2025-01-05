import { BASE_URL } from './api.js';

export async function githubFetch(path) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    logger.error(`GitHub API Error: ${response.status} ${response.statusText}`);
    logger.debug(`Response: ${errorMessage}`);
    
    if (response.status === 404) {
      throw new Error('Repository or path not found');
    }
    if (response.status === 401) {
      throw new Error('Invalid GitHub token or missing permissions');
    }
    if (response.status === 403) {
      throw new Error('API rate limit exceeded or insufficient permissions');
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
