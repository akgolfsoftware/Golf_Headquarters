# Designstatus mot koden · 04.10.2026 kl. 21:35

Kilde: GitHub `akgolfsoftware/Golf_Headquarters@main` (fdc180547c11), de 12 siste commitene (portering i dag, Gemini). Designkilde: dette prosjektet.

## Hva er portert i dag
| Gruppe | Skjermer | Designstatus |
|---|---|---|
| PlayerHQ live og runde | PH-04, PH-05, PH-06, PH-07, PH-08, PH-09, PH-15 | Kandidater, gjeldende |
| PlayerHQ Workbench | PH-11 | Kandidat. Valgt retning A–D er ikke kontrollert mot koden |
| PlayerHQ Meg | PH-24 Profil, PH-24 Utstyr | Kandidater, gjeldende |
| AgencyOS Mer | AG-19, AG-21, AG-22, AG-23, AG-24 | Kandidater, gjeldende |
| **Utgått 28.09** | **AG-02 Kø, AG-17 Turneringer, AG-18 TrackMan og video, PH-26 Utenfor banen** | **Skal ikke bygges.** Funksjonen er flyttet til Innboks (AG-04), Workbench/Plan, Spiller 360 › Samtaler og Plan/Meg |

## Avvik
1. **Fire utgåtte skjermer er bygget på nytt.** AG-02 er laget fra `arkiv/2026-09-30/agencyos/screens/AG-02.jsx`, altså en arkivert fil. Repoets `docs/design-system/skjermliste-precision-athletics.md` følger fortsatt oppsettet fra 26.09 (PH-26, AG-02, AG-17 og AG-18 står som aktive). Det var punkt 1–2 i porteringskøen.
2. **Feil godkjenningsstatus i repoet.** `docs/planer/portering-alle-skjermer-2026-10-02.md` sier at «Precision-skjermene er visuelt godkjent av Anders». Det stemmer ikke, for bare PH-01 er godkjent. Eieren står fortsatt som Codex.
3. **Ingenting fra køen 04.10 er portert:** IUP-tilgang, PH-IUP-01/02, PH-11-MAL-IUP, PH-27 «Gruppe», AG-08-IUP 2027 og regi per spiller. `AG08Faner.tsx` viser fortsatt «FINNES IKKE I APPEN ENNÅ» for fireukerssjekken og den gamle skala-teksten.
4. **Tokenavvik i nye filer (stikkprøve PH-26 og AG-02):**
   - `--border-subtle`, `--action-primary`, `--signal-warn` og `--shadow-surface` finnes ikke i tokens. Riktig er `--border-hairline`, `--primary`, `--signal` og ingen kortskygge.
   - Kortradius er 12, men skal være 8 (12 er bare for modal).
   - Kvitteringer (toast) varer 3,5 s og sitter midt øverst. Designet sier 2,6 s og en felles Toaster.
   - Haken er tegnet som «✓»-tegn i stedet for ikon.
   - Faneknappene har `whiteSpace: nowrap`.
   - Meta-tekst på 9,5–10 px, mens minimum er `--type-meta` 11 px.
5. Bruk av ekte personnavn i standarddata er ikke kontrollert. Regelen er bare syntetiske data.

## Anbefaling før neste porteringsøkt
- Stopp portering av utgåtte skjermer. AG-02, AG-17, AG-18 og PH-26 må fjernes eller gjøres om til videresending (porteringskø pkt. 1).
- Oppdater repoets skjermliste og porteringsplan til oppsettet fra 28.09 og godkjenningsstatus «bare PH-01» (pkt. 2).
- Kjør token-sjekken (`scripts/check-token-gap.mjs`) mot ukjente variabler.
- Neste porteringer: pkt. 3–9 og 12 i `overlevering/claude-code.md`.
