#!/usr/bin/env node
/** Read-only source scan. --write updates generated inventory only, never design decisions. */
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const pagePattern = /^page\.(tsx|jsx|ts|js|mdx)$/;
const surfacePattern = /^(layout|template|loading|error|global-error|not-found|default)\.(tsx|jsx|ts|js|mdx)$/;
export function routeInfo(source) {
  const pieces = source.replaceAll('\\', '/').replace(/^src\/app\//, '').split('/').slice(0, -1);
  const intercepted = pieces.some(p => /^\(\./.test(p));
  const slots = pieces.filter(p => p.startsWith('@'));
  const groups = pieces.filter(p => /^\([^)]*\)$/.test(p) && !/^\(\./.test(p));
  const route = '/' + pieces.filter(p => !groups.includes(p) && !p.startsWith('@')).join('/');
  return { route: intercepted ? null : route, groups, slots, requiresRouteReview: intercepted || slots.length > 0 };
}
export function areaFor(route, source = '') {
  const p = route ?? '/' + source.replace(/^src\/app\//, '');
  if (/^\/(demos|design-system)(\/|$)/.test(p)) return 'interne-eksempler';
  if (/^\/(auth|onboard|inviter)(\/|$)/.test(p)) return 'inngang-og-konto';
  if (/^\/booking(\/|$)/.test(p)) return 'offentlig-booking';
  if (/^\/portal(\/|$)/.test(p)) return 'playerhq';
  if (/^\/admin(\/|$)/.test(p)) return 'agencyos';
  if (/^\/forelder(\/|$)/.test(p)) return 'forelder';
  if (/^\/(team-wang|team-norway|team-gfgk|gfgk-junior)(\/|$)/.test(p)) return 'lag-og-skole';
  if (/^\/innsyn(\/|$)/.test(p)) return 'delt-innsyn';
  if (/^\/meg(\/|$)/.test(p)) return 'personlig-arbeidsflate';
  if (/^\/(offline|vedlikehold)(\/|$)/.test(p)) return 'systemtilstand';
  return 'marked-og-offentlig';
}
function walk(root, directory) {
  if (!existsSync(resolve(root, directory))) return [];
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap(e => {
    const p = `${directory}/${e.name}`;
    if (e.isSymbolicLink()) return [];
    return e.isDirectory() ? walk(root, p) : [p];
  }).sort();
}
export function inventory(root) {
  if (!existsSync(resolve(root, 'src/app'))) throw new Error('Mangler src/app. Oppgi prosjektrot med --root.');
  const appFiles = walk(root, 'src/app');
  const surfaces = appFiles.filter(p => surfacePattern.test(p.split('/').at(-1)));
  const pages = appFiles.filter(p => pagePattern.test(p.split('/').at(-1))).map(source => {
    const info = routeInfo(source);
    // Candidate only: a redirect in a comment or conditional is not proof of a retired route.
    const redirectCandidate = /\b(?:permanentRedirect|redirect)\s*\(/.test(readFileSync(resolve(root, source), 'utf8'));
    const directory = dirname(source);
    return { source, ...info, area: areaFor(info.route, source), legacyGroup: info.groups.includes('(legacy)'), redirectCandidate,
      nearbySurfaces: surfaces.filter(s => directory === dirname(s) || directory.startsWith(dirname(s) + '/')),
      designStatus: 'ikke-vurdert', accessStatus: 'ikke-verifisert' };
  });
  const components = walk(root, 'src/components').filter(p => /\.(tsx|jsx)$/.test(p)).map(source => ({source, family: source.split('/')[2], isTest: /\.(test|spec)\./.test(source)}));
  const counts = {};
  for (const p of pages) counts[p.area] = (counts[p.area] ?? 0) + 1;
  const grouped = new Map();
  for (const p of pages) if (p.route) grouped.set(p.route, [...(grouped.get(p.route) ?? []),p.source]);
  return { schemaVersion: 1, method: 'Filinventar fra src/app og src/components. Flate er foreslått fra sti, ikke tilgangsbevis. Skanner ikke API-handler, miljøfiler, kundedata eller produksjon. Filantall er ikke antall ferdige skjermer.',
    totals: { pageFiles: pages.length, uniqueRoutePatterns: grouped.size, componentFiles: components.length, surfaceFiles: surfaces.length, byArea: counts },
    sharedRoutePatterns: [...grouped].filter(([,paths]) => paths.length > 1).map(([route,sources]) => ({route,sources})),
    pages, components, surfaces };
}
function csvCell(value) { return '"' + String(value ?? '').replaceAll('"','""') + '"'; }
export function outputs(data) {
  const header = ['kildefil','rutemonster','foreslatt-flate','legacy-gruppe','mulig-videresending','krever-rutevurdering','designstatus','tilgangsstatus'];
  const rows = data.pages.map(p => [p.source,p.route,p.area,p.legacyGroup,p.redirectCandidate,p.requiresRouteReview,p.designStatus,p.accessStatus]);
  return {'ruteinventar.json': JSON.stringify(data,null,2)+'\n', 'ruteinventar.csv': [header,...rows].map(r => r.map(csvCell).join(',')).join('\n')+'\n'};
}
function main() {
  const args = process.argv.slice(2); let root = process.cwd(); let output = resolve(import.meta.dirname,'../assets');
  let mode = 'summary';
  for (let i=0;i<args.length;i++) {
    if (args[i]==='--root' || args[i]==='--output') {
      if (!args[i+1] || args[i+1].startsWith('--')) throw new Error(`Mangler verdi for ${args[i]}`);
      const value=resolve(args[++i]); if (args[i-1]==='--root') root=value; else output=value;
    } else if (args[i]==='--write' || args[i]==='--check') {
      if (mode!=='summary') throw new Error('Velg bare én av --write og --check.'); mode=args[i].slice(2);
    } else throw new Error(`Ukjent argument: ${args[i]}`);
  }
  const data=inventory(root);
  for (const [name,content] of Object.entries(outputs(data))) {
    const file=resolve(output,name);
    if (mode==='write') {mkdirSync(output,{recursive:true});writeFileSync(file,content);}
    if (mode==='check' && (!existsSync(file) || readFileSync(file,'utf8')!==content)) throw new Error(`Inventaret er utdatert: ${relative(root,file)}. Kjør samme kommando med --write. Beslutningsregisteret endres ikke.`);
  }
  console.log(JSON.stringify({mode,...data.totals},null,2));
}
if (process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  try { main(); } catch(error) { console.error(error.message); process.exitCode=1; }
}
