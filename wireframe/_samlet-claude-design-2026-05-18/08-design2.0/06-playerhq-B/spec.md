# Mini-batch playerhq-B - Coach-samhandling

**5 skjermer i denne mini-batchen.** Felles moenster: PlayerHQ-flate hvor
spilleren (Markus) ser, leser og handler paa coach-relasjonen (Anders K).
Coach-detalj, coaching-planer (kanban + detalj), og coach-notater (feed + detalj).
Tier-gating er sentralt -- mesteparten er Pro-only med full Free-lock-overlay.

**Generer alle 5 skjermer i denne sesjonen.** Foelg anti-state-katalog-regel
fra `felles-instruks.md` (last opp foerst) -- EEN produksjons-skjerm per HTML,
ikke captioned mini-mockups.

---

## Felles for PlayerHQ-skjermer

- **Sidebar:** LYS, 220px (#FFFFFF), enkelt-lag. Active item: rgba(209,248,67,0.30) bg + #0A1F18 tekst. ALDRI moerk rail som i CoachHQ.
- **Hero:** Italic Instrument Serif 36px observasjons-fragment (aldri "God morgen, Markus" eller "Welcome back"). Eksempel: *"12 notater fra Anders, Markus."*
- **Coach-relasjonen:** Anders Kristiansen er hovedcoach (NGF Trener IV, 12 aar erfaring, 280+ spillere). Avatar med groenn online-prikk eller graa offline. Tom Hansen (Putt-spesialist) og Sara Lien (Mental) er sub-coaches naar det er relevant.
- **Tier-gating:** Free / Pro / Elite. Pro-only-skjermer faar FULL lock-overlay-card med Lucide `Lock` 48px + 3 fordeler + CTA "Oppgrader til Pro ->". Coach-detalj er helt skjult for Free (fanen vises ikke).
- **Pyramide-farger:** FYS groenn `#16A34A`, TEK darker primary `#005840`, SLAG lime accent `#D1F843`, SPILL gold `#F4C430`, TURN graa `#5E5C57`.
- **Notat-typer (pill-farger):** Tilbakemelding (primary), Plan (accent lime), Spoersmaal (warning amber), Video-review (destructive subtil).

---

## Pakker i denne mini-batchen

---

## Pakke 1/5: Coach-detalj

# AK Golf Platform — PlayerHQ — Coach-detalj

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach`
- **Arketype:** C — Detail + tabs (5 tabs, coach-info)
- **Tier-gating:** **Pro** (Free ser ikke coach-fanen i det hele tatt)
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coach-detalj.html`
- **Audit:** `wireframe/audit/playerhq-coach-detalj.md`
- **Tilhørende modaler:** `SessionHistoryModal`, `FocusRatingDetailModal`, `CertificationDetailModal`, `SwapCoachModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Spillerens view av sin(e) coach(er). Hovedcoach er Anders K (28 økter sammen). Sub-coaches kan vises (Markus har 3 coaches totalt). Spilleren kan se profil, sertifiseringer, sende melding, be om økt, eller bytte coach for én konkret økt.

## Header-blokk — UNIKT

- **Avatar:** 64px sirkel med Anders K profilbilde + grønn online-dot
- **H1:** `Anders Kristiansen` (Geist 32px)
- **Subtittel:** `Hovedcoach · NGF Trener IV · 12 år erfaring · Online nå`
- **Stat-pills (4):** `28 økter sammen` (klikk → SessionHistoryModal) · `2 uleste meldinger` · `14:00 neste økt i dag` · `4,9 snitt-fokus / 5` (klikk → FocusRatingDetailModal)
- **Primary CTA:** `Be om økt` (link til `/portal/coach/request`)
- **Sekundær:** `Send melding` (link til `/portal/coach/message` — pakke 15)

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Om** (default) | Bio + spesialiteter + sertifiseringer |
| **Mine økter** | Liste over alle økter med Anders |
| **Meldinger** | Tråd-historikk |
| **Notater** | Coach-notater til meg |
| **Plan** | Aktiv plan av Anders |

## Layout — Om-tab (default)

- **Bio-card (8-col):** Italic Instrument Serif quote om coaching-filosofi + 3 paragraphs Geist
- **Stat-rich (4-col):** "12 år · 280+ spillere · 4,9 ★"
- **Spesialiteter-pills (12-col):** Pyramide-fokus (TEK, SLAG, SPILL) — klikkbare som filter
- **Sertifiseringer-tabell (12-col):** NGF Trener IV, TPI Level 3, TrackMan Master Coach, Mac O'Grady MORAD — klikk-rad → CertificationDetailModal

### Drawer (åpen ved klikk på stat-rich)
- "Andre coacher du kan booke" — 2 alternative coaches (Sara, Tom) som cards
- `Send melding til Anders`
- `Bytt coach for én økt` (åpner SwapCoachModal)
- `Les notatet →` (link til siste notat)

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| Online-dot | static (grønn) / offline (grå) / "siden 14:22" |
| `Send melding` | default, hover, klikk → compose-skjerm |
| `Be om økt` CTA | default, hover, klikk → wishlist-skjerm |
| Spesialitet-pill | default, hover, active (filter) |
| Sertifisering-rad | default, hover, klikk → modal |
| Stat-rich-card | default, hover, klikk → modal/drawer |

## Multi-coach-state

Hvis spiller har flere coaches (som Markus): drawer viser dem som cards med:
- Avatar 32px + navn
- Rolle ("Putt-spesialist Tom Hansen" / "Mental coach Sara Lien")
- `Bytt til denne →` knapp

## Empty / loading / error

- **Empty per tab:** "Ingen meldinger ennå", "Anders har ikke skrevet notat", "Ingen aktiv plan"
- **Offline-state:** Coach offline → grå dot + "Sist sett: i går 18:24"
- **Loading:** Skeleton bio-card + sertifisering-tabell

## Eksempel-data

- **Coach:** Anders Kristiansen
- **Spiller:** Markus Roinås Pedersen
- **Erfaring:** 12 år, 280+ spillere
- **Snitt-fokus:** 4,9/5 (over 28 økter)
- **Sertifiseringer:** NGF Trener IV, TPI Level 3, TrackMan Master, MORAD
- **Andre coacher:** Tom Hansen (Putt), Sara Lien (Mental)

## Ønsket output fra Claude Design

1. Lyst tema, Om-tab default
2. Mørkt tema, samme
3. Drawer åpen med multi-coach-alternativer
4. Tab-bytte til Mine økter
5. Coach offline-state
6. Empty: ingen meldinger
7. Mobil ≤640px — bio + stats stables, sertifisering blir kort

## Ikke-mål

- Ikke designe `SwapCoachModal`, `SessionHistoryModal` (egne pakker)
- Ikke designe compose-skjerm (egen pakke 15)

---

## Pakke 2/5: Coaching-planer (kanban)

# AK Golf Platform — PlayerHQ — Coaching-planer

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach/plans`
- **Arketype:** B — List + filter (kanban-variant)
- **Tier-gating:** **Pro/Elite.** Free ser hele siden med lock-overlay + CTA til `UpgradeToProModal`.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coaching-planer.html`
- **Audit:** `wireframe/audit/playerhq-coaching-planer.md`
- **Tilhørende modaler:** `PlanProposalDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS. Maks 3 lime per skjerm. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren, Anders K. er coach.

## Spec — hva skjermen er for

Coaching-planer er Markus' utsikt over alle treningsplaner Anders K. har laget for ham — fra forslag som venter på godkjenning, til aktive planer han følger nå, til ferdige planer han kan se tilbake på. Skjermen er ukentlig destinasjon for å akseptere/avvise nye planer og sjekke fremdrift.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md`. I tillegg:

- **Hero italic Instrument Serif 36px:** *«1 aktiv plan, Markus. 2 forslag venter.»* Sub: «Anders K. har sendt 2 nye forslag for juni-juli»
- **Ingen KPI-strip** — direkte til kanban
- **Kanban-kolonner (3):**
  - **Foreslått** (2) — accent-prikk i header, må handles på
  - **Aktiv** (1) — primary-prikk, breddest
  - **Ferdig** (5) — collapsed by default, klikk for å vise
- **Plan-kort-spec (full kolonne-bredde, ~280px):**
  - Coach-avatar 24px (Anders K.) øverst-venstre
  - Plan-tittel italic Instrument Serif 18px (eks «Putte-fokus mai»)
  - Periode-pill (JetBrains Mono 11px): «6. mai – 31. mai 2026»
  - Status-pill (kategori-farge): «Foreslått» (accent) / «Aktiv» (primary) / «Ferdig» (muted)
  - Pyramide-fokus-rad: 5 mini-prikker FYS/TEK/SLAG/SPILL/TURN — fylt prikker = vekt
  - Progress-bar (kun Aktiv): 4px, accent-fyll, «64% gjennomført»
  - Footer-CTA: «Detaljer →» → `PlanProposalDetailModal`
- **Foreslått-kort har ekstra:** to pill-knapper «Godta» (accent) + «Avvis» (muted) under «Detaljer →»

## Filter-bar — UNIKT

- Søk: «Søk planer …»
- Chip: **Coach** (Anders K · Sara · Tom — hvis flere coaches)
- Chip: **Periode** — Inneværende · Sesongen · Alt
- Chip: **Pyramide-fokus** — FYS · TEK · SLAG · SPILL · TURN
- Sort: Sist endret (default) · Periode-start · A–Å
- Ingen primary CTA («Ny plan» kommer fra coach, ikke spiller)

## Klikkbare elementer

Se `wireframe/audit/playerhq-coaching-planer.md`. UNIKT:

| Element | States |
|---|---|
| Plan-kort | default, hover (lift + accent-border), klikk → `PlanProposalDetailModal` |
| «Godta»-pill (Foreslått-kort) | default, hover, active, focus, loading (under godkjenning) |
| «Avvis»-pill | default, hover (subtil destructive-tint), klikk → confirm-popover |
| Kanban-kolonne-header | default, hover, count-badge |
| Ferdig-kolonne | collapsed (default), expanded |
| Coach-avatar | default, hover (tooltip «Anders Kristiansen — din coach») |
| Pyramide-fokus-prikk | default, hover (tooltip «TEK 40%») |
| Progress-bar | 0%, 25%, 50%, 75%, 100% (accent når fullført) |
| Lock-overlay (Free) | full skjerm-overlay + lucide `Lock` + CTA «Oppgrader til Pro for personlig coaching →» |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **Empty (Pro, ingen plan):** «Anders K. har ikke sendt deg en plan ennå. Be om plan →» CTA-link
- **Empty per kolonne:** «Ingen planer i {kolonne}» + dempet ikon `ClipboardList`
- **Tier-låst (Free):** Hele siden bak full lock-overlay-card:
  - Lucide `Lock` 48px
  - «Coaching-planer er en Pro-feature»
  - 3 fordeler (personlig plan fra coach, ukentlig progresjon, AI-tilpasset)
  - CTA «Oppgrader til Pro →»
- **Loading:** Skeleton plan-kort (2 i Foreslått, 1 i Aktiv)

## Ønsket output fra Claude Design

1. Hovedskjerm lyst tema (Pro — alle 3 kolonner med data)
2. Hovedskjerm lyst tema (Free — full lock-overlay)
3. Mørkt tema (Pro)
4. Hover på Foreslått-kort med Godta/Avvis-knapper synlige
5. Empty (Pro, ingen plan)
6. Loading
7. Mobil ≤640px — kanban scrollbar horisontalt, kort 280px

## Ikke-mål

- Ikke designe `PlanProposalDetailModal` (egen pakke senere)
- Ikke designe plan-detalj-skjerm (`/portal/coach/plans/:id` — egen batch)
- Ikke endre kolonne-rekkefølge (Foreslått → Aktiv → Ferdig er fast)

---

## Pakke 3/5: Coaching-plan-detalj

# AK Golf Platform — PlayerHQ — Coaching-plan-detalj (spiller-side)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach/plans/:id`
- **Arketype:** C — Detail + tabs (5 tabs, plan fra coach-perspektiv)
- **Tier-gating:** **Pro**
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coaching-detail.html`
- **Audit:** `wireframe/audit/playerhq-coaching-detail.md`
- **Tilhørende modaler:** `PhaseDetailModal`, `PeakReadinessModal`, `RequestPlanChangeModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Spillerens dypere view av en coach-laget plan. Forskjellig fra `treningsplan` (pakke 07) — denne kommer fra coach-fanen og fokuserer på "hva coach har tenkt" (insight + peak-readiness + plan-endring-request). Mer dialog-rettet enn execution-rettet.

## Header-blokk — UNIKT

- **Avatar:** 64px med Anders K + lime accent ring (= aktiv coaching-plan)
- **H1:** `Sommer-toppform` (Instrument Serif italic)
- **Subtittel:** `Coachet av Anders K · 9. mai – 30. juni · Fase 3 av 5`
- **Stat-pills (4):** `13/19 ferdig` (klikk → tab Økter) · `I dag pitch 50-100m` (klikk → økt) · `3d til neste test` · `21d til peak` (klikk → PeakReadinessModal)
- **Primary CTA:** `Start dagens økt` (lime, → `/portal/live/:id`)
- **Sekundær:** `Be om endring` (åpner RequestPlanChangeModal)

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Plan** (default) | Plan-overview + insight |
| **Faser** | 5 phase-cards |
| **Økter** | Ukens 5 økter |
| **Tester** | Tester planlagt |
| **Mål** | Plan-mål + delmål |

## Layout — Plan-tab (default)

### Foran/Bak-skjema-banner (12-col)
Insight-banner: "Du er **2 dager foran** skjema basert på adherence" (lime accent) — eller "Du er 1 dag bak" (warning).

### Plan-overview-card (8-col)
- Plan-tittel + coach
- Periode-stripe med fase-markører
- Progress-bar 64 %
- Primary i card: `Se hele planen →` (link til `/portal/tren/plan` = pakke 07)

### Coach-quote (4-col)
Italic Instrument Serif quote fra Anders: *"Markus, vi har tre uker til Sørlandsåpent. Konsentrer deg om pitch 50-100m — det er hovedforskjellen mellom 5. og 1. plass."*

### Hva du skal gjøre denne uka (12-col)
Tabell med 5 rader (TIL-DO-stil):
| Dag | Hva | Link |
|---|---|---|
| I dag | TEK 1:1 Pitch 50-100m | `/portal/sessions/:id` |
| Tirsdag | Sand-test 30m | `/portal/tren/tester/:id` |
| Onsdag | SPILL 9-hulls | `/portal/sessions/:id` |
| Torsdag | FYS 60min | `/portal/sessions/:id` |
| Fredag | TEK 1:1 Driver-baseline | `/portal/sessions/:id` |

## Layout — Faser-tab

5 phase-cards horisontalt (samme mønster som pakke 07 + 03), klikk → PhaseDetailModal.

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| `Start dagens økt` CTA | default, hover, loading |
| `Be om endring` | default, hover, modal-trigger |
| `21d til peak` | klikk → PeakReadinessModal |
| Phase-card | default, hover, current (accent border), klikk → modal |
| Tabell-rad ukens-økt | default, hover, klikk → økt eller test-skjerm |
| `Send melding til Anders` (drawer) | klikk → compose-skjerm (pakke 15) |

## Empty / loading / error

- **Empty (ingen plan tildelt):** "Anders har ikke laget plan ennå. Be om plan →"
- **Plan-godkjenning-state:** Banner "⏳ Anders har sendt ny plan-versjon — godkjenn?" (åpner PlanApprovalModal)
- **Foran/bak-skjema:** Lime banner (foran) eller warning banner (bak)
- **Loading:** Skeleton coach-quote + tabell

## Eksempel-data

- **Plan:** "Sommer-toppform" av Anders K
- **Spiller:** Markus Roinås Pedersen
- **Status:** 2 dager foran skjema, 64 % gjennomført
- **I dag:** TEK 1:1 Pitch 50-100m
- **Peak:** 12. juni (Sørlandsåpent)

## Ønsket output fra Claude Design

1. Lyst tema, Plan-tab default (foran skjema)
2. Mørkt tema, samme
3. Bak-skjema-state (warning banner)
4. Tab-bytte til Faser
5. Plan-godkjenning-banner state
6. Empty: ingen plan
7. Mobil ≤640px — coach-quote stables, tabell blir kort

## Ikke-mål

- Ikke designe `RequestPlanChangeModal`, `PeakReadinessModal` (egne pakker)
- Ikke designe `treningsplan` (pakke 07)

---

## Pakke 4/5: Coach-notater (feed)

# AK Golf Platform — PlayerHQ — Coach-notater

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach/notes`
- **Arketype:** B — List + filter (feed-variant)
- **Tier-gating:** **Pro/Elite.** Free ser hele siden med lock-overlay + CTA til `UpgradeToProModal`.
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coach-notes.html`
- **Audit:** `wireframe/audit/playerhq-coach-notes.md`
- **Tilhørende modaler:** `ShareWithParentModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. PlayerHQ-sidebar er LYS. Eksakte token-navn — ikke hardkode hex. Markus er referanse-spilleren, Anders K. er coach.

## Spec — hva skjermen er for

Coach-notater er Markus' kronologiske strøm av tilbakemeldinger fra Anders K. — etter live-økter, etter analyse av runder, eller spørsmål Anders har tatt opp. Feed-stilen (ikke tabell) understreker at hver note er rik tekst, ikke en datarad. Brukes daglig av Markus for å holde seg oppdatert.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md`, men erstatt tabell med **feed**. I tillegg:

- **Hero italic Instrument Serif 36px:** *«12 notater fra Anders, Markus.»* Sub: «Sist: i dag 14:32 · 3 nye denne uka»
- **Ingen KPI-strip** — direkte til søk + filter
- **Sticky filter-bar** øverst (forblir synlig ved scroll, 56px høy):
  - Søk-felt: «Søk i notater …»
  - Chip-rad: type-filter
  - Date-range-picker: «Siste 30 dager»
- **Feed-layout:** 12 notat-cards, kronologisk nyeste øverst, full-bredde 720px max
- **Notat-card-spec (variabel høyde, padding 24px):**
  - Header-rad: coach-avatar 32px (Anders K.) + navn (Inter Tight 14px) + dato (JetBrains Mono 12px muted, f.eks. «8. mai 2026 · 14:32»)
  - Type-pill øverst-høyre i header: «Tilbakemelding» (primary) / «Plan» (accent) / «Spørsmål» (warning) / «Video-review» (purple-token)
  - Body: utdrag av notat (Inter 15px, max 3 linjer med fade-out hvis lengre)
  - Footer-rad: lucide-ikon + meta («knyttet til Live-økt 7. mai» eller «runde Borre 5. mai») + «Les mer →»-link
  - Hover: subtil bg-shift + lift 2px

## Filter-bar — UNIKT

- Søk: «Søk i notater …» (med forslag fra `SearchNotesPopover`)
- Chip: **Type** — Tilbakemelding · Plan · Spørsmål · Video-review
- Chip: **Knyttet til** — Live-økt · Runde · Generelt
- Date-range: «Siste 30 dager» (default) — popover med presets
- Sort: Nyeste (default) · Eldste · Type
- Ingen primary CTA (notater opprettes av coach, ikke spiller)

## Klikkbare elementer

Se `wireframe/audit/playerhq-coach-notes.md`. UNIKT:

| Element | States |
|---|---|
| Notat-card | default, hover (lift + bg-shift), klikk → utvid inline / `MessageDetailModal` |
| «Les mer →»-link | default, hover, focus |
| Type-pill | farger per type (Tilbakemelding=primary, Plan=accent, Spørsmål=warning, Video-review=destructive subtil) |
| Coach-avatar | default, hover (popover med Anders' kort-info) |
| Søk-felt | default, focus, with-text, clear-button, no-results, suggest-popover |
| Date-range-picker | default, open, preset-selected, custom-range |
| Lock-overlay (Free) | full skjerm-overlay + lucide `Lock` + CTA «Oppgrader til Pro for coach-notater →» |
| Sticky filter-bar | default, scrolled (subtil shadow under) |

## Empty / loading / error / tier-låst-states

Bruker arketype-B-felles. UNIKT:
- **Empty (Pro, ingen notater):** «Anders K. har ikke skrevet notater ennå. Be om tilbakemelding →»
- **Empty filter:** «Ingen notater matcher filteret. Tilbakestill →»
- **Søk no-results:** «Ingen treff for «{søk}». Prøv et annet ord.»
- **Tier-låst (Free):** Hele siden bak full lock-overlay-card:
  - Lucide `Lock` 48px
  - «Coach-notater er en Pro-feature»
  - 3 fordeler (skriftlig tilbakemelding, video-review-notater, søkbart arkiv)
  - CTA «Oppgrader til Pro →»
- **Loading:** 4 grå skeleton-cards i feed
- **Error:** Per-feed retry

## Ønsket output fra Claude Design

1. Hovedskjerm lyst tema (Pro — full feed, 4 typer pills synlige)
2. Hovedskjerm lyst tema (Free — full lock-overlay)
3. Mørkt tema (Pro)
4. Sticky filter-bar med scroll-state (shadow under)
5. Empty (Pro, ingen notater)
6. Søk aktivt med no-results
7. Mobil ≤640px — feed full bredde, sticky filter konvolverer til «Filter (2) ↓»-knapp

## Ikke-mål

- Ikke designe `ShareWithParentModal` eller `MessageDetailModal` (egne pakker)
- Ikke designe enkelt-notat-skjerm (`/portal/coach/notes/:id` — egen batch)
- Ikke implementere ekte søk-popover — peker til `SearchNotesPopover`-spec

---

## Pakke 5/5: Notater-detalj

# AK Golf Platform — PlayerHQ — Notat-detalj

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach/notes/:id`
- **Arketype:** C — Detail + tabs (4 tabs, notat med tråd)
- **Tier-gating:** **Pro**
- **HTML-referanse:** `wireframe/screen-deck/playerhq/notater-detalj.html`
- **Audit:** `wireframe/audit/playerhq-notater-detalj.md`
- **Tilhørende modaler:** `RelatedNotesModal`, `LinkSessionModal`, `ActionableItemsModal`, `ShareWithParentModal`, `VideoPlayerModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Spilleren leser et coach-notat etter en økt. Notatet kan ha actionable items (sjekkliste), video-vedlegg, og relaterte notater. Spilleren kan markere som lest, kommentere, og dele med foresatte.

## Header-blokk — UNIKT

- **Avatar:** 56px med Anders K + tag "Coach"
- **H1:** `Pitch 50-100m: konsistens-fokus` (Geist 24px, ikke italic — notat-tittel skal være lesbar)
- **Subtittel:** `Skrevet av Anders K · 8. mai 16:42 · Knyttet til økt 8. mai 14:00`
- **Stat-pills (4):** `0 ganger lest` · `3 relaterte notater` (klikk → RelatedNotesModal) · `Knytt til økt 09.05` (klikk → LinkSessionModal) · `2 actionable` (klikk → ActionableItemsModal)
- **Primary CTA:** `Marker som lest` (lime, blir `Markert som lest ✓` etter klikk)
- **Sekundær:** `Del med foresatte` (åpner ShareWithParentModal)

## Tab-strip (4 tabs)

| Tab | Innhold |
|---|---|
| **Notatet** (default) | Notat-tekst med highlights |
| **Relaterte** | 3 relaterte notater |
| **Kommentarer** | Tråd mellom spiller og coach |
| **Vedlegg** | Video + PDF + bilder |

## Layout — Notatet-tab (default)

### Notat-body (8-col)
- Tekstblokk i Geist 16px (line-height 1,7)
- Actionable-tekst med gul markering (Lucide `Highlighter`-ikon ved siden av): "[ ] Tren 4×15min pitch fra 75m hver dag denne uka" + "[ ] Logg refleksjon etter hver runde"
- Quote-blokker fra coach: italic Instrument Serif, accent venstre-border

### Sidebar (4-col)
- Knyttet til økt-card (klikkbar → økt-skjerm)
- Coach-info: Anders K avatar + "Send svar →"
- Tags: TEK · SLAG · pitch-konsistens

## Layout — Kommentarer-tab

Tråd-design:
- Hver kommentar = card (avatar + navn + dato + tekst)
- Spiller-kommentarer høyrejustert (lime bg)
- Coach-kommentarer venstrejustert (default bg)
- Bunn: tekstarea + `Send svar` CTA

## Layout — Vedlegg-tab

Grid 3-kol:
- **Video-thumbnail:** "Pitch-demo 75m.mp4" + duration + Lucide `Play`-overlay → klikk → VideoPlayerModal
- **PDF:** "TPI-rapport 8mai.pdf" + ikon
- **Bilde:** "Setup-foto" + thumbnail

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| `Marker som lest` CTA | default, hover, success-flash, after-state (`Markert ✓`) |
| `Del med foresatte` | default, hover, modal-trigger |
| Action-strip-pill (4 stk) | default, hover, klikk → modal |
| Video-thumbnail | default, hover (play-overlay), klikk → VideoPlayerModal |
| Kommentar-card | default, hover (subtle bg-shift) |
| `Send svar` CTA i kommentar-tab | default, hover, loading, success-toast |
| Relaterte-notat-rad | klikk → andre notat-detalj |

## Empty / loading / error

- **Empty Vedlegg:** "Ingen vedlegg på dette notatet"
- **Empty Relaterte:** "Ingen relaterte notater funnet"
- **Empty Kommentarer:** "Vær først til å kommentere"
- **Lest-state:** Banner endrer fra "Ulest" (warning) til "Lest 8. mai 17:03" (muted)
- **Loading:** Skeleton notat-body + sidebar

## Eksempel-data

- **Notat:** "Pitch 50-100m: konsistens-fokus"
- **Coach:** Anders Kristiansen
- **Spiller:** Markus Roinås Pedersen
- **Dato:** 8. mai 2026 16:42
- **Knyttet økt:** 8. mai 14:00 TEK 1:1
- **Actionable:** 2 (4×15min pitch + logg refleksjon)

## Ønsket output fra Claude Design

1. Lyst tema, Notatet-tab default (ulest)
2. Mørkt tema, samme
3. Lest-state (banner endret)
4. Tab-bytte til Kommentarer (med 3 meldinger)
5. Tab-bytte til Vedlegg (video-thumbnail synlig)
6. ActionableItemsModal åpen
7. Mobil ≤640px — sidebar stables under body

## Ikke-mål

- Ikke designe `VideoPlayerModal`, `ShareWithParentModal` (egne pakker)
- Ikke designe coach-notes-list (i batch 2)
