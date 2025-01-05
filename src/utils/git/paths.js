import path from 'path';

export const GIT_DIR = '_git';

export function getGitPath(...segments) {
  return path.join(GIT_DIR, ...segments);
}

export const PATHS = {
  config: () => getGitPath('config.json'),
  snapshot: () => getGitPath('snapshot.json'),
  staging: () => getGitPath('staging'),
  objects: () => getGitPath('objects'),
  refs: () => getGitPath('refs'),
  head: () => getGitPath('HEAD'),
  index: () => getGitPath('index')
};

export const GIT_IGNORE_PATTERNS = [
  `**/${GIT_DIR}/**`,
  GIT_DIR,
  '**/node_modules/**',
  'package-lock.json'
];