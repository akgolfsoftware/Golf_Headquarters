# Remaining after 4h autonomous batch (2026-08-08)

## Must do on Mac (you)
1. Run `push-4h-paper.sh` → push main
2. Wait Vercel READY
3. Hard refresh akgolf.no/portal — confirm Paper Hjem/Plan

## After prod green
- Visual sign-off Hjem/Plan/Analyse mobile 390 + desktop 1280
- W2 wireframes in Claude Design (not in this batch)

## Not bugs
- 8 portal fullscreen pages without `@/components/v2` import still use `components/portal/live` (Paper live PR #311–317) — triage false positive
