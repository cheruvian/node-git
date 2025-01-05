import fs from 'fs';
import path from 'path';
import { logger } from './logger.js';

export function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      return;
    }

    const content = fs.readFileSync(envPath, 'utf-8');
    const env = {};

    content.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      
      if (!key || !value) return;
      
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      process.env[key.trim()] = cleanValue;
      env[key.trim()] = cleanValue;
    });

    return env;
  } catch (error) {
    logger.debug(`Error loading .env file: ${error.message}`);
  }
}