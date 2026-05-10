# Mini-batches for Batch-5 (Fullscreen / Live)

12 design-pakker delt i 2 mini-batches. Kjør én sesjon per mini-batch i claude.ai/design.

## Rekkefølge og innhold

| Mini-batch | Antall | Innhold | Mønster |
|---|---|---|---|
| **5-A** | 6 | PlayerHQ Live (3) + CoachHQ fullscreen (3) | Fullscreen, mørk bg, store tap-targets, counter-typografi |
| **5-B** | 6 | Tverrgående fullscreen (2) + Live Session 4-modal (4) | Pipeline-visualisering + live-flyt mellom 4 modaler |

## Filer per mini-batch

For hver `5-X` finnes 3 filer:

- `5-X.md` — **Konsolidert spec** (ASCII-sanitised, lastes opp i Claude Design)
- `5-X-prompt.md` — **Custom prompt** (kopieres inn som første melding i sesjonen)
- `5-X-vedlegg.txt` — **Liste over HTML-filer** å laste opp som visuelle vedlegg

## Bruk

### Steg 1 — Start ny Claude Design-sesjon per mini-batch

Per mini-batch (start på 5-A først):

1. Åpne **`5-A-vedlegg.txt`** i editor — gir deg klikkbare filstier
2. Last opp i Claude Design:
   - System-kontekst (engang per session): `branding-style-guide.html` + `design-system-v2.md` + alle 20 fonter fra `for-claude-design/fonts/`
   - Mini-batch-spec: `5-A.md`
   - Alle HTML-vedlegg listet i `5-A-vedlegg.txt`
3. Åpne **`5-A-prompt.md`**, kopier hele PROMPT-blokken
4. Lim inn som første melding i Claude Design

### Steg 2 — Generer 6-og-6 i én sesjon

Claude Design genererer Pakke 1 → viser → går videre til Pakke 2 uten å vente.
Etter alle 6 i mini-batchen er klare, reviewer du samlet og godkjenner eller flagger feil.

### Steg 3 — Pilot-gate på Live Session 4-modal-pakken

**5-B er pilot for live-flyten.** Etter 5-B er ferdig, evaluer:
- Henger de 4 modalene visuelt sammen (intro → active → between → summary)?
- Føles transitions naturlige?
- Er counter-typografi konsistent på tvers?

Hvis JA → batch-5 er APPROVED.
Hvis NEI → flagg avvik per modal, jeg justerer og re-sender.

## ASCII-sanitised

Alle filene i denne mappen er sanitised (ingen UTF-8-tegn som æ/ø/å, em-dash, smart quotes, box-drawing) — for å unngå Claude Designs encoding-bug. Norske tegn er erstattet med ae/oe/aa.

## Spesielt for batch-5: Fullscreen-instruksjon

Alle pakker i denne batchen MÅ eksplisitt instruere Claude Design om:
- **Fullscreen — ingen sidebar, ingen top-bar med navigation**
- Mørk bakgrunn (`#0A1F18` eller helt `#000`)
- Store tap-targets (min 44×44px, primær CTA 88px høy)
- "Avslutt" / "Lukk" alltid topp-høyre 40×40px sirkel
- Live-counter sentrert med JetBrains Mono store tall

Dette er gjentatt i hver mini-batch-prompt for å sikre at Claude Design ikke faller tilbake til arketype-A/B-layout med sidebar.
