#!/bin/bash
# meg-index.sh — wrapper for meg-index-vaults.ts (kalles av LaunchAgent).
# Kjører indekseringen i prosjektmappen så .env.local + tsx er tilgjengelig.
set -euo pipefail

PROJECT_DIR="$HOME/Developer/akgolf-hq"
cd "$PROJECT_DIR"

/opt/homebrew/bin/npx tsx scripts/meg-index-vaults.ts
