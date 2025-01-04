import { logger } from './logger.js';
import { getContent } from '../github/api.js';
import { writeFile } from './fs.js';
import { getIgnorePatterns } from './ignore.js';
import { minimatch } from 'minimatch';
import path from 'path';

export async function downloadFiles(owner, repo, currentPath = '') {
  const ignorePatterns = getIgnorePatterns();
  const contents = await getContent(owner, repo, currentPath);
  
  for (const item of contents) {
    const itemPath = path.join(currentPath, item.name);
    
    // Skip ignored files
    if (ignorePatterns.some(pattern => minimatch(itemPath, pattern))) {
      continue;
    }

    if (item.type === 'dir') {
      await downloadFiles(owner, repo, itemPath);
    } else if (item.type === 'file') {
      const fileData = await getContent(owner, repo, itemPath);
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      writeFile(itemPath, content);
      logger.debug(`Downloaded: ${itemPath}`);
    }
  }
}