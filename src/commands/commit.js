import { createCommit } from '../github/commits.js';
import { getGitStatus } from './status.js';
import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import fs from 'fs';
import path from 'path';

export async function commit(message) {
  try {
    validateGitHubToken();

    const status = await getGitStatus();
    
    if (!status.staged.length) {
      logger.warn('No changes staged for commit');
      return;
    }

    logger.info('Preparing changes for commit...');
    const changes = status.staged.map(file => ({
      path: file,
      mode: '100644',
      type: 'blob',
      content: fs.readFileSync(path.join(process.cwd(), file), 'utf-8')
    }));

    const configPath = path.join(process.cwd(), '.git', 'config');
    const config = fs.readFileSync(configPath, 'utf-8');
    const remoteUrl = config.match(/url = https:\/\/github.com\/(.+)\/(.+).git/);
    
    if (!remoteUrl) {
      throw new Error('No GitHub remote found');
    }

    const [, owner, repo] = remoteUrl;
    logger.info(`Creating commit in ${owner}/${repo}...`);
    
    await createCommit(owner, repo, message, changes);
    logger.success('Changes committed successfully!');
  } catch (error) {
    logger.error(`Commit failed: ${error.message}`);
    logger.debug(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
}