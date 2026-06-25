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
echo "## Step 4b: adversarial diff (sub-agent review)" | tee -a "$SCRATCH/verification-manifest.log"
{
  echo "# CMD: node scripts/workbench-adversarial-diff.mjs $SCRATCH/wb-gate $SCRATCH/verification-manifest.log"
  node scripts/workbench-adversarial-diff.mjs "$SCRATCH/wb-gate" "$SCRATCH/verification-manifest.log"
  echo "EXIT:0"
} >>"$SCRATCH/wb-gate/adversarial-diff.log" 2>&1
if ! grep -q '0 undocumented deviations' "$SCRATCH/wb-gate/adversarial-diff.md" 2>/dev/null; then
  echo "adversarial-diff.md MISSING verdict" | tee -a "$SCRATCH/verification-manifest.log"
  exit 1
fi
if ! grep -q 'ADVERSARIAL_AGENT' "$SCRATCH/wb-gate/adversarial-diff.md" 2>/dev/null; then
  echo "adversarial-diff.md MISSING agent review marker" | tee -a "$SCRATCH/verification-manifest.log"
  exit 1
fi
echo "adversarial-diff.md agent review OK" | tee -a "$SCRATCH/verification-manifest.log"

echo "" | tee -a "$SCRATCH/verification-manifest.log"
echo "## Step 5: locked decisions evidence (from gate)" | tee -a "$SCRATCH/verification-manifest.log"
if [[ -f "$SCRATCH/wb-gate/locked-decisions.log" ]]; then
  cp "$SCRATCH/wb-gate/locked-decisions.log" "$SCRATCH/locked-decisions.log"
  echo "locked-decisions.log copied from wb-gate EXIT:0" | tee -a "$SCRATCH/verification-manifest.log"
else
  echo "locked-decisions.log MISSING from wb-gate" | tee -a "$SCRATCH/verification-manifest.log"
  exit 1
fi

echo "" | tee -a "$SCRATCH/verification-manifest.log"
echo "## Manifest PASS/FAIL" | tee -a "$SCRATCH/verification-manifest.log"
MANIFEST_FAIL=0
FLOW_LOG="$SCRATCH/wb-gate/workbench-flow.log"

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "MANIFEST_MISSING file=$1" | tee -a "$SCRATCH/verification-manifest.log"
    MANIFEST_FAIL=1
  fi
}

require_pattern() {
  local file="$1" pattern="$2" label="$3"
  if [[ ! -f "$file" ]] || ! grep -qE "$pattern" "$file"; then
    echo "MANIFEST_MISSING pattern=$label in $file" | tee -a "$SCRATCH/verification-manifest.log"
    MANIFEST_FAIL=1
  else
    echo "MANIFEST_OK $label" | tee -a "$SCRATCH/verification-manifest.log"
  fi
}

require_file "$SCRATCH/build-verify.log"
require_file "$SCRATCH/smoke.log"
require_file "$SCRATCH/unit-tests.log"
require_file "$SCRATCH/locked-decisions.log"
require_file "$SCRATCH/wb-gate/adversarial-diff.md"
require_file "$FLOW_LOG"

require_pattern "$FLOW_LOG" 'MOVE_DRAG_BEFORE' 'MOVE_DRAG_BEFORE'
require_pattern "$FLOW_LOG" 'MOVE_DRAG_POINTER' 'MOVE_DRAG_POINTER'
require_pattern "$FLOW_LOG" 'MOVE_DRAG_AFTER.*pointer=true.*PASS' 'MOVE_DRAG_AFTER'
require_pattern "$FLOW_LOG" 'PUBLISH_BEFORE' 'PUBLISH_BEFORE'
require_pattern "$FLOW_LOG" 'PUBLISH_AFTER.*PASS' 'PUBLISH_AFTER'
require_pattern "$FLOW_LOG" 'PUBLISH_CLICK' 'PUBLISH_UI'

PNG_COUNT="$(find "$SCRATCH/wb-gate" -maxdepth 1 -name '*.png' 2>/dev/null | wc -l | tr -d ' ')"
if [[ "${PNG_COUNT:-0}" -lt 10 ]]; then
  echo "MANIFEST_MISSING png_count=$PNG_COUNT (need >=10)" | tee -a "$SCRATCH/verification-manifest.log"
  MANIFEST_FAIL=1
else
  echo "MANIFEST_OK png_count=$PNG_COUNT" | tee -a "$SCRATCH/verification-manifest.log"
fi

BUNDLE_TS="$(head -1 "$SCRATCH/verification-manifest.log" | sed 's/.*— //')"
DIFF_TS="$(grep -m1 'step 4' "$SCRATCH/wb-gate/adversarial-diff.md" 2>/dev/null || true)"
if [[ -n "$BUNDLE_TS" && -n "$DIFF_TS" && "$DIFF_TS" != *"$BUNDLE_TS"* ]]; then
  echo "MANIFEST_WARN adversarial-diff timestamp may differ from bundle ($BUNDLE_TS)" | tee -a "$SCRATCH/verification-manifest.log"
fi

if [[ "$MANIFEST_FAIL" -ne 0 ]]; then
  echo "MANIFEST:FAIL" | tee -a "$SCRATCH/verification-manifest.log"
  exit 1
fi
echo "MANIFEST:PASS" | tee -a "$SCRATCH/verification-manifest.log"

echo "DONE verification bundle → $SCRATCH" | tee -a "$SCRATCH/verification-manifest.log"