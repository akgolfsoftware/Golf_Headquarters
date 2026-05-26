# Batch 1 — Dashboard (Pilot)

**Antall pakker:** 5
**Status:** Klar for claude.ai/design
**Estimert tid:** 2–3 timer

## Hvorfor pilot

Disse 5 skjermene tester arketype A (Dashboard). Når Anders er fornøyd med visuell stil, palette-bruk og bento-mønster, ruller vi det videre til Batch 2 (List+filter).

## Rekkefølge

| # | Pakke | Skjerm | Hvorfor først? |
|---|---|---|---|
| 1 | `01-coachhq-hub.md` | CoachHQ Hub | Mest variert bento — tester asymmetri-prinsipp |
| 2 | `02-playerhq-hjem.md` | PlayerHQ Hjem | Konsumentside-counterpart — tester italic editorial greeting |
| 3 | `03-playerhq-mal-oversikt.md` | PlayerHQ Mål-oversikt | Pyramide-progresjon + SG-radar (kompleks viz) |
| 4 | `04-coachhq-analytics.md` | CoachHQ Analytics | Datatung side — tester chart-stil og tabular nums |
| 5 | `05-coachhq-finance.md` | CoachHQ Økonomi | Pengetall — tester JetBrains Mono + status-pills |

## Slik bruker du hver pakke i claude.ai/design

### Engang per session (oppstart) — last opp 2 filer
1. **`wireframe/brain/desktop-import/branding-style-guide.html`** — primær visuell systemreferanse (61 KB interaktiv HTML med alle tokens, knapper, kort, sidebars, motion)
2. **`wireframe/brain/design-system-v2.md`** — tekstlig backup-spec
3. Bekreft i en kort prompt: "Jeg har lastet opp designsystem (branding-style-guide.html + design-system-v2.md). Bekreft at du har lest begge."

### Per skjerm
1. Åpne `0X-{navn}.md`-filen
2. Last opp `screen-deck/{produkt}/{skjerm}.html` som visuell referanse-vedlegg
3. Kopier hele innholdet i `0X-{navn}.md` inn som prompt
4. Iterer
5. Lim **design-link** tilbake til Claude Code (meg)

### Etter alle 5
- Si "Pilot ferdig — godkjent" til Claude Code
- Jeg oppdaterer `design-tracker.md` med `APPROVED`-status og design-links
- Vi committer batch-completion
- Du gir grønt lys for Batch 2

## Anti-AI-regler (gjenta i Claude Design hvis design ser generisk ut)

- ALDRI 3×1 eller 4×1 uniform grid
- ALDRI flat avatar-row som primær-mønster
- ALDRI "Welcome back, [Name]!" — bruk italic editorial greeting
- Maks 3 lime-elementer (`#D1F843`) per skjerm
- Asymmetrisk bento — ett hero + 2–4 støtte i variert størrelse
- Hierarki, bevisst whitespace
