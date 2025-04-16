#!/usr/bin/env node
/**
 * generateConsolidated.js
 *
 * Recursively walks the current directory (skipping .git and node_modules),
 * reads each file as a Buffer, and writes a single Markdown file (consolidated.md)
 * with:
 *   - Text files shown raw in UTF-8 code blocks
 *   - Binary files shown as Base64 in code blocks labeled "base64"
 *
 * Usage:
 *   node generateConsolidated.js
 */

const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set(['.git', 'node_modules']);
const INSPECT_BYTES = 512;

/**
 * Detects a binary file by checking for any null byte in the first chunk.
 */
function isBinary(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(INSPECT_BYTES);
  const bytesRead = fs.readSync(fd, buffer, 0, INSPECT_BYTES, 0);
  fs.closeSync(fd);
  for (let i = 0; i < bytesRead; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

/**
 * Recursively collect all file paths (relative to cwd), skipping ignored dirs.
 */
function collectFiles(dir, list = []) {
  const entries = fs.readdirSync(dir).sort();
  for (const name of entries) {
    if (IGNORE_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const rel  = path.relative(process.cwd(), full);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      collectFiles(full, list);
    } else if (stat.isFile()) {
      list.push(rel);
    }
  }
  return list;
}

/**
 * Builds a Markdown string with each file’s contents.
 */
function buildMarkdown(fileList) {
  let md = '';
  for (const relPath of fileList) {
    md += `## File: ${relPath}\n\n`;
    const fullPath = path.join(process.cwd(), relPath);
    try {
      const data = fs.readFileSync(fullPath);
      if (isBinary(fullPath)) {
        // Binary → Base64
        const b64 = data.toString('base64');
        md += '```base64\n' + b64 + '\n```\n\n';
      } else {
        // Text → UTF-8
        const text = data.toString('utf8');
        md += '```\n' + text + '\n```\n\n';
      }
    } catch (err) {
      md += `_Error reading file: ${err.message}_\n\n`;
    }
  }
  return md;
}

/**
 * Main entrypoint: collect, build, write.
 */
function main() {
  const files = collectFiles(process.cwd());
  const markdown = buildMarkdown(files);
  fs.writeFileSync(path.join(process.cwd(), 'consolidated.md'), markdown, 'utf8');
  console.log(`✅ consolidated.md created with ${files.length} files.`);
}

main();
