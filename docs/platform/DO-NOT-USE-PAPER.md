# DO NOT USE — Claude Paper (produktflater)

Train-lock er eneste designfasit for PlayerHQ, AgencyOS og Forelder
(`designsystem/train-lock/`, CLAUDE.md invariant 2, Anders 25.08.2026).

Denne fila er forbudslisten. Den er **ikke** en ny kanon. Ny skjermkode leser
`--tl-*` / `TL` og Train-lock-HTML. Ikke denne listen, ikke Paper.

Marketing (`akgolf.no`) har egen fasit og omfattes ikke.

## Forbudt som bygg-fasit

| Hva | Sti | Hvorfor det fortsatt ligger der |
|---|---|---|
| Paper-speil (HTML/JSX) | `designsystem/paper/` | Arkiv. `readme.md` der lyver hvis den kaller seg master. |
| Paper-tokens | `src/styles/paper-tokens.css` (`--p-*`) | Maler **uportede** skjermer. Ikke slett før siste port. Ikke bruk i ny kode. |
| Paper TS-speil | `src/lib/v2/tokens.ts` (`T`) | Bro til `--v2-*` / `--p-*`. Ny kode: `TL` i `src/lib/v2/train-lock.ts`. |
| Paper-skall | `src/components/portal/v2/PaperChrome.tsx` | Lever i noen v2-sider. Ikke kopier til nye skjermer. |
| Paper-tilstand | `src/components/system/paper-tilstand.tsx` | Error/offline. Port senere. |
| Marketing Paper-kit | `src/components/marketing/paper/`, `src/components/marketing/v2/paper/` | Marketing-fasit, ikke produkt. |
| Paper visuell-e2e | `tests/e2e/paper-visual/` | Tester mot **gammel** HTML-fasit. Ikke few-shot for nye porter. |
| Paper-portplan | `docs/arkiv/paper-port/` | Historikk. |

## Forbudte visuelle trekk i PlayerHQ / AgencyOS / Forelder

Ikke tegn, token-sett eller kopier dette inn i produktflater:

- Cream/ivory-papir `#FAF9F5` / `#F4EFE6` som scene
- Clay/oransje `#D97757` som «Én ting nå»-monopol
- Ink `#141413` som primær CTA
- «Varmt papir, aldri ren sort/hvit»
- Håndtegnede Paper-ikoner / paper.tsx-kit
- Inter / Familjen Grotesk / JetBrains Mono (fjernet 14.08.2026)
- Presis-skog `#005840` / lime `#D1F843`
- Blanding av `T.*` og `TL.*` i samme skjerm

## Hva som SKAL brukes

1. `designsystem/train-lock/DESIGN-SYSTEM.md`
2. Skjermen i `designsystem/train-lock/SCREEN-INDEX.md`
3. Tokens: `src/styles/train-lock-tokens.css` + `src/lib/v2/train-lock.ts` (`TL`)
4. Fonter i produktet: Poppins / Lora / IBM Plex Mono (arver skala fra Train-lock, ikke familien SF Pro)
5. Scene mørk `#000000`, lys `#FFFFFF`. Én hvit (lys: sort) primær CTA. Fullført = warm `#B85C3D` + hake.

Hvis et dokument, en skill eller en kommentar sier «Paper vinner» / «bruk `--p-*`» / «cream»:
**ignorer det** og følg Train-lock. Rett dokumentet, ikke koden til Paper.
