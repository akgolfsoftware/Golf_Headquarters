# Runde 3 — PlayerHQ Live Session (4 skjermer)

**Plattform:** Mobil-kritisk fullscreen (430px). Ikke bunn-nav. Bryter ut av portal-shellen.
**Modus:** Wake-lock aktivert. Offline-først (IndexedDB). Tidstracker per drill + totaltid.
**Status:** Klar til Claude Design

---

## Skjerm-oversikt

| # | Rute | Hva | Hovedkomponenter |
|---|---|---|---|
| 1 | /portal/tren/[id] | Økt-intro (preview før start) | okt-detail, featured, buttons |
| 2 | /portal/tren/[id]/live | Aktiv drill (timer + reps) | live-session, buttons (rep-knapper) |
| 3 | /portal/tren/[id]/live | Drill-overgang (mini-summering) | live-session, kpi |
| 4 | /portal/tren/[id]/oppsummering | Økt-fullført (totalsummering) | live-session, kpi, featured |

**Felles for alle 4:** Forest #005840 bakgrunn (full immersjon). Lime #D1F843 for aktive elementer. Cream #FAFAF7 for tekst. Inter Tight for tall, JetBrains Mono for tid/reps.

---

## 1. /portal/tren/[id] — Økt-intro (preview før start)

**Hva:** Spilleren har trykket "Start økt" fra Hjem eller Workbench. Ser hele økten før start. Kan endre rekkefølge, hoppe over drills, eller justere reps. Stort START-CTA nederst.

### Wireframe (mobil 430px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ←  ØKT-INTRO                                                              [Lukk ✕]     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ONS 28 MAI · 14:30 · INNSPILL                              ← lime caps eyebrow        │
│                                                                                        │
│  Innspill er der det                                        ← display 32px italic      │
│  skjer i dag.                                                  "der" italic, cream     │
│                                                                                        │
│  60 min · 4 drills · CS 80 · 165 reps planlagt              ← meta-rad, mono           │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  PLAN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ 1 · OPPVARMING                                                10 min          │    │
│  │   Pendel-svinger · 25 reps                                          [⋮]      │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ 2 · TEKNIKK                                                   15 min          │    │
│  │   Ball-først-kontakt · 30 reps · 50m PW                             [⋮]      │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ 3 · KAMP                                                      25 min          │    │
│  │   Up&Down 50-80m · 60 reps · % opp/ned                              [⋮]      │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ 4 · NEDTRAPPING                                               10 min          │    │
│  │   Følelse-putt · 50 reps · 3-6m                                     [⋮]      │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  MÅL FOR ØKTA                                                                          │
│  • Treffe planlagt CS 80 (compliance score)                                            │
│  • Logge minst 1 video på Kamp-drill                                                   │
│  • Bedre enn forrige innspill-økt: 76                                                  │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                       ┌────────────────────────────────────┐                          │
│                       │       START ØKT  →                 │     ← lime pill, 56px    │
│                       └────────────────────────────────────┘                          │
│                                                                                        │
│                            Spar batteri · wake-lock på                                 │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt
- **components-okt-detail** (drill-rad med nummer + kategori-eyebrow + tittel + meta + drag-handle)
- **components-featured** (tittel-block øverst med display italic-aksent)
- **components-buttons** (stort lime pill-CTA "Start økt", subtil sekundær "Lukk")

### States
- **Default:** som vist, alle drills enabled, START-CTA aktiv lime
- **Tom plan (umulig fra UX, men edge):** "Ingen drills lagt til" + [Tilbake til Plan]
- **Tilpasset:** brukeren har hoppet over drill 3 → drill 3 vises med strikethrough + "Hoppet over"
- **Offline-banner:** hvis ikke koblet → grå pill øverst "Offline — alt lagres lokalt"

### Claude Design-prompt
```
Design /portal/tren/[id] — Økt-intro før start. Mobil 430px, fullscreen modus.

Bakgrunn: Forest #005840 full. Cream #FAFAF7 tekst.

Topbar: tilbake-pil venstre, "ØKT-INTRO" mono caps midtstilt, [Lukk ✕] høyre.

Hero-block:
- Eyebrow lime caps mono: "ONS 28 MAI · 14:30 · INNSPILL"
- Display 32px Inter Tight italic-aksent: "Innspill er der det skjer i dag." — "der" italic
- Meta-rad mono 14px: "60 min · 4 drills · CS 80 · 165 reps planlagt"

PLAN-seksjon (eyebrow + horisontal linje):
- 4 drill-rader (components-okt-detail). Hver rad:
  - Stort tall venstre (Inter Tight 24px, lime), nummer-prefix
  - Kategori-eyebrow mono caps: OPPVARMING / TEKNIKK / KAMP / NEDTRAPPING
  - Tittel cream 18px
  - Meta-rad muted: "25 reps · 50m PW"
  - Drag-handle (⋮) høyre — rearrange
- Bakgrunn: forest-tint card (#0A6A50), 12px radius, 8pt-grid spacing

MÅL-seksjon: bullets cream, små tall lime venstre

CTA-footer (sticky bunn):
- Stort lime pill "START ØKT →" full bredde 56px høyde
- Forest tekst, semibold
- Subtil hint under: "Spar batteri · wake-lock på"

States:
- Default: alle aktive
- Hoppet over drill: strikethrough + opacity 50%
- Offline-banner sticky topp: grå pill med wifi-off-ikon
```

---

## 2. /portal/tren/[id]/live — Aktiv drill (timer + rep-knapper)

**Hva:** Det viktigste skjermbildet. Spilleren er midt i en drill. Stor timer, drill-tittel, sirkulære rep-knapper (5/10/25), faktiske vs planlagte reps, video/foto/notat-knapper, drill-progresjon nederst.

### Wireframe (mobil 430px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ←   DRILL 3 AV 4 · KAMP                                              [Pause ⏸]  [✕]    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Drill-progresjon, lime, 4px      │
│                                                                                        │
│  KAMP · UP&DOWN 50-80m                                      ← lime eyebrow caps        │
│                                                                                        │
│  Up & Down                                                  ← display 36px italic      │
│  50–80m                                                        cream, Inter Tight      │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                              ┌──────────────────────┐                                  │
│                              │      08:42           │   ← TIMER, JetBrains Mono       │
│                              │                      │      80px, lime, monospace      │
│                              │   av 25:00 · drill   │   ← under: subtil hint           │
│                              └──────────────────────┘                                  │
│                                                                                        │
│                              TOTAL 24:18                    ← mono 14px, muted        │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  REPS                                              42 / 60                            │
│  ████████████████████░░░░░░░░░░  70 %  ← lime progress bar, 6px                       │
│                                                                                        │
│                                                                                        │
│            ╭───────╮          ╭───────╮          ╭───────╮                            │
│            │       │          │       │          │       │                            │
│            │  +5   │          │  +10  │          │  +25  │   ← sirkulære rep-knapper  │
│            │       │          │       │          │       │      56px diameter, lime    │
│            ╰───────╯          ╰───────╯          ╰───────╯      forest tekst            │
│                                                                                        │
│                              [− 1 rep angre]                ← liten sekundær          │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                                        │
│   │   🎥     │    │   📷     │    │   📝     │     ← logg-knapper, 48px               │
│   │  Video   │    │  Foto    │    │  Notat   │       cream på forest-tint            │
│   └──────────┘    └──────────┘    └──────────┘                                        │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  NESTE: NEDTRAPPING · Følelse-putt · 50 reps               ← muted, mono caps eyebrow │
│                                                                                        │
│                       ┌────────────────────────────────────┐                          │
│                       │     FERDIG MED DRILL  →            │     ← lime pill           │
│                       └────────────────────────────────────┘                          │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt
- **components-live-session** (timer-display stor mono, drill-tittel italic, progresjon-bar)
- **components-buttons** (sirkulære rep-knapper 56px +5/+10/+25, lime fyll, forest tekst)
- **components-buttons** (logg-knapper Video/Foto/Notat — square 48px med ikon + label)

### States
- **Default (aktiv):** timer teller opp, rep-knapper enabled, alt lime og lyst
- **Paused:** timer fryst, hele skjermen får 60 % opacity, stor "FORTSETT"-pill midt på + "AVBRYT ØKT" sekundær
- **Drill fullført (overgang):** se skjerm 3 — auto-trigger når reps ≥ planlagt eller bruker trykker "Ferdig med drill"
- **Over-compliance:** hvis reps > planlagt vises tallene i lime-pulse (achievement-trigger)
- **Offline-recording:** når Video/Foto trykkes uten nett → "Lagres lokalt — synker senere" toast

### Claude Design-prompt
```
Design /portal/tren/[id]/live — Aktiv drill, fullscreen mobil 430px.

KRITISK: Dette er hovedskjermen — må fungere i sollys, med svette hender, mens spilleren slår.

Bakgrunn: Forest #005840. Wake-lock på.

Topbar:
- ← tilbake (åpner "Avbryt økt?"-modal)
- Senter: "DRILL 3 AV 4 · KAMP" mono caps cream
- Høyre: [Pause ⏸] sirkulær 40px + [✕] tett

Progresjon-bar (4px, lime): viser hvor langt i hele økta (drill 3 av 4 = 50–75%)

Drill-hero:
- Eyebrow lime caps: "KAMP · UP&DOWN 50-80m"
- Display 36px Inter Tight italic: "Up & Down 50–80m" — "Up & Down" italic

Timer-blokk midtstilt:
- Stor JetBrains Mono 80px tall i lime: "08:42"
- Under: "av 25:00 · drill" muted cream 12px
- "TOTAL 24:18" mono 14px under det igjen

Rep-tracker:
- Label venstre "REPS" mono caps + tall høyre "42 / 60" stor mono lime
- Lime progress bar 6px med prosent ("70 %") høyre
- TRE SIRKULÆRE rep-knapper på rad: +5, +10, +25
  - 56px diameter, lime fyll, forest tekst, JetBrains Mono semibold 18px
  - Skygge subtil for press-feedback, haptic-tap
  - Gap 24px mellom knappene, sentrert
- Under: "− 1 rep angre" liten sekundær link cream-muted

Logg-rad: 3 firkant-knapper 48px (Video/Foto/Notat)
- Ikon Lucide 24px + label under
- Cream på forest-tint #0A6A50, 8px radius

Footer:
- "NESTE: NEDTRAPPING · Følelse-putt · 50 reps" eyebrow mono muted
- "FERDIG MED DRILL →" lime pill full bredde 56px

States:
- Default: alle aktive, timer teller
- Paused: 60% opacity + stor "FORTSETT"-pill overlay
- Over-compliance (reps > planlagt): tall lime-pulse animasjon
- Offline-toast: dark pill bunn "Lagres lokalt — synker senere"

Touch-targets minimum 56px. Ingen tekst under 14px. Kontrast WCAG AA.
```

---

## 3. /portal/tren/[id]/live — Drill-overgang (mini-oppsummering)

**Hva:** Mellom hver drill (eller når reps er nådd). Kort feedback-skjerm: hva ble gjort, compliance, neste drill. Bruker kan trykke "Start neste" eller "Pause".

### Wireframe (mobil 430px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ←   DRILL FULLFØRT                                                            [✕]      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ████████████████████████░░░░░░░░░░░░░░░░░░  Drill-progresjon, 3/4 ferdig             │
│                                                                                        │
│                                                                                        │
│                                  ✓                          ← stor lime sjekkmark      │
│                                                                72px, animert i         │
│                                                                                        │
│  KAMP · UP&DOWN 50-80m                                      ← lime eyebrow             │
│                                                                                        │
│  Ferdig                                                     ← display 40px italic      │
│  med drill 3                                                                            │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌─────────────────┬─────────────────┐                                                 │
│  │  REPS           │  TID            │                                                 │
│  │  62 / 60        │  24:18          │   ← KPI-strip 2-col mobil                       │
│  │  ↑ +2 over plan │  av 25:00       │                                                 │
│  ├─────────────────┼─────────────────┤                                                 │
│  │  COMPLIANCE     │  LOGGET         │                                                 │
│  │  103 %          │  1 video        │                                                 │
│  │  ↑ over mål     │  2 notater      │                                                 │
│  └─────────────────┴─────────────────┘                                                 │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  NESTE DRILL                                                                           │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ 4 · NEDTRAPPING                                               10 min          │    │
│  │   Følelse-putt · 50 reps · 3-6m                                              │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                       ┌────────────────────────────────────┐                          │
│                       │     START NESTE DRILL  →           │     ← lime pill           │
│                       └────────────────────────────────────┘                          │
│                                                                                        │
│                            [Pause]            [Hopp over]                              │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt
- **components-live-session** (sjekkmark-animasjon + display-tittel italic + progresjon-bar)
- **components-kpi** (2x2 KPI-grid, mono tall, delta-piler, forest-tint cards)
- **components-okt-detail** (neste drill-rad, samme format som intro)
- **components-buttons** (primær lime pill + 2 sekundære under)

### States
- **Default (etter ferdig drill):** som vist, auto-fade-in på sjekkmark + KPI
- **Under-compliance (<70 %):** delta-piler røde "↓", subtil hint "Kort økt — alt teller"
- **Siste drill ferdig:** auto-redirect til skjerm 4 (oppsummering) — denne skjermen vises ikke
- **Paused:** samme overlay som skjerm 2

### Claude Design-prompt
```
Design /portal/tren/[id]/live mellom drills — Drill-overgang. Mobil 430px fullscreen.

Bakgrunn: Forest #005840.

Topbar: ← tilbake, "DRILL FULLFØRT" mono caps midt, [✕] høyre.

Progresjon-bar topp: lime 4px, viser 75 % (3 av 4 ferdig).

Hero-block midtstilt:
- Stor lime sjekkmark Lucide Check 72px, animert i fra scale 0.6 til 1.0
- Eyebrow lime caps: "KAMP · UP&DOWN 50-80m"
- Display 40px Inter Tight italic: "Ferdig med drill 3" — "Ferdig" italic-aksent

KPI-grid 2x2 (components-kpi):
- Cards forest-tint #0A6A50, 12px radius
- Hver card: label mono caps muted + stor tall lime mono + delta mono cream
- 1: REPS 62/60 ↑ +2 over plan
- 2: TID 24:18 av 25:00
- 3: COMPLIANCE 103 % ↑ over mål
- 4: LOGGET 1 video, 2 notater
- Gap 8px, 8pt-grid

NESTE DRILL-seksjon:
- Eyebrow mono caps "NESTE DRILL"
- components-okt-detail rad samme stil som intro-skjerm

Footer:
- Primær: lime pill "START NESTE DRILL →" full bredde 56px
- Under: to sekundære ghost-knapper side-by-side, "Pause" + "Hopp over"

States:
- Default: animert fade-in (sjekkmark først, KPI etter 200ms)
- Under-compliance <70%: piler rød + hint
- Auto-advance: 5 sek countdown-ring rundt START-knapp (kan kanselleres)

Total visningstid forventet: 5–15 sek. Ikke distraherende, men feirende.
```

---

## 4. /portal/tren/[id]/oppsummering — Økt-fullført (totalsummering + achievements)

**Hva:** Hele økta er ferdig. Totalsummering: tid, reps, compliance. Achievements hvis utløst (ny PR, første video, etc.). CTA for å lagre + dele med coach. Lenke til neste planlagte økt.

### Wireframe (mobil 430px)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                              [Lukk ✕]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                                                                                        │
│                                                                                        │
│                                     ★                       ← lime stjerne, 96px       │
│                                                                animert puls            │
│                                                                                        │
│                                                                                        │
│  ONS 28 MAI · INNSPILL                                      ← lime eyebrow caps        │
│                                                                                        │
│  Økt fullført                                               ← display 44px italic      │
│  i dag.                                                       Inter Tight, cream       │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  TOTAL                                                                                 │
│  ┌─────────────────┬─────────────────┐                                                 │
│  │  TID            │  REPS           │                                                 │
│  │  58:42          │  167 / 165      │                                                 │
│  │  av 60:00       │  ↑ +2 over plan │                                                 │
│  ├─────────────────┼─────────────────┤                                                 │
│  │  COMPLIANCE     │  DRILLS         │                                                 │
│  │  CS 84          │  4 / 4          │                                                 │
│  │  ↑ +4 over mål  │  ✓ Alle fullført│                                                 │
│  └─────────────────┴─────────────────┘                                                 │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ACHIEVEMENTS                                                                          │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ 🏆  Ny CS-rekord i innspill                                                   │    │
│  │     Forrige: 76 · Nå: 84                                                      │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ 🎥  Første video-logg                                                          │    │
│  │     Send til coach for feedback?                                              │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  PER DRILL                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ 1 · Pendel-svinger          25/25  · 10:02  ·  CS 100  ✓                     │    │
│  │ 2 · Ball-først-kontakt      28/30  ·  14:38 ·  CS 93   ✓                     │    │
│  │ 3 · Up&Down 50-80m          62/60  ·  24:18 ·  CS 103  ✓                     │    │
│  │ 4 · Følelse-putt            52/50  ·  9:44  ·  CS 104  ✓                     │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  NESTE ØKT                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────┐    │
│  │ TOR 29 MAI · 09:00 · FYS                                                      │    │
│  │ Sirkel-styrke A · 45 min                                                      │    │
│  └──────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                       ┌────────────────────────────────────┐                          │
│                       │   LAGRE OG DEL MED COACH  →        │     ← lime pill           │
│                       └────────────────────────────────────┘                          │
│                                                                                        │
│                              [Bare lagre]                                              │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt
- **components-live-session** (hero med stjerne-animasjon + display-tittel italic)
- **components-kpi** (2x2 totals med deltas)
- **components-featured** (achievement-cards med ikon + tittel + sub-tekst)
- **components-okt-detail** (per-drill rad, kompakt)
- **components-buttons** (primær lime + sekundær ghost)

### States
- **Default (vellykket økt):** stjerne lime + alle deltas positive
- **Lav compliance (<70 %):** stjerne erstattes med sirkel-ikon, hero-tekst "Økt loggført" istedet for "Økt fullført", ingen achievements
- **Avbrutt økt (delvis):** "Økt avbrutt" + KPI viser hva som ble gjort + "Fortsett senere?" CTA
- **Offline-lagret:** sticky topp-banner "Lagret lokalt — synkes når du er online"
- **Ingen neste økt:** skjul "NESTE ØKT"-blokk

### Claude Design-prompt
```
Design /portal/tren/[id]/oppsummering — Økt-fullført feiring og totalsummering. Mobil 430px.

Bakgrunn: Forest #005840. Subtil radial gradient lime fra topp (15% opacity).

Topbar: kun [Lukk ✕] høyre — ingen tilbake (økta er ferdig).

Hero-block (midtstilt, romslig):
- Stor lime stjerne Lucide Star fyll 96px, animert puls (scale 1.0 ↔ 1.05 sakte)
- Eyebrow lime caps mono: "ONS 28 MAI · INNSPILL"
- Display 44px Inter Tight italic: "Økt fullført i dag." — "fullført" italic-aksent

TOTAL KPI-grid 2x2 (components-kpi):
- Cards forest-tint #0A6A50, 12px radius, 8pt-grid
- 1: TID 58:42 av 60:00
- 2: REPS 167/165 ↑ +2 over plan
- 3: COMPLIANCE CS 84 ↑ +4 over mål
- 4: DRILLS 4/4 ✓ Alle fullført

ACHIEVEMENTS-seksjon (kun hvis utløst):
- Eyebrow mono caps lime "ACHIEVEMENTS"
- Card-rad: ikon emoji eller Lucide 32px + tittel cream semibold + sub-tekst muted
- Eksempler: "Ny CS-rekord i innspill" / "Første video-logg"
- Achievement med CTA-link (send til coach) får lime accent-border venstre

PER DRILL-tabell:
- Eyebrow mono caps "PER DRILL"
- 4 kompakte rader, mono-tall, sjekkmark høyre
- Format: "1 · Pendel-svinger    25/25  ·  10:02  ·  CS 100  ✓"
- Tabular numbers, JetBrains Mono

NESTE ØKT-card (components-okt-detail kompakt):
- Eyebrow mono "NESTE ØKT"
- Dato + kategori + drill-navn + varighet

Footer (sticky bunn):
- Primær lime pill "LAGRE OG DEL MED COACH →" full bredde 56px
- Sekundær under: "Bare lagre" ghost-link

States:
- Vellykket: stjerne + alle deltas grønne
- Lav CS <70%: dempet ikon, ingen achievements, hero "Økt loggført"
- Avbrutt: "Økt avbrutt" + "Fortsett senere?"-CTA
- Offline: banner topp "Lagret lokalt — synkes når du er online"

Tone: feirende men profesjonell. Ingen confetti. Lime + stjerne + tall som snakker.
```

---

## Leveranse-status

**Levert Runde 3:** 4 Live Session-skjermer (fullscreen mobil-kritisk).

**Total levert hittil:** 35 skjermer (Runde 1: 13 + Runde 2: 18 + Runde 3: 4).

**Mobile-first kjernemekanikker dekket:**
- Tidstracker per drill + totaltid (JetBrains Mono 80px hovedtimer)
- Sirkulære rep-knapper 5/10/25 (56px diameter, lime, forest-tekst)
- Offline-først (IndexedDB) med toast + banner-states
- Video/foto/notat-logg (48px firkant-knapper)
- Compliance-score (faktisk vs planlagt reps + CS-prosent)

**Komponent-referanser brukt:**
- components-live-session (timer + progresjon + sjekkmark)
- components-okt-detail (drill-rader)
- components-buttons (sirkulære rep-knapper + pill-CTAs)
- components-kpi (2x2 og 2-col grids)
- components-featured (hero-blocks + achievements)

**Neste (Runde 4):** Coach-portal (CoachHQ) — separate skjermer for treningsplanlegging, spilleroversikt, feedback-tråder.
