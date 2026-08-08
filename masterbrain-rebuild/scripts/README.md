# Masterbrain rebuild scripts

## `inventory_audio.py`

Kartlegger videofiler på Toshiba-SOURCE for lydspor og prioritet (P1–SKIP).

**Krav:** SOURCE montert (default `/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH`) eller `SOURCE_DIR=...`

```bash
# Fra HQ-repo
python3 masterbrain-rebuild/scripts/inventory_audio.py --profile priority

# Fra disk (valgfritt speil)
cd "/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH/MORAD_DATA/scripts"
python3 inventory_audio.py --profile priority
```

**Profiler:** `priority` | `speech` | `full`

**Output (på disken):**
- `MORAD_DATA/01_inventory/audio_inventory.csv`
- `MORAD_DATA/01_inventory/audio_priority_queue.csv`
- `MORAD_DATA/01_inventory/audio_inventory_summary.md`
- `MORAD_DATA/01_inventory/audio_inventory_state.json` (resume)

Se `../10-AUDIO-INVENTORY-HOWTO.md` og `../09-SOURCE-TIL-MASTERBRAIN-SESSION.md`.
