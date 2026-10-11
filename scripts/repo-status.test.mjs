import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inventory, matchesRepository } from './repo-status.mjs';

test('recognizes only the intended repository without exposing credentials', () => {
  for (const url of ['https://github.com/akgolfsoftware/Golf_Headquarters.git', 'git@github.com:akgolfsoftware/Golf_Headquarters.git', 'ssh://git@github.com/akgolfsoftware/Golf_Headquarters.git']) assert.equal(matchesRepository(url), true);
  for (const url of ['https://github.com.example.org/akgolfsoftware/Golf_Headquarters', 'https://github.com/other/repo', null]) assert.equal(matchesRepository(url), false);
});

test('reports dirty work, unpublished commits, stashes and worktrees without changing them', () => {
  const root = mkdtempSync(join(tmpdir(), 'ak-repo-status-'));
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    git('init', '-b', 'main');
    git('config', 'user.name', 'Synthetic Test'); git('config', 'user.email', 'test@example.invalid');
    writeFileSync(join(root, 'tracked.txt'), 'base\n'); git('add', 'tracked.txt'); git('commit', '-m', 'fixture');
    const base = git('rev-parse', 'HEAD');
    git('remote', 'add', 'origin', 'https://synthetic-token@github.com/akgolfsoftware/Golf_Headquarters.git');
    git('update-ref', 'refs/remotes/origin/main', base);
    git('switch', '-c', 'work'); git('branch', '--set-upstream-to=origin/main');
    writeFileSync(join(root, 'tracked.txt'), 'committed\n'); git('commit', '-am', 'unpublished fixture');
    writeFileSync(join(root, 'tracked.txt'), 'stashed\n'); git('stash', 'push', '-m', 'private-text');
    writeFileSync(join(root, 'tracked.txt'), 'dirty\n'); writeFileSync(join(root, 'new.txt'), 'untracked\n');
    git('worktree', 'add', '--detach', join(root, 'second'), base);
    const before = { head: git('rev-parse', 'HEAD'), status: git('status', '--porcelain'), stash: git('stash', 'list'), refs: git('show-ref') };
    const report = inventory(root, { label: 'test' });
    const active = report.worktrees.find(w => w.branch === 'work');
    assert.equal(active.tracked, 1); assert.ok(active.untracked >= 1);
    assert.deepEqual(active.versus_upstream, { behind: 0, ahead: 1 });
    assert.equal(report.stash_count, 1); assert.equal(report.worktrees.length, 2);
    assert.equal(report.fetched_now, false); assert.equal(report.remote_refs_may_be_stale, true);
    assert.equal(JSON.stringify(report).includes('synthetic-token'), false);
    assert.equal(JSON.stringify(report).includes('private-text'), false);
    assert.deepEqual({ head: git('rev-parse', 'HEAD'), status: git('status', '--porcelain'), stash: git('stash', 'list'), refs: git('show-ref') }, before);
    git('remote', 'set-url', 'origin', 'https://github.com/other/repo');
    assert.throws(() => inventory(root, { fetch: true }), /forventede/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
