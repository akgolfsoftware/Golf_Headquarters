# Mini-batches for Batch-2 (List + filter)

22 design-pakker delt i 4 mini-batches. Kjør én sesjon per mini-batch i claude.ai/design.

## Rekkefølge og innhold

| Mini-batch | Antall | Innhold | Mønster |
|---|---|---|---|
| **2-A** | 5 | CoachHQ kjerne — Elever, Plans, Approvals, Bookings, Sessions | Tabell + filter + bulk-actions |
| **2-B** | 5 | CoachHQ drift — Services, Locations, Team, Groups, Tournaments | Cards/grid + CRUD |
| **2-C** | 5 | PlayerHQ kjerne — Ovelser, Tester, Runder, TrackMan, Baner | Tabell/grid + tier-gating |
| **2-D** | 7 | PlayerHQ coach + 4 modaler | Modal-design samlet |

## Filer per mini-batch

For hver `2-X` finnes 3 filer:

- `2-X.md` — **Konsolidert spec** (ASCII-sanitised, lastes opp i Claude Design)
- `2-X-prompt.md` — **Custom prompt** (kopieres inn som første melding i sesjonen)
- `2-X-vedlegg.txt` — **Liste over HTML-filer** å laste opp som visuelle vedlegg

## Bruk

### Steg 1 — Start ny Claude Design-sesjon per mini-batch
Per mini-batch (start på 2-A først):

1. Åpne **`2-A-vedlegg.txt`** i editor — gir deg klikkbare filstier
2. Last opp i Claude Design:
   - System-kontekst (engang per session): `branding-style-guide.html` + `design-system-v2.md` + alle 20 fonter fra `for-claude-design/fonts/`
   - Mini-batch-spec: `2-A.md`
   - Alle HTML-vedlegg listet i `2-A-vedlegg.txt`
3. Åpne **`2-A-prompt.md`**, kopier hele PROMPT-blokken
4. Lim inn som første melding i Claude Design

### Steg 2 — Generer 5 (eller 7) skjermer av gangen
Claude Design genererer Pakke 1 → viser → venter på "neste"

Du sier "neste" mellom hver. Etter alle skjermer i mini-batchen er klare, reviewer du samlet og godkjenner eller flagger feil.

### Steg 3 — Pilot-gate
**2-A er pilot for hele batch-2-mønsteret.** Etter 2-A er ferdig, evaluer:
- Fungerer 5-og-5-rytmen?
- Er kontekst beholdt over hele sesjonen?
- Er kvaliteten konsistent?

Hvis JA → kjør 2-B, 2-C, 2-D etter samme oppskrift.
Hvis NEI → si fra, jeg justerer strategien før neste mini-batch.

## ASCII-sanitised

Alle filene i denne mappen er sanitised (ingen UTF-8-tegn som æ/ø/å, em-dash, smart quotes, box-drawing) — for å unngå Claude Designs encoding-bug. Norske tegn er erstattet med ae/oe/aa.
