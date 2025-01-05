import { fetchWithRetry } from './http.js';
import { readConfig, updateConfig } from './config.js';
import { BASE_URL } from '../github/api.js';

export async function getLatestCommit(owner, repo, branch = 'main') {
  const url = `${BASE_URL}/repos/${owner}/${repo}/commits/${branch}`;
  const commit = await fetchWithRetry(url);
  return commit.sha;
}

export function getLocalCommit() {
  const config = readConfig();
  return config.lastCommit || null;
}

export function updateLocalCommit(sha) {
  return updateConfig({ lastCommit: sha });
}

export async function getCommitDiff(owner, repo, base, head) {
  const url = `${BASE_URL}/repos/${owner}/${repo}/compare/${base}...${head}`;
  return fetchWithRetry(url);
}