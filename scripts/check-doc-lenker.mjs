#!/usr/bin/env node
/** Local Markdown links in maintained documentation. No network or writes. */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const config = JSON.parse(readFileSync(join(root, 'docs/vedlikehold/prosjektstruktur.json'), 'utf8'));
function walk(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap(e => {
    const p = `${dir}/${e.name}`;
    if ([...config.historiskeDokumenter, ...config.eksterneDokumenter].some(prefix => p === prefix || p.startsWith(prefix + '/'))) return [];
    return e.isDirectory() ? walk(p) : e.name.endsWith('.md') ? [p] : [];
  });
}
// Parse balanced parentheses so Next route-group paths remain valid link targets.
function targets(text) {
  const result = [];
  const body = text.replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '').replace(/`[^`\n]*`/g, '');
  const start = /\]\(/g;
  for (let m; (m = start.exec(body));) {
    let depth = 1, i = start.lastIndex;
    for (; i < body.length && depth; i++) {
      if (body[i] === '\\') { i++; continue; }
      if (body[i] === '(') depth++;
      if (body[i] === ')') depth--;
    }
    if (depth) continue;
    let target = body.slice(start.lastIndex, i - 1).trim();
    target = target.startsWith('<') ? target.slice(1, target.indexOf('>')) : target.replace(/\s+["'][\s\S]*$/, '');
    result.push(target);
    start.lastIndex = i;
  }
  return result;
}
const files = [...new Set([...config.innganger, ...walk('docs'), ...walk('.claude/skills')])];
const failures = [];
for (const file of files) {
  if (!existsSync(join(root, file))) { failures.push(`Inngang mangler: ${file}`); continue; }
  for (const target of new Set(targets(readFileSync(join(root, file), 'utf8')))) {
    if (!target || /^[a-zA-Z][\w+.-]*:|^#|^\/|^~/.test(target)) continue;
    const path = decodeURIComponent(target.split('#')[0].split('?')[0]);
    if (!path || path.includes('*')) continue;
    if (!existsSync(resolve(root, dirname(file), path))) failures.push(`${file} → ${target}`);
  }
}
if (failures.length) { console.error('Døde lokale dokumentlenker:\n' + failures.join('\n')); process.exitCode = 1; }
else console.log(`OK: lokale Markdown-lenker i ${files.length} vedlikeholdte dokumenter (arkiv, daterte underlag og eksterne skill-pakker er unntatt).`);
