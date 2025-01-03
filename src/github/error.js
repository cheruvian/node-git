import { logger } from '../utils/logger.js';

const ERROR_MESSAGES = {
  404: 'Repository or path not found',
  401: 'Invalid GitHub token or missing permissions',
  403: 'API rate limit exceeded or insufficient permissions',
  500: 'GitHub server error. Please try again later'
};

export function handleGitHubError(error, context) {
  logger.error(`GitHub API Error: ${error.message}`);
  logger.debug(`Status: ${error.status}`);
  logger.debug(`Response: ${JSON.stringify(error.response?.data, null, 2)}`);

  const message = ERROR_MESSAGES[error.status] || `${context}: ${error.message}`;
  throw new Error(message);
}