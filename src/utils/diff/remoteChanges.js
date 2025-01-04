import { logger } from '../logger.js';
import { getContent } from '../../github/api.js';

export async function getChangedFiles(owner, repo) {
  try {
    const contents = await getContent(owner, repo);
    return contents
      .filter(item => item.type === 'file')
      .map(item => item.path);
  } catch (error) {
    logger.error(`Failed to get changed files: ${error.message}`);
    throw error;
  }
}