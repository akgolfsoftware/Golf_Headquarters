#!/usr/bin/env node
// Kjøres etter `gh pr merge`: fjerner lokale worktrees og grener som er
// trygge å slette (rene, og enten merget inn i main eller fjernet på remote).
// Rører aldri main, gjeldende sjekket-ut gren, eller grener med lokale endringer.
import { execSync } from "node:child_process";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (d) => (data += d));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", () => resolve(""));
  });
}

function sh(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], ...opts });
}

async function main() {
  const raw = await readStdin();
  let payload = {};
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    return;
  }
  const cmd = payload?.tool_input?.command || "";
  if (!/gh\s+pr\s+merge/.test(cmd)) return;

  let root;
  try {
    root = sh("git rev-parse --show-toplevel").trim();
  } catch {
    return;
  }

  try {
    sh("git fetch origin --prune", { cwd: root });
  } catch {
    // nettverksfeil er ikke kritisk her
  }

  const currentBranch = sh("git branch --show-current", { cwd: root }).trim();

  // Bygg worktree-kart: gren -> sti
  const wtRaw = sh("git worktree list --porcelain", { cwd: root });
  const worktreeByBranch = {};
  let cur = {};
  for (const line of wtRaw.split("\n")) {
    if (line.startsWith("worktree ")) {
      if (cur.path) {
        // flush forrige
      }
      cur = { path: line.slice(9) };
    } else if (line.startsWith("branch ")) {
      cur.branch = line.slice(7).replace("refs/heads/", "");
      worktreeByBranch[cur.branch] = cur.path;
    }
  }

  const branchLines = sh("git branch -vv", { cwd: root })
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const removed = [];
  for (const line of branchLines) {
    const stripped = line.replace(/^\*\s*/, "").replace(/^\+\s*/, "");
    const branch = stripped.split(/\s+/)[0];
    if (!branch || branch === "main" || branch === currentBranch) continue;

    const worktreePath = worktreeByBranch[branch];

    // hopp over worktree med ulagrede endringer
    if (worktreePath) {
      try {
        const status = sh(`git -C "${worktreePath}" status --porcelain`);
        if (status.trim().length > 0) continue;
      } catch {
        continue;
      }
    }

    let merged = false;
    try {
      sh(`git merge-base --is-ancestor ${branch} main`, { cwd: root });
      merged = true;
    } catch {
      merged = false;
    }

    const remoteGone = /: gone\]/.test(line);

    if (!merged && !remoteGone) continue;

    try {
      if (worktreePath) {
        sh(`git worktree remove "${worktreePath}"`, { cwd: root });
      }
      sh(`git branch -D ${branch}`, { cwd: root });
      removed.push(branch);
    } catch {
      // trygt å hoppe over — ikke kritisk opprydding
    }
  }

  if (removed.length > 0) {
    console.error(`[rydd-etter-merge] Fjernet worktree/gren: ${removed.join(", ")}`);
  }
}

main().catch(() => {});
