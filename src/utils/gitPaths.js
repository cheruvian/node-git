import path from 'path';

// Base git directory name
export const GIT_DIR = '_git';

// Common git paths
export function getGitPath(...segments) {
  return path.join(GIT_DIR, ...segments);
}

export function getConfigPath() {
  return getGitPath('config.json');
}

export function getSnapshotPath() {
  return getGitPath('snapshot.json');
}

// Git ignore patterns
export const GIT_IGNORE_PATTERNS = [
  `**/${GIT_DIR}/**`,
  GIT_DIR,
  '**/node_modules/**',
  'package-lock.json'
];