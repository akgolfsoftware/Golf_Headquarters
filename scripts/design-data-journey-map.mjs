/** Read-only AST inventory: reachability is a lead, never runtime/test proof. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative, dirname } from 'node:path';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const report = resolve(root, 'docs/design-audit/design-data-journey-map-2026-10-01.json');
const sha = value => createHash('sha256').update(value).digest('hex');
const files = execFileSync('rg', ['--files', 'src'], { cwd: root, encoding: 'utf8' }).trim().split('\n')
  .filter(file => /\.tsx?$/.test(file) && !file.includes('/generated/') && !/\.test\.tsx?$/.test(file)).sort();
const known = new Set(files);
const config = ts.readConfigFile(resolve(root, 'tsconfig.json'), ts.sys.readFile);
if (config.error) throw new Error('Cannot read project TypeScript configuration');
const options = ts.parseJsonConfigFileContent(config.config, ts.sys, root).options;
const cache = ts.createModuleResolutionCache(root, value => value, options);
const models = new Set([...readFileSync(resolve(root, 'prisma/schema.prisma'), 'utf8').matchAll(/^model\s+(\w+)/gm)]
  .map(([, name]) => name[0].toLowerCase() + name.slice(1)));
const writeMethods = new Set(['create', 'createMany', 'createManyAndReturn', 'update', 'updateMany', 'updateManyAndReturn', 'upsert', 'delete', 'deleteMany']);
const familyRules = [
  ['design-preview', /^\/(ds|design|demo)(\/|$)/],
  ['auth', /^\/(auth|api\/auth)(\/|$)/],
  ['parent-consent', /^\/(forelder|innsyn)(\/|$)|\/(gdpr|samtykke|personvern)(\/|$)/],
  ['organisations', /^\/(team-norway|team-wang|wang|gfgk|junior)(\/|$)/],
  ['booking-payments', /\/(booking|bookinger|stripe|abonnement|betaling|credits|klippekort)(\/|$)/],
  ['ai-approval', /\/(caddie|jarvis|agenticos|agenter|godkjenninger)(\/|$)/],
  ['live-summary', /\/(live|gjennomfore|okter)(\/|$)/],
  ['planning-sources', /\/(workbench|planlegge|teknisk-plan|plan|fys|maler|ovelser)(\/|$)/],
  ['analysis-registration', /\/(analysere|analyse|stats|tester|runde|runder|slag|turneringer|baneguide|gameplan)(\/|$)/],
  ['groups-messages-calendar', /\/(grupper|meldinger|innboks|kalender|varsler)(\/|$)/],
  ['player-account', /^\/portal(\/|$)/],
  ['coach-operations', /^\/admin(\/|$)/],
  ['internal', /^\/(api|meg|me)(\/|$)/],
];
const family = route => familyRules.find(([, pattern]) => pattern.test(route))?.[0] ?? 'public-market';
const routeOf = file => '/' + file.slice('src/app/'.length).split('/').slice(0, -1)
  .filter(part => !/^\(.+\)$/.test(part) && !part.startsWith('@')).join('/');
const exportsOf = ast => ast.statements.flatMap(statement => {
  if (!statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) return [];
  if (ts.isFunctionDeclaration(statement) && statement.name) return [statement.name.text];
  if (ts.isVariableStatement(statement)) return statement.declarationList.declarations
    .filter(declaration => ts.isIdentifier(declaration.name)).map(declaration => declaration.name.text);
  return [];
});

const nodes = new Map();
for (const file of files) {
  const content = readFileSync(resolve(root, file), 'utf8');
  const ast = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const imports = new Set();
  const unresolvedLocal = new Set();
  const calls = new Map();
  const addImport = specifier => {
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return;
    const resolved = ts.resolveModuleName(specifier, resolve(root, file), options, ts.sys, cache).resolvedModule;
    const target = resolved ? relative(root, resolved.resolvedFileName) : null;
    if (target && known.has(target)) imports.add(target);
    else if (!/\.(css|svg|png|jpg|webp)$/.test(specifier) && !target?.includes('/generated/')) unresolvedLocal.add(specifier);
  };
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      const onlyTypes = clause?.isTypeOnly || (bindings && ts.isNamedImports(bindings) &&
        !clause.name && bindings.elements.length > 0 && bindings.elements.every(item => item.isTypeOnly));
      if (!onlyTypes) addImport(node.moduleSpecifier.text);
    }
    if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) addImport(node.moduleSpecifier.text);
    if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) addImport(node.arguments[0].text);
      const expr = node.expression;
      if (ts.isPropertyAccessExpression(expr) && ts.isPropertyAccessExpression(expr.expression)) {
        const table = expr.expression;
        if (ts.isIdentifier(table.expression) && ['prisma', 'tx', 'db'].includes(table.expression.text) && models.has(table.name.text)) {
          const key = table.name.text + '.' + expr.name.text;
          calls.set(key, { model: table.name.text, operation: expr.name.text,
            writes: writeMethods.has(expr.name.text), line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1 });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const server = ast.statements.some(statement => ts.isExpressionStatement(statement) &&
    ts.isStringLiteral(statement.expression) && statement.expression.text === 'use server');
  nodes.set(file, { file, sha256: sha(content), imports: [...imports].sort(), unresolvedLocal: [...unresolvedLocal].sort(),
    serverActions: server ? exportsOf(ast) : [], modelCalls: [...calls.values()] });
}
function layouts(file) {
  const result = [];
  let directory = dirname(file);
  while (directory.startsWith('src/app')) {
    for (const base of ['layout', 'template']) {
      const candidate = directory + '/' + base + '.tsx';
      if (known.has(candidate)) result.push(candidate);
    }
    if (directory === 'src/app') break;
    directory = dirname(directory);
  }
  return result;
}
function closure(seeds) {
  const seen = new Set();
  const pending = [...seeds];
  while (pending.length) {
    const file = pending.pop();
    if (seen.has(file) || !nodes.has(file)) continue;
    seen.add(file);
    pending.push(...nodes.get(file).imports);
  }
  return [...seen].sort();
}
const routes = files.filter(file => file.startsWith('src/app/') && /\/(page\.tsx|route\.ts)$/.test(file)).map(file => {
  const route = routeOf(file);
  const kind = file.endsWith('/page.tsx') ? 'page' : 'api';
  const dependencies = closure([file, ...(kind === 'page' ? layouts(file) : [])]);
  const boundaries = dependencies.map(item => nodes.get(item)).filter(node => node.serverActions.length || node.modelCalls.length);
  return { file, route, kind, family: family(route),
    parallelSlot: file.split('/').some(part => part.startsWith('@')),
    sourceSha256: nodes.get(file).sha256,
    dependencyCount: dependencies.length,
    boundaryFiles: boundaries.map(node => node.file),
    modelsRead: [...new Set(boundaries.flatMap(node => node.modelCalls.filter(call => !call.writes).map(call => call.model)))].sort(),
    modelsWritten: [...new Set(boundaries.flatMap(node => node.modelCalls.filter(call => call.writes).map(call => call.model)))].sort(),
    evidence: 'source-reachability-only', designReference: null, runtimeJourney: 'not-verified-as-whole-route' };
});
const nodeArray = [...nodes.values()];
const body = {
  schemaVersion: 1,
  limits: [
    'Static runtime-import closure includes reachable helpers and parent layouts, not proof that an action executes.',
    'Prisma calls recognise prisma/tx/db identifiers only; raw SQL, Supabase Storage, computed delegates and external services need manual review.',
    'Route families are triage groups, not new navigation or product scope. No selected design version is implied.',
    'Browser, real persistence, mocked request context, visual approval and provider tests must be reported separately.',
  ],
  sourceFingerprint: sha(nodeArray.map(node => node.file + ':' + node.sha256).join('\n')),
  schemaFingerprint: sha(readFileSync(resolve(root, 'prisma/schema.prisma'))),
  counts: { sourceModules: nodeArray.length, pages: routes.filter(route => route.kind === 'page').length,
    apiRoutes: routes.filter(route => route.kind === 'api').length,
    serverModules: nodeArray.filter(node => node.serverActions.length).length },
  families: [...new Set(routes.map(route => route.family))].sort().map(id => ({ id,
    routes: routes.filter(route => route.family === id).length, runtimeStatus: 'not-verified-as-whole-family' })),
  routes,
  modules: nodeArray.filter(node => node.serverActions.length || node.modelCalls.length || node.unresolvedLocal.length),
};
if (process.argv.includes('--check')) {
  const stored = JSON.parse(readFileSync(report, 'utf8'));
  const { measuredAt: _time, baseCommit: _commit, ...previous } = stored;
  if (JSON.stringify(previous) !== JSON.stringify(body)) throw new Error('Source map is stale. Regenerate and review it.');
  console.log('Design/data source map matches this working tree.');
} else {
  writeFileSync(report, JSON.stringify({ measuredAt: new Date().toISOString(),
    baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), ...body }, null, 2) + '\n');
  console.log(JSON.stringify(body.counts));
}
