/** Read-only source inventory. File presence is never proof of working behavior. */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const files = execFileSync('rg', ['--files', 'src'], { cwd: root, encoding: 'utf8' }).trim().split('\n').sort();
const routeFor = file => '/' + file.replace(/^src\/app\//, '').replace(/\/(page|route)\.tsx?$/, '')
  .split('/').filter(part => !/^\(.+\)$/.test(part)).join('/');
const pages = files.filter(file => /\/(page\.tsx|route\.ts)$/.test(file)).map(file => ({
  file, route: file === 'src/app/page.tsx' ? '/' : routeFor(file),
  kind: file.endsWith('/page.tsx') ? 'page' : 'api',
  sourceSha256: createHash('sha256').update(readFileSync(resolve(root, file))).digest('hex'),
  status: 'ikke-undersokt-som-hel-funksjon',
}));
const serverModules = [];
for (const file of files.filter(file => /\.tsx?$/.test(file) && !file.includes('/generated/') && !file.endsWith('.test.ts'))) {
  const source = readFileSync(resolve(root, file), 'utf8');
  if (!/^[\s\S]{0,300}["']use server["']/.test(source)) continue;
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  if (!ast.statements.some(statement => ts.isExpressionStatement(statement) &&
    ts.isStringLiteral(statement.expression) && statement.expression.text === 'use server')) continue;
  const exports = ast.statements.flatMap(statement => {
    if (!statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) return [];
    if (ts.isFunctionDeclaration(statement) && statement.name) return [statement.name.text];
    if (ts.isVariableStatement(statement)) return statement.declarationList.declarations
      .filter(declaration => ts.isIdentifier(declaration.name)).map(declaration => declaration.name.text);
    return [];
  });
  serverModules.push({ file, runtimeExports: exports, status: 'ikke-undersokt-som-hel-funksjon' });
}
const output = {
  measuredAt: new Date().toISOString(),
  baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  note: 'Arbeidskopi med lokale brukerrettinger. Rute, API og runtime-eksport er inventar, ikke full funksjonsdekning. Brukerreisene er dokumentert separat.',
  counts: {
    pages: pages.filter(page => page.kind === 'page').length,
    apiRoutes: pages.filter(page => page.kind === 'api').length,
    serverModules: serverModules.length,
    serverRuntimeExports: serverModules.reduce((sum, module) => sum + module.runtimeExports.length, 0),
  },
  routes: pages, serverModules,
};
writeFileSync(resolve(root, 'docs/design-audit/funksjonsinventar-2026-10-01.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output.counts));
