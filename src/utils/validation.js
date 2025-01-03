import { logger } from './logger.js';

export function validateGitHubToken() {
  logger.debug('Checking for GITHUB_TOKEN...');
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not set in .env file');
  }
  if (process.env.GITHUB_TOKEN === 'your_github_token_here') {
    throw new Error('GITHUB_TOKEN is still set to the default value. Please update it in .env file');
  }
  logger.debug('GITHUB_TOKEN validation passed');
}