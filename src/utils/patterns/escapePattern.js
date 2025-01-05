export function escapePattern(pattern) {
  // Escape special regex characters except * and ?
  return pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}