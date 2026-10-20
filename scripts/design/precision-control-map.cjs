#!/usr/bin/env node
'use strict';
/** Offline kildekart. Leser AST; evaluerer aldri eksportert JavaScript. Output kan
 * inneholde privat skjermtekst og hele handlere: lagre output utenfor Git/public.
 * Dynamiske instanser er regler, ikke påstander om kjørte brukerreiser. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { createRequire } = require('node:module');
const dependencyRequire = createRequire(path.join(process.env.PRECISION_NODE_MODULES_ROOT || path.resolve(__dirname, '../..'), 'package.json'));
const parser = dependencyRequire('@babel/parser');
const traverse = dependencyRequire('@babel/traverse').default;
const t = dependencyRequire('@babel/types');
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const val = x => ({ kind: 'literal', value: x });
const obj = (entries = []) => ({ kind: 'object', entries: new Map(entries) });
const unknown = (p, chain = []) => ({ kind: 'expression', path: p, chain });
const propName = n => n && (n.name ?? n.value);
const isFn = p => p && (p.isFunctionDeclaration() || p.isFunctionExpression() || p.isArrowFunctionExpression() || p.isObjectMethod());
const scopeKey = p => { const program = p.isProgram() ? p : p.findParent(x => x.isProgram()); return `${program?.node.__precisionUnit || 'unattached'}:${p.scope.block.start}:${p.scope.block.end}`; };
const keyOf = (p, name) => `${scopeKey(p)}:${name}`;
function htmlScripts(text) {
  // HTML extraction only. JavaScript is parsed exclusively with Babel below.
  const scripts = [];
  const tags = /<script\b((?:"[^"]*"|'[^']*'|[^>])*)>([\s\S]*?)<\/script\s*>/gi;
  for (const m of text.matchAll(tags)) {
    const attrs = Object.fromEntries([...m[1].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(a => [a[1].toLowerCase(), a[2] ?? a[3] ?? a[4]]));
    scripts.push({ src: attrs.src, type: attrs.type || '', code: m[2], offset: m.index + m[0].indexOf('>') + 1 });
  }
  return scripts;
}
class Mapper {
  constructor(root, options = {}) {
    this.root = fs.realpathSync(root); this.options = options;
    this.units = new Map(); this.sources = new Map(); this.issues = [];
    this.namespace = 'AKGolfPrecisionAthletics_7d7c29'; this.canonical = new Map();
    const mf = this.safeFile('_ds_manifest.json');
    if (mf && fs.existsSync(mf)) {
      const manifestBytes = fs.readFileSync(mf); this.sources.set('_ds_manifest.json', { file: '_ds_manifest.json', sha256: sha(manifestBytes), bytes: manifestBytes.length });
      const manifest = JSON.parse(manifestBytes.toString('utf8'));
      this.namespace = manifest.namespace || this.namespace;
      for (const c of manifest.components || []) this.canonical.set(c.name, c.sourcePath);
    }
    this.guardAudit = []; this.rows = []; this.componentContracts = []; this.roots = []; this.hosts = []; this.renderedDefinitions=new Map(); this.forms=[];
  }
  issue(code, detail) { this.issues.push({ code, ...detail }); }
  safeFile(rel) {
    const full = path.resolve(this.root, rel);
    if (full !== this.root && !full.startsWith(this.root + path.sep)) throw new Error(`Kilde utenfor eksport: ${rel}`);
    if (fs.existsSync(full) && !fs.realpathSync(full).startsWith(this.root + path.sep)) throw new Error(`Symlink utenfor eksport: ${rel}`);
    return full;
  }
  unit(rel, code, offset = 0) {
    const id = `${rel}:${offset}`;
    if (this.units.has(id)) return this.units.get(id);
    const bytes = fs.readFileSync(this.safeFile(rel)); const fullText = bytes.toString('utf8');
    if (code === undefined) code = fullText;
    this.sources.set(rel, { file: rel, sha256: sha(bytes), bytes: bytes.length });
    let ast;
    try { ast = parser.parse(code, { sourceType: 'unambiguous', plugins: ['jsx'], allowReturnOutsideFunction: true }); }
    catch (e) { this.issue('parse-error', { file: rel, line: e.loc?.line, message: e.message }); return null; }
    const u = { id, rel, code, offset, fullText, ast, paths: new WeakMap(), env: new Map() };
    traverse(ast, { enter(p) { u.paths.set(p.node, p); } });
    this.units.set(id, u); return u;
  }
  source(p) {
    if (!p?.node) return null;
    const u = this.findUnit(p); if (!u) return null;
    const start = p.node.start + u.offset, end = p.node.end + u.offset;
    const line = u.fullText.slice(0, start).split('\n').length;
    const endLine = u.fullText.slice(0, end).split('\n').length;
    return { file: u.rel, offsetUnit: 'utf16-code-unit', sha256: this.sources.get(u.rel).sha256, start, end, line, endLine };
  }
  findUnit(p) { if (!p?.node) return null; return this.units.get((p.isProgram() ? p : p.findParent(x => x.isProgram()))?.node.__precisionUnit) || p.node.__precisionOwner || this.currentUnit; }
  text(p) { const u = this.findUnit(p); return p?.node && u ? u.code.slice(p.node.start, p.node.end) : ''; }
  attach(u) { u.ast.program.__precisionUnit = u.id; }
  binding(p, name, ctx) {
    const b = p.scope.getBinding(name);
    const k = b ? keyOf(b.path, name) : keyOf(p, name);
    if (ctx?.bindings?.has(k)) return ctx.bindings.get(k);
    const u = this.findUnit(p);
    if (u?.env.has(k)) return u.env.get(k);
    if (b?.path.isImportSpecifier() || b?.path.isImportDefaultSpecifier()) {
      const declaration = b.path.parentPath;
      const rel = path.posix.normalize(path.posix.join(path.posix.dirname(this.findUnit(p).rel), declaration.node.source.value));
      if (!rel.startsWith('.') && fs.existsSync(this.safeFile(rel))) {
        const importedUnit = this.unit(rel); if (importedUnit) {
          this.attach(importedUnit);
          const name = b.path.isImportSpecifier() ? propName(b.path.node.imported) : 'default';
          const prog = importedUnit.paths.get(importedUnit.ast.program), exported = prog.scope.getBinding(name);
          if (exported) return this.binding(exported.path, name, ctx);
        }
      }
    }
    if (b?.path.isFunctionDeclaration()) { const v = { kind: 'function', path: b.path, properties: new Map() }; if (u) u.env.set(k, v); return v; }
    if (b?.path.isVariableDeclarator()) {
      const init = b.path.get('init');
      if (init.node && !(ctx?.resolving || new Set()).has(k)) {
        const resolving = new Set(ctx?.resolving || []); resolving.add(k);
        const v = this.evaluate(init, { ...ctx, resolving });
        const id = b.path.get('id');
        if (id.isIdentifier()) return v;
        if (id.isObjectPattern()) {
          for (const pr of id.get('properties')) if (pr.isObjectProperty() && propName(pr.node.value) === name) return this.member(v, propName(pr.node.key), p);
        }
        if (id.isArrayPattern()) {
          const i = id.node.elements.findIndex(x => x?.name === name);
          return this.member(v, i, p);
        }
      }
    }
    if (!b && ctx?.globals?.entries.has(name)) return ctx.globals.entries.get(name);
    return unknown(p);
  }
  member(v, key, p) {
    if (v?.kind === 'expression' && v.collectionValue?.kind === 'array') {
      const choices = v.collectionValue.items.map(item => item?.kind === 'array' ? item.items[Number(key)] : item?.kind === 'object' ? item.entries.get(String(key)) : null);
      if (choices.length && choices.every(c => c?.kind === 'function' || c == null || c?.kind === 'literal')) return { kind: 'function-choice', choices: choices.map(c => c || val(undefined)), path: p, chain: [...(v.chain || []), { type: 'member-access', key }] };
    }
    if (v?.kind === 'function') return v.properties?.get(String(key)) || unknown(p);
    if (v?.kind === 'object') return v.entries.has(String(key)) ? v.entries.get(String(key)) : v.isGlobal || v.unknownSpread ? unknown(p) : val(undefined);
    if (v?.kind === 'array' && Number.isInteger(Number(key))) return v.items[Number(key)] || unknown(p);
    return unknown(p, [...(v?.chain || []), { type: 'member-access', key }]);
  }
  evaluate(p, ctx = {}, depth = 0) {
    if (!p?.node || depth > 18) return unknown(p);
    const e = x => this.evaluate(x, ctx, depth + 1), n = p.node;
    if (t.isLiteral(n) && !t.isRegExpLiteral(n)) return val(n.value);
    if (p.isIdentifier()) {
      if (n.name === 'window' || n.name === 'globalThis') return ctx.globals;
      if (n.name === 'undefined') return val(undefined);
      return this.binding(p, n.name, ctx);
    }
    if (isFn(p)) return { kind: 'function', path: p, closureBindings: new Map(ctx.bindings || []) };
    if (p.isJSXElement() || p.isJSXFragment()) return { kind: 'jsx', path: p };
    if (p.isObjectExpression()) {
      const o = obj();
      for (const pr of p.get('properties')) {
        if (pr.isSpreadElement()) { const v = e(pr.get('argument')); if (v?.kind === 'object') for (const [k, x] of v.entries) o.entries.set(k, x); else o.unknownSpread = this.text(pr); }
        else { const k = pr.node.computed ? e(pr.get('key')) : val(propName(pr.node.key)); if (k?.kind === 'literal') o.entries.set(String(k.value), pr.isObjectMethod() ? { kind: 'function', path: pr } : e(pr.get('value'))); }
      } return o;
    }
    if (p.isArrayExpression()) return { kind: 'array', items: p.get('elements').map(e) };
    if (p.isMemberExpression() || p.isOptionalMemberExpression()) {
      const k = n.computed ? e(p.get('property')) : val(propName(n.property));
      return k?.kind === 'literal' ? this.member(e(p.get('object')), k.value, p) : unknown(p);
    }
    if (p.isBinaryExpression()) {
      const a = e(p.get('left')), b = e(p.get('right'));
      if (a?.kind === 'literal' && b?.kind === 'literal') {
        const ops = { '+': () => a.value + b.value, '-': () => a.value - b.value, '*': () => a.value * b.value, '===': () => a.value === b.value, '!==': () => a.value !== b.value, '<': () => a.value < b.value, '>': () => a.value > b.value, '<=': () => a.value <= b.value, '>=': () => a.value >= b.value };
        if (ops[n.operator]) return val(ops[n.operator]());
      }
    }
    if (p.isTemplateLiteral()) {
      const values = p.get('expressions').map(e); if (values.every(v => v?.kind === 'literal')) return val(n.quasis.map((q, i) => q.value.cooked + (i < values.length ? String(values[i].value) : '')).join(''));
    }
    if (p.isLogicalExpression()) {
      const a = e(p.get('left')), tr = this.truth(a);
      if (n.operator === '||' && tr !== null) return tr ? a : e(p.get('right'));
      if (n.operator === '&&' && tr !== null) return tr ? e(p.get('right')) : a;
      if (n.operator === '??' && a?.kind === 'literal') return a.value == null ? e(p.get('right')) : a;
      return unknown(p);
    }
    if (p.isUnaryExpression() && n.operator === '!') { const tr = this.truth(e(p.get('argument'))); return tr === null ? unknown(p) : val(!tr); }
    if (p.isConditionalExpression()) { const tr = this.truth(e(p.get('test'))); return tr === null ? unknown(p) : e(p.get(tr ? 'consequent' : 'alternate')); }
    if (p.isAssignmentExpression()) { const v = e(p.get('right')); this.assign(p.get('left'), v, ctx); return v; }
    if (p.isCallExpression()) {
      const name = this.text(p.get('callee'));
      if (name === 'React.useContext') {
        const arg = p.get('arguments.0'), binding = arg.node && arg.scope.getBinding(arg.node.name);
        const context = binding && ctx.contexts?.get(keyOf(binding.path, arg.node.name));
        if (context) return context;
      }
      if (name === 'Object.assign') { const args = p.get('arguments').map(e), target = args[0]; if (target?.kind === 'object') { for (const v of args.slice(1)) if (v?.kind === 'object') for (const [k, x] of v.entries) target.entries.set(k, x); return target; } }
      if (name === 'React.useState' || name.endsWith('.useState')) {
        const initial = p.get('arguments.0');
        return { kind: 'array', items: [unknown(p, [{ type: 'state', initial: this.text(initial) }]), { kind: 'setter', name: '', path: p }] };
      }
      const callee = p.get('callee');
      if (callee.isMemberExpression() && ['forEach', 'map'].includes(propName(callee.node.property)) && isFn(p.get('arguments.0'))) {
        const items = e(callee.get('object')), callback = p.get('arguments.0');
        if (items?.kind === 'array' && items.items.length <= 500) {
          for (const [i, item] of items.items.entries()) {
            const inner = { ...ctx, bindings: new Map(ctx.bindings || []) };
            callback.get('params').forEach((q, j) => this.bind(q, [item, val(i), items][j] || unknown(q), inner));
            const body = callback.get('body'); if (body.isBlockStatement()) this.statements(body.get('body'), inner); else this.evaluate(body, inner, depth + 1);
          }
          return unknown(p);
        }
      }
      const fn = e(p.get('callee'));
      if (fn?.kind === 'function') {
        let registers = false;
        fn.path.traverse({ MemberExpression(q) { if (String(propName(q.node.property)).endsWith('_SCREENS')) registers = true; } });
        if (registers && depth < 15) {
          const inner = { ...ctx, bindings: new Map([...(ctx.bindings || []), ...(fn.closureBindings || [])]) };
          fn.path.get('params').forEach((q, i) => this.bind(q, e(p.get('arguments')[i]) || unknown(q), inner));
          const body = fn.path.get('body'); if (body.isBlockStatement()) this.statements(body.get('body'), inner); else this.evaluate(body, inner, depth + 1);
          return val(undefined);
        }
        let returnsMarkup=false;fn.path.traverse({Function(q){q.skip();},JSXElement(){returnsMarkup=true;},JSXFragment(){returnsMarkup=true;}});
        if(returnsMarkup)return {kind:'render-call',path:p,context:ctx};
        const b = fn.path.get('body'); const r = b.isBlockStatement() ? b.get('body').find(x => x.isReturnStatement())?.get('argument') : b;
        // Only lexical factories and namespace/property accessor returns. No
        // arbitrary statement execution or host effects during expression reads.
        if (r && !r.isJSXElement() && !r.isJSXFragment() && !r.isAssignmentExpression() && !r.isUpdateExpression() && !r.isAwaitExpression()) {
          const inner = { ...ctx, bindings: new Map([...(ctx.bindings || []), ...(fn.closureBindings || [])]) };
          fn.path.get('params').forEach((q, i) => this.bind(q, e(p.get('arguments')[i]) || unknown(q), inner));
          if (b.isBlockStatement()) for (const declaration of b.get('body')) if (declaration.isVariableDeclaration()) for (const d of declaration.get('declarations')) this.bind(d.get('id'), this.evaluate(d.get('init'), inner, depth + 1), inner);
          const returned = this.evaluate(r, inner, depth + 1);
          if (returned?.kind === 'function') returned.factoryBindings = fn.path.get('params').map((q, i) => ({ name: this.text(q), value: e(p.get('arguments')[i]) || unknown(q) }));
          return returned;
        }
      }
    }
    return unknown(p);
  }
  truth(v) { return v?.kind === 'literal' ? !!v.value : ['object', 'array', 'function', 'setter', 'jsx'].includes(v?.kind) ? true : null; }
  bind(pattern, v, ctx) {
    if (pattern.isIdentifier()) { const k = keyOf(pattern.scope.getBinding(pattern.node.name)?.path || pattern, pattern.node.name); ctx.bindings.set(k, v); }
    else if (pattern.isAssignmentPattern()) this.bind(pattern.get('left'), v === undefined || (v?.kind === 'literal' && v.value === undefined) ? this.evaluate(pattern.get('right'), ctx) : v, ctx);
    else if (pattern.isObjectPattern()) {
      const used = new Set();
      for (const pr of pattern.get('properties')) {
        if (pr.isRestElement()) { const rest = obj(); if (v?.kind === 'object') for (const [k, x] of v.entries) if (!used.has(k)) rest.entries.set(k, x); this.bind(pr.get('argument'), rest, ctx); }
        else { const k = String(propName(pr.node.key)); used.add(k); this.bind(pr.get('value'), this.member(v, k, pr), ctx); }
      }
    } else if (pattern.isArrayPattern()) for (const [i, el] of pattern.get('elements').entries()) if (el.node) this.bind(el, this.member(v, i, el), ctx);
  }
  assign(p, v, ctx) {
    if (p.isIdentifier()) { this.bind(p, v, ctx); const u = this.findUnit(p); const b = p.scope.getBinding(p.node.name); if (u && b) u.env.set(keyOf(b.path, p.node.name), v); }
    else if (p.isMemberExpression()) {
      const target = this.evaluate(p.get('object'), ctx), k = p.node.computed ? this.evaluate(p.get('property'), ctx) : val(propName(p.node.property));
      if (target?.kind === 'object' && k?.kind === 'literal') target.entries.set(String(k.value), v);
      else if (target?.kind === 'function' && k?.kind === 'literal') { target.properties ||= new Map(); target.properties.set(String(k.value), v); }
    }
  }
  guardEffect(p) {
    const styles = new Set(), evidence = []; let registration = false, appended = false, content = false;
    const memberPath = q => {
      const names = []; while (q.isMemberExpression() && !q.node.computed) { names.unshift(q.node.property.name); q = q.get('object'); }
      return q.isIdentifier() && !q.scope.getBinding(q.node.name) ? [q.node.name, ...names].join('.') : null;
    };
    const body = p.get('consequent');
    body.traverse({ Function(q) { q.skip(); }, MemberExpression(q) { if (String(propName(q.node.property)).endsWith('_SCREENS')) registration = true; }, VariableDeclarator: q => {
      const init = q.get('init');
      if (q.get('id').isIdentifier() && init.isCallExpression() && memberPath(init.get('callee')) === 'document.createElement' && init.node.arguments[0]?.value === 'style') { styles.add(keyOf(q.get('id'), q.node.id.name)); evidence.push(this.source(q)); }
    } });
    const isStyle = q => q.isIdentifier() && styles.has(keyOf(q.scope.getBinding(q.node.name)?.path || q, q.node.name));
    body.traverse({ Function(q) { q.skip(); }, CallExpression: q => {
      if (memberPath(q.get('callee')) === 'document.head.appendChild' && q.get('arguments')[0] && isStyle(q.get('arguments')[0])) { appended = true; evidence.push(this.source(q)); }
    }, AssignmentExpression: q => {
      const left = q.get('left'); if (left.isMemberExpression() && !left.node.computed && left.node.property.name === 'textContent' && isStyle(left.get('object'))) { content = true; evidence.push(this.source(q)); }
    } });
    return { registration, cssInjection: !registration && styles.size > 0 && appended && content, evidence };
  }
  statements(list, ctx, guards = []) {
    for (const p of list) {
      if (p.isReturnStatement()) return true;
      if (p.isExportNamedDeclaration() || p.isExportDefaultDeclaration()) { const d = p.get('declaration'); if (d.node) this.statements([d], ctx, guards); }
      else if (p.isVariableDeclaration()) for (const d of p.get('declarations')) this.bind(d.get('id'), this.evaluate(d.get('init'), ctx), ctx);
      else if (p.isExpressionStatement()) {
        const e = p.get('expression');
        if (e.isCallExpression() && isFn(e.get('callee'))) { const fn = e.get('callee'), inner = { ...ctx, bindings: new Map(ctx.bindings) }; this.statements(fn.get('body.body'), inner, guards); for (const [k, v] of inner.bindings) this.findUnit(fn).env.set(k, v); }
        else this.evaluate(e, ctx);
      } else if (p.isBlockStatement()) { if (this.statements(p.get('body'), ctx, guards)) return true; }
      else if (p.isTryStatement()) this.statements([p.get('block')], ctx, guards);
      else if (p.isIfStatement()) {
        const tr = this.truth(this.evaluate(p.get('test'), ctx));
        const effect = this.guardEffect(p), source = this.source(p.get('test'));
        const classification = effect.cssInjection ? 'conditional-dom-css-injection' : effect.registration ? 'definition-or-registration-guard' : 'conditional-side-effect';
        const guard = { host: ctx.host, source, expression: this.text(p.get('test')), truth: tr, classification, evidence: effect.evidence, selectedBranch: tr === null ? 'not-interpreted' : tr ? 'consequent' : 'alternate', runtimeVerified: false };
        const existing = this.guardAudit.find(g => g.host === guard.host && g.source?.sha256 === source?.sha256 && g.source?.start === source?.start && g.truth === tr && g.classification === classification);
        const occurrence = { scriptOrder: ctx.scriptOrder, phase: ctx.executionPhase, moduleOrder: ctx.moduleOrder };
        if (existing) existing.occurrences.push(occurrence); else this.guardAudit.push({ ...guard, occurrences: [occurrence] });
        if (tr !== null) { const b = p.get(tr ? 'consequent' : 'alternate'); if (b.node && this.statements([b], ctx, guards)) return true; }
        else if (!effect.cssInjection) {
          // Known CSS guards still have unknown runtime truth; they cannot prove definitions.
          this.issue(effect.registration ? 'unknown-registration-guard' : 'unknown-side-effect-guard', { host: ctx.host, source, expression: this.text(p.get('test')), branchExecuted: false });
        }
      }
    } return false;
  }
  runUnit(u, ctx) {
    if (!u) return;
    this.attach(u); this.currentUnit = u;
    this.statements(u.paths.get(u.ast.program).get('body'), ctx);
    for (const [k, v] of ctx.bindings) if (k.startsWith(`${scopeKey(u.paths.get(u.ast.program))}:`)) u.env.set(k, v);
  }
  bundle(u, ctx) {
    const metadataComment = u.ast.comments.find(c => c.value.trim().startsWith('@ds-bundle:'));
    let metadata = {};
    try { metadata = JSON.parse(metadataComment.value.trim().slice('@ds-bundle:'.length)); } catch { this.issue('bundle-metadata-invalid', { file: u.rel }); }
    const paths = []; const modules = [];
    traverse(u.ast, { TryStatement: p => {
      const catcher = p.get('handler'); if (!catcher.node) return;
      let rel;
      catcher.traverse({ ObjectProperty(q) { if (propName(q.node.key) === 'path' && q.get('value').isStringLiteral()) rel = q.node.value.value; } });
      if (rel && !paths.includes(rel)) paths.push(rel);
    } });
    ctx.globals.entries.set(this.namespace, obj());
    const canonicalExports = new Map();
    for (const rel of paths) {
      const file = this.safeFile(rel);
      if (!fs.existsSync(file)) { this.issue('bundle-source-missing', { host: ctx.host, file: rel, bundle: this.source(u.paths.get(u.ast.program)) }); continue; }
      const source = this.unit(rel); if (!source) continue;
      const hashes = metadata.sourceHashes || metadata.hashes || metadata.sources || {};
      const expected = hashes[rel];
      modules.push({ order: modules.length, file: rel, sha256: this.sources.get(rel).sha256, bundleExpectedPrefix: expected || null, sourceMatchesBundlePrefix: expected ? this.sources.get(rel).sha256.startsWith(expected) : null, historicalPath: ['arkiv/', '_kilde/', '_utenfor/'].some(prefix => rel.startsWith(prefix)) });
      if (expected && !this.sources.get(rel).sha256.startsWith(expected)) this.issue('bundle-source-sha-mismatch', { host: ctx.host, file: rel, expected, actual: this.sources.get(rel).sha256 });
      const inner = { ...ctx, bindings: new Map(), executionPhase: 'bundle-source-module', moduleOrder: modules.length }; this.runUnit(source, inner);
      // Manifest is the bundle's exposed export list. Match lexical export, not a
      // same-named component elsewhere in the project.
      for (const [name, canonicalRel] of this.canonical) if (canonicalRel === rel) {
        const prog = source.paths.get(source.ast.program); const b = prog.scope.getBinding(name);
        if (b) canonicalExports.set(name, this.binding(b.path, name, inner));
        else this.issue('canonical-export-missing', { host: ctx.host, name, file: rel });
      }
      for (const [k, v] of inner.bindings) source.env.set(k, v);
    }
    for (const [name, value] of canonicalExports) ctx.globals.entries.get(this.namespace).entries.set(name, value);
    ctx.bundle = { file: u.rel, sha256: this.sources.get(u.rel).sha256, sourceModules: paths.length, modules, compiledModulesReadFromAst: true, sourceExecution: false };
  }
  serialize(v, seen = new Set()) {
    if (!v) return null;
    if (v.kind === 'literal') return { kind: 'literal', value: v.value === undefined ? null : v.value, undefined: v.value === undefined || undefined };
    if (v.kind === 'function-choice') return { kind: 'function-choice', source: this.source(v.path), chain: v.chain, choices: v.choices.map(c => this.serialize(c)) };
    if (v.kind === 'function') return { kind: 'function', expression: this.text(v.path), source: this.source(v.path) };
    if (v.kind === 'expression') return { kind: 'expression', expression: this.text(v.path), source: this.source(v.path), chain: v.chain || [] };
    if (v.kind === 'object') return { kind: 'object', keys: [...v.entries.keys()], unknownSpread: v.unknownSpread };
    if (v.kind === 'array') return { kind: 'array', length: v.items.length };
    return { kind: v.kind, source: this.source(v.path) };
  }
  references(p, ctx) {
    const refs = new Map();
    const add = q => { if (!q.isReferencedIdentifier()) return; const n = q.node.name; const b = q.scope.getBinding(n); if (b && b.path.findParent(x => x === p)) return; const v = this.binding(q, n, ctx); refs.set(b ? keyOf(b.path, n) : n, { name: n, definition: b ? this.source(b.path) : null, value: this.serialize(v) }); };
    if (p.isIdentifier()) add(p);
    p.traverse({ Identifier: add }); return [...refs.values()];
  }
  props(element, ctx) {
    const out = obj();
    for (const a of element.get('openingElement.attributes')) {
      if (a.isJSXSpreadAttribute()) { const v = this.evaluate(a.get('argument'), ctx); if (v?.kind === 'object') for (const [k, x] of v.entries) out.entries.set(k, x); else out.unknownSpread = this.text(a.get('argument')); }
      else if (a.isJSXAttribute()) { const n = propName(a.node.name), v = a.get('value'); out.entries.set(n, !v.node ? val(true) : this.evaluate(v.isJSXExpressionContainer() ? v.get('expression') : v, ctx)); }
    }
    const children = element.get('children').filter(x => !(x.isJSXText() && !x.node.value.trim()));
    out.entries.set('children', { kind: 'children', paths: children, context: ctx }); return out;
  }
  jsxName(p, ctx) {
    if (p.isJSXIdentifier()) return this.binding(p, p.node.name, ctx);
    if (p.isJSXMemberExpression()) { const left = p.get('object'); const v = left.isJSXIdentifier() && left.node.name === 'window' ? ctx.globals : this.jsxName(left, ctx); return this.member(v, propName(p.node.property), p); }
    return unknown(p);
  }
  callMeaning(callee, fn, ctx, builtin) {
    if (fn?.kind === 'setter') return { category: 'state-mutation', evidence: this.source(fn.path), certainty: 'lexical-react-useState-binding', runtimeVerified: false };
    if (fn?.kind === 'function' && ctx.navigationNodes?.has(fn.path.node)) return { category: 'navigation', evidence: this.source(fn.path), certainty: 'host-function-identity', runtimeVerified: false };
    if (builtin) return { category: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'].includes(callee.node.name) ? 'deferred-browser-action' : 'pure-data-operation', evidence: this.source(callee), certainty: 'unshadowed-standard-global', runtimeVerified: false };
    if (fn?.kind === 'function-choice') return { category: 'selected-item-action', evidence: this.source(fn.path), certainty: 'closed-source-literal-options', runtimeVerified: false };
    if (fn?.kind === 'function') {
      const writes = [], calls = []; fn.path.traverse({ Function(p) { p.skip(); }, AssignmentExpression: p => { writes.push(this.source(p)); }, UpdateExpression: p => { writes.push(this.source(p)); }, CallExpression: p => { calls.push(this.source(p)); } });
      return { category: writes.length ? 'bound-helper-with-mutation' : calls.length ? 'bound-helper-calls-source' : 'pure-lexical-data-helper', evidence: this.source(fn.path), writes, dependentCalls: calls, certainty: 'own-body-ast', runtimeVerified: false };
    }
    if (callee.isMemberExpression()) {
      const chain = []; let base = callee;
      while (base.isMemberExpression() && (!base.node.computed || base.get('property').isStringLiteral())) { chain.unshift(base.node.computed ? base.node.property.value : base.node.property.name); base = base.get('object'); }
      const root = base.isIdentifier() && !base.scope.getBinding(base.node.name) ? base.node.name : null;
      const global = root ? [root, ...chain].join('.') : null;
      const browserActions = new Set(['window.dispatchEvent', 'window.parent.postMessage', 'window.addEventListener', 'window.removeEventListener', 'document.addEventListener', 'document.removeEventListener', 'localStorage.setItem', 'localStorage.removeItem', 'sessionStorage.setItem', 'sessionStorage.removeItem', 'window.localStorage.setItem', 'window.sessionStorage.setItem', 'document.body.appendChild', 'URL.createObjectURL', 'URL.revokeObjectURL']);
      const browserReads = new Set(['document.getElementById', 'document.querySelector', 'document.querySelectorAll', 'document.elementFromPoint', 'document.createElement', 'window.getComputedStyle', 'localStorage.getItem', 'sessionStorage.getItem', 'window.localStorage.getItem', 'window.sessionStorage.getItem']);
      if (browserActions.has(global) || browserReads.has(global)) return { category: browserActions.has(global) ? 'browser-action' : 'browser-data-read', evidence: this.source(callee), api: global, certainty: 'unshadowed-global-member-chain', runtimeVerified: false };
      const property = callee.node.computed ? callee.get('property').isStringLiteral() ? callee.node.property.value : null : callee.node.property.name;
      if (root === 'Math' && chain.length === 1 && ['abs','ceil','floor','round','max','min','pow','sqrt','trunc','sign','hypot'].includes(property)) return { category: 'pure-data-operation', api: global, evidence: this.source(callee), certainty: 'unshadowed-math-intrinsic', runtimeVerified: false };
      if (root === 'Array' && chain.length === 1 && ['from','isArray'].includes(property)) return { category: 'pure-data-operation', api: global, evidence: this.source(callee), certainty: 'unshadowed-array-intrinsic', runtimeVerified: false };
      if (root === 'Date' && chain.length === 1 && ['now','parse','UTC'].includes(property)) return { category: property === 'now' ? 'time-data-read' : 'pure-data-operation', api: global, evidence: this.source(callee), certainty: 'unshadowed-date-intrinsic', runtimeVerified: false };
      if (root === 'Object' && chain.length === 1 && ['assign','defineProperty'].includes(property)) return { category: 'object-mutation', api: global, evidence: this.source(callee), certainty: 'unshadowed-object-intrinsic', runtimeVerified: false };
      if (root === 'Object' && chain.length === 1 && ['keys','values','entries','fromEntries'].includes(property)) return { category: 'pure-data-operation', api: global, evidence: this.source(callee), certainty: 'unshadowed-object-intrinsic', runtimeVerified: false };
      if (root === 'JSON' && chain.length === 1 && ['parse','stringify'].includes(property)) return { category: 'pure-data-operation', api: global, evidence: this.source(callee), certainty: 'unshadowed-json-intrinsic', runtimeVerified: false };
      const receiver = this.evaluate(callee.get('object'), ctx);
      if (['preventDefault','stopPropagation'].includes(property) && receiver?.chain?.some(c => c.type === 'event-or-argument') && ctx.eventName) return { category: 'browser-event-action', evidence: this.source(callee), eventProperty: ctx.eventName, certainty: 'event-parameter-method-rule', runtimeVerified: false };
      const pure = new Set(['map','filter','forEach','flatMap','reduce','find','findIndex','some','every','includes','indexOf','slice','concat','join','split','replace','replaceAll','trim','toUpperCase','toLowerCase','startsWith','endsWith','padStart','padEnd','substring','toFixed','toLocaleString','getDate','getDay','getMonth','getFullYear','getTime','getHours','getMinutes','toTimeString','test']);
      const mutators = new Set(['push','pop','shift','unshift','splice','sort','reverse','set','add','delete','clear']);
      if (pure.has(property) || mutators.has(property)) return { category: pure.has(property) ? 'data-method-rule' : 'receiver-mutation-rule', property, receiver: this.serialize(receiver), evidence: this.source(callee), certainty: 'standard-method-contract-receiver-type-requires-review', runtimeVerified: false };
    }
    return { category: 'unclassified-call-rule', evidence: this.source(callee), value: this.serialize(fn), certainty: 'requires-semantic-review', runtimeVerified: false };
  }
  handler(pValue, ctx) {
    const result = { original: this.serialize(pValue), bindings: [], calls: [], assignments: [], returns: [], deferredCallbacks: [], unresolved: [] };
    const expressionRule = (p, local) => ({ expression: this.text(p), source: this.source(p), value: this.serialize(this.evaluate(p,local)), references: this.references(p,local),
      objectFields: p.isObjectExpression() ? p.get('properties').map(property => property.isSpreadElement() ? { spread: this.text(property.get('argument')), source: this.source(property), references: this.references(property,local) } : { key: property.node.computed ? this.text(property.get('key')) : propName(property.node.key), computed: Boolean(property.node.computed), expression: this.text(property.get('value')), value: this.serialize(this.evaluate(property.get('value'),local)), source: this.source(property), references: this.references(property,local) }) : undefined });
    const enclosingConditions = (q, boundary) => {
      const conditions=[];
      const terminal = p => p?.node&&(p.isReturnStatement()||p.isThrowStatement()||p.isBlockStatement()&&terminal(p.get('body').at(-1))||p.isIfStatement()&&terminal(p.get('consequent'))&&terminal(p.get('alternate')));
      for(let a=q.parentPath;a&&a!==boundary;a=a.parentPath) {
        if(a.isIfStatement()||a.isConditionalExpression()) { const inTrue=q.node.start>=a.node.consequent.start&&q.node.end<=a.node.consequent.end, inFalse=a.node.alternate&&q.node.start>=a.node.alternate.start&&q.node.end<=a.node.alternate.end; if(inTrue||inFalse) conditions.push({ expression: inTrue?this.text(a.get('test')):`!(${this.text(a.get('test'))})`, source:this.source(a.get('test')) }); }
        else if(a.isLogicalExpression()&&q.node.start>=a.node.right.start) conditions.push({expression:a.node.operator==='&&'?this.text(a.get('left')):`!(${this.text(a.get('left'))})`,source:this.source(a.get('left'))});
        if(a.isBlockStatement())for(const previous of a.get('body').filter(s=>s.node.end<=q.node.start)) {
          if(previous.isIfStatement()) {const yes=terminal(previous.get('consequent')),no=terminal(previous.get('alternate'));if(yes!==no)conditions.push({expression:yes?`!(${this.text(previous.get('test'))})`:this.text(previous.get('test')),source:this.source(previous.get('test')),reason:'preceding-terminal-branch-must-not-execute'});else if(yes&&no)conditions.push({expression:'false',source:this.source(previous),reason:'preceding-statement-always-terminates'});}
          else if(terminal(previous))conditions.push({expression:'false',source:this.source(previous),reason:'preceding-statement-always-terminates'});
        }
      }
      return conditions;
    };
    const visit = (v, args, chain, seen = new Set()) => {
      if (v?.kind === 'function-choice') {
        v.choices.forEach((choice, index) => visit(choice, args, [...chain, { condition: 'selected literal collection item callback', index, rule: v.chain }], seen)); return;
      }
      if (v?.kind === 'expression' && v.path?.isConditionalExpression()) {
        const test = v.path.get('test'), tr = this.truth(this.evaluate(test, ctx));
        for (const arm of tr === null ? ['consequent', 'alternate'] : [tr ? 'consequent' : 'alternate']) visit(this.evaluate(v.path.get(arm), ctx), args, [...chain, { condition: arm === 'consequent' ? this.text(test) : `!(${this.text(test)})`, source: this.source(test) }], seen);
        return;
      }
      if (v?.kind === 'expression' && v.chain?.some(c => c.type === 'host-navigation')) {
        result.calls.push({ kind: 'navigation', callee: this.text(v.path), arguments: args.map(a => this.serialize(a)), contract: v.chain }); return;
      }
      if (v?.kind === 'setter') { if (!chain.length) result.calls.push({ kind: 'state-update', meaning: { category: 'state-mutation', evidence: this.source(v.path), certainty: 'direct-react-setter-callback', runtimeVerified: false }, expression: this.text(v.path), arguments: args.map(a => this.serialize(a)) }); return; }
      if (v?.kind === 'literal' && (v.value === undefined || v.value === null || v.value === false)) { result.calls.push({ kind: 'unbound-optional-callback', value: this.serialize(v) }); return; }
      if (v?.kind !== 'function') { result.unresolved.push({ reason: 'handler-binding-not-a-function', value: this.serialize(v), chain }); return; }
      const token = `${this.findUnit(v.path)?.id}:${v.path.node.start}`;
      if (seen.has(token)) { result.unresolved.push({ reason: 'handler-cycle', source: this.source(v.path) }); return; }
      seen = new Set(seen); seen.add(token);
      const local = { ...ctx, bindings: new Map([...ctx.bindings, ...(v.closureBindings || [])]) };
      v.path.get('params').forEach((p, i) => this.bind(p, args[i] || unknown(p, [{ type: 'event-or-argument', index: i }]), local));
      result.bindings.push({ source: this.source(v.path), fullHandler: this.text(v.path), parameters: v.path.node.params.map(x => this.text(this.findUnit(v.path).paths.get(x))), arguments: args.map(a => this.serialize(a)), references: this.references(v.path, local), chain });
      v.path.traverse({
        Function(q) { if (q !== v.path) q.skip(); },
        AssignmentExpression: q => {
          const target=q.get('left');
          result.assignments.push({ expression:this.text(q),source:this.source(q),references:this.references(q,local),conditions:enclosingConditions(q,v.path),operator:q.node.operator,target:expressionRule(target,local),valueRule:expressionRule(q.get('right'),local),
            objectIndexRule: target.isMemberExpression()&&target.node.computed ? expressionRule(target.get('property'),local) : null });
        },
        ReturnStatement: q => { const arg=q.get('argument'); result.returns.push({source:this.source(q),expression:this.text(q),valueRule:arg.node?expressionRule(arg,local):null,conditions:enclosingConditions(q,v.path),execution:'not-asserted'}); },
        CallExpression: q => {
          const conditions = []; let reachable = true;
          for (let a = q.parentPath; a && a !== v.path; a = a.parentPath) {
            if (a.isConditionalExpression() || a.isIfStatement()) {
              const test = a.get('test'), tr = this.truth(this.evaluate(test, local)), inTrue = q.node.start >= a.node.consequent.start && q.node.end <= a.node.consequent.end, inFalse = a.node.alternate && q.node.start >= a.node.alternate.start && q.node.end <= a.node.alternate.end;
              if (!inTrue && !inFalse) continue;
              if (tr !== null && tr !== inTrue) { reachable = false; break; }
              conditions.push(inTrue ? this.text(test) : `!(${this.text(test)})`);
            } else if (a.isLogicalExpression() && q.node.start >= a.node.right.start) {
              const tr = this.truth(this.evaluate(a.get('left'), local));
              if ((a.node.operator === '&&' && tr === false) || (a.node.operator === '||' && tr === true)) { reachable = false; break; }
              conditions.push(a.node.operator === '&&' ? this.text(a.get('left')) : `!(${this.text(a.get('left'))})`);
            }
          }
          if (!reachable) return;
          const callee = q.get('callee'), name = this.text(callee), argv = q.get('arguments').map(a => this.evaluate(a, local));
          const fn = this.evaluate(callee, local);
          const builtin = callee.isIdentifier() && !callee.scope.getBinding(name) && !local.globals.entries.has(name) && ['String', 'Number', 'Boolean', 'parseInt', 'parseFloat', 'isFinite', 'isNaN', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'].includes(name);
          for (const [index, arg] of q.get('arguments').entries()) if (isFn(arg)) result.deferredCallbacks.push({ parentCall: name, argumentIndex: index, source: this.source(arg), fullHandler: this.text(arg), references: this.references(arg, local), execution: 'not-asserted' });
          const conditionRules=enclosingConditions(q,v.path);
          if(conditionRules.some(c=>c.expression==='false'&&c.reason))return;
          result.calls.push({ meaning: this.callMeaning(callee, fn, local, builtin), conditions:[...new Set([...conditions,...conditionRules.map(c=>c.expression)])], conditionRules, argumentRules:q.get('arguments').map(a=>expressionRule(a,local)), resolution: builtin ? { kind: 'standard-global', callee: name } : fn?.kind === 'function' ? { kind: 'lexically-bound-function', definition: this.source(fn.path) } : fn?.kind === 'setter' ? { kind: 'react-state-setter', definition: this.source(fn.path) } : fn?.kind === 'function-choice' ? { kind: 'closed-literal-callback-choice', definition: this.source(fn.path) } : { kind: 'expression-rule-requires-semantic-review', callee: name, value: this.serialize(fn) }, kind: builtin ? 'standard-js-or-browser-api' : fn?.kind === 'setter' ? 'state-update' : fn?.kind === 'function' && local.navigationNodes?.has(fn.path.node) ? 'navigation' : 'call', callee: name, arguments: argv.map(a => this.serialize(a)), source: this.source(q), references: this.references(q, local), effect: fn?.kind === 'setter' ? { operation: 'state-set', setter: name, value: this.serialize(argv[0]), stateDeclaration: this.source(fn?.path) } : null });
          if (fn?.kind === 'function' || fn?.kind === 'setter' || fn?.kind === 'function-choice' || fn?.chain?.some(c => c.type === 'host-navigation')) visit(fn, argv, [...chain, { callee: name, source: this.source(q) }], seen);
          else if (callee.isIdentifier() && !builtin) result.unresolved.push({ reason: 'called-function-unresolved', callee: name, source: this.source(q) });
        }
      });
    };
    visit(pValue, [], []);
    result.contract = { eventProperty:ctx.eventName || null,
      navigationRuleIndices:result.calls.flatMap((call,index)=>call.kind==='navigation'?[index]:[]),
      stateRuleIndices:result.calls.flatMap((call,index)=>call.effect||call.kind==='state-update'?[index]:[]),
      objectIndexAssignmentIndices:result.assignments.flatMap((assignment,index)=>assignment.objectIndexRule?[index]:[]),
      payloadAssignmentIndices:result.assignments.flatMap((assignment,index)=>assignment.valueRule?.objectFields?[index]:[]),
      returnRuleIndices:result.returns.map((_,index)=>index),
      closeOrCancelCallback: ['onClose','onCancel','onDismiss'].includes(ctx.eventName) ? {property:ctx.eventName,evidence:'explicit-component-event-property',bindingIndices:result.bindings.map((_,index)=>index)} : null,
      prerequisites:{controlConditions:ctx.conditions||[],iterationRules:ctx.iterations||[]},
      semantics:'Exact source expressions with lexical references. Dynamic IDs are selection rules; execution, persistence and route rendering remain unverified.' };
    return result;
  }
  row(element, props, ctx, tag) {
    const events = [...props.entries].filter(([k, v]) => /^on[A-Z]/.test(k) && !(v?.kind === 'literal' && (v.value == null || v.value === false)));
    if (!events.length && !['button', 'input', 'select', 'textarea', 'a', 'summary'].includes(tag) && !['button', 'link', 'tab', 'checkbox', 'radio', 'switch', 'menuitem'].includes(props.entries.get('role')?.value)) return;
    const source = this.source(element); const site = ctx.instance.concat(`${tag}@${source.file}:${source.start}`).join('/');
    const label = props.entries.get('aria-label') || props.entries.get('title');
    const data = {
      id: sha(`${ctx.host}|${ctx.root}|${site}|${JSON.stringify(ctx.conditions)}|${JSON.stringify(ctx.iterations.map(i => i.source))}`).slice(0, 24), host: ctx.host, root: ctx.root,
      instancePath: site, tag, role: this.serialize(props.entries.get('role')), propNames: [...props.entries.keys()], source, componentChain: ctx.componentChain,
      conditions: ctx.conditions, iterationRules: ctx.iterations,
      label: label ? this.serialize(label) : { kind: 'source-children', expression: element.get('children').map(x => this.text(x)).join('') },
      disabled: this.serialize(props.entries.get('disabled')), readOnly: this.serialize(props.entries.get('readOnly')), inputType: this.serialize(props.entries.get('type')), href: this.serialize(props.entries.get('href')),
      activity: this.nativeActivity(tag,props,ctx,source,this.propertyRule(element,'disabled',props,ctx)), formNoValidate:this.serialize(props.entries.get('formNoValidate')),
      formOverrides:Object.fromEntries(['formAction','formMethod','formTarget','formEncType','formNoValidate'].map(k=>[k,this.propertyRule(element,k,props,ctx)])),
      formAssociation: ['button','input','select','textarea'].includes(tag) ? { explicit: this.serialize(props.entries.get('form')),explicitRule:this.propertyRule(element,'form',props,ctx), ancestorFormRuleId:ctx.nativeFormOwner?.id || null, source } : null,
      callbacks: Object.fromEntries(events.map(([k, v]) => [k, this.handler(v, { ...ctx, eventName: k })])),
      ancestorActionCandidates: ctx.ancestorActionCandidates || [], callbackProvenance: ctx.callbackProvenance || [], componentCallSites: ctx.componentCallSites || [],
      unknownPropSpread: props.unknownSpread || null,
      coverage: 'static-instance-rule', runtimeVerified: false,
    };
    // Final classification follows form-owner resolution after all sibling JSX
    // instances are expanded. Explicit form IDs may refer to a later form.
    data.actionClassification = data.activity.status==='inactive' ? 'disabled-no-action' : events.length ? 'bound-callback' : 'pending-native-classification';
    if (/^[a-z]/.test(tag) && !tag.includes('.')) this.rows.push(data); else this.componentContracts.push(data);
    return data;
  }
  propertyRule(element,name,props,ctx) {
    const attribute=element.get('openingElement.attributes').find(a=>a.isJSXAttribute()&&propName(a.node.name)===name);
    return {value:this.serialize(props.entries.get(name)),source:attribute?this.source(attribute):null,expression:attribute?this.text(attribute):null,references:attribute?this.references(attribute,ctx):[],unknownSpread:props.unknownSpread||null};
  }
  nativeActivity(tag,props,ctx,source,ownRule) {
    if(!['button','input','select','textarea','option','optgroup'].includes(tag))return {status:'active',nativeDisabledApplies:false,predicates:[]};
    const predicates=[{kind:'own-disabled',source,value:this.serialize(props.entries.get('disabled')),rule:ownRule,truth:this.truth(props.entries.get('disabled'))??(props.entries.has('disabled')?null:false)},
      ...(ctx.disabledFieldsets||[]).map(f=>({kind:'inherited-fieldset-disabled',source:f.source,fieldsetRuleId:f.id,value:f.disabled,rule:f.disabledRule,truth:f.truth}))];
    return {status:predicates.some(p=>p.truth===true)?'inactive':predicates.some(p=>p.truth===null)?'conditional':'active',nativeDisabledApplies:true,predicates,fieldsetLegendException:ctx.fieldsetLegendException||null,fieldsetLegendResolution:ctx.fieldsetLegendResolution||null,runtimeVerified:false};
  }
  renderNative(element,props,ctx,tag) {
    const source=this.source(element),site=ctx.instance.concat(`${tag}@${source.file}:${source.start}`).join('/');
    const id=sha(`${ctx.host}|${ctx.root}|${site}|${JSON.stringify(ctx.conditions)}|${JSON.stringify(ctx.iterations.map(i=>i.source))}`).slice(0,24);
    let childrenContext=ctx;
    if(tag==='legend'&&ctx.domParentTag==='fieldset'&&ctx.disabledFieldsets?.some(f=>f.id===ctx.domParentFieldsetId&&f.firstLegendUncertain)) {
      childrenContext={...ctx,disabledFieldsets:ctx.disabledFieldsets.map(f=>f.id===ctx.domParentFieldsetId?{...f,truth:null}:f),fieldsetLegendResolution:'component-or-conditional-first-legend-order-unresolved'};
    }
    if(tag==='form') {
      const form={id,host:ctx.host,root:ctx.root,source,instancePath:site,htmlId:this.serialize(props.entries.get('id')),idRule:this.propertyRule(element,'id',props,ctx),conditions:ctx.conditions,iterationRules:ctx.iterations,
        action:this.serialize(props.entries.get('action')),method:this.serialize(props.entries.get('method')),target:this.serialize(props.entries.get('target')),encType:this.serialize(props.entries.get('encType')),noValidate:this.serialize(props.entries.get('noValidate')),
        attributeRules:Object.fromEntries(['id','action','method','target','encType','noValidate'].map(k=>[k,this.propertyRule(element,k,props,ctx)])),callbacks:{},runtimeVerified:false};
      if(ctx.nativeFormOwner)this.issue('nested-form-source-requires-dom-review',{host:ctx.host,root:ctx.root,source,ancestorFormRuleId:ctx.nativeFormOwner.id});
      this.forms.push(form);childrenContext={...ctx,nativeFormOwner:form};
    }
    const own=this.row(element,props,ctx,tag);
    if(tag==='form') {const form=childrenContext.nativeFormOwner;form.callbackControlId=own?.id||null;form.callbacks=Object.fromEntries(Object.entries(own?.callbacks||{}).filter(([k])=>['onSubmit','onReset'].includes(k)));}
    if(tag==='fieldset') {
      const disabled=props.entries.get('disabled');
      childrenContext={...childrenContext,disabledFieldsets:[...(ctx.disabledFieldsets||[]),{id,source,disabled:this.serialize(disabled),disabledRule:this.propertyRule(element,'disabled',props,ctx),truth:this.truth(disabled)??(props.entries.has('disabled')?null:false)}]};
    }
    const actions=own&&(own.callbacks.onClick||own.callbacks.onPointerDown||own.callbacks.onKeyDown)?[{id:own.id,source:own.source,callbacks:Object.keys(own.callbacks)}]:[];
    // Native first-legend exception is provable for a direct literal JSX child.
    // Component/conditional-produced legends require a DOM check, recorded below.
    const children=element.get('children'),firstLegend=tag==='fieldset'?children.find(c=>c.isJSXElement()&&c.get('openingElement.name').isJSXIdentifier({name:'legend'})):null;
    const preceding=firstLegend?children.slice(0,children.indexOf(firstLegend)):children;
    const firstLegendUncertain=tag==='fieldset'&&preceding.some(c=>c.isJSXExpressionContainer()||c.isJSXFragment()||c.isJSXElement()&&!(c.get('openingElement.name').isJSXIdentifier()&&/^[a-z]/.test(c.node.openingElement.name.name)));
    if(firstLegendUncertain)childrenContext={...childrenContext,disabledFieldsets:childrenContext.disabledFieldsets.map(f=>f.id===id?{...f,firstLegendUncertain:true}:f),fieldsetLegendResolution:'component-or-conditional-first-legend-order-unresolved'};
    for(const child of children) {
      let childContext={...childrenContext,domParentTag:tag,domParentFieldsetId:tag==='fieldset'?id:null,ancestorActionCandidates:[...(ctx.ancestorActionCandidates||[]),...actions]};
      if(child===firstLegend)childContext=firstLegendUncertain?{...childContext,disabledFieldsets:childContext.disabledFieldsets.map(f=>f.id===id?{...f,truth:null}:f)}:{...childContext,disabledFieldsets:childContext.disabledFieldsets.filter(f=>f.id!==id),fieldsetLegendException:{fieldsetRuleId:id,fieldsetSource:source,source:this.source(child)}};
      this.render(child,childContext);
    }
  }
  finalizeNativeRules() {
    for(const c of this.rows) {
      const assoc=c.formAssociation,explicit=assoc?.explicit;
      if(assoc) {
        const present=explicit&&!(explicit.kind==='literal'&&(explicit.value==null||explicit.undefined));
        let candidates=[];
        if(present&&explicit.kind==='literal'&&['string','number'].includes(typeof explicit.value)&&String(explicit.value).length)candidates=this.forms.filter(f=>f.host===c.host&&(f.root===c.root||f.root==='@shell')&&f.htmlId?.kind==='literal'&&['string','number'].includes(typeof f.htmlId.value)&&String(f.htmlId.value)===String(explicit.value));
        else if(!present&&assoc.ancestorFormRuleId)candidates=this.forms.filter(f=>f.id===assoc.ancestorFormRuleId);
        assoc.ownerCandidates=candidates.map(f=>({formRuleId:f.id,source:f.source,conditions:f.conditions,iterationRules:f.iterationRules}));
        assoc.status=present&&candidates.some(f=>f.iterationRules.length)?'repeated-literal-form-id-unresolved':candidates.length===1?'source-owner-linked':candidates.length>1?'ambiguous-source-form-id':present&&explicit.kind!=='literal'?'dynamic-form-id-unresolved':present?'explicit-form-id-not-found':'no-form-owner';
        assoc.ownerKind=present?'explicit-form-attribute':'native-ancestor';
        const type=c.inputType,knownType=type?.kind==='literal'?(type.value==null||type.undefined?null:String(type.value).toLowerCase()):type?'unknown':null;
        const nativeInputTypes=['button','checkbox','color','date','datetime-local','email','file','hidden','image','month','number','password','radio','range','reset','search','submit','tel','text','time','url','week'];
        const effective=c.tag==='button'?(knownType==='unknown'?'unknown':['button','reset','submit'].includes(knownType)?knownType:'submit'):c.tag==='input'?(knownType==='unknown'?'unknown':nativeInputTypes.includes(knownType)?knownType:'text'):null;
        assoc.effectiveType=effective;assoc.typeSource=c.inputType;assoc.defaultTypeApplied=c.tag==='button'&&effective==='submit'&&knownType!=='submit';
        if(['submit','reset','image'].includes(effective))c.formAction={operation:effective==='reset'?'reset':'submit',eventProperty:effective==='reset'?'onReset':'onSubmit',ownerStatus:assoc.status,
          targets:candidates.map(f=>({formRuleId:f.id,callbackControlId:f.callbackControlId,eventProperty:effective==='reset'?'onReset':'onSubmit',handlerPresent:Boolean(f.callbacks[effective==='reset'?'onReset':'onSubmit']),source:f.source,conditions:f.conditions})),
          formNoValidate:c.formNoValidate,submitterOverrides:c.formOverrides,ownerNoValidate:candidates.map(f=>({formRuleId:f.id,noValidate:f.noValidate})),prerequisites:['Control is enabled.','The associated form exists in the rendered document under its recorded conditions.','Activation is not cancelled.','For submission: applicable native constraint validation permits submission unless native noValidate/formNoValidate bypasses it.'],runtimeVerified:false};
      }
      if(c.activity.status==='inactive'){c.actionClassification='disabled-no-action';continue;}
      if(assoc&&['ambiguous-source-form-id','dynamic-form-id-unresolved','explicit-form-id-not-found','repeated-literal-form-id-unresolved'].includes(assoc.status))this.issue('form-owner-unresolved',{host:c.host,root:c.root,id:c.id,source:c.source,status:assoc.status,explicit:assoc.explicit,candidates:assoc.ownerCandidates});
      if(Object.keys(c.callbacks).length)c.actionClassification='bound-callback';
      else if(c.formAction&&assoc.status==='source-owner-linked')c.actionClassification='native-form-action';
      else if(c.formAction&&assoc.status!=='no-form-owner')c.actionClassification='form-owner-unresolved';
      else if(c.readOnly?.value===true&&(c.tag==='textarea'||c.tag==='input'&&['text','search','url','tel','email','password','date','month','week','time','datetime-local','number'].includes(assoc.effectiveType)))c.actionClassification='read-only-native-control';
      else if(c.href)c.actionClassification='native-href';
      else if(['input','select','textarea'].includes(c.tag)&&!c.formAction)c.actionClassification='native-input-no-app-callback';
      else c.actionClassification='no-bound-action';
      if(c.tag==='button'&&assoc.effectiveType==='unknown'&&!Object.keys(c.callbacks).length){c.actionClassification='native-button-type-unresolved';this.issue('native-button-type-unresolved',{host:c.host,root:c.root,id:c.id,source:c.source,type:c.inputType,formOwner:assoc});}
      if(c.actionClassification==='no-bound-action')this.issue(c.activity.status==='conditional'?'callbackless-disabled-predicate-unresolved':'active-control-without-local-bound-action',{host:c.host,root:c.root,id:c.id,source:c.source,tag:c.tag,type:c.inputType,componentChain:c.componentChain});
    }
  }
  renderFunction(fn, props, ctx) {
    if (fn?.kind !== 'function') { this.issue('component-unresolved', { host: ctx.host, root: ctx.root, instance: ctx.instance, component: this.serialize(fn) }); return; }
    const definition=this.source(fn.path),definitionKey=`${definition.file}:${definition.start}:${definition.end}`;
    if(!this.renderedDefinitions.has(definitionKey))this.renderedDefinitions.set(definitionKey,{source:definition,roots:[],invocations:0});
    const reached=this.renderedDefinitions.get(definitionKey),rootRef=`${ctx.host}:${ctx.root}`;reached.invocations++;if(!reached.roots.includes(rootRef))reached.roots.push(rootRef);
    const token = `${this.findUnit(fn.path)?.id}:${fn.path.node.start}`;
    if (ctx.stack.includes(token) || ctx.stack.length >= (this.options.maxDepth || 24)) { this.issue('component-cycle-or-depth', { host: ctx.host, root: ctx.root, source: this.source(fn.path), instance: ctx.instance }); return; }
    const local = { ...ctx, stack: [...ctx.stack, token], bindings: new Map([...ctx.bindings, ...(fn.closureBindings || [])]), componentChain: [...ctx.componentChain, this.source(fn.path)] };
    fn.path.get('params').forEach((p, i) => this.bind(p, ctx.argumentValues ? ctx.argumentValues[i] || unknown(p) : i === 0 ? props : unknown(p), local));
    delete local.argumentValues;
    const body = fn.path.get('body');
    if (!body.isBlockStatement()) { this.render(body, local); return; }
    let flow = local;
    for (const s of body.get('body')) {
      if (s.isVariableDeclaration()) for (const d of s.get('declarations')) this.bind(d.get('id'), this.evaluate(d.get('init'), flow), flow);
      if (s.isReturnStatement()) { this.render(s.get('argument'), flow); break; }
      else if (s.isIfStatement()) {
        const test = s.get('test'), tr = this.truth(this.evaluate(test, flow));
        this.renderStatement(s, flow);
        if (tr !== null) { if (this.alwaysReturns(s.get(tr ? 'consequent' : 'alternate'))) break; }
        else if (this.alwaysReturns(s.get('consequent')) && !s.node.alternate) flow = { ...flow, conditions: [...flow.conditions, `!(${this.text(test)})`] };
        else if (this.alwaysReturns(s.get('consequent')) && this.alwaysReturns(s.get('alternate'))) break;
      }
      else if (!s.isVariableDeclaration() && !s.isFunctionDeclaration() && !s.isExpressionStatement()) {
        let hasJsx = false; s.traverse({ JSXElement() { hasJsx = true; }, JSXFragment() { hasJsx = true; } });
        if (hasJsx) this.issue('render-statement-not-expanded', { host: ctx.host, root: ctx.root, source: this.source(s), statementType: s.node.type });
      }
    }
  }
  alwaysReturns(p) {
    if (!p?.node) return false;
    if (p.isReturnStatement()) return true;
    if (p.isBlockStatement()) return p.get('body').some(q => this.alwaysReturns(q));
    if (p.isIfStatement()) return this.alwaysReturns(p.get('consequent')) && this.alwaysReturns(p.get('alternate'));
    return false;
  }
  renderStatement(p, ctx) {
    if (!p?.node) return;
    if (p.isReturnStatement()) this.render(p.get('argument'), ctx);
    else if (p.isBlockStatement()) for (const q of p.get('body')) this.renderStatement(q, ctx);
    else if (p.isIfStatement()) {
      const c = this.text(p.get('test')), tr = this.truth(this.evaluate(p.get('test'), ctx));
      if (tr !== null) { this.renderStatement(p.get(tr ? 'consequent' : 'alternate'), ctx); return; }
      this.renderStatement(p.get('consequent'), { ...ctx, conditions: [...ctx.conditions, c] });
      if (p.node.alternate) this.renderStatement(p.get('alternate'), { ...ctx, conditions: [...ctx.conditions, `!(${c})`] });
    }
  }
  render(p, ctx) {
    if (!p?.node) return;
    if(this.rows.length >= (this.options.maxControls || 60000)) { if(!this.issues.some(i=>i.code==='control-limit-reached'))this.issue('control-limit-reached',{host:ctx.host,root:ctx.root,source:this.source(p),limit:this.options.maxControls||60000});return; }
    if (p.isJSXElement()) {
      const name = p.get('openingElement.name'), tag = this.text(name), props = this.props(p, ctx), source = this.source(p);
      const isNative = name.isJSXIdentifier() && /^[a-z]/.test(tag);
      if (isNative) {
        this.renderNative(p,props,ctx,tag);
      }
      else if (tag === 'React.Fragment' || tag === 'Fragment') for (const c of p.get('children')) this.render(c, ctx);
      else {
        const fn = this.jsxName(name, ctx);
        if (fn?.kind === 'literal' && typeof fn.value === 'string') {
          this.renderNative(p,props,ctx,fn.value); return;
        }
        // Non-native callback contract is kept even if leaf expansion fails.
        const contract = [...props.entries.keys()].some(k => /^on[A-Z]/.test(k)) ? this.row(p, props, ctx, tag) : null;
        const propBindings=Object.fromEntries([...props.entries].filter(([k])=>k!=='children').map(([k,value])=>[k,this.serialize(value)]));
        const propRules=p.get('openingElement.attributes').map(attribute=>({source:this.source(attribute),expression:this.text(attribute),references:this.references(attribute,ctx)}));
        this.renderFunction(fn, props, { ...ctx, componentCallSites: [...(ctx.componentCallSites || []), { tag, source,propBindings,propRules }], callbackProvenance: [...(ctx.callbackProvenance || []), ...(contract ? [{ id: contract.id, tag: contract.tag, source: contract.source, callbacks: Object.keys(contract.callbacks) }] : [])], instance: [...ctx.instance, `${tag}@${source.file}:${source.start}`] });
      }
    } else if (p.isJSXFragment()) for (const c of p.get('children')) this.render(c, ctx);
    else if (p.isJSXExpressionContainer()) this.render(p.get('expression'), ctx);
    else if (p.isConditionalExpression()) {
      const c = this.text(p.get('test')), tr = this.truth(this.evaluate(p.get('test'), ctx));
      if (tr !== null) { this.render(p.get(tr ? 'consequent' : 'alternate'), ctx); return; }
      this.render(p.get('consequent'), { ...ctx, conditions: [...ctx.conditions, c] }); this.render(p.get('alternate'), { ...ctx, conditions: [...ctx.conditions, `!(${c})`] });
    } else if (p.isLogicalExpression()) {
      const value=this.evaluate(p.get('left'),ctx),tr = this.truth(value),left=this.text(p.get('left'));
      if (p.node.operator === '&&' && tr === false) return;
      if (p.node.operator === '||' && tr === true) { this.render(p.get('left'), ctx); return; }
      if(p.node.operator==='||') {if(tr===null)this.render(p.get('left'),{...ctx,conditions:[...ctx.conditions,left]});this.render(p.get('right'),{...ctx,conditions:[...ctx.conditions,`!(${left})`]});}
      else if(p.node.operator==='??') {if(value?.kind==='literal')this.render(p.get(value.value==null?'right':'left'),ctx);else {this.render(p.get('left'),{...ctx,conditions:[...ctx.conditions,`${left} != null`]});this.render(p.get('right'),{...ctx,conditions:[...ctx.conditions,`${left} == null`]});}}
      else this.render(p.get('right'), { ...ctx, conditions: [...ctx.conditions, left] });
    }
    else if (p.isArrayExpression()) for (const c of p.get('elements')) this.render(c, ctx);
    else if (p.isCallExpression()) {
      const callee = p.get('callee');
      if (this.text(callee) === 'React.createElement') {
        const [component, propertyArg, ...children] = p.get('arguments'); const props = propertyArg?.node ? this.evaluate(propertyArg, ctx) : obj();
        if (props?.kind === 'object') props.entries.set('children', { kind: 'children', paths: children, context: ctx });
        const fn = this.evaluate(component, ctx);
        if (fn?.kind === 'literal') this.issue('createElement-native-not-expanded', { host: ctx.host, root: ctx.root, source: this.source(p), tag: fn.value });
        else this.renderFunction(fn, props?.kind === 'object' ? props : obj(), { ...ctx, instance: [...ctx.instance, `createElement@${this.source(p).file}:${this.source(p).start}`] });
      } else if (callee.isMemberExpression() && propName(callee.node.property) === 'map' && isFn(p.get('arguments.0'))) {
        const callback = p.get('arguments.0'), collection = callee.get('object'), local = { ...ctx, bindings: new Map(ctx.bindings), iterations: [...ctx.iterations, { collection: this.text(collection), source: this.source(collection), references: this.references(collection, ctx), parameters: callback.node.params.map(x => this.text(this.findUnit(callback).paths.get(x))) }] };
        callback.get('params').forEach((q, i) => { const value = unknown(q, [{ type: 'iteration', collection: this.text(collection), index: i }]); if (i === 0) value.collectionValue = this.evaluate(collection, ctx); this.bind(q, value, local); });
        const b = callback.get('body'); if (b.isBlockStatement()) for (const s of b.get('body')) this.renderStatement(s, local); else this.render(b, local);
      } else {
        const fn = this.evaluate(callee, ctx);
        if (fn?.kind === 'function') {
          const args = p.get('arguments').map(x => this.evaluate(x, ctx)); const props = args[0] || obj(); this.renderFunction(fn, props, { ...ctx, argumentValues: args, instance: [...ctx.instance, `call:${this.text(callee)}@${this.source(p).start}`] });
        }
      }
    } else if (p.isIdentifier() || p.isMemberExpression()) {
      const v = this.evaluate(p, ctx);
      if (v?.kind === 'jsx') this.render(v.path, ctx);
      else if(v?.kind==='render-call')this.render(v.path,{...v.context,instance:ctx.instance,stack:ctx.stack,componentChain:ctx.componentChain,conditions:ctx.conditions,iterations:ctx.iterations,componentCallSites:ctx.componentCallSites,callbackProvenance:ctx.callbackProvenance,nativeFormOwner:ctx.nativeFormOwner,disabledFieldsets:ctx.disabledFieldsets,domParentTag:ctx.domParentTag,domParentFieldsetId:ctx.domParentFieldsetId,fieldsetLegendResolution:ctx.fieldsetLegendResolution,fieldsetLegendException:ctx.fieldsetLegendException});
      else if (v?.kind === 'children') for (const c of v.paths) this.render(c, { ...v.context, instance: [...ctx.instance, `children@${this.source(p).file}:${this.source(p).start}`], stack: v.context.stack, componentChain: ctx.componentChain, conditions: ctx.conditions, iterations: ctx.iterations, ancestorActionCandidates: ctx.ancestorActionCandidates,nativeFormOwner:ctx.nativeFormOwner,disabledFieldsets:ctx.disabledFieldsets,domParentTag:ctx.domParentTag,domParentFieldsetId:ctx.domParentFieldsetId,fieldsetLegendResolution:ctx.fieldsetLegendResolution,fieldsetLegendException:ctx.fieldsetLegendException });
      else if(v?.kind==='expression'&&v.path?.node&&v.path.node!==p.node&&(v.path.isConditionalExpression()||v.path.isLogicalExpression()||v.path.isCallExpression()||v.path.isArrayExpression())) {
        // A JSX-valued local conditional is a render rule, not plain data. State
        // stays unknown: explore its possible branches through the original AST.
        let hasJsx=false;v.path.traverse({JSXElement(){hasJsx=true;},JSXFragment(){hasJsx=true;}});
        if(hasJsx){const token=`${this.source(v.path).file}:${v.path.node.start}`;if((ctx.expressionStack||[]).includes(token)||(ctx.expressionStack||[]).length>=(this.options.maxDepth||24))this.issue('render-expression-cycle-or-depth',{host:ctx.host,root:ctx.root,source:this.source(v.path)});else this.render(v.path,{...ctx,expressionStack:[...(ctx.expressionStack||[]),token],instance:[...ctx.instance,`expression@${this.source(p).file}:${this.source(p).start}`]});}
      }
      else if(v?.kind==='array')for(const [index,item] of v.items.entries())if(item?.kind==='jsx')this.render(item.path,{...ctx,instance:[...ctx.instance,`array-item:${index}@${this.source(p).start}`]});
    }
  }
  host(id, rel) {
    const hostFile = this.safeFile(rel);
    if (!fs.existsSync(hostFile)) { this.issue('host-missing', { host: id, file: rel }); return; }
    const html = fs.readFileSync(hostFile, 'utf8'), scripts = htmlScripts(html);
    this.sources.set(rel, { file: rel, sha256: sha(html), bytes: Buffer.byteLength(html) });
    const globals = obj(['PHQ_SCREENS', 'AG_SCREENS', 'FO_SCREENS', this.namespace].map(k => [k, val(undefined)])); globals.isGlobal = true;
    for (const u of this.units.values()) u.env.clear();
    const ctx = { host: id, globals, bindings: new Map() }, ordered = [];
    for (const [i, s] of scripts.entries()) {
      if (s.src && /^(https?:)?\/\//.test(s.src)) { ordered.push({ order: i, external: s.src, inspected: false }); continue; }
      const src = s.src ? path.posix.normalize(path.posix.join(path.posix.dirname(rel), decodeURIComponent(s.src.split('?')[0]))) : rel;
      if (s.src && !fs.existsSync(this.safeFile(src))) { this.issue('script-missing', { host: id, file: src }); continue; }
      const u = this.unit(src, s.src ? undefined : s.code, s.src ? 0 : s.offset);
      ctx.scriptOrder = i; ctx.executionPhase = 'host-script';
      ordered.push({ order: i, file: src, inlineOffset: s.src ? undefined : s.offset, sha256: this.sources.get(src)?.sha256 });
      if (src === '_ds_bundle.js' && u) this.bundle(u, ctx); else this.runUnit(u, ctx);
    }
    const hostRecord = { id, file: rel, scriptOrder: ordered, bundle: ctx.bundle }; this.hosts.push(hostRecord);
    hostRecord.canonicalWinners = [...this.canonical].map(([name, manifestSource]) => { const chosen = ctx.globals.entries.get(this.namespace)?.entries?.get(name); return { name, manifestSource, chosen: this.serialize(chosen), chosenFromManifestSource: chosen?.path ? this.source(chosen.path)?.file === manifestSource : null }; });
    const regName = id === 'PH' ? 'PHQ_SCREENS' : id === 'AG' ? 'AG_SCREENS' : 'FO_SCREENS';
    const reg = ctx.globals.entries.get(regName);
    const screenEntries = reg?.kind === 'object' ? [...reg.entries] : [];
    if (!screenEntries.length && !(id === 'FO' && rel === 'ui_kits/forelder/index.html')) this.issue('host-registry-empty', { host: id, registry: regName });
    // The Forelder shell mounts a literal screens object instead of FO_SCREENS.
    if (id === 'FO' && rel === 'ui_kits/forelder/index.html') {
      const shell = ctx.globals.entries.get('ForelderShell');
      if (shell?.kind === 'function') {
        let rootScreens;
        shell.path.traverse({ JSXAttribute: p => { if (propName(p.node.name) === 'screens') rootScreens = this.evaluate(p.get('value.expression'), ctx); } });
        if (rootScreens?.kind === 'object') for (const [k, v] of rootScreens.entries) screenEntries.push([k, obj([['Component', v]])]);
      }
    }
    const catalogue = ctx.globals.entries.get('AK_KATALOG'), ia = ctx.globals.entries.get('AK_IA');
    const outgoing = ia?.entries?.get('utgar');
    const listed = catalogue?.kind === 'object' ? [...catalogue.entries].filter(([k]) => k.startsWith(id + '-')) : [];
    const registered = new Set(screenEntries.map(([k]) => k));
    hostRecord.registryAudit = {
      registry: regName, registeredRoots: screenEntries.length, catalogueRoots: listed.length,
      catalogueMissingRegistration: listed.filter(([k]) => !registered.has(k)).map(([k]) => k),
      registeredOutsideCatalogue: screenEntries.filter(([k]) => !listed.some(([id]) => id === k)).map(([k]) => k),
      declaredOutgoing: screenEntries.filter(([k]) => outgoing?.entries?.has(k) || catalogue?.entries?.get(k)?.entries?.get('utgar')?.value === true).map(([k]) => k),
      sourceEvidence: ['ui_kits/katalog.js', 'ui_kits/katalog-24d.js', 'ui_kits/_shared/ia.js'].filter(f => this.sources.has(f)).map(f => this.sources.get(f)),
      scope: 'registries and catalogue read as AST values; runtime host filtering not asserted'
    };
    const hostApi = ctx.globals.entries.get(id === 'PH' ? 'PHQ' : 'AGQ');
    const hostFn = hostApi?.entries?.get('Host');
    let actualHostContext;
    if (hostFn?.kind === 'function') {
      const snapshot = { ...ctx, bindings: new Map() };
      for (const declaration of hostFn.path.get('body.body')) if (declaration.isVariableDeclaration()) for (const d of declaration.get('declarations')) this.bind(d.get('id'), this.evaluate(d.get('init'), snapshot), snapshot);
      const bodyScope = hostFn.path.get('body').scope, contextBinding = bodyScope.getBinding('ctx');
      if (contextBinding) actualHostContext = snapshot.bindings.get(keyOf(contextBinding.path, 'ctx'));
      const contextSymbol = hostFn.path.scope.getBinding('WCtx');
      if (actualHostContext?.kind === 'object' && contextSymbol) {
        ctx.contexts = new Map([[keyOf(contextSymbol.path, 'WCtx'), actualHostContext]]);
        const nav0Binding = bodyScope.getBinding('nav0'), nav0 = nav0Binding && snapshot.bindings.get(keyOf(nav0Binding.path, 'nav0'));
        ctx.navigationNodes = new Set([actualHostContext.entries.get('go')?.path?.node, nav0?.path?.node].filter(Boolean));
        hostRecord.hostContextSource = this.source(contextBinding.path);
      }
    }
    for (const [screenId, meta] of screenEntries.filter(([screenId])=>!this.options.roots||this.options.roots.includes(screenId))) {
      const component = meta?.kind === 'object' ? meta.entries.get('Component') : undefined;
      if (!component) { this.issue('screen-component-missing', { host: id, root: screenId }); continue; }
      const before = this.rows.length;
      const local = { ...ctx, root: screenId, instance: [id, screenId], stack: [], componentChain: [], conditions: [], iterations: [] };
      const rootProps = obj([['go', actualHostContext?.entries?.get('go') || unknown(component.path, [{ type: 'host-navigation', registry: regName }])], ['state', unknown(component.path, [{ type: 'host-state', values: ['data', 'tom', 'laster', 'feil'] }])], ['nav', actualHostContext?.entries?.get('nav') || unknown(component.path, [{ type: 'host-nav-contract' }])]]);
      this.renderFunction(component, rootProps, local);
      this.roots.push({ host: id, id: screenId, registry: regName, catalogueListed: listed.some(([id]) => id === screenId), declaredOutgoing: hostRecord.registryAudit.declaredOutgoing.includes(screenId), factoryBindings: (component.factoryBindings || []).map(v => ({ name: v.name, value: this.serialize(v.value) })), component: this.serialize(component), route: this.serialize(meta.entries.get('route')), controls: this.rows.length - before });
    }
    const shellName = id === 'PH' ? 'PHQ' : id === 'AG' || id === 'FO' ? 'AGQ' : null;
    const shell = shellName ? ctx.globals.entries.get(shellName)?.entries?.get('Shell') : ctx.globals.entries.get('ForelderShell');
    if (this.options.roots&&!this.options.roots.includes('@shell')) return;
    if (shell?.kind === 'function') {
      const before = this.rows.length;
      this.renderFunction(shell, obj([['go', actualHostContext?.entries?.get('go') || unknown(shell.path, [{ type: 'host-navigation', registry: regName }])], ['meta', unknown(shell.path, [{ type: 'selected-screen-metadata', registry: regName }])]]), { ...ctx, root: '@shell', instance: [id, '@shell'], stack: [], componentChain: [], conditions: [], iterations: [] });
      this.roots.push({ host: id, id: '@shell', component: this.serialize(shell), controls: this.rows.length - before });
    } else this.issue('shell-unresolved', { host: id, name: shellName || 'ForelderShell' });
  }
  effectiveSources() {
    const components = new Map(), controls = new Map(), handlers = new Map();
    const add = (map, source, reference) => {
      if (!source) return;
      const key = `${source.file}:${source.start}:${source.end}`;
      if (!map.has(key)) map.set(key, { source, historicalPath: source.file.split('/').some(part => ['arkiv', '_kilde', '_utenfor'].includes(part)), references: [] });
      const entry = map.get(key); if (!entry.references.some(r => r.id === reference.id)) entry.references.push(reference);
    };
    for (const c of this.rows) {
      const reference = { id: c.id, host: c.host, root: c.root };
      add(controls, c.source, reference); for (const source of c.componentChain) add(components, source, reference);
      for (const handler of Object.values(c.callbacks)) for (const binding of handler.bindings) add(handlers, binding.source, reference);
    }
    return { components: [...components.values()], nativeControls: [...controls.values()], boundHandlers: [...handlers.values()], method: 'Definitions reached by static instance rules, not every module physically present in bundle.' };
  }
  coverageInventory() {
    const declared=new Map();
    for(const u of this.units.values())traverse(u.ast,{Function:p=>{
      let ownJsx=false;p.traverse({Function(q){q.skip();},JSXElement(){ownJsx=true;},JSXFragment(){ownJsx=true;}});if(!ownJsx)return;
      const source=this.source(p),key=`${source.file}:${source.start}:${source.end}`;if(declared.has(key))return;
      const parent=p.parentPath,name=p.node.id?.name||(parent.isVariableDeclarator()&&parent.node.id.name)||(parent.isObjectProperty()&&propName(parent.node.key))||null;
      const template=parent.isCallExpression()&&parent.node.arguments.includes(p.node)&&parent.get('callee').isMemberExpression()&&['map','flatMap'].includes(propName(parent.node.callee.property));
      const rendered=this.renderedDefinitions.get(key),overridden=name&&this.hosts.some(h=>h.canonicalWinners?.some(w=>w.name===name&&w.chosen?.source?.file!==source.file&&w.chosenFromManifestSource===true));
      declared.set(key,{source,name,category:template?'iteration-render-template':'jsx-source-function',status:rendered?'rendered-in-static-instance-expansion':template?'iteration-template-not-a-component-call':overridden?'canonical-source-overridden':'not-reached-by-selected-roots',roots:rendered?.roots||[],invocations:rendered?.invocations||0,
        limitation:!rendered&&!template&&!overridden?'May be unused, an alternate host/route or an unexpanded render path. This status alone does not prove exclusion.':undefined});
    }});
    const definitions=[...declared.values()];return {scope:this.options.roots?{selectedRoots:this.options.roots}: {allRegisteredRoots:true},declaredJsxFunctions:definitions,renderedDefinitions:[...this.renderedDefinitions.values()],counts:Object.fromEntries([...new Set(definitions.map(d=>d.status))].map(status=>[status,definitions.filter(d=>d.status===status).length])),universalCoverageAsserted:false};
  }
  reviewGroups() {
    const callbackGroups = new Map(), actionGroups = new Map(), semanticGroups = new Map();
    for (const control of this.rows) {
      for (const [event, handler] of Object.entries(control.callbacks)) {
        for (const call of handler.calls) if (call.meaning) {
          const key = `${call.meaning.category}|${call.callee || ''}|${call.source?.file}:${call.source?.line}`;
          if (!semanticGroups.has(key)) semanticGroups.set(key, { category: call.meaning.category, callee: call.callee || null, source: call.source || call.meaning.evidence, certainty: call.meaning.certainty, count: 0, roots: [] });
          const g = semanticGroups.get(key); g.count++; const ref = `${control.host}:${control.root}`; if (!g.roots.includes(ref)) g.roots.push(ref);
        }
        for (const gap of handler.unresolved) {
        const source = gap.source || gap.value?.source || control.source, key = `${control.activity?.status}|${gap.reason}|${gap.callee || ''}|${source?.file}:${source?.line}`;
        if (!callbackGroups.has(key)) callbackGroups.set(key, { reason: gap.reason, callee: gap.callee || null, source, activity:control.activity?.status, countsAsActiveBindingGap:control.activity?.status!=='inactive',controls: [] });
        callbackGroups.get(key).controls.push({ id: control.id, host: control.host, root: control.root, event });
        }
      }
      if (control.actionClassification !== 'bound-callback') {
        const original = control.componentCallSites.at(-1)?.source || control.source;
        const key = `${control.actionClassification}|${original.file}:${original.line}`;
        if (!actionGroups.has(key)) actionGroups.set(key, { classification: control.actionClassification, source: original, nativeSource: control.source, controls: [] });
        actionGroups.get(key).controls.push({ id: control.id, host: control.host, root: control.root, tag: control.tag, ancestorActionCandidates: control.ancestorActionCandidates });
      }
    }
    return { semanticOperations: [...semanticGroups.values()], callbackBindingGaps: [...callbackGroups.values()], nativeActionReview: [...actionGroups.values()] };
  }
  run() {
    const hosts = this.options.hosts || [{ id: 'PH', file: 'ui_kits/playerhq/screen.html' }, { id: 'AG', file: 'ui_kits/agencyos/screen.html' }, { id: 'FO', file: 'ui_kits/_shared/screen.html' }];
    for (const h of hosts) this.host(h.id, h.file);
    this.finalizeNativeRules();
    const duplicates = new Map(); for (const r of this.rows) duplicates.set(r.id, (duplicates.get(r.id) || 0) + 1);
    for (const [id, count] of duplicates) if (count > 1) this.issue('duplicate-control-rule', { id, count });
    const allCalls = this.rows.flatMap(r => Object.values(r.callbacks).flatMap(c => c.calls));
    const semanticCallRules = allCalls.filter(call => ['unclassified-call-rule', 'data-method-rule', 'receiver-mutation-rule'].includes(call.meaning?.category));
    const callMeaningCounts = Object.fromEntries([...new Set(allCalls.map(c => c.meaning?.category || c.kind))].map(kind => [kind, allCalls.filter(c => (c.meaning?.category || c.kind) === kind).length]));
    const callbackGaps=r=>Object.values(r.callbacks).reduce((a,c)=>a+c.unresolved.length,0);
    const callbackUnresolved = this.rows.filter(r=>r.activity?.status!=='inactive').reduce((n,r)=>n+callbackGaps(r),0);
    const inactiveCallbackBindingGaps=this.rows.filter(r=>r.activity?.status==='inactive').reduce((n,r)=>n+callbackGaps(r),0);
    return { schemaVersion: 1, generatedAt: new Date().toISOString(), method: 'offline-babel-ast-no-source-execution', root: this.root,
      status: 'static-inventory-requires-runtime-and-semantic-review', limitations: ['No imported/exported source is executed. This is conservative static analysis, not JavaScript runtime equivalence.', 'Conditional UI and map instances are expression rules, not enumerated runtime objects.', 'External React/Babel scripts are recorded but not fetched.', 'Bundle source reconstruction requires matching source metadata; mismatches are blocking evidence.', 'Unknown guards, callback bindings, imports, components and depth limits remain explicit issues. Standard data-method contracts retain receiver type preconditions; they are not missing navigation targets.', 'Prototype state/save calls do not prove persistence or app behavior.'],
      coverageInventory:this.coverageInventory(), guardAudit: this.guardAudit, effectiveSourceInventory: this.effectiveSources(), sources: [...this.sources.values()].sort((a, b) => a.file.localeCompare(b.file)), hosts: this.hosts, roots: this.roots, forms:this.forms, reviewGroups: this.reviewGroups(), controls: this.rows, componentCallbackContracts: this.componentContracts, issues: this.issues,
      summary: { hosts: this.hosts.length, roots: this.roots.length, controls: this.rows.length, componentCallbackContracts: this.componentContracts.length, forms:this.forms.length,callbackUnresolved,inactiveCallbackBindingGaps, semanticCallRulesRequiringReview: semanticCallRules.length, callMeaningCounts, issues: this.issues.length, issueKinds: Object.fromEntries([...new Set(this.issues.map(x => x.code))].map(k => [k, this.issues.filter(x => x.code === k).length])) } };
  }
}
function generate(root, options) { return new Mapper(root, options).run(); }
/** Lossless JSON dictionaries. The tables store complete texts and source spans;
 * references merely deduplicate evidence. They do not shorten handlers or chains.
 * Decode only a control's ruleRef when inspecting one screen, rather than expanding
 * the entire private raw map. Deduplication uses content hashes. Table indices
 * follow deterministic sorted-key traversal, independent of Babel scope UIDs. */
function normalizeMap(input) {
  const dictionaries = { objects: [], arrays: [], texts: [] }, hashes = { o:new Map(), a:new Map(), t:new Map() };
  const intern = (table, value, prefix) => {
    const content = typeof value === 'string' ? value : JSON.stringify(value);
    const digest = sha(`${prefix}:${content}`), existing = hashes[prefix].get(digest);
    if (existing !== undefined) { if (JSON.stringify(table[existing]) !== JSON.stringify(value)) throw new Error('Dictionary hash collision'); return { [`$${prefix}`]: existing }; }
    const id = table.length; hashes[prefix].set(digest,id); table.push(value); return { [`$${prefix}`]: id };
  };
  const objectMemo = new WeakMap();
  const encode = value => {
    if (typeof value === 'string') return value.length >= 24 ? intern(dictionaries.texts, value, 't') : value;
    if (!value || typeof value !== 'object') return value;
    if (objectMemo.has(value)) return objectMemo.get(value);
    if (Array.isArray(value)) { const ref = intern(dictionaries.arrays, value.map(v => v === undefined ? null : encode(v)), 'a'); objectMemo.set(value, ref); return ref; }
    const fields = Object.fromEntries(Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => [k, encode(value[k])]));
    const ref = intern(dictionaries.objects, fields, 'o'); objectMemo.set(value, ref); return ref;
  };
  const rootRef = encode(input);
  return { schemaVersion: 1, format: 'precision-control-map-normalized-v1', rootRef,
    summary: input.summary, strictStatus: strictStatus(input),
    privacy: 'Full source and labels remain private. Normalization is not anonymization.',
    controlIndex: (input.controls || []).map(c => ({ id: c.id, host: c.host, root: c.root, tag: c.tag, actionClassification: c.actionClassification, ruleRef: encode(c) })),
    rootIndex: (input.roots || []).map(r => ({ host: r.host, id: r.id, controls: r.controls, ruleRef: encode(r) })), dictionaries };
}
function expandNormalized(normalized, reference = normalized.rootRef) {
  if (normalized.format !== 'precision-control-map-normalized-v1') throw new Error('Unsupported normalized map format');
  const tables = normalized.dictionaries, active = new Set();
  const decode = value => {
    if (!value || typeof value !== 'object') return value;
    const keys = Object.keys(value), k = keys.length === 1 && keys[0];
    const table = k === '$o' ? tables.objects : k === '$a' ? tables.arrays : k === '$t' ? tables.texts : null;
    if (table) {
      const id = value[k], token = `${k}:${id}`;
      if (!Object.hasOwn(table, id)) throw new Error(`Missing dictionary reference: ${token}`);
      if (active.has(token)) throw new Error(`Cyclic dictionary reference: ${token}`);
      active.add(token); const entry = table[id];
      // Table entries are original containers, even when an original object used
      // a reserved-looking key. Interpret references only in their child values.
      const result = k === '$t' ? entry : k === '$a' ? entry.map(decode) : Object.fromEntries(Object.entries(entry).map(([key, v]) => [key, decode(v)]));
      active.delete(token); return result;
    }
    return Array.isArray(value) ? value.map(decode) : Object.fromEntries(Object.entries(value).map(([key, v]) => [key, decode(v)]));
  };
  return decode(reference);
}
function strictStatus(map) {
  const groups = {};
  for (const issue of map.issues || []) groups[issue.code] = (groups[issue.code] || 0) + 1;
  const missingCatalogue = (map.hosts || []).reduce((n, h) => n + (h.registryAudit?.catalogueMissingRegistration.length || 0), 0);
  const canonicalMismatch = (map.hosts || []).reduce((n, h) => n + (h.canonicalWinners || []).filter(c => c.chosenFromManifestSource === false).length, 0);
  if (missingCatalogue) groups['catalogue-registration-missing'] = missingCatalogue;
  if (canonicalMismatch) groups['canonical-manifest-source-mismatch'] = canonicalMismatch;
  if (map.summary?.callbackUnresolved) groups['callback-binding-unresolved'] = map.summary.callbackUnresolved;
  const blockers = Object.values(groups).reduce((n, count) => n + count, 0);
  return { verdict: blockers ? 'needs-source-or-action-review' : 'no-listed-source-or-action-blockers', blockers, blockerKinds: groups,
    runtimeVerified: false, semanticReceiverRulesAreNotMissingNavigation: true,
    exitCodeWhenStrict: blockers ? 3 : 0 };
}
function screenMap(normalized, host, screen) {
  if (normalized.format !== 'precision-control-map-normalized-v1') throw new Error('Screen extraction requires a normalized map');
  const top = normalized.dictionaries.objects[normalized.rootRef.$o];
  const read = ref => expandNormalized(normalized,ref);
  const refs = field => normalized.dictionaries.arrays[top[field]?.$a] || [];
  const match = ref => {const fields=normalized.dictionaries.objects[ref.$o];return read(fields.host)===host&&read(fields.root)===screen;};
  const controls = normalized.controlIndex.filter(c=>c.host===host&&c.root===screen).map(c=>read(c.ruleRef));
  const roots = normalized.rootIndex.filter(r=>r.host===host&&r.id===screen).map(r=>read(r.ruleRef));
  if (!roots.length) throw new Error('Requested screen is not registered in the source map');
  const hosts=refs('hosts').filter(ref=>read(normalized.dictionaries.objects[ref.$o].id)===host).map(read);
  const componentCallbackContracts=refs('componentCallbackContracts').filter(match).map(read);
  const issues=refs('issues').filter(ref=>{const fields=normalized.dictionaries.objects[ref.$o];return (!fields.host||read(fields.host)===host)&&(!fields.root||read(fields.root)===screen);}).map(read);
  const view={ schemaVersion:1, generatedAt:read(top.generatedAt), method:read(top.method), root:read(top.root),
    status:'selected-screen-static-source-contract', scope:{host,screen,fullMapControls:normalized.summary.controls,fullMapStrictStatus:normalized.strictStatus},
    limitations:read(top.limitations), sources:read(top.sources),
    coverageInventory:top.coverageInventory?{sourceMapInventory:read(top.coverageInventory),selectedScreen:{host,screen},universalCoverageAsserted:false}:undefined,
    guardAudit:refs('guardAudit').filter(ref=>read(normalized.dictionaries.objects[ref.$o].host)===host).map(read),
    hosts, roots, controls, componentCallbackContracts, issues,
    forms:refs('forms').filter(ref=>{const fields=normalized.dictionaries.objects[ref.$o];return read(fields.host)===host&&(read(fields.root)===screen||read(fields.root)==='@shell');}).map(read),
    summary:{hosts:hosts.length,roots:roots.length,controls:controls.length,componentCallbackContracts:componentCallbackContracts.length,callbackUnresolved:controls.filter(c=>c.activity?.status!=='inactive').reduce((n,c)=>n+Object.values(c.callbacks).reduce((a,h)=>a+h.unresolved.length,0),0),issues:issues.length} };
  return normalizeMap(view);
}
module.exports = { generate, Mapper, htmlScripts, sha, normalizeMap, expandNormalized, strictStatus, screenMap };
if (require.main === module) {
  const args = process.argv.slice(2), strict = args.includes('--strict'), normalized = args.includes('--normalized'), fromFile = args.includes('--normalize-file'), screenFile=args.includes('--screen-file'), gzip=args.includes('--gzip');
  const options={};for(const flag of ['--host','--screen']){const i=args.indexOf(flag);if(i>=0){options[flag]=args[i+1];args.splice(i,2);}}
  const [root, output, ...extra] = args.filter(a => !['--strict', '--normalized', '--normalize-file','--screen-file','--gzip'].includes(a));
  if (!root || !output || extra.length || [root, output].some(a => a.startsWith('--')) || screenFile&&(!options['--host']||!options['--screen']) || screenFile&&fromFile) { console.error('Bruk: node scripts/design/precision-control-map.cjs <eksportrot> <privat-output.json> [--normalized] [--strict] [--gzip]\nEller: --normalize-file <privat-raw.json> <privat-kompakt.json>\nEller: --screen-file <privat-kompakt.json> <privat-skjerm.json> --host PH --screen PH-11\n--gzip skriver også en tapsfri .gz-sidefil. Strict exit 3 betyr kilde-/handlingsavvik; exit 0 er ingen kjøretids- eller designgodkjenning. PRECISION_NODE_MODULES_ROOT kan peke til prosjektrot med Babel-avhengigheter.'); process.exitCode = 2; }
  else {
    try {
      const result = screenFile?screenMap(JSON.parse(fs.readFileSync(root,'utf8')),options['--host'],options['--screen']):fromFile ? JSON.parse(fs.readFileSync(root, 'utf8')) : generate(root), status = screenFile?result.strictStatus:strictStatus(result);
      const payload = screenFile?result:normalized || fromFile ? normalizeMap(result) : { ...result, strictStatus: status };
      fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
      const json=JSON.stringify(payload, null, normalized || fromFile ||screenFile ? undefined : 2) + '\n';fs.writeFileSync(output,json);
      if(gzip)fs.writeFileSync(output+'.gz',zlib.gzipSync(json,{level:9}));
      console.log(JSON.stringify({ ...result.summary, strictStatus: status, outputBytes: fs.statSync(output).size, gzipBytes:gzip?fs.statSync(output+'.gz').size:undefined, normalized: normalized || fromFile||screenFile }));
      if (strict) process.exitCode = status.exitCodeWhenStrict;
    } catch (error) { console.error(`Kartmotor feilet: ${error.message}`); process.exitCode = 2; }
  }
}
