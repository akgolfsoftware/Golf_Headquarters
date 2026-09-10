#!/usr/bin/env node
/** Stable project boundaries. No network, app imports or writes. */
import { readdirSync, lstatSync, realpathSync, existsSync, readFileSync, readlinkSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const config = JSON.parse(readFileSync(join(root, 'docs/vedlikehold/prosjektstruktur.json'), 'utf8'));
const errors = [];
for (const entry of readdirSync(root)) {
  if (entry.startsWith('.env') || config.rot.includes(entry)) continue;
  errors.push(`Uklassifisert rotoppføring: ${entry}. Plasser den i riktig mappe eller oppdater prosjektkartet.`);
}
for (const [source, target] of Object.entries(config.fellesPekere)) {
  const file = join(root, source);
  if (!existsSync(file) || !lstatSync(file).isSymbolicLink() || readlinkSync(file).startsWith('/') || realpathSync(file) !== realpathSync(join(root, target))) {
    errors.push(`${source} må være en relativ peker til ${target}; ikke en redigert kopi.`);
  }
}
for (const p of config.pensjonert) if (existsSync(join(root, p))) errors.push(`Utgått kilde gjeninnført: ${p}`);
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
for (const [name, command] of Object.entries(pkg.scripts)) {
  if (command.includes('scripts/arkiv/') || name === 'speil:paper') errors.push(`Aktiv npm-kommando bruker arkiv: ${name}`);
  for (const match of command.matchAll(/\bscripts\/[\w/.-]+\.(?:mjs|ts|sh|py)\b/g)) {
    if (!existsSync(join(root, match[0]))) errors.push(`npm ${name}: mangler ${match[0]}`);
  }
}
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.md') ? [join(dir, e.name)] : []);
}
for (const p of [join(root, 'AGENTS.md'), join(root, 'CLAUDE.md'), join(root, 'QWEN.md'), ...walk(join(root, '.claude/skills'))]) {
  const text = readFileSync(p, 'utf8');
  if (/\.Codex\/|Codex Paper|Codex Design-prosjekt/.test(text)) errors.push(`Feilaktig verktøykopi: ${p.slice(root.length + 1)}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('OK: prosjektstruktur, delte instruksjoner og aktive npm-verktøy.');
