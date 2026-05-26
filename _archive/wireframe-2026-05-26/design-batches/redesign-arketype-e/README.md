# Redesign Arketype-E — Live, Agenter, Pipeline

**10 skjermer som må redesignes** fordi forrige levering var state-katalog i stedet for produksjons-skjerm.

## Hva som var feil

Live-, agent- og pipeline-skjermene ble levert som "state-katalog" — 5-7 captioned mini-mockups side-om-side på samme HTML-fil. Dette gjorde dem:
- Umulige å implementere som React-komponenter (ingen "korrekt" versjon)
- Visuelt buggy (tekst overlapper, linjer router gjennom labels)
- Konseptuelt forvirrende (empty + populated states blandet sammen)

Detaljert diagnose: se kommenteringen i `felles-instruks.md`.

## 10 skjermer + rekkefølge

### Mini-batch redesign-A — Live Session-flyten (5)
Felles arketype: fullscreen, mørk bg, ingen sidebar.

1. `01-live-session-prompt.md` — PlayerHQ /live/:id (tap-mode)
2. `02-live-tapper-prompt.md` — PlayerHQ range-mode
3. `03-modal-live-intro-prompt.md` — LiveIntroModal
4. `04-edge-live-empty-prompt.md` — Live empty-state
5. `10-klubb-live-scoring-prompt.md` — Klubb live-scoring board

### Mini-batch redesign-B — Agenter & pipeline (5)
Felles arketype: dashboard med kompleks data-visning.

6. `05-playerhq-agent-pipeline-prompt.md` — PlayerHQ pipeline-side
7. `06-shared-agent-pipeline-overview-prompt.md` — Admin overview
8. `07-shared-periodiserings-agent-prompt.md` — Periodiserings-agent UI
9. `08-coach-agent-chat-prompt.md` — AI-chat med agent
10. `09-coachhq-agenter-prompt.md` — Agent-konfig admin

## Slik bruker du hver prompt i Claude Design

### Engang per session
1. Last opp `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. Last opp `wireframe/brain/for-claude-design/design-system-v2.md`
3. Last opp alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. Last opp **`felles-instruks.md`** (denne mappa)
5. Bekreft: "Jeg har lastet opp designsystem + felles-instruks. Bekreft at du har lest begge."

### Per skjerm
1. Åpne `0X-{navn}-prompt.md`
2. Last opp tilhørende eksisterende HTML fra `wireframe/screen-deck/` (IA-referanse)
3. Kopier hele prompten inn i Claude Design
4. Når Claude leverer: sjekk caption-tellingen (skal være 0)
5. Lim design-link tilbake til meg

## Suksess-kriterier

For hver levert skjerm:
- `grep -c "cap-title"` = 0 (ingen state-katalog)
- Skjermen fyller hele viewport (for arketype-E)
- Tekst overlapper ikke
- Linjer/wires går bak tekst-bokser
- Innhold er konkret (Markus, 12,4, "Putte-økt") — ikke placeholder
- Default-state — én tydelig handling synlig

Hvis ikke OK: jeg skriver revisions-prompt, du kjører i Claude Design.

## Etter alle 10 er APPROVED

Klart for React-implementering i:
- `src/app/portal/live/` (Live Session, Tapper)
- `src/app/portal/agents/` (Agent-pipeline player-side)
- `src/app/admin/agents/` (Agent-pipeline overview, Periodiserings-agent, Agent-konfig)
- `src/app/admin/coach-chat/` (AI-chat)
- `src/app/klubb/live-scoring/` (Klubb live-scoring)
