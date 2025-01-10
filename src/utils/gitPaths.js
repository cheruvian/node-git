import path from 'path';

export const GIT_DIR = '_git';

export function getGitPath(...segments) {
  return path.join(GIT_DIR, ...segments);
}

export function getConfigPath() {
  return getGitPath('config.json');
}

export function getSnapshotPath() {
  return getGitPath('snapshot.json');
}

export function getStagingPath() {
  return getGitPath('staging');
}

export function getObjectsPath() {
  return getGitPath('objects');
}

export function getRefsPath() {
  return getGitPath('refs');
}
