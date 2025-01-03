import { logger } from '../utils/logger.js';

const BASE_URL = 'https://api.github.com';

async function githubFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${error}`);
  }

  return response.json();
}

export async function createCommit(owner, repo, message, changes) {
  logger.debug(`Creating commit in ${owner}/${repo}...`);
  
  try {
    // Get repository info to get default branch
    const repository = await githubFetch(`/repos/${owner}/${repo}`);
    const defaultBranch = repository.default_branch;
    logger.debug(`Default branch: ${defaultBranch}`);

    // Get current ref
    const ref = await githubFetch(`/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`);
    logger.debug(`Current ref: ${ref.object.sha}`);

    // Get current commit
    const commit = await githubFetch(`/repos/${owner}/${repo}/git/commits/${ref.object.sha}`);
    logger.debug(`Parent commit: ${commit.sha}`);

    // Create tree
    const tree = await githubFetch(`/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: commit.tree.sha,
        tree: changes
      })
    });
    logger.debug(`Created tree: ${tree.sha}`);

    // Create commit
    const newCommit = await githubFetch(`/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree: tree.sha,
        parents: [commit.sha]
      })
    });
    logger.debug(`Created commit: ${newCommit.sha}`);

    // Update ref
    await githubFetch(`/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
      method: 'PATCH',
      body: JSON.stringify({
        sha: newCommit.sha
      })
    });
    logger.debug('Updated ref to new commit');

    return newCommit;
  } catch (error) {
    logger.error(`Failed to create commit: ${error.message}`);
    throw error;
  }
}