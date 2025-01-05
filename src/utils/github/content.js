import { logger } from '../logger.js';
import { githubFetch } from './fetch.js';

export async function fetchFileContent(owner, repo, path, ref = '') {
  try {
    const query = ref ? `?ref=${ref}` : '';
    const response = await githubFetch(`/repos/${owner}/${repo}/contents/${path}${query}`);
    
    // Handle empty files
    if (response.size === 0) {
      return '';
    }
    
    // Handle regular files
    if (response.content) {
      return Buffer.from(response.content, 'base64').toString('utf-8');
    }
    
    return null;
  } catch (error) {
    if (error.status === 404) {
      logger.debug(`File not found: ${path}`);
      return null;
    }
    throw error;
  }
}

export async function fetchDirectoryContents(owner, repo, path = '', ref = '') {
  try {
    const query = ref ? `?ref=${ref}` : '';
    const contents = await githubFetch(`/repos/${owner}/${repo}/contents/${path}${query}`);
    
    if (!Array.isArray(contents)) {
      return [contents];
    }
    
    return contents;
  } catch (error) {
    if (error.status === 404) {
      logger.debug(`Directory not found: ${path}`);
      return [];
    }
    throw error;
  }
}