import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

export function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.debug(`Created directory: ${dir}`);
  }
}

export function writeFile(filePath, content) {
  createDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
  logger.debug(`Created file: ${filePath}`);
}

export function decodeContent(content, encoding) {
  if (encoding === 'base64') {
    return Buffer.from(content, 'base64').toString('utf-8');
  }
  return content;
}