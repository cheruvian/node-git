import { logger } from '../utils/logger.js';
import { githubFetch } from '../fetch.js';

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