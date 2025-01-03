import { logger } from '../utils/logger.js';
import { fetchWithRetry } from '../utils/http.js';

const BASE_URL = 'https://api.github.com';

export async function downloadContents(owner, repo, path = '') {
  logger.debug(`Downloading contents for ${owner}/${repo}/${path}...`);
  
  try {
    const contents = await fetchWithRetry(
      `${BASE_URL}/repos/${owner}/${repo}/contents/${path}`
    );
    
    if (!Array.isArray(contents)) {
      const { content = '', encoding = 'base64' } = contents;
      contents.content = Buffer.from(content, encoding).toString('utf-8');
      return [contents];
    }

    const contentPromises = contents.map(async item => {
      if (item.type === 'file') {
        const fileData = await fetchWithRetry(item.url);
        const { content = '', encoding = 'base64' } = fileData;
        item.content = Buffer.from(content, encoding).toString('utf-8');
      }
      return item;
    });

    return Promise.all(contentPromises);
  } catch (error) {
    logger.error(`Failed to download contents: ${error.message}`);
    throw error;
  }
}