# Batch 7 — Other + tverrgående (Arketype G)

**Antall pakker:** 42 (17 spesial-skjermer + 25 tverrgående katalog-flater)
**Status:** Klar for claude.ai/design
**Estimert tid:** 8–11 timer fordelt på 8 mini-batches

## Hvorfor denne batchen nå

Dette er restposten — alt som ikke passer inn i arketypene A–F, pluss tverrgående katalog-flater som dokumenterer hele plattformens visuelle systemer (modaler, ikoner, error-states, design-tokens, sidebar-mønstre osv). Etter batch 1–6 har vi etablert dashboards, lister, detaljer, wizards, fullscreen og settings. Det som gjenstår er enten **spesialvisninger** (kalendere, kapasitets-grids, finance-konsoll, audit-logg) eller **interne katalog-sider** som samler eksempler fra hele plattformen i ett dokument.

Når denne batchen er ferdig har vi designspec for **alle 62 wireframede skjermer** og kan gå over til implementasjon i de fire produkt-repoene (`akgolf-website`, `akgolf-booking`, `akgolf-playerhq`, `akgolf-coachhq`).

## Arketype G — felles spec (gjelder alle 42 pakker)

Arketype G er ikke ett mønster — det er **paraplyen for "alt annet"**. Hver pakke beskriver sitt eget unike layout. Likevel finnes felles regler for å holde batchen visuelt konsistent med de seks tidligere arketypene.

### To hovedformer

1. **Spesial-visninger (17 stk):** Egne IA-er for kalendere, grids, finance-konsoll, audit, kart-baserte visninger, daglig-brief, leaderboard, varslingssentral. Hver har layout som er beskrevet per pakke.

2. **Tverrgående katalog-flater (25 stk):** Sider som viser **mange eksempler på samme tema** — alle modal-typer, alle error-state-eksempler, alle empty-states, alle ikoner, alle design-tokens. Format: header + filter (ofte) + grid-av-eksempler. Brukt internt som referanse for designere og utviklere.

### Layout for katalog-flater (tverrgående)

```
+--------------------------------------------------+
|  Sidebar  |  Hero (italic editorial title)       |
|           +--------------------------------------+
|           |  Intro (1-2 setninger om hva siden  |
|           |  dokumenterer)                       |
|           +--------------------------------------+
|           |  Filter / kategori-tabs (valgfritt)  |
|           +--------------------------------------+
|           |  Grid med eksempler                  |
|           |  +---------+  +---------+  +-------+ |
|           |  | Eksempel|  | Eksempel|  | ...   | |
|           |  | + label |  | + label |  |       | |
|           |  +---------+  +---------+  +-------+ |
|           +--------------------------------------+
|           |  Footer-link tilbake til oversikt    |
|           +--------------------------------------+
```

### Fellestrekk på tvers

- **Hero alltid italic Instrument Serif** (samme som batch 1–6) med editorial fragment, aldri "Velkommen, …".
- **Lyst tema default**, mørkt tema som speilet variant.
- **8pt-grid for spacing.** Aldri `p-1`, `p-3`, `p-5`, `p-7`, `p-9`.
- **Lucide-ikoner**, 1.75 stroke, alltid `currentColor`.
- **Maks 3 lime-elementer (#D1F843)** synlig per skjerm.
- **Norsk bokmål** (æ, ø, å), **komma som desimal** (12,4 ikke 12.4), **mellomrom som tusenseparator** (1 600 kr ikke 1,600).
- **24-timer**, ISO-dato i datapunkter ("11. mai 2026").
- **Asymmetrisk layout** når relevant — ikke 3×1 uniform-grid hvis innholdet kan rytmiseres.

### Spesial-visninger — kalendere og grids

Flere pakker (1, 2, 9, 14) bruker tids-grid (uke-kalender) eller kapasitets-grid. Felles regler:

- **Tidsblokker fra 06:00 til 22:00**, 30-min slots
- **"Naa"-linje (rød horisontal)** på dagens dato/klokkeslett
- **Pyramide-stripe** (4px venstre på blokk) hvis økt har FYS/TEK/SLAG/SPILL/TURN-fokus
- **Klikk på blokk → quick-popover** med detaljer + 2 aksjoner
- **Klikk på tom slot → modal** med pre-fylt tid

### Empty / loading / error / count-states

- **Empty:** Sentrert ikon + tekst + CTA. F.eks. "Ingen audit-events ennå. Brukeraktivitet vises her etterhvert."
- **Loading:** Skeleton som matcher faktisk layout (ikke generic).
- **Error:** Per-seksjon-error med retry, aldri full-screen-rød.
- **Count:** "Viser 24 av 38 modaler" når filter er aktivt.

### Mobil-versjon

- **Spesial-visninger:** Tids-grid blir 1-dag-view, kart blir kort-liste, finance-tabeller scroller horisontalt.
- **Katalog-flater:** Grid kollapser fra 3- til 1-kolonne, filter blir bottom-sheet, alle eksempler beholdes.

### Responsive breakpoints

- Desktop: ≥1024px — full layout
- Tablet: 768–1023px — kondensert
- Mobil: ≤640px — én-kolonne

---

## Per-skjerm-pakker (42)

### Other-skjermer (17) — special-views

#### CoachHQ (12)
1. `01-coachhq-kalender.md` — Coach-kalender (uke-grid med pyramide-stripes)
2. `02-coachhq-kapasitet.md` — Kapasitets-grid (fasilitet × tid)
3. `03-coachhq-finance.md` — Finance-konsoll (utvidet)
4. `04-coachhq-facilities.md` — Fasiliteter (utvidet detail)
5. `05-coachhq-reports.md` — Rapporter (cards-grid)
6. `06-coachhq-audit.md` — Revisjonslogg (timeline)
7. `07-coachhq-locations.md` — Lokasjoner (utvidet detail-view)
8. `08-coachhq-oppfolgingsko.md` — Oppfølgings-kø (board-style)
9. `13-coachhq-meldinger.md` — Meldinger (chat-panel)
10. `14-coachhq-daglig-brief.md` — Daglig brief (morgen-rapport)
11. `15-coachhq-analytics-v2.md` — Analytics V2 (stallen samlet)
12. `16-coachhq-spiller-detalj.md` — Spiller-detalj (light variant)

#### PlayerHQ (4)
9. `09-playerhq-tren-kalender.md` — Treningskalender
10. `10-playerhq-baner.md` — Baner (kart + liste utvidet)
11. `11-playerhq-meg-help.md` — Hjelp + support
12. `12-playerhq-mal-leaderboard.md` — Mål-leaderboard (utvidet)

#### Shared (1)
17. `17-shared-varslingssentral.md` — Varslingssentral

### Tverrgående hovedflater (25)

18. `18-shared-agent-pipeline-overview.md` — Agent-pipeline arkitektur
19. `19-shared-periodiserings-agent.md` — Periodiserings-agent dyp-dykk
20. `20-shared-modal-katalog.md` — Modal-katalog (alle modaler)
21. `21-shared-cbac-matrise.md` — CBAC matrise (rolle × capability)
22. `22-shared-datakilder-matrise.md` — Datakilder-matrise
23. `23-shared-signal-typer.md` — Signal-typer-katalog
24. `24-shared-plan-aksjon-typer.md` — Plan-aksjon-typer
25. `25-shared-design-tokens.md` — Design-tokens viewer
26. `26-shared-tilgangskontroll.md` — Tilgangskontroll
27. `27-shared-import-assistent.md` — Import-assistent (GolfBox/CSV)
28. `28-shared-error-modal-katalog.md` — Error-modal-katalog
29. `29-shared-loading-skeletons.md` — Loading-skeletons-katalog
30. `30-shared-confirm-dialogs.md` — Confirm-dialogs-katalog
31. `31-shared-inline-editing.md` — Inline-editing-mønstre
32. `32-shared-eksport-funksjoner.md` — Eksport-funksjoner
33. `33-shared-mobile-gestures.md` — Mobile gestures-katalog
34. `34-shared-empty-states.md` — Empty-states-katalog
35. `35-shared-toast-system.md` — Toast-system
36. `36-shared-sidebar-patterns.md` — Sidebar-mønstre
37. `37-shared-topbar-breadcrumbs.md` — Topbar + breadcrumbs
38. `38-shared-onboarding-full.md` — Onboarding-flyt (full)
39. `39-shared-facility-manager.md` — Facility manager
40. `40-shared-innstillings-layout.md` — Innstillings-layout (felles)
41. `41-shared-notifikasjons-taxonomy.md` — Notifikasjons-taksonomi
42. `42-shared-modal-katalog.md` — Modal-katalog (referanse-indeks)

## Slik bruker du hver pakke

1. Last opp `branding-style-guide.html` + `design-system-v2.md` som system-kontekst (én gang per session)
2. Per pakke: åpne `0X-{navn}.md`, last opp tilhørende HTML-wireframe, kopier prompt, iterer
3. Lim design-link tilbake til Claude Code

## Mini-batches

Batchen kjøres i 8 mini-batches á ca 5–7 pakker. Se `mini-batches/README.md`.

| Mini-batch | Pakker | Tema |
|---|---|---|
| 7-A | 1–5 | CoachHQ kalender/kapasitet/finance/facilities/reports |
| 7-B | 6–10 | Audit/locations/oppfolgingsko/PlayerHQ kalender/baner |
| 7-C | 11–15 | PlayerHQ help/leaderboard + CoachHQ meldinger/brief/analytics |
| 7-D | 16–20 | Spiller-detalj + tverrgående 1–4 |
| 7-E | 21–25 | Tverrgående 5–9 (CBAC, datakilder, signal, plan-aksjon, tokens) |
| 7-F | 26–30 | Tverrgående 10–14 (tilgang, import, error, loading, confirm) |
| 7-G | 31–35 | Tverrgående 15–19 (inline, eksport, gesture, empty, toast) |
| 7-H | 36–42 | Tverrgående 20–25 (sidebar, topbar, onboarding, facility, settings, notif, modal-indeks) |

## Gate

Alle 42 pakker må være `APPROVED` før vi avslutter design-fasen og går til implementasjon.
