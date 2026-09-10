#!/usr/bin/env node
/** Inventory of tracked and non-ignored project files. Never reads env or private data. */
import { execFileSync } from 'node:child_process';
import { lstatSync, existsSync, readFileSync, writeFileSync, mkdirSync, readlinkSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = 'docs/vedlikehold/filregister.json';
const generated = new Set([output, 'docs/vedlikehold/dokumentregister.md', 'scripts/katalog.md']);
const files = [...new Set(execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean))]
  .filter(p => existsSync(resolve(root, p)))
  .filter(p => !p.startsWith('.agents/skills/') && !p.startsWith('.codex/hooks/'))
  .sort((a, b) => a.localeCompare(b, 'en'));

function area(p) {
  if (p.startsWith('docs/arkiv/') || p.startsWith('scripts/arkiv/')) return 'historikk';
  if (p.startsWith('docs/planer/')) return 'datert-plan';
  if (p.startsWith('docs/referanse/')) return 'referanse';
  if (p.startsWith('designsystem/')) return 'designkilde';
  if (p.startsWith('docs/')) return 'dokumentasjon';
  if (p.startsWith('src/')) return p.includes('.test.') ? 'test' : 'appkode';
  if (p.startsWith('tests/')) return 'test';
  if (p.startsWith('prisma/') || p.startsWith('supabase-meg/')) return 'databasekilde';
  if (p.startsWith('scripts/')) return 'verktoy';
  if (p.startsWith('public/') || p.startsWith('content/')) return 'offentlig-innhold';
  if (p.startsWith('data/')) return 'datamal';
  return 'prosjektoppsett';
}
const rows = files.filter(p => !generated.has(p)).map(p => {
  const stat = lstatSync(resolve(root, p));
  return { sti: p, omrade: area(p), byte: stat.size, ...(stat.isSymbolicLink() ? { peker: readlinkSync(resolve(root, p)) } : {}) };
});
const metrics = {
  prosjektfiler: rows.length,
  sidefiler: rows.filter(r => /^src\/app\/.*\/page\.tsx$|^src\/app\/page\.tsx$/.test(r.sti)).length,
  prismamodeller: (readFileSync(resolve(root, 'prisma/schema.prisma'), 'utf8').match(/^model /gm) ?? []).length,
  enhetstestfiler: rows.filter(r => r.sti.startsWith('src/') && r.sti.endsWith('.test.ts')).length,
  nettlesertestfiler: rows.filter(r => /^tests\/e2e\/.*\.spec\.ts$/.test(r.sti)).length,
  trainLockTegninger: rows.filter(r => /^designsystem\/train-lock\/[^/]+\.dc\.html$/.test(r.sti)).length,
};
const payload = { metode: 'git ls-files -co --exclude-standard; eksisterende filer; genererte registerfiler utelatt. Kun metadata, ikke kundedata eller miljøverdier.', telling: metrics, filer: rows };
const documents = rows.filter(r => r.sti.startsWith('docs/') && r.sti.endsWith('.md'));
const docLines = ['# Dokumentregister', '', 'Generert med `npm run prosjekt:register`. Alle dokumenter under docs er tatt med, også historikk. Kategorien sier hvor dokumentet hører hjemme; den bekrefter ikke at innholdet eller funksjonen er ferdig.', '', 'Start i [dokumentoversikten](../README.md). Designleveranser ligger separat i [designkartet](../../designsystem/README.md).', '', '| Kategori | Dokument |', '|---|---|', ...documents.map(r => `| ${r.omrade} | [${r.sti}](<${relative(resolve(root, 'docs/vedlikehold'), resolve(root, r.sti))}>) |`), ''];
function scriptType(p) {
  const name = p.split('/').at(-1);
  if (/^(check-|maal-|prosjekt-register)/.test(name)) return 'Kontroll / rapport — les skriptet for eventuelle sideeffekter';
  if (/^(seed-|import-|add-|apply-|migrate-|wipe-|reset-|rotate-|roter-|reimport-|send-|opprett-|cleanup-|dedupe-|backfill-|sync-|retag-|koble-|lag-)/.test(name)) return 'Data / integrasjon — kan skrive eller sende';
  if (/shot|signoff|pixel|smoke|evidence|stikkprove/.test(name)) return 'Test / bilde — kontroller miljø og testkonto';
  return 'Verktøy / drift — les kontrakten før kjøring';
}
const scripts = rows.filter(r => r.sti.startsWith('scripts/') && !r.sti.startsWith('scripts/arkiv/') && !r.sti.endsWith('.md'));
const scriptLines = ['# Verktøykatalog', '', 'Generert med `npm run prosjekt:register`. Kategoriene er veivisere basert på navn, ikke en sikkerhetsgodkjenning. Kontroller innhold og miljø før kjøring. Skriptene kjøres ikke av registeret.', '', '| Type | Fil |', '|---|---|', ...scripts.map(r => `| ${scriptType(r.sti)} | [${r.sti}](<${relative(resolve(root, 'scripts'), resolve(root, r.sti))}>) |`), ''];
if (process.argv.includes('--write')) {
  mkdirSync(resolve(root, 'docs/vedlikehold'), { recursive: true });
  writeFileSync(resolve(root, output), JSON.stringify(payload, null, 2) + '\n');
  writeFileSync(resolve(root, 'docs/vedlikehold/dokumentregister.md'), docLines.join('\n'));
  writeFileSync(resolve(root, 'scripts/katalog.md'), scriptLines.join('\n'));
}
console.log(JSON.stringify(metrics, null, 2));
