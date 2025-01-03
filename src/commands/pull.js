import { logger } from '../utils/logger.js';
import { validateGitHubToken } from '../utils/validation.js';
import { getRepo, getContent } from '../github/api.js';
import { getRemoteState } from '../utils/remoteState.js';
import { writeFile } from '../utils/fs.js';
import path from 'path';

export async function pull() {
  try {
    validateGitHubToken();
    
    const remote = getRemoteState();
    if (!remote) {
      throw new Error('No GitHub remote configured');
    }

    logger.info(`Pulling from ${remote.owner}/${remote.repo}...`);
    
    // Get repository info
    const repo = await getRepo(remote.owner, remote.repo);
    const defaultBranch = repo.default_branch;
    
    // Get latest tree
    const contents = await getContent(remote.owner, remote.repo);
    
    // Update index
    const indexPath = path.join('.git', 'index');
    const index = contents.map(item => ({
      path: item.path,
      mode: item.type === 'file' ? '100644' : '040000',
      type: item.type,
      sha: item.sha
    }));
    
    writeFile(indexPath, JSON.stringify(index, null, 2));
    logger.success('✓ Git index updated successfully');
  } catch (error) {
    logger.error(`Pull failed: ${error.message}`);
    process.exit(1);
  }
}