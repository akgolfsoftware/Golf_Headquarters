# QWEN.md — AK Golf HQ

Les AGENTS.md og docs/platform/AGENT-BRIEF.md først.

## Design
Fasit: `designsystem/train-lock/` (`DESIGN-SYSTEM.md` → `SCREEN-INDEX.md`).
Ny UI: kun `--tl-*` / `TL`. Scene `#000000`, lys `#FFFFFF`.
Fonter: Poppins / Lora / IBM Plex Mono.

## Forbudt
- `designsystem/paper/` som bygg-fasit eller few-shot
- `T` fra `src/lib/v2/tokens.ts`, `--p-*`, cream `#FAF9F5`, clay-CTA
- Inter / Familjen Grotesk / JetBrains / Inter Tight
- Presis-skog / lime
- `public/design/akhq-tokens.css` inn i produkt
- Notion
- Nye token-filer, nye primitiver som allerede finnes

Marketing (`/` og `/(marketing)`) får beholde Paper. Ikke kopier den til `/portal` eller `/admin`.

## Ferdig
En skjerm er ferdig når Anders har sett den (mobil 390 + desktop, lys + mørk). Token-import er ikke ferdig.

## Denne sessionen
Ikke merge. Ikke Prisma. Ikke port alle skjermer. Én fil eller én skjerm om gangen.
