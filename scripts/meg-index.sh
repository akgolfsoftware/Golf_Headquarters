#!/bin/bash
# meg-index.sh — wrapper for meg-index-vaults.ts (kalles av LaunchAgent).
# Kjører indekseringen i prosjektmappen så .env.local + tsx er tilgjengelig.
set -euo pipefail

PROJECT_DIR="$HOME/Developer/akgolf-hq"
cd "$PROJECT_DIR"

# Trim loggen LaunchAgenten skriver til — behold siste 2000 linjer så den
# ikke vokser ubegrenset (var 5,9 MB med Voyage-429-støy før 2026-07-25).
LOGG="$PROJECT_DIR/scripts/meg-index.log"
if [ -f "$LOGG" ] && [ "$(wc -l < "$LOGG")" -gt 2000 ]; then
  tail -n 2000 "$LOGG" > "$LOGG.tmp" && mv "$LOGG.tmp" "$LOGG"
fi

/opt/homebrew/bin/npx tsx scripts/meg-index-vaults.ts
