# AK Golf Platform — PlayerHQ — Treningsdetalj (post-økt)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/sessions/:id`
- **Arketype:** C — Detail + tabs (4 tabs, post-økt review)
- **Tier-gating:** **Pro**
- **HTML-referanse:** `wireframe/screen-deck/playerhq/treningsdetalj.html`
- **Audit:** `wireframe/audit/playerhq-treningsdetalj.md`
- **Tilhørende modaler:** `ActionableItemsModal`, `ShareWithPeerModal`, `ReflectionLogModal`, `StationDetailModal`, `AgentInsightDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Etter en gjennomført live-økt går spilleren hit for å se sammendrag, øvelser, resultater og notater fra coach. Hovedhandling er `Logg refleksjon` (1-10-skala + tekst) — det er hva som lukker økt-loopen.

## Header-blokk — UNIKT

- **Avatar/ikon:** rounded-lg 64px med Lucide `CheckCircle2` på success-grønn
- **H1:** `TEK 1:1 — Pitch 50-100m` (Geist 28px)
- **Subtittel:** `Med Anders K · 8. mai 14:00 – 15:30 · Mulligan Studio 2`
- **Stat-pills (4):** `2t siden` · `4/4 øvelser` · `1 åpen action` (klikk → ActionableItemsModal) · `Anders K avatar 28px`
- **Primary CTA:** `Logg refleksjon` (lime, åpner ReflectionLogModal)
- **Sekundær:** `Del med peer` (åpner ShareWithPeerModal) · `...`-meny (Eksporter PDF)

## Tab-strip (4 tabs)

| Tab | Innhold |
|---|---|
| **Sammendrag** (default) | "Hva gikk bra" + "Hva må forbedres" + agent-insight |
| **Øvelser** | Liste 4 øvelser med faktisk vs plan |
| **Resultater** | Carry-tabell + Sammenliknet med snitt-bar |
| **Notater** | Coach-notat + spillerens refleksjon |

## Layout — Sammendrag-tab (default)

- **2 hero-cards (12-col):** "Hva gikk bra" (lime accent strip) + "Hva må forbedres" (warning amber strip), hvert med 3 bullet-points
- **Agent-insight panel (12-col):** "Pyramide-agent: Konsistens på 50m forbedret 12 % vs forrige uke" + "Se full agent-rapport →" (åpner AgentInsightDetailModal)
- **Anbefalt neste øvelse-card (8-col):** "Sand-shot 30m fra grøntside" med "Se økt-detaljer →"
- **Coach-notat-snippet (4-col):** italic Instrument Serif quote + `Les hele notatet →`

## Layout — Resultater-tab

Carry-tabell, kolonner: `Slag | Klubb | Carry | Spin | Mål-distanse | Avvik`. 4 rader klikkbare → StationDetailModal.

Under: "Sammenliknet med snitt"-bar (progress-bar med din verdi vs gruppens snitt).

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| `Logg refleksjon` CTA | default, hover, loading, success-toast |
| `Del med peer` | default, hover, modal-trigger |
| Action-strip "1 åpen action" | klikk → ActionableItemsModal |
| Carry-tabell-rad | default, hover, klikk → StationDetailModal |
| Agent-insight panel | klikk → AgentInsightDetailModal |
| `Les hele notatet →` | default, hover (underline) |

## Empty / loading / error

- **Empty (rå økt uten notater):** "Anders har ikke skrevet notat ennå. Sjekk tilbake senere."
- **Per tab empty:** Kontekst-spesifikk dempet ikon + tekst
- **Loading:** Skeleton hero-cards + carry-tabell
- **Refleksjon-logget:** Toast "Refleksjon lagret" + endre primary CTA til `Endre refleksjon`

## Eksempel-data

- **Økt:** TEK 1:1 — Pitch 50-100m, 8. mai 2026
- **Coach:** Anders Kristiansen
- **Sted:** Mulligan Studio 2
- **Hva gikk bra:** Kontakt på 70m, balanse i finish, tempo
- **Hva må forbedres:** Spin-konsistens på 100m, lav ball-flight på 50m
- **Carry-data:** 4 rader (Wedge, Pitching, 9-jern, Sand)

## Ønsket output fra Claude Design

1. Lyst tema, Sammendrag-tab default
2. Mørkt tema, samme
3. Tab-bytte til Resultater (carry-tabell)
4. ReflectionLogModal åpen (1-10 slider + tekstarea)
5. Empty: rå økt
6. Refleksjon-logget-state (CTA endret)
7. Mobil ≤640px — hero-cards stables, tabs scroll horisontalt

## Ikke-mål

- Ikke designe `ReflectionLogModal`, `ShareWithPeerModal` (egne pakker)
- Ikke designe live-session (egen Fase 5)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
