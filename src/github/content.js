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
      if (contents.content) {
        contents.content = Buffer.from(contents.content, 'base64').toString('utf-8');
      }
      return [contents];
    }

    const contentPromises = contents.map(async item => {
      if (item.type === 'file' && item.download_url) {
        const fileData = await fetchWithRetry(item.url);
        if (fileData.content) {
          item.content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        }
      }
      return item;
    });

    return Promise.all(contentPromises);
  } catch (error) {
    logger.error(`Failed to download contents: ${error.message}`);
    throw error;
  }
}