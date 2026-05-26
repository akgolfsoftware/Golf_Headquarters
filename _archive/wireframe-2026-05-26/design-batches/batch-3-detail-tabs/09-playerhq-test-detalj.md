# AK Golf Platform — PlayerHQ — Test-detalj

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/tren/tester/:id`
- **Arketype:** C — Detail + tabs (3 tabs, test-historikk + projeksjon)
- **Tier-gating:** **Pro** for historikk + projeksjon. Free ser kun siste forsøk.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/test-detalj.html`
- **Audit:** `wireframe/audit/playerhq-test-detalj.md`
- **Tilhørende modaler:** `TestAttemptDetailModal`, `VideoPlayerModal`, `BookSessionModal`, `AgentInsightDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Detaljvisning av én test (f.eks. "Sand-test 30m") med beste resultat, mål, alle forsøk over tid, og agent-insights. Spilleren bruker denne for å se hvor de står og bestemme om de skal kjøre nytt forsøk eller booke trening på testet område.

## Header-blokk — UNIKT

- **Avatar/ikon:** rounded-lg 64px med Lucide `Target` på primary
- **H1:** `Sand-test 30m` (Geist 28px)
- **Subtittel:** `Slag-kategori · Standard NGF-protokoll · 4 forsøk siste 8 uker`
- **Stat-pills (5):** `Beste 7,2` · `Sist 6,8` · `Mål 8,0` · `PR 7,2 ★` · `Forrige 5,8`
- **Primary CTA:** `+ Start nytt forsøk` (åpner `/portal/live/:id/tapper`)
- **Sekundær:** `Eksporter CSV` · `Book sand-tid GFGK` (åpner BookSessionModal)

## Tab-strip (3 tabs)

| Tab | Innhold |
|---|---|
| **Beskrivelse** (default) | Test-protokoll + utstyr + standard |
| **Resultater** | Tabell over alle forsøk + SVG-graf med trend |
| **Insights** | Agent-insight-cards + relaterte tester |

## Layout — Resultater-tab

### SVG-graf (12-col)
Linje-graf, x = dato, y = score. 4 datapunkter + projeksjon-stiplet linje til mål 8,0. Datapunkter klikkbare → DataPointPopover.

### Tabell (12-col)
| Dato | Score | Forhold | Coach | PR? | ... |
|---|---|---|---|---|---|
| 8. mai 2026 | 6,8 | Sand tørr | Anders K | – | ... |
| 1. mai 2026 | 7,2 ★ | Sand våt | Anders K | PR | ... |
| 17. apr 2026 | 6,4 | Innendørs | Anders K | – | ... |
| 3. apr 2026 | 5,8 | Sand tørr | Anders K | – | ... |

Klikk-rad → TestAttemptDetailModal.

### Mål-progress-bar (12-col)
Visuell bar fra 0 til 10, med markører for: nåværende (7,2) + mål (8,0) + peer-snitt (6,4).

## Layout — Insights-tab

3 agent-insight-cards:
- "Konsistens-agent: Du bommer 32 % oftere på våt sand → tren mer i dette forholdet"
- "Trend-agent: +0,8 score på 8 uker — du er på rute mot mål 12. juni"
- "Sammenligning-agent: Du er #3 av 8 i WANG-laget på denne testen"

Hvert kort: ikon + tekst + "Se detaljer →" (åpner AgentInsightDetailModal).

## Free-tier lock-overlay

Pro-features med lock:
- Historikk-tabell viser kun siste forsøk
- SVG-graf-projeksjon dimmet
- Insights-tab helt låst
- Lock-banner: "Test-historikk er Pro. Oppgrader →"

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| `+ Start nytt forsøk` CTA | default, hover, loading |
| `Book sand-tid GFGK` | default, hover, modal-trigger |
| SVG-datapunkt | default, hover (utvid + tooltip), klikk → popover |
| Tabell-rad | default, hover, PR-rad (★ accent), klikk → modal |
| Agent-insight-card | default, hover (lift), klikk → modal |
| `Se video-protokoll →` | default, hover, klikk → VideoPlayerModal |

## Empty / loading / error

- **Empty (0 forsøk):** "Ingen forsøk ennå. Start første for å sette baseline →"
- **Pågår-state:** Warning-pill "Pågår — sluttføres i live-session"
- **Loading:** Skeleton graf + tabell-rader
- **PR-highlight:** Stjerne ★ + lime accent på rad

## Eksempel-data

- **Test:** Sand-test 30m
- **Spiller:** Markus Roinås Pedersen
- **Beste:** 7,2 (1. mai 2026, sand våt)
- **Sist:** 6,8 (8. mai 2026, sand tørr)
- **Mål:** 8,0 innen 12. juni 2026

## Ønsket output fra Claude Design

1. Lyst tema, Resultater-tab med 4 forsøk
2. Mørkt tema, samme
3. Free-tier lock-state
4. Tab-bytte til Insights
5. DataPointPopover åpen på 1. mai (PR 7,2)
6. Empty: 0 forsøk (baseline)
7. Mobil ≤640px — graf full bredde, tabell stables til kort

## Ikke-mål

- Ikke designe `TestAttemptDetailModal`, `VideoPlayerModal` (egne pakker)
- Ikke designe live-tapper (egen Fase 5)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
