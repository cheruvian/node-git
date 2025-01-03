import { octokit } from './client.js';
import { logger } from '../utils/logger.js';
import { handleGitHubError } from './error.js';

export async function fetchContent(owner, repo, path = '') {
  logger.debug(`Fetching content for ${owner}/${repo}/${path || 'root'}...`);
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });
    logger.debug(`Content retrieved successfully for ${path || 'root'}`);
    return data;
  } catch (error) {
    handleGitHubError(error, `Failed to fetch content for ${path || 'root'}`);
  }
}