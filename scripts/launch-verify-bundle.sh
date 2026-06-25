#!/usr/bin/env bash
# Full launch verification bundle — writes coherent evidence to SCRATCH dir.
# Usage: SCRATCH=/path/to/implementer bash scripts/launch-verify-bundle.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRATCH="${SCRATCH:-$ROOT/tmp/launch-evidence}"
BASE_URL="${BASE_URL:-http://localhost:3000}"

mkdir -p "$SCRATCH/wb-gate"

echo "# Launch verification bundle — $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee "$SCRATCH/verification-manifest.log"
echo "SCRATCH=$SCRATCH" | tee -a "$SCRATCH/verification-manifest.log"
echo "BASE_URL=$BASE_URL" | tee -a "$SCRATCH/verification-manifest.log"

cd "$ROOT"

echo "" | tee -a "$SCRATCH/verification-manifest.log"
echo "## Step 1: prisma + tsc + build" | tee -a "$SCRATCH/verification-manifest.log"
{
  echo "# CMD: npx prisma validate && npx prisma generate && npx tsc --noEmit && npm run build"
  echo "# Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  npx prisma validate
  npx prisma generate
  npx tsc --noEmit
  npm run build
  echo "EXIT:0"
  echo "# Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} >"$SCRATCH/build-verify.log" 2>&1
if grep -qE '\[@serwist/next\] WARNING|⚠ Warning' "$SCRATCH/build-verify.log"; then
  echo "build-verify.log BUILD_WARNING:FAIL" | tee -a "$SCRATCH/verification-manifest.log"
  exit 1
fi
echo "build-verify.log EXIT:0" | tee -a "$SCRATCH/verification-manifest.log"

echo "" | tee -a "$SCRATCH/verification-manifest.log"
echo "## Step 2: unit tests" | tee -a "$SCRATCH/verification-manifest.log"
{
  echo "# CMD: npm test"
  echo "# Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  npm test
  echo "EXIT:0"
} >"$SCRATCH/unit-tests.log" 2>&1
TESTS_PASS="$(grep -E '^ℹ pass [0-9]+' "$SCRATCH/unit-tests.log" | tail -1 || true)"
echo "unit-tests.log $TESTS_PASS" | tee -a "$SCRATCH/verification-manifest.log"

echo "" | tee -a "$SCRATCH/verification-manifest.log"
echo "## Step 3: smoke-test (prod)" | tee -a "$SCRATCH/verification-manifest.log"
{
  echo "# CMD: bash scripts/smoke-test.sh"
  echo "# Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  bash scripts/smoke-test.sh
  echo "EXIT:0"
} >"$SCRATCH/smoke.log" 2>&1
echo "smoke.log EXIT:0" | tee -a "$SCRATCH/verification-manifest.log"

echo "" | tee -a "$SCRATCH/verification-manifest.log"
echo "## Step 4: workbench gate (Playwright)" | tee -a "$SCRATCH/verification-manifest.log"
rm -f "$SCRATCH/wb-gate/console-final.log" "$SCRATCH/wb-gate/wb-gate-run.log" "$SCRATCH/wb-gate/workbench-flow.log"
{
  echo "# CMD: node scripts/workbench-gate-evidence.mjs $BASE_URL $SCRATCH/wb-gate"
  echo "# Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  node scripts/workbench-gate-evidence.mjs "$BASE_URL" "$SCRATCH/wb-gate"
  echo "EXIT:0"
} 2>&1 | tee "$SCRATCH/wb-gate/console-final.log"
echo "wb-gate EXIT:0" | tee -a "$SCRATCH/verification-manifest.log"

echo "" | tee -a "$SCRATCH/verification-manifest.log"
echo "## Step 5: locked decisions evidence" | tee -a "$SCRATCH/verification-manifest.log"
{
  echo "# CMD: npx tsx scripts/workbench-locked-evidence.ts"
  npx tsx scripts/workbench-locked-evidence.ts "$SCRATCH/locked-decisions.log"
  echo "EXIT:0"
} >>"$SCRATCH/locked-decisions.log" 2>&1 || true

echo "DONE verification bundle → $SCRATCH" | tee -a "$SCRATCH/verification-manifest.log"