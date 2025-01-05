import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';

export function createGitObject(type, content) {
  // Create the header
  const header = `${type} ${Buffer.from(content).length}\0`;
  const store = Buffer.concat([
    Buffer.from(header),
    Buffer.from(content)
  ]);
  
  // Calculate SHA-1 hash
  const hash = crypto.createHash('sha1').update(store).digest('hex');
  
  // Compress the content
  const compressed = zlib.deflateSync(store);
  
  return { hash, content: compressed };
}

export function writeGitObject(objectsDir, hash, content) {
  const dir = path.join(objectsDir, hash.substring(0, 2));
  const file = path.join(dir, hash.substring(2));
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  
  // Write the compressed binary content
  fs.writeFileSync(file, content);
  return hash;
}

export function readGitObject(objectsDir, hash) {
  const dir = path.join(objectsDir, hash.substring(0, 2));
  const file = path.join(dir, hash.substring(2));
  
  if (!fs.existsSync(file)) {
    throw new Error(`Git object ${hash} not found`);
  }
  
  // Read and decompress the object
  const compressed = fs.readFileSync(file);
  const raw = zlib.inflateSync(compressed);
  
  // Parse the header
  const nullIndex = raw.indexOf(0);
  const header = raw.slice(0, nullIndex).toString();
  const [type, size] = header.split(' ');
  
  // Get the content
  const content = raw.slice(nullIndex + 1);
  
  return {
    type,
    size: parseInt(size),
    content: content.toString()
  };
}