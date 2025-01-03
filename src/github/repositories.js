import { logger } from '../utils/logger.js';

const BASE_URL = 'https://api.github.com';

async function githubFetch(path, options = {}) {
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
    throw new Error(`GitHub API error: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export async function createRepository(name, isPrivate = true) {
  logger.debug(`Creating repository: ${name}`);
  return githubFetch('/user/repos', {
    method: 'POST',
    body: JSON.stringify({
      name,
      private: isPrivate,
      auto_init: false
    })
  });
}