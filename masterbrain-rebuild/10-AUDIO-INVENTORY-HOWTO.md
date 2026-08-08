# 10 — Audio inventory: video → hva kan bli tekst

**Script (kanonisk):**  
`/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH/MORAD_DATA/scripts/inventory_audio.py`

**Output:**  
`/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH/MORAD_DATA/01_inventory/`

| Fil | Innhold |
|-----|---------|
| `audio_inventory.csv` | Alle skannede filer |
| `audio_priority_queue.csv` | P1–P3 med lyd, klar for Whisper |
| `audio_inventory_summary.md` | Sammendrag |
| `audio_inventory_state.json` | Resume (kan kjøres på nytt uten å starte forfra) |

Speil-wrapper i HQ: `masterbrain-rebuild/scripts/inventory_audio.py`

---

## Kjør

```bash
cd "/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH/MORAD_DATA/scripts"

# 1) Prioritet (Skype + Reference + DVD) — start her
python3 inventory_audio.py --profile priority

# 2) Flere speech-mapper (uten MORAD Main 370G)
python3 inventory_audio.py --profile speech

# 3) Full (timer–dager på USB)
python3 inventory_audio.py --profile full
```

**Resume:** Kjør samme kommando på nytt — ferdige paths hoppes over.  
**Force:** `--force` prober alt på nytt.  
**Begrens:** `--limit 100` for test.  
**Uten ffmpeg:** `--no-probe` (kun heuristikk).

ffmpeg: scriptet bruker imageio_ffmpeg i `scripts/venv` hvis PATH mangler.

---

## Prioritetskoder

| Kode | Betydning |
|------|-----------|
| **P1** | Forelesning/practice med lyd — transkriber først |
| **P2** | Skype, kortere tale, store filer med lyd |
| **P3** | Personlig / ukjent med lyd |
| **P4** | Lav (sving med lyd, arkiv) |
| **SKIP** | Ingen lyd, allerede tekst, modell-sving, for kort |

---

## Etter inventar

1. Les `audio_inventory_summary.md`
2. Transkriber køen med eksisterende Whisper-pipeline
3. Destiller til dokumenter / Masterbrain raw + rag
4. **Ikke** auto-fyll drills.json

---

## Status 2026-08-07

- Smoke-test: 23 Skype `.audionote` → alle `has_audio=True`, prioritet P2
- transcript file_ids funnet: ~313
- Priority-profile full scan startet i bakgrunn (log: `10_logs/inventory_audio_priority_run.log`)
