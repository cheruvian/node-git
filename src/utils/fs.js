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

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.debug(`Created directory: ${dir}`);
  }
}

export function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  logger.debug(`Copied file: ${src} -> ${dest}`);
}

export function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    logger.error(`Failed to read JSON file ${filePath}: ${error.message}`);
    return {};
  }
}