#!/usr/bin/env node
/** Git inventory only. No checkout, commit, reset, stash, prune or deletion. */
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPOSITORY = 'akgolfsoftware/Golf_Headquarters';
function git(cwd, args, optional = false) {
  try {
    return execFileSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' },
    }).trimEnd();
  } catch (error) {
    if (optional) return null;
    // Never echo remote credentials, command arguments or arbitrary Git stderr.
    throw new Error(`Git ${args[0]} feilet (status ${error.status ?? 'ukjent'}).`);
  }
}

export function matchesRepository(remote) {
  if (!remote) return false;
  const ssh = remote.match(/^git@github\.com:(.+?)(?:\.git)?$/);
  if (ssh) return ssh[1].toLowerCase() === REPOSITORY.toLowerCase();
  try {
    const u = new URL(remote);
    return ['https:', 'ssh:'].includes(u.protocol) && u.hostname === 'github.com'
      && u.pathname.replace(/^\//, '').replace(/\.git$/, '').toLowerCase() === REPOSITORY.toLowerCase();
  } catch { return false; }
}

function counts(cwd, ref) {
  if (!ref || !git(cwd, ['rev-parse', '--verify', ref], true)) return null;
  const [behind, ahead] = git(cwd, ['rev-list', '--left-right', '--count', `${ref}...HEAD`]).split(/\s+/).map(Number);
  return { behind, ahead };
}

function changes(cwd) {
  const records = git(cwd, ['status', '--porcelain=v1', '-z', '--untracked-files=all']).split('\0');
  let tracked = 0, untracked = 0;
  for (let i = 0; i < records.length; i++) {
    const status = records[i].slice(0, 2);
    if (!status) continue;
    if (status === '??') untracked++;
    else {
      tracked++;
      if (/[RC]/.test(status)) i++; // Rename/copy has a second path record.
    }
  }
  return { tracked, untracked };
}

export function inventory(cwd, { label = 'ukjent-maskin', fetch = false } = {}) {
  const root = git(cwd, ['rev-parse', '--show-toplevel']);
  const originMatchesExpected = matchesRepository(git(root, ['remote', 'get-url', 'origin'], true));
  if (fetch) {
    if (!originMatchesExpected) throw new Error('Origin er ikke det forventede AK Golf HQ-repoet. Ingen fetch utført.');
    git(root, ['fetch', '--no-tags', 'origin', '+refs/heads/*:refs/remotes/origin/*']);
  }
  const worktrees = git(root, ['worktree', 'list', '--porcelain']).split('\n\n').filter(Boolean).map(block => {
    const lines = block.split('\n');
    const path = lines.find(l => l.startsWith('worktree '))?.slice(9);
    const branch = lines.find(l => l.startsWith('branch '))?.slice(7).replace(/^refs\/heads\//, '') ?? null;
    const head = lines.find(l => l.startsWith('HEAD '))?.slice(5) ?? null;
    let state;
    try {
      const upstream = git(path, ['rev-parse', '--abbrev-ref', '@{upstream}'], true);
      state = { readable: true, ...changes(path), upstream, versus_upstream: counts(path, upstream), versus_main: counts(path, 'refs/remotes/origin/main') };
    } catch { state = { readable: false }; }
    return { path, branch, head, locked: lines.some(l => l.startsWith('locked')), prunable: lines.some(l => l.startsWith('prunable')), ...state };
  });
  const branches = git(root, ['for-each-ref', '--format=%(refname:short)\t%(objectname)\t%(upstream:short)', 'refs/heads']).split('\n').filter(Boolean).map(line => {
    const [name, sha, upstream] = line.split('\t');
    const remoteSha = upstream ? git(root, ['rev-parse', '--verify', upstream], true) : null;
    return { name, sha, upstream: upstream || null, remote_sha: remoteSha, same_as_upstream: remoteSha ? sha === remoteSha : null };
  });
  const stashes = git(root, ['stash', 'list', '--format=%H']).split('\n').filter(Boolean);
  return {
    schema_version: 1, measured_at: new Date().toISOString(), machine_label: label,
    repository: REPOSITORY, origin_matches_expected: originMatchesExpected,
    fetched_now: fetch, remote_refs_may_be_stale: !fetch,
    shallow: git(root, ['rev-parse', '--is-shallow-repository']) === 'true',
    origin_main: git(root, ['rev-parse', '--verify', 'refs/remotes/origin/main'], true),
    worktrees, local_branches: branches, stash_count: stashes.length,
    limitations: ['Bare denne Git-kopien og registrerte worktrees er undersøkt.', 'Andre kloner og andre maskiner må kjøres separat.', 'Ignorerte filer og filinnhold leses ikke. Rapporten er ikke en sikkerhetskopi.'],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2);
    let label = 'ukjent-maskin', fetch = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--fetch') fetch = true;
      else if (args[i] === '--label' && args[i + 1] && !args[i + 1].startsWith('--')) label = args[++i];
      else throw new Error('Bruk: node scripts/repo-status.mjs [--fetch] [--label macbook-air|mac-mini]');
    }
    process.stdout.write(JSON.stringify(inventory(process.cwd(), { label, fetch }), null, 2) + '\n');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
