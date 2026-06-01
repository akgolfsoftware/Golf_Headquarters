# Runde 4 — AgencyOS Auth + Daglig brief + Stallen (7 skjermer)

> Coach-admin (AgencyOS) — fra login til daglig brief, stallen, spiller-detalj, Coach-Workbench, innboks og kalender.
> Plattform: DESKTOP-first (1440px, sidebar 240px). Mobil 430px for Daglig brief + Innboks (coach mellom timer).
> Master DS: Forest #005840, Lime #D1F843, Cream #FAFAF7, Inter + Inter Tight + JetBrains Mono, 8pt-grid.
> AgencyOS visuell signatur: **MØRK sidebar** (forest-900 #003D2C) + **lys innholdsflate** (cream-50 #FAFAF7).

---

## Innhold

1. /admin/auth/login — Coach login
2. /admin/agencyos — Daglig brief (DASHBOARD HOVEDLANDING) — desktop + mobil
3. /admin/spillere — Stallen (spillerliste-tabell)
4. /admin/spillere/[id] — Spiller-detalj (side-panel slide-over)
5. /admin/spillere/[id]/workbench — Coach-Workbench (role="coach")
6. /admin/innboks — Innboks / handlingskø — desktop + mobil
7. /admin/kalender — Kalender (lese-modus, uke-visning)

---

## Design-tokens (rask referanse for promptene)

```
Bakgrunn (innhold)  : #FAFAF7 (cream-50)
Sidebar bg          : #003D2C (forest-900, mørk)
Sidebar tekst       : #FAFAF7 (cream-50)
Sidebar aktiv-pill  : #D1F843 (lime), tekst #003D2C
Primær (innhold)    : #005840 (forest-700)
Lime accent         : #D1F843
Border              : rgba(15, 41, 80, 0.08)  (rolig)
Hover row           : #F3F1EB (cream-100)
Suksess             : #1F8A4C
Varsel              : #B26A00
Feil                : #B3261E
Font display        : Inter Tight (h1, h2, KPI-tall)
Font tekst          : Inter (body, tabell, etiketter)
Font mono           : JetBrains Mono (klokkeslett, SG, tall i tabell)
Radius              : 12px (kort), 8px (knapp), 6px (input), 999px (pill)
Grid                : 8pt — gap-4 (16), gap-6 (24), gap-8 (32)
Sidebar bredde      : 240px (desktop, sticky)
```

---

# 1) /admin/auth/login — Coach login

**Rute:** `/admin/auth/login`
**Hensikt:** Coach (ikke spiller) logger inn til AgencyOS. Samme stil/struktur som PlayerHQ login (Runde 1), men med tydelig "Coach"-merking og mørk forest-aksent øverst.

## ASCII-wireframe — desktop (1440 × 900)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                       ┌────────────────────────────┐                         │
│                       │  AK Golf  ·  AgencyOS      │ ← tagline forest-700    │
│                       │  Logg inn som coach        │ ← Inter Tight 32        │
│                       │  Bruk din coach-konto      │                         │
│                       │                            │                         │
│                       │  E-post  [_____________]   │ ← input radius 6        │
│                       │  Passord [••••••••••• 👁]  │                         │
│                       │  [       Logg inn       ]  │ ← forest-700 fill       │
│                       │  Glemt passord?            │ ← lenke                 │
│                       │  ── eller ──               │                         │
│                       │  [ Logg inn med Google ]   │ ← outline               │
│                       │  Er du spiller? PlayerHQ → │                         │
│                       └────────────────────────────┘                         │
│                                                                              │
│  © AK Golf Group · Fredrikstad                v1.0 · status: alle systemer  │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Komponenter brukt
- `components-agency-auth-card` (sentrert, 440px maks-bredde, white card, radius 12, shadow-sm)
- `components-input-text` (e-post, passord)
- `components-button-primary` (forest fill)
- `components-button-outline` (Google)
- `components-divider-or` ("eller"-skille)

## States
- **default** — felter tomme, primær-knapp aktiv
- **typing** — passord vises som prikker, øye-ikon for vis/skjul (top-right i input)
- **loading** — knapp viser spinner, felter disabled
- **feil** — rød border på felt, feilmelding under input: "Feil e-post eller passord."
- **låst** — etter 5 forsøk: gul info-bar "Konto låst i 15 min. Prøv igjen kl 09:42."

## Claude Design-prompt

```
Lag en login-skjerm for AgencyOS (coach-admin) på desktop 1440×900.

Sentrert card 440px bredt på cream-50 bakgrunn (#FAFAF7).
Card: hvit (#FFFFFF), radius 12, shadow-sm, padding 40px.

Øverst i card: liten tagline "AK Golf · AgencyOS" i Inter 12px,
forest-700 (#005840), letter-spacing 0.06em, uppercase.

Under tagline: H1 "Logg inn som coach" i Inter Tight 32px,
forest-900 (#003D2C). Subtekst "Bruk din coach-konto" i Inter 14px,
forest-700/70%, marg-bottom 32px.

Felter (alle Inter 14px, radius 6, border rgba(15,41,80,0.12),
height 44px, padding 12px):
- E-post (placeholder "anders@akgolf.no")
- Passord (med øye-ikon høyre side for vis/skjul)

Primærknapp 100% bredde, 48px høyde, forest-700 fill, cream-50 tekst,
radius 8, Inter 15px semibold. Tekst: "Logg inn".

Under knapp: lenke "Glemt passord?" i Inter 13px forest-700, høyrejustert.

Skille: "── eller ──" Inter 12px forest-700/50%, centered, marg 24px.

Sekundærknapp: outline (border forest-700, tekst forest-700), Google-ikon
venstre, tekst "Logg inn med Google".

Helt nederst i card: liten tekst "Er du spiller? Gå til PlayerHQ →"
Inter 12px, forest-700, lenke-stil.

Footer bunn av skjerm: Inter 11px forest-700/60%
"© AK Golf Group · Fredrikstad" venstre, "v1.0 · status: alle systemer" høyre.
Padding 24px.

Bruk 8pt-grid. Fonter: Inter, Inter Tight.
```

---

# 2) /admin/agencyos — Daglig brief (DASHBOARD HOVEDLANDING)

**Rute:** `/admin/agencyos`
**Hensikt:** Første skjerm coachen ser etter login. Skal svare på "Hva må jeg gjøre i dag?" på under 5 sekunder.
**Layout:** 3-kolonne på desktop (timeline + innboks-snippet + fokus-spillere). KPI-strip nederst.

## ASCII-wireframe — desktop (1440 × 900)

```
┌─────────┬──────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  TOPP-BAR: God morgen, Anders · tor 28. mai · 06:42       [🔔3] [AK]    │
│ (mørk)  ├──────────────────────────────────────────────────────────────────────────┤
│ ● Brief │  Daglig brief                                       [Marker alt lest]   │
│ ○ Stallen│                                                                         │
│ ○ Innboks│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐    │
│ ○ Kal   │  │ I DAG · TIMELINE │ │ INNBOKS (3 nye)  │ │ FOKUS-SPILLERE (5)   │    │
│ ○ Workb │  │ 5 timer planlagt │ │                  │ │                      │    │
│         │  │                  │ │ 🔴 Emma · 2t     │ │ [E] Emma  ⬆+0.4 84%  │    │
│ ──      │  │ 08:00 ▌Emma·Putt │ │   "Kan vi flytt" │ │ [L] Lars  ⬇−0.2 62%⚠ │    │
│ [AK]    │  │ 09:30 ▌Lars·Slag │ │ 🟡 Lars · 5t     │ │ [M] Mia   ➡ 0.0 91%  │    │
│ Anders  │  │ 11:00 ▌WANG·Grp  │ │   "Bra økt!"     │ │ [J] Jonas ⬆+0.3 78%  │    │
│ Coach   │  │ 14:00 ▌Jonas·Liv │ │ 🟢 Mia · 1d      │ │ [S] Sofie ⬆+0.5 88%  │    │
│         │  │ 16:00 ▌Sofie·Pu  │ │   Rapport klar   │ │                      │    │
│         │  │                  │ │ [ Se alle (12) ] │ │ [ Åpne stallen → ]   │    │
│         │  └──────────────────┘ └──────────────────┘ └──────────────────────┘    │
│         │                                                                          │
│         │  KPI-STRIP (denne uka)                                                   │
│         │  ┌────────┬────────┬────────┬────────┬────────┐                         │
│         │  │TIMER UK│ØKTER UK│BOOKING │AKTIVE  │ADHEREN.│                         │
│         │  │ 28t    │  34    │  19    │  32    │  76%   │                         │
│         │  │⬆+3     │⬆+5     │➡ samme │spillere│ snitt  │                         │
│         │  └────────┴────────┴────────┴────────┴────────┘                         │
└─────────┴──────────────────────────────────────────────────────────────────────────┘
```

## ASCII-wireframe — mobil (430 × 932)

```
┌──────────────────────────────────┐
│ ☰  AgencyOS         [🔔3] [AK]  │ ← topp-bar 56, forest-900
├──────────────────────────────────┤
│ God morgen, Anders               │ Inter Tight 24
│ torsdag 28. mai · 06:42          │
│                                  │
│ ┌── I DAG · 5 TIMER ───────────┐ │
│ │ 08:00  Emma · Putting        │ │
│ │ 09:30  Lars · Slag           │ │
│ │ 11:00  WANG · Gruppe         │ │
│ │ 14:00  Jonas · Live          │ │
│ │ 16:00  Sofie · Putting       │ │
│ │ [ Åpne kalender → ]          │ │
│ └──────────────────────────────┘ │
│ ┌── INNBOKS (3) ───────────────┐ │
│ │ 🔴 Emma  "Kan vi flytte..."  │ │
│ │ 🟡 Lars  "Bra økt!"          │ │
│ │ 🟢 Mia   Auto-rapport klar   │ │
│ │ [ Se alle (12) → ]           │ │
│ └──────────────────────────────┘ │
│ ┌── FOKUS-SPILLERE (5) ────────┐ │
│ │ [E] Emma  ⬆ +0.4             │ │
│ │ [L] Lars  ⬇ −0.2 ⚠           │ │
│ │ [M] Mia   ➡ 0.0              │ │
│ │ [J] Jonas ⬆ +0.3             │ │
│ │ [S] Sofie ⬆ +0.5             │ │
│ │ [ Åpne stallen → ]           │ │
│ └──────────────────────────────┘ │
│ ┌── UKE-KPI ───────────────────┐ │
│ │ 28t · 34 økter · 19 bk       │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ [Brief*][Innboks][Kal][Mer]      │ ← bunn-tab 64
└──────────────────────────────────┘
```

## Komponenter brukt
- `components-agency-sidebar` (mørk, 240px, sticky, forest-900 bg, lime aktiv-pill)
- `components-agency-topbar` (hilsen + dato + varsel-bjelle + avatar)
- `components-agency-dashboard` (3-kolonne grid 1fr / 1fr / 1fr, gap 24)
- `components-timeline-day` (venstre kolonne — tidslinje med tid + chip per økt)
- `components-inbox-snippet` (midt — siste 3 meldinger med fargeprikk)
- `components-focus-players` (høyre — 5 spillere med SG-trend + pyramide)
- `components-kpi-strip` (nederst, 5 KPI-celler i ett rad-kort)
- `components-mobile-bottomnav` (mobil)

## States
- **default** — alle 3 kolonner fylt, KPI-strip viser tall
- **tomstate (ingen timer i dag)** — timeline: illustrasjon (kalender-ikon forest-700/40%) + tekst "Ingen timer planlagt i dag. Trenger du å booke?" + knapp "Åpne kalender"
- **tomstate (ingen meldinger)** — innboks: ikon (innboks forest-700/40%) + "Innboks tom. Bra jobba."
- **tomstate (ingen fokus-spillere)** — "Ingen fokus-spillere ennå. [Marker en spiller som fokus →]"
- **loading** — skeleton-blokker 3 kolonner: timeline 5×40px rows, innboks 3×60px rows, fokus 5×56px rows; KPI-strip 5×72px celler
- **feil (lasting feilet)** — banner top: "Kunne ikke laste data. [Prøv igjen]"

## Claude Design-prompt

```
Lag dashboard-skjerm "Daglig brief" for AgencyOS coach-admin på desktop 1440×900.

LAYOUT:
- Venstre: sidebar 240px, forest-900 bg (#003D2C), cream-50 tekst,
  sticky, full høyde. Logo "AK · AgencyOS" øverst, padding 24.
  Nav-items: Brief (aktiv), Stallen, Innboks, Kalender, Workbench.
  Aktiv-item: lime-pill (#D1F843) bak teksten, tekst forest-900.
  Inaktive: cream-50/70%, hover: cream-50 + bg forest-700/20.
  Nederst i sidebar: brukerkort [AK] Anders / Coach.

- Innhold: cream-50 bg (#FAFAF7), padding 32px.

TOPP-BAR (i innholdsflaten, 64px høy):
"God morgen, Anders" Inter Tight 28px forest-900,
under "torsdag 28. mai · 06:42" Inter 13px forest-700/70%.
Høyre: bjelle-ikon med rød badge "3", avatar [AK] 36×36 radius full.

H1-rad: "Daglig brief" Inter Tight 32px forest-900,
høyre: knapp "Marker alt lest" outline forest-700, Inter 13px.

3-KOLONNE GRID, gap 24, alle kort: hvit bg, radius 12, padding 24,
border 1px rgba(15,41,80,0.08):

KOLONNE 1 — I DAG · TIMELINE:
Kort-header: "I DAG · TIMELINE" Inter 11px uppercase letter-spacing 0.08em
forest-700/70%. Under: "5 timer planlagt" Inter Tight 20px forest-900.
Tidslinje: vertikal linje 2px forest-200, tidspunkter JetBrains Mono 13px
forest-700 (08:00, 09:30, 11:00, 14:00, 16:00). For hver økt:
chip med vertikal lime-strek 3px venstre + Inter 14px semibold navn +
Inter 12px forest-700/70% under (varighet · sted). Mellomrom 16px mellom økter.

KOLONNE 2 — INNBOKS:
Kort-header: "INNBOKS (3 nye)". 3 rader, hver 64px:
- fargeprikk venstre (rød/gul/grønn 8px), avatar 32×32, navn Inter 14px
  semibold + tidsstempel Inter 11px forest-700/60% høyre,
  meldings-snippet Inter 13px forest-900/80% (én linje, ellipsis).
Hover: bg cream-100. Klikk åpner /admin/innboks med thread valgt.
Nederst i kort: knapp "Se alle (12) →" tekst-knapp forest-700 Inter 13px.

KOLONNE 3 — FOKUS-SPILLERE:
Kort-header: "FOKUS-SPILLERE (5)". 5 rader, hver 72px:
- avatar 36×36 radius full (initialer på lime bg, forest-900 tekst),
- navn Inter 14px semibold,
- under: SG-trend (pil + tall, mono 12px, grønn ⬆ / rød ⬇ / forest-700 ➡)
  + pyramide-prosent Inter 12px forest-700/70%,
- høyre: liten chip "Næste: i dag 08:00" Inter 11px forest-700,
  eller varsel-chip "⚠ adherence-dropp" gul bg, forest-900 tekst.
Skille mellom rader: 1px border-bottom forest-100.

KPI-STRIP (nederst, full bredde under 3-kolonne grid):
Ett kort hvit, radius 12, padding 24, 5 celler horisontalt med
vertikal skille 1px forest-100 mellom. Hver celle:
- Etikett øverst Inter 11px uppercase letter-spacing 0.08em forest-700/70%
  (TIMER UKE, ØKTER UKE, BOOKINGER, AKTIVE spillere, ADHERENCE snitt)
- Stort tall Inter Tight 36px forest-900 (28t, 34, 19, 32, 76%)
- Under: trend Inter 12px (⬆ +3 vs forr / ➡ samme), grønn/forest-700.

Sidebar nederst: liten brukerkort [AK] Anders / Coach, cream-50/80%.

Bruk 8pt-grid. Fonter Inter Tight + Inter + JetBrains Mono.
```

### Mobil-tillegg til prompten

```
MOBIL 430×932:
- Topp-bar 56px forest-900 bg, cream-50 tekst:
  ☰ hamburger venstre, "AgencyOS" senter Inter 15px semibold,
  bjelle (badge 3) + avatar høyre.
- Innhold cream-50 bg, padding 16. Stack vertikalt:
  hilsen-blokk → timeline-kort → innboks-kort → fokus-kort → KPI-kort.
- Alle kort radius 12, padding 20, marg-bottom 16. Inni hvert kort:
  kompakt liste (5 timer / 3 meldinger / 5 spillere) + tekst-knapp
  "Åpne ... →" nederst.
- KPI-kort: én rad horisontalt med 3 mini-KPI (timer / økter / bookinger),
  separert med dot · — ikke 5 stk på mobil.
- Bunn-tab 64px med 4 ikoner: Brief (aktiv lime), Innboks, Kalender, Mer.
```

---

# 3) /admin/spillere — Stallen (spillerliste-tabell)

**Rute:** `/admin/spillere`
**Hensikt:** Coach ser alle spillere i ett blikk — kan filtrere på gruppe, sortere, og klikke for å åpne side-panel.

## ASCII-wireframe — desktop (1440 × 900)

```
┌─────────┬───────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  TOPP-BAR                                              [🔔3] [AK]         │
│         ├───────────────────────────────────────────────────────────────────────────┤
│ ● Stallen│  Stallen                                    [+ Legg til spiller]         │
│         │                                                                            │
│         │  ┌── FILTER ──────────────────────────────────────────────────────────┐   │
│         │  │ [Alle 32][WANG 14][GFGK 11][AKA 7]   🔍 Søk...     Sortér:Tier ▼   │   │
│         │  └────────────────────────────────────────────────────────────────────┘   │
│         │                                                                            │
│         │  ┌──────────────────────────────────────────────────────────────────────┐│
│         │  │SPILLER       GRUP COACH  TIER ØKT/UK TIMER  SG 7D   PYR.  STAT       ││
│         │  ├──────────────────────────────────────────────────────────────────────┤│
│         │  │[E] Emma B.   WANG Anders ●●●  5     18t   ⬆+0.4 ▁▃▅▆█ 84%   🟢      ││
│         │  │[L] Lars H.   WANG Anders ●●●  4     15t   ⬇−0.2 ▆▅▃▂▁ 62%⚠ 🟡      ││
│         │  │[M] Mia O.    GFGK Karen  ●●   3     12t   ➡ 0.0 ▃▄▃▄▃ 91%   🟢      ││
│         │  │[J] Jonas P.  AKA  Anders ●●●● 6     22t   ⬆+0.3 ▂▄▅▆█ 78%   🟢      ││
│         │  │[S] Sofie K.  WANG Pål    ●●   4     16t   ⬆+0.5 ▁▂▄▆█ 88%   🟢      ││
│         │  │[T] Tobias R. GFGK Karen  ●    2      8t   ⬆+0.1 ▃▃▄▅▅ 71%   🟢      ││
│         │  │... 26 til ...                                                          ││
│         │  └──────────────────────────────────────────────────────────────────────┘│
│         │                                                                            │
│         │  32 spillere · 14 WANG · 11 GFGK · 7 AKA           [Eksporter CSV]        │
└─────────┴───────────────────────────────────────────────────────────────────────────┘
```

## Komponenter brukt
- `components-agency-sidebar`
- `components-agency-topbar`
- `components-filter-pills` (Alle / WANG / GFGK / AKA — antall vist i parentes)
- `components-search-input` (søk navn, top-right av filter-row)
- `components-sort-dropdown` (Tier, Navn, Timer 30d, SG, Pyramide)
- `components-agency-player-table` (sticky header, hover-row, klikk åpner slide-over)
- `components-sparkline` (SG 7d, 5 punkter, 60×20 px, lime-stroke)
- `components-status-dot` (🟢/🟡/🔴 + valgfri ⚠ for adherence-dropp)
- `components-table-footer` (telling + eksport)

## States
- **default** — 10 rader synlig, scroll for resten
- **filter aktiv** — én pill aktiv (lime bg, forest-900 tekst), andre outline
- **søk aktiv** — viser kun matchende rader, banner "8 av 32 spillere matcher 'Emma'"
- **tomstate (ingen treff)** — sentrert i tabell-flate: ikon + "Ingen spillere matcher filteret. [Nullstill filter]"
- **loading** — 10 skeleton-rader (avatar + 8 felter, hver 56px høy)
- **ingen spillere i det hele tatt** — illustrasjon + "Du har ikke lagt til spillere ennå. [+ Legg til første spiller]"

## Claude Design-prompt

```
Lag "Stallen" — spilleroversikt-tabell for AgencyOS på desktop 1440×900.

Samme sidebar (mørk forest-900, 240px) og topp-bar som dashboard.
Innhold cream-50 bg, padding 32px.

H1-rad: "Stallen" Inter Tight 32px forest-900,
høyre: primær-knapp "+ Legg til spiller" forest-700 fill, cream-50 tekst,
height 40, padding 16, radius 8, Inter 14px semibold.

FILTER-RAD (under H1, marg-top 24, marg-bottom 16):
Hvit kort, radius 12, padding 16, full bredde:
- Venstre: pill-gruppe — "Alle 32" (aktiv, lime bg, forest-900 tekst),
  "WANG 14", "GFGK 11", "AKA 7" (outline, border forest-700/30, tekst forest-700).
  Hver pill: height 32, padding 0 16, radius 999, Inter 13px semibold.
- Midt: søkefelt 240px, lupe-ikon venstre, placeholder "Søk navn..."
- Høyre: sortér-dropdown "Sortér: Tier ▼" outline, Inter 13px.

TABELL (under filter, hvit kort radius 12 padding 0, border 1px forest-100):

Header-rad (sticky, bg cream-100, height 44px, Inter 11px uppercase
letter-spacing 0.08em forest-700/70%):
SPILLER (40%) · GRUPPE · COACH · TIER · ØKTER/UKE · TIMER 30D · SG 7D · PYR. · STAT

Data-rader (height 64px, Inter 14px forest-900, hover bg cream-100,
cursor pointer):
- SPILLER: avatar 36×36 sirkulær (initialer lime bg #D1F843, forest-900 tekst),
  så fornavn+etternavn Inter 14px semibold.
- GRUPPE: chip outline, Inter 12px (WANG forest-700, GFGK lime-tekst på
  forest-700 bg, AKA cream på forest-700). Eller: alle samme stil, bare
  navn — velg ensartet.
- COACH: Inter 13px forest-700.
- TIER: ●-pictogram, 1-4 utfylte sirkler 6px hver, lime farge,
  forest-100 for utfylte.
- ØKTER/UKE: stort tall Inter 16px semibold.
- TIMER 30D: tall + "t" suffix, Inter 14px mono (JetBrains Mono).
- SG 7D: pil + verdi i mono (⬆+0.4 grønn / ⬇−0.2 rød / ➡ 0.0 forest-700),
  så sparkline 60×20px lime stroke 1.5px, ingen fill.
- PYR.: prosent Inter 14px + liten progressbar 40px under
  (lime fill, forest-100 bg). Hvis under 70%: forest-700-tekst gjøres
  amber + vis ⚠ til høyre.
- STAT: status-dot 8px (grønn aktiv / gul varsel / rød rødt-flagg),
  + valgfri ⚠ ved adherence-dropp.

Skille mellom rader: 1px border-bottom forest-100.

KLIKK på rad: åpner slide-over (se /admin/spillere/[id]).

FOOTER (under tabell, padding-top 16, Inter 13px forest-700/70%):
Venstre: "32 spillere · 14 WANG · 11 GFGK · 7 AKA"
Høyre: tekst-knapp "Eksporter CSV" forest-700.

States: tom-filter, søk-aktiv (banner topp "8 av 32 matcher 'Emma'"),
loading (10 skeleton-rader).

Bruk 8pt-grid. Fonter Inter + Inter Tight + JetBrains Mono.
```

---

# 4) /admin/spillere/[id] — Spiller-detalj (side-panel slide-over)

**Rute:** `/admin/spillere/[id]` (åpner som overlay over Stallen, ikke egen side)
**Hensikt:** Rask sniktitt på spiller — uten å forlate stallen-konteksten. CTA "Åpne Workbench →" tar coach inn i full arbeidsflate.

## ASCII-wireframe — desktop (overlay 520px bredt, høyre side)

```
                              ┌─────────────────────────────────────────────┐
  Stallen synlig bak,         │  [×]                            [Workbench] │
  dimmet 40% sort overlay     ├─────────────────────────────────────────────┤
                              │  ┌──┐                                       │
                              │  │E │ Emma B.            ●●● Tier 3         │
                              │  └──┘ WANG · 17 år                          │
                              │                                             │
                              │  ┌─────────────────────────────────────────┐│
                              │  │ NESTE TIME                              ││
                              │  │ I dag 08:00 · Putting · Range 3 (1t)    ││
                              │  │ [ Start live-økt → ]                    ││
                              │  └─────────────────────────────────────────┘│
                              │  ┌─────────────────┬─────────────────────┐  │
                              │  │ TIMER 30D       │ ØKTER 30D           │  │
                              │  │ 18t  ⬆+2        │ 22  ⬆+4             │  │
                              │  └─────────────────┴─────────────────────┘  │
                              │  ┌─────────────────────────────────────────┐│
                              │  │ PYRAMIDE: ████████████████░░░  84%      ││
                              │  │ Mål: 80% · over mål                     ││
                              │  └─────────────────────────────────────────┘│
                              │  ┌─────────────────────────────────────────┐│
                              │  │ SG-TREND 30D (linje-graf)               ││
                              │  │  ▁▂▃▄▄▅▆▆▇█▇█▇       Total: ⬆ +0.4      ││
                              │  └─────────────────────────────────────────┘│
                              │  ┌─────────────────────────────────────────┐│
                              │  │ SISTE 5 ØKTER                           ││
                              │  │ 27.mai Putting 45m · 26.mai Slag 1t     ││
                              │  │ 24.mai Live 1t · 23.mai Range 1t        ││
                              │  │ 22.mai Putting 30m                      ││
                              │  └─────────────────────────────────────────┘│
                              │  [ Åpne Workbench → ]   [ Send melding ]   │
                              └─────────────────────────────────────────────┘
```

## Komponenter brukt
- `components-agency-player-panel` (slide-over 520px, høyre side, shadow-xl, transform translateX)
- `components-overlay-dim` (svart 40% bak panel, klikk lukker)
- `components-player-header-block` (avatar 64 + navn + meta + tier)
- `components-next-session-card` (gul-aksent kort med start-CTA)
- `components-kpi-mini-pair` (2-kolonne KPI inni panel)
- `components-pyramide-bar` (horizontal progress, 8px høy)
- `components-sparkline-line` (480×120, ingen punkter, lime stroke + soft fill)
- `components-session-list-compact` (5 siste økter)

## States
- **default** — alle blokker fylt
- **loading** — skeleton-blokker i samme rytme (header 80px, KPI 80×2, pyramide 56, graf 140, økter 5×40)
- **tomstate (ny spiller)** — KPI viser "—", pyramide "Ingen baseline ennå", graf "Trenger 3 økter for trend", økter "Ingen økter logget"
- **uten neste time** — Neste time-kort byttes med outline-kort "Ingen time planlagt. [+ Book time]"

## Claude Design-prompt

```
Lag spiller-detalj-panel som slide-over fra høyre over /admin/spillere.

OVERLAY: hele bakgrunnen dimmes 40% svart (rgba(0,0,0,0.4)).
Klikk utenfor panel = lukk. Panel slir inn fra høyre 520px bredt,
full høyde, hvit bg, shadow-xl, ingen radius (kantet venstre).

HEADER (sticky toppen av panel, height 56, padding 16, border-bottom):
- Venstre: [×] lukk-ikon 24px, forest-700.
- Høyre: knapp "Workbench" outline forest-700, Inter 13px, åpner full side.

BODY (padding 24, scroll vertikal):

Spillerhode (marg-bottom 24):
Avatar 64×64 sirkulær (initialer 24px lime bg #D1F843 forest-900 tekst).
Til høyre: "Emma B." Inter Tight 24px forest-900,
under "WANG · 17 år" Inter 13px forest-700/70%.
Helt høyre: tier ●●●○ + tekst "Tier 3" Inter 12px forest-700.

NESTE TIME-kort (lys-lime bg #D1F843/15%, border forest-700/20, radius 12,
padding 16, marg-bottom 16):
Etikett "NESTE TIME" Inter 11px uppercase forest-700.
Tekst "I dag 08:00 · Putting · Range 3 (1t)" Inter 14px forest-900.
CTA-knapp "Start live-økt →" forest-700 fill, full bredde, height 40.

2-KOLONNE KPI (gap 12, marg-bottom 16):
To kort hvit, border forest-100, radius 12, padding 16, hver 50%.
Hver: etikett uppercase 11px + tall Inter Tight 28px + trend 12px.
TIMER 30D / 18t / ⬆ +2t vs forrige.
ØKTER 30D / 22 / ⬆ +4 vs forrige.

PYRAMIDE-ADHERENCE-kort (hvit, radius 12, padding 16, marg-bottom 16):
Etikett "PYRAMIDE-ADHERENCE" + horisontal bar 8px høy
(lime fill 84%, forest-100 bg). Prosent "84%" Inter Tight 20px høyre.
Subtekst "Mål: 80% · Status: over mål" Inter 12px forest-700/70%.

SG-TREND-kort (hvit, radius 12, padding 16, marg-bottom 16):
Etikett "SG-TREND 30D". Linje-graf 480×120, lime stroke 2px,
soft lime fill under (#D1F843/15%), x-akse 1px forest-100,
ingen punkter. Under: "Total: ⬆ +0.4" Inter 13px grønn.

SISTE 5 ØKTER-kort (hvit, radius 12, padding 16):
Etikett "SISTE 5 ØKTER". Liste 5 rader 40px hver:
"27. mai · Putting · 45 min" Inter 13px, dato i mono.
Skille 1px forest-100.

CTA-RAD nederst (sticky bunn 64px, border-top, padding 16, gap 12):
Primær "Åpne Workbench →" forest-700 fill, 60% bredde.
Sekundær "Send melding" outline, 40% bredde.

Bruk 8pt-grid. Fonter Inter + Inter Tight + JetBrains Mono.
```

---

# 5) /admin/spillere/[id]/workbench — Coach-Workbench

**Rute:** `/admin/spillere/[id]/workbench`
**Hensikt:** Samme komponent som PlayerHQ Workbench (Runde 2), men `role="coach"` — coach kan se ALT (rådata, økonomi, treningsplan-editor, kommentarer privat til coach-team) som er skjult for spilleren.

## ASCII-wireframe — desktop (1440 × 900)

```
┌─────────┬───────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  Stallen / Emma B. / Workbench                       [🔔3] [AK]       │
│         ├───────────────────────────────────────────────────────────────────────┤
│         │  ┌──┐ Emma B. ●●● Tier 3 · WANG · 17 år   [Coach-modus] [Lukk →]    │
│ ● Workb │  └──┘                                                                  │
│         │  ┌──────┬──────┬──────┬───────┬───────┬──────┬──────┐                │
│         │  │Overs.│Pyram.│Tren. │Statist│Økonomi│Notat │Admin │ ← 7 faner       │
│         │  └──────┴──────┴──────┴───────┴───────┴──────┴──────┘                │
│         │                                                                        │
│         │  Fane: OVERSIKT                                                        │
│         │  ┌──────────────┬──────────────┬──────────────┐                       │
│         │  │SG-TREND 30D  │PYRAMIDE 84%  │TIMER 30D·18t │                       │
│         │  │⬆ +0.4        │Mål: 80%      │Bookinger: 5  │                       │
│         │  └──────────────┴──────────────┴──────────────┘                       │
│         │  ┌────────────────────────────────────────────────────────────────┐  │
│         │  │ TRENINGSKART (30d)  [Putt ████ Slag ███ Range ██ Live ██]      │  │
│         │  └────────────────────────────────────────────────────────────────┘  │
│         │  ┌────────────────────────────────────────────────────────────────┐  │
│         │  │ ⚙ COACH-ONLY · INTERN OBSERVASJON                              │  │
│         │  │ "Emma trenger short game-fokus før WANG-cup. Mer 40-70m."      │  │
│         │  │ — Anders, 26. mai      [+ Legg til intern notat]               │  │
│         │  └────────────────────────────────────────────────────────────────┘  │
│         │                                                                        │
│         │  [Book time] [Send melding] [Skriv rapport] [Eksporter PDF]           │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

## Komponenter brukt
- Hele Workbench-komponentet fra PlayerHQ (Runde 2: `components-workbench-tabs`, `components-workbench-overview`, `components-pyramide-view`, `components-training-map`)
- `components-coach-only-block` (gul-aksent kort med 🔒-ikon, kun synlig når `role="coach"`)
- `components-coach-action-bar` (nederst — book/melding/rapport/eksport)
- `components-coach-tabs` (utvider fra 5 til 7 faner: + Økonomi + Admin)

## States
- **default** — Oversikt-fane aktiv, alle KPI fylt, COACH-ONLY-blokk synlig
- **fane: Økonomi** — viser fakturahistorikk, utestående, neste forfall (KUN coach)
- **fane: Admin** — viser samtykke-status (FYS-data, video, GDPR), foresattes kontaktinfo, rolle-tilganger (KUN coach)
- **loading** — skeleton i alle blokker
- **role-veksling** — knapp øverst "Coach-modus" kan klikkes for å se "som spilleren ser det" (forhåndsvisning, ramme rundt med dashed lime border + label "Spiller-visning · forhåndsvis")

## Claude Design-prompt

```
Lag Coach-Workbench på desktop 1440×900 — samme komponentbase som
PlayerHQ Workbench (Runde 2), men med 7 faner i stedet for 5
og en COACH-ONLY-blokk.

Sidebar (mørk) + topp-bar som dashboard.
Brødsmuler øverst: "Stallen / Emma B. / Workbench" Inter 13px
forest-700, separator " / ", siste navn forest-900 semibold.

PLAYER-HEAD (under brødsmuler, 80px høy):
Avatar 48 + navn "Emma B." Inter Tight 24px + tier-pictogram +
chip "WANG" + "17 år" Inter 13px forest-700/70%.
Høyre: chip "Coach-modus" lime bg #D1F843 forest-900 tekst +
knapp "Lukk →" outline (returnerer til Stallen).

TABS-RAD (7 faner, height 44, border-bottom forest-100):
Oversikt (aktiv) · Pyramide · Treningsplan · Statistikk · Økonomi ·
Notater · Admin. Aktiv-fane: lime indikator 2px under tekst,
tekst forest-900 semibold. Inaktive: tekst forest-700/70%.

FANE: OVERSIKT (default):
3-KOLONNE KPI-grid (gap 16, marg-bottom 24): SG-TREND 30D /
PYRAMIDE 84% / TIMER 30D. Hver kort hvit, radius 12, padding 20,
Inter Tight 28px stor verdi + 12px subtekst.

TRENINGSKART-blokk (hvit kort, radius 12, padding 24, marg-bottom 24):
Etikett "TRENINGSKART (30d)" + horisontal bar-cluster:
fire bars (Putting, Slag, Range, Live), hver med navn venstre,
forest-700 stroke, lime fill, prosent høyre. Inter 13px.

COACH-ONLY-blokk (gul-aksent, lys gul bg #FFF7E0, border 1px #B26A00/30,
radius 12, padding 24, marg-bottom 24):
Header "⚙ COACH-ONLY · INTERN OBSERVASJON" Inter 11px uppercase
letter-spacing 0.08em farget #B26A00.
Sitat-blokk: italic Inter 14px forest-900,
linje-bryt, så "— Anders, 26. mai" Inter 12px forest-700/70%.
Knapp nederst "+ Legg til intern notat" tekst-knapp forest-700.

AKSJONS-RAD nederst (sticky, padding-top 24):
4 knapper i én rad, gap 12:
[Book time] forest-700 fill primær
[Send melding] outline
[Skriv rapport] outline
[Eksporter PDF] outline (mono-suffiks ikon nedlastning)

EKSTRA FANER:
- Økonomi: tabell over fakturaer (dato, beskrivelse, beløp i mono,
  status-chip betalt/utestående/forfalt), totalsum øverst.
- Admin: tre kort — Samtykker (FYS/video/GDPR med toggle-status),
  Foresatte (kontaktinfo), Tilganger (rolle-matrise).

Bruk 8pt-grid. Fonter Inter Tight + Inter + JetBrains Mono.
```

---

# 6) /admin/innboks — Innboks / handlingskø

**Rute:** `/admin/innboks`
**Hensikt:** Coach jobber gjennom dagens kommunikasjon. Tre kolonner: trådliste (venstre) + samtale (midt) + spiller-kontekst (høyre).

## ASCII-wireframe — desktop (1440 × 900)

```
┌─────────┬───────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  TOPP-BAR                                            [🔔3] [AK]        │
│         ├───────────────────────────────────────────────────────────────────────┤
│ ● Innboks│  Innboks                                                              │
│         │  ┌──────────────┬─────────────────────────┬──────────────────────┐   │
│         │  │ ALLE (12)    │ Emma B. · I dag 06:18   │ KONTEKST             │   │
│         │  │ [Alle][Ulest]│                         │                      │   │
│         │  │ [Sp][Fores.] │ ┌──────────────────┐    │ ┌──┐ Emma B.         │   │
│         │  │              │ │ Kan vi flytte    │    │ └──┘ WANG ●●● Tier 3 │   │
│         │  │ 🔴 Emma 06:18│ │ til 09? Hadde noe│    │                      │   │
│         │  │ "Kan vi..."  │ │ på skolen...    │    │ NESTE TIME           │   │
│         │  │ 🟡 Lars 01:42│ │       06:18 i dag│    │ I dag 08:00 Putting  │   │
│         │  │ "Bra økt!"   │ └──────────────────┘    │                      │   │
│         │  │ 🟢 Mia ig18  │       ┌──────────────┐  │ TIMER 30D: 18t      │   │
│         │  │ "Rapport..." │       │ Hei Emma! Ja │  │ SG 7D: ⬆ +0.4       │   │
│         │  │ 🟢 Jonas ig14│       │ flytter 09   │  │ PYRAMIDE: 84%       │   │
│         │  │              │       │   06:32 i dag│  │                      │   │
│         │  │ ... 8 til    │       └──────────────┘  │ [Åpne Workbench →]  │   │
│         │  │              │ ┌──────────────────┐    │                      │   │
│         │  │              │ │ Perfekt, takk ✌  │    │ HURTIG-AKSJONER     │   │
│         │  │              │ │       06:45 i dag│    │ [Book ny time]      │   │
│         │  │              │ └──────────────────┘    │ [Send notat]        │   │
│         │  │              │ ┌─────────────────────┐ │ [Marker ferdig]     │   │
│         │  │              │ │ Skriv svar... [Send→]│ │                      │   │
│         │  │              │ └─────────────────────┘ │                      │   │
│         │  └──────────────┴─────────────────────────┴──────────────────────┘   │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

## ASCII-wireframe — mobil (430 × 932)

```
┌──────────────────────────────────┐
│ ←  Innboks            [🔔3] [AK] │
├──────────────────────────────────┤
│ [Alle][Uleste][Spillere][Fores.] │ ← horisontal scroll
│ ┌──────────────────────────────┐ │
│ │ 🔴 Emma B.       I dag 06:18 │ │
│ │ "Kan vi flytte timen..."     │ │
│ ├──────────────────────────────┤ │
│ │ 🟡 Lars H.       I dag 01:42 │ │
│ │ "Bra økt i går!"             │ │
│ ├──────────────────────────────┤ │
│ │ 🟢 Mia O.        I går 18:30 │ │
│ │ "Auto-rapport klar"          │ │
│ ├──────────────────────────────┤ │
│ │ 🟢 Jonas P.      I går 14:12 │ │
│ │ "Takk for øktene!"           │ │
│ ├──────────────────────────────┤ │
│ │ ... 8 til ...                │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ [Brief][Innboks*][Kal][Mer]      │
└──────────────────────────────────┘
Tap på rad → samtale i full skjerm med tilbake-pil + send-felt.
```

## Komponenter brukt
- `components-agency-inbox` (3-kolonne grid 320 / 1fr / 320)
- `components-thread-list` (venstre — søk + filter-pills + tråder)
- `components-message-bubble-pair` (innkommende venstre forest-100 bg, utgående høyre lime bg)
- `components-message-input` (textarea + send-knapp + vedlegg)
- `components-context-sidebar` (høyre — kompakt spillerkort + KPI + hurtig-aksjoner)

## States
- **default** — en tråd valgt, samtale fylt, kontekst-panel viser spilleren
- **tomstate (ingen tråder)** — sentrert "Innboks tom. Bra jobba." + lime sjekk-ikon
- **tomstate (ingen tråd valgt)** — midtkolonne: "Velg en samtale til venstre"; høyre: "Ingen spiller valgt"
- **loading** — skeleton i alle 3 kolonner
- **sending** — utgående melding viser klokke-ikon, blir lime + sjekk når levert

## Claude Design-prompt

```
Lag Innboks-skjerm for AgencyOS på desktop 1440×900.

Sidebar mørk + topp-bar som vanlig. H1 "Innboks" Inter Tight 32px.

3-KOLONNE GRID under H1 (cream-50 bg, padding 32):
gap 16, høyder fyller resten av viewport. Alle kolonner hvit kort
radius 12, border forest-100, padding 0 (innhold styrer egen padding).

KOLONNE 1 — TRÅDLISTE (320px):
Header padding 16: "ALLE (12)" Inter 13px semibold forest-900.
Filter-pills under: [Alle] [Uleste] [Spillere] [Foresatte], outline,
height 28 padding 12, radius 999, Inter 12px. Aktiv: forest-700 fill,
cream-50 tekst.
Trådliste scroll. Hver tråd 72px høy, padding 16,
border-bottom forest-100. Aktiv-tråd: lime-strek 3px venstre,
bg cream-100.
Trådrad: fargeprikk 8px venstre (rød = haster, gul = nytt,
grønn = info), avatar 32 sirkulær, navn + tid (mono 11px) på samme
linje (tid høyre), under: snippet Inter 13px forest-900/70%
én linje ellipsis.

KOLONNE 2 — SAMTALE (1fr):
Header padding 16, border-bottom: "Emma B. · I dag 06:18" Inter 14px
semibold + meta-ikoner høyre (⋮ for tråd-aksjoner).
Body: scroll, padding 24. Meldingsbobler:
- Innkommende: venstre, bg forest-100, radius 12 (men 4 bunn-venstre),
  maks 70%, Inter 14px forest-900, tid Inter 11px forest-700/60% under.
- Utgående: høyre, bg lime #D1F843, radius 12 (men 4 bunn-høyre),
  tekst forest-900.
Avstand 16 mellom bobler.
Inntastingsfelt nederst (sticky, padding 16, border-top):
textarea min-height 56, radius 8, border forest-100, padding 12,
placeholder "Skriv svar...". Send-knapp høyre forest-700 fill,
ikon papirfly + "Send →".

KOLONNE 3 — KONTEKST (320px):
Header "KONTEKST" Inter 11px uppercase letter-spacing 0.08em
forest-700/70%, padding 16.
Spillerhode: avatar 48 + navn Inter Tight 18px + meta-rad
"WANG · ●●● Tier 3" Inter 12px forest-700.
Neste time-mini-kort: lys-lime bg, "I dag 08:00 · Putting" Inter 13px.
3 KPI-rader (kompakt): "TIMER 30D · 18t", "SG 7D · ⬆ +0.4",
"PYRAMIDE · 84%", hver i én linje med etikett venstre forest-700/70%
og verdi høyre mono 14px.
Hurtig-aksjoner: 3 outline-knapper full bredde stacked:
[Book ny time] [Send notat] [Marker ferdig].

MOBIL 430×932:
- Topp-bar 56px med ←-pil, "Innboks", bjelle, avatar.
- Innhold: filter-pills horisontal scroll, så trådliste full bredde
  (rader 80px). Tap åpner samtale-view i full skjerm med send-felt
  sticky bunn.
- Bunn-tab 64px.

Bruk 8pt-grid. Fonter Inter + Inter Tight + JetBrains Mono.
```

---

# 7) /admin/kalender — Kalender (lese-modus, uke-visning)

**Rute:** `/admin/kalender`
**Hensikt:** Coach ser uka i ett blikk. Lese-modus (ikke booking-editor — det er en egen flyt). Klikk på event = side-panel med event-detalj.

## ASCII-wireframe — desktop (1440 × 900)

```
┌─────────┬───────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  TOPP-BAR                                            [🔔3] [AK]        │
│         ├───────────────────────────────────────────────────────────────────────┤
│ ● Kal   │  Kalender               [Uke][Måned][Liste]    [+ Ny booking]         │
│         │  [‹] Uke 22 · 25.–31. mai 2026 [›]                       [I dag]      │
│         │  ┌────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐                    │
│         │  │    │M 25 │T 26 │O 27 │T 28 │F 29 │L 30 │S 31 │                    │
│         │  ├────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤                    │
│         │  │08  │     │▌Lar │     │▌Emm │     │     │     │                    │
│         │  │09  │▌Mia │ Sla │▌Nor │▌Lar │     │▌WAN │     │                    │
│         │  │10  │ Put │     │ Sla │ Sla │     │ Grp │     │                    │
│         │  │11  │     │▌Sof │     │▌WAN │     │     │     │                    │
│         │  │12  │     │ Liv │     │ Grp │     │     │     │                    │
│         │  │13  │▌Tob │     │▌Jon │     │     │     │     │                    │
│         │  │14  │ Ran │     │ Liv │▌Jon │     │     │     │                    │
│         │  │15  │     │     │     │ Liv │     │     │     │                    │
│         │  │16  │     │     │     │▌Sof │     │     │     │                    │
│         │  │17  │     │     │     │ Put │     │     │     │                    │
│         │  └────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘                    │
│         │  ▌Lime=1:1   ▌Forest=Gruppe   ▌Cream-gull=Live-økt                    │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

## Komponenter brukt
- `components-agency-sidebar`
- `components-agency-topbar`
- `components-calendar-toolbar` (uke/måned/liste + dato-nav + I dag-knapp + + Ny booking)
- `components-calendar-week-grid` (8-kolonne grid: tidskolonne 64px + 7 dager 1fr)
- `components-calendar-event` (vertikal blokk med lime/forest/cream venstre-strek + tittel + meta)
- `components-calendar-legend` (forklaring nederst)

## States
- **default** — denne uke aktiv, alle events synlig
- **klikk event** — åpner slide-over 480px høyre side med event-detalj (spiller, tid, sted, type, notater) + [Åpne spiller] + [Avlys] + [Reschedule]
- **tomstate (ingen events i uke)** — sentrert: "Ingen timer denne uka." + knapp "+ Book første time"
- **loading** — skeleton-grid: tidskolonne + 7 dager med 3-4 grå blokker hver
- **navigasjon** — ‹/› endrer uke, "I dag" går til aktuell uke (med soft scroll-animasjon)

## Claude Design-prompt

```
Lag kalender-skjerm (uke-visning, lese-modus) for AgencyOS på desktop 1440×900.

Sidebar mørk + topp-bar. Innhold cream-50 padding 32.

H1-rad: "Kalender" Inter Tight 32px forest-900.
Høyre samme rad: vis-toggle [Uke (aktiv)] [Måned] [Liste] — pill-gruppe
outline, aktiv lime bg. Etter toggle: primær-knapp "+ Ny booking"
forest-700 fill.

NAV-RAD (under H1, marg-top 16, marg-bottom 16):
Venstre: piler [‹] og [›] outline forest-700, mellom dem
"Uke 22 · 25.–31. mai 2026" Inter Tight 20px forest-900.
Høyre: knapp "I dag" outline forest-700.

UKE-GRID (hvit kort, radius 12, border forest-100, padding 0,
overflow hidden):
8 kolonner: tidskolonne 64px + 7 dager (1fr hver).
HEADER-RAD (height 48, bg cream-100, border-bottom forest-100):
Tidskolonne tom, hver dag-celle: "MAN 25" Inter 11px uppercase
letter-spacing 0.06em forest-700/70% over, "25" Inter Tight 18px
forest-900 under. I dag-kolonne: tekst forest-900, liten lime
prikk under dato.
TIDS-RADER (07:00–18:00, 12 stk, hver 48px høy):
Tidskolonne: JetBrains Mono 12px forest-700/70%, høyrejustert,
padding-right 8. Vertikale skille-linjer 1px forest-100 mellom dager.
Horisontale 1px på hver hele time.

EVENTS (absolute innenfor dag-kolonnen):
Hver event-blokk: radius 6, padding 8, Inter 12px,
vertikal venstre-strek 3px:
- Lime (#D1F843) = 1-til-1: bg lime/15%, strek lime, tekst forest-900.
- Forest (#005840) = Gruppe: bg forest-700/10%, strek forest-700,
  tekst forest-900.
- Cream-aksent = Live-økt: bg #FAFAF7 med gull-strek #B8975C/40%.
Blokk-innhold: spillernavn semibold + type Inter 11px forest-700/70%.
Høyde = varighet (1t = 48px, 2t = 96px).

KLIKK EVENT: åpner slide-over 480px (samme mønster som spiller-detalj):
header med [×], event-detalj-kort (tid, type, sted), spillerhode,
notater, og rad med [Åpne spiller] [Avlys] [Flytt].

LEGENDE (under grid, padding-top 16):
Inter 13px forest-700, 3 prikker (lime/forest/cream-gull) +
forklaringer på en linje.

Bruk 8pt-grid. Fonter Inter Tight + Inter + JetBrains Mono.
```

---

# Leveranse-status

**Fil:** `/Brading guide AK Golf HQ/SKJERMER-RUNDE-4-AGENCYOS-DASHBOARD-STALLEN.md`
**Innhold:** 7 skjermer levert med rute, ASCII-wireframe (desktop 1440px + mobil 430px på de to mobil-relevante), komponent-referanser, states og Claude Design-prompt.

| # | Skjerm | Rute | Plattform | Status |
|---|---|---|---|---|
| 1 | Coach login | `/admin/auth/login` | Desktop | OK |
| 2 | Daglig brief (DASHBOARD) | `/admin/agencyos` | Desktop + Mobil | OK |
| 3 | Stallen (tabell) | `/admin/spillere` | Desktop | OK |
| 4 | Spiller-detalj (slide-over) | `/admin/spillere/[id]` | Desktop | OK |
| 5 | Coach-Workbench | `/admin/spillere/[id]/workbench` | Desktop | OK |
| 6 | Innboks | `/admin/innboks` | Desktop + Mobil | OK |
| 7 | Kalender (uke) | `/admin/kalender` | Desktop | OK |

**Konsistens-sjekk Runde 1–3:**
- Header-format: identisk ("# Runde N — …")
- Skjerm-blokk: Rute / Wireframe / Komponenter / States / Claude Design-prompt — likt mønster
- Token-tabell øverst: levert (samme rytme som Runde 2/3)
- Komponent-referanser bruker `components-agency-*` prefix (egen AgencyOS-navngivning, parallelt med `components-player-*` i Runde 2)

**Designsignatur AgencyOS:**
- Mørk sidebar (forest-900 #003D2C) + lys innhold (cream-50) — etablert som visuell skillelinje mot PlayerHQ
- KPI bruker treningstimer/økter/bookinger/adherence — IKKE HCP som primær
- Lime brukes som aktiv-pill i sidebar + accent i events/CTA — sparsom bruk

**Neste anbefalte runde:** Booking-flyt (4 skjermer — velg spiller, velg tid, bekreft, bekreftet) + Rapport-bygger (3 skjermer — mal-velger, redaksjon, forhåndsvis/send).

Klar for review.
