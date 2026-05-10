# Mini-batches for Batch-3 (Detail + tabs)

23 design-pakker delt i 4 mini-batches. Kjør én sesjon per mini-batch i claude.ai/design.

## Rekkefølge og innhold

| Mini-batch | Antall | Innhold | Mønster |
|---|---|---|---|
| **3-A** | 5 | CoachHQ Detail — 360-profil, Spiller-detalj, Plan-detalj, Plan-edit, Talent | Header + tabs + drawer/edit |
| **3-B** | 5 | PlayerHQ Detail-1 — Treningsplan, Treningsdetalj, Test-detalj, Mål-detalj, TrackMan-analyse | Tier-gating + tabs + insight |
| **3-C** | 5 | PlayerHQ Detail-2 + CoachHQ Lag — Coach-detalj, Coaching-detail, Notater-detalj, Coach-message-compose, Lag-snitt | Coach-relasjon + matrise |
| **3-D** | 8 | Modaler — EditPlan, PlanActionDetail, RoundDetail, RoundInsight, Comparison, MessageDetail, PlanShare, FacilityDetail | Drill-in modaler |

## Filer per mini-batch

For hver `3-X` finnes 3 filer:

- `3-X.md` — **Konsolidert spec** (ASCII-sanitised, lastes opp i Claude Design)
- `3-X-prompt.md` — **Custom prompt** (kopieres inn som første melding i sesjonen)
- `3-X-vedlegg.txt` — **Liste over HTML-filer** å laste opp som visuelle vedlegg

## Bruk

### Steg 1 — Start ny Claude Design-sesjon per mini-batch
Per mini-batch (start på 3-A først):

1. Åpne **`3-A-vedlegg.txt`** i editor — gir deg klikkbare filstier
2. Last opp i Claude Design:
   - System-kontekst (én gang per session): `branding-style-guide.html` + `design-system-v2.md` + alle 20 fonter fra `for-claude-design/fonts/`
   - Mini-batch-spec: `3-A.md`
   - Alle HTML-vedlegg listet i `3-A-vedlegg.txt`
3. Åpne **`3-A-prompt.md`**, kopier hele PROMPT-blokken
4. Lim inn som første melding i Claude Design

### Steg 2 — Generer 5 (eller 8) skjermer av gangen
Claude Design genererer Pakke 1 -> viser -> venter på "neste"

Du sier "neste" mellom hver. Etter alle skjermer i mini-batchen er klare, reviewer du samlet og godkjenner eller flagger feil.

### Steg 3 — Pilot-gate
**3-A er pilot for arketype-C-mønsteret.** Etter 3-A er ferdig, evaluer:
- Sitter tab-strip-mønsteret konsistent?
- Er header-blokken gjenkjennelig på tvers?
- Drawer/modal-grenser tydelige?

Hvis JA -> kjør 3-B, 3-C, 3-D etter samme oppskrift.
Hvis NEI -> si fra, jeg justerer strategien før neste mini-batch.

## ASCII-sanitised

Alle filene i denne mappen er sanitised (ingen UTF-8-tegn som ae/oe/aa, em-dash, smart quotes, box-drawing) — for å unngå Claude Designs encoding-bug. Norske tegn er erstattet med ae/oe/aa.
