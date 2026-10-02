#!/usr/bin/env node
/** Statisk inventar. Leser bare kode; ingen appimporter, miljøfiler eller nettverk. */
import { readFileSync, readdirSync, writeFileSync, realpathSync } from 'node:fs';
import { resolve, relative, dirname, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--output') {
  console.error('Bruk: node scripts/codebase-audit.mjs --output docs/design-audit/kodebase-inventar-YYYY-MM-DD.json');
  process.exit(1);
}
const auditDir = realpathSync(resolve(root, 'docs/design-audit'));
const output = resolve(root, args[1]);
if (realpathSync(dirname(output)) !== auditDir || extname(output) !== '.json') {
  throw new Error('Output må være en JSON-fil direkte i docs/design-audit.');
}
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const config = ts.readConfigFile(resolve(root, 'tsconfig.json'), ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const options = ts.parseJsonConfigFileContent(config.config, ts.sys, root).options;
const cache = ts.createModuleResolutionCache(root, (p) => p, options);
const nodes = new Map();
const external = new Map();

function walk(dir) {
  return readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap((e) => {
    const p = `${dir}/${e.name}`;
    if (e.isSymbolicLink() || p === 'src/generated') return [];
    return e.isDirectory() ? walk(p) : /\.(?:[cm]?[jt]sx?|mdx)$/.test(p) ? [p] : [];
  });
}
const testFile = (p) => /(?:\.test\.|\.spec\.|\/__tests__\/)/.test(p);
const entryFile = (p) => /^src\/app\/.*\/(?:page|layout|template|route|loading|error|not-found|default|global-error|sitemap|robots|manifest|opengraph-image|twitter-image)\.[^.]+$/.test(p) || /^src\/(?:proxy|instrumentation|instrumentation-client|sw)\.[^.]+$/.test(p);
const area = (p) => {
  const segments = p.split('/').slice(2);
  if (segments.includes('(marketing)')) return 'marketing';
  return segments.find((s) => !s.startsWith('('))?.replace(/\.[^.]+$/, '') ?? 'rot';
};

for (const path of walk('src').sort()) {
  const source = readFileSync(resolve(root, path), 'utf8');
  const sf = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, path.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const imports = new Set();
  const directives = sf.statements.filter(ts.isExpressionStatement).filter((n) => ts.isStringLiteral(n.expression)).map((n) => n.expression.text);
  const row = {
    path, hash: createHash('sha256').update(source).digest('hex'), lines: source.split('\n').length,
    kind: testFile(path) ? 'test' : entryFile(path) ? 'entry' : 'module',
    directives: directives.filter((s) => ['use server', 'use client'].includes(s)),
    imports: [], externalImports: [], databaseCalls: [], exports: [],
  };
  function visit(n) {
    if ((ts.isImportDeclaration(n) && !n.importClause?.isTypeOnly) || (ts.isExportDeclaration(n) && !n.isTypeOnly)) {
      if (n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) imports.add(n.moduleSpecifier.text);
    }
    if (ts.isCallExpression(n)) {
      if ((n.expression.kind === ts.SyntaxKind.ImportKeyword || n.expression.getText(sf) === 'require') && n.arguments.length === 1 && ts.isStringLiteral(n.arguments[0])) imports.add(n.arguments[0].text);
      const target = n.expression.getText(sf);
      if (/^(?:prisma|tx)\.(?:\w+\.)?(?:findMany|findFirst|findUnique|count|aggregate|groupBy|create|update|updateMany|delete|deleteMany|upsert|\$transaction|\$queryRaw|\$executeRaw)$/.test(target)) {
        row.databaseCalls.push({ target, line: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1 });
      }
    }
    if (ts.isFunctionDeclaration(n) && n.name && n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) row.exports.push(n.name.text);
    ts.forEachChild(n, visit);
  }
  // MDX er registrert som inngang, men blir ikke analysert som TypeScript.
  if (!path.endsWith('.mdx')) visit(sf);
  for (const specifier of imports) {
    const result = ts.resolveModuleName(specifier, resolve(root, path), options, ts.sys, cache).resolvedModule;
    const local = result ? relative(root, result.resolvedFileName).split('\\').join('/') : null;
    if (local?.startsWith('src/') && !local.startsWith('src/generated/')) row.imports.push(local);
    else if (!specifier.startsWith('.') && !specifier.startsWith('@/')) {
      row.externalImports.push(specifier);
      external.set(specifier, (external.get(specifier) ?? 0) + 1);
    }
  }
  row.imports.sort();
  row.externalImports.sort();
  nodes.set(path, row);
}

const reachable = new Set();
function mark(path) {
  if (reachable.has(path) || !nodes.has(path)) return;
  reachable.add(path);
  for (const next of nodes.get(path).imports) mark(next);
}
for (const row of nodes.values()) if (row.kind === 'entry') mark(row.path);
// Tarjan: grupper av gjensidig avhengige filer, ikke påstander om feil.
let index = 0;
const indices = new Map(), low = new Map(), stack = [], onStack = new Set(), cycles = [];
function connect(path) {
  indices.set(path, index); low.set(path, index++); stack.push(path); onStack.add(path);
  for (const next of nodes.get(path).imports) {
    if (!nodes.has(next) || nodes.get(next).kind === 'test') continue;
    if (!indices.has(next)) { connect(next); low.set(path, Math.min(low.get(path), low.get(next))); }
    else if (onStack.has(next)) low.set(path, Math.min(low.get(path), indices.get(next)));
  }
  if (low.get(path) === indices.get(path)) {
    const group = []; let next;
    do { next = stack.pop(); onStack.delete(next); group.push(next); } while (next !== path);
    if (group.length > 1) cycles.push(group.sort());
  }
}
for (const row of nodes.values()) if (row.kind !== 'test' && !indices.has(row.path)) connect(row.path);
const productAreas = {};
const incoming = new Map();
for (const row of nodes.values()) {
  row.entryReachable = reachable.has(row.path);
  if (row.kind === 'entry') (productAreas[area(row.path)] ??= []).push(row.path);
  for (const next of row.imports) incoming.set(next, (incoming.get(next) ?? 0) + 1);
}
const schema = readFileSync(resolve(root, 'prisma/schema.prisma'), 'utf8');
const summary = {
  sourceFiles: nodes.size,
  entries: [...nodes.values()].filter((n) => n.kind === 'entry').length,
  pages: [...nodes.keys()].filter((p) => /\/page\.(tsx?|mdx)$/.test(p)).length,
  apiRoutes: [...nodes.keys()].filter((p) => /^src\/app\/api\/.*\/route\.ts$/.test(p)).length,
  testFiles: [...nodes.values()].filter((n) => n.kind === 'test').length,
  serverActionModules: [...nodes.values()].filter((n) => n.directives.includes('use server')).length,
  entryReachableFiles: reachable.size,
  models: [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]),
  productAreas: Object.fromEntries(Object.entries(productAreas).map(([k, v]) => [k, v.length])),
  largestRuntimeFiles: [...nodes.values()].filter((n) => n.kind !== 'test').sort((a, b) => b.lines - a.lines).slice(0, 20).map(({ path, lines }) => ({ path, lines })),
  mostImported: [...incoming].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([path, count]) => ({ path, count })),
  cycles,
};
const report = {
  formatVersion: 1,
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  trackedFiles: tracked.length,
  limits: ['Importgraf er statisk, inkluderer noen typeimporter og utelater indirekte/dynamiske koblinger og MDX-importer.', 'Ikke nådd fra filinngang betyr ikke ubrukt kode. Skript, konfigurasjon og eksterne kall kan bruke filen.', 'Databasekall er syntaktiske signaler, ikke målt ytelse eller full dataflyt.', 'Hashene identifiserer arbeidsfilene; commit identifiserer grunnlaget, ikke nødvendigvis alle arbeidsendringer.'],
  summary, productAreas,
  externalImports: Object.fromEntries([...external].sort(([a], [b]) => a.localeCompare(b))),
  trackedOutsideSource: tracked.filter((p) => !p.startsWith('src/')),
  files: [...nodes.values()],
};
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ output: relative(root, output), ...summary, models: summary.models.length, cycles: summary.cycles.length }, null, 2));
