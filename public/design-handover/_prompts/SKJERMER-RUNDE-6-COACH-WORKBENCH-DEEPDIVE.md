# Runde 6 — Coach-Workbench dybde + spiller-paneler (5 skjermer)

> Plattform: **Desktop-first 1440px** (med mobil-variant for skjerm 2).
> Master DS: Forest #005840, Lime #D1F843, Cream #FAFAF7, Inter + Inter Tight + JetBrains Mono, 8pt-grid.
> Konsistent med Runder 1-5. Norsk bokmål, norsk komma.

---

## Innhold

1. `/admin/spillere/[id]/workbench` (desktop) — Komplett Coach-Workbench, tre-kolonne
2. `/admin/spillere/[id]/workbench` (mobil 430px) — Workbench på mobil, slide-over sidebar
3. `/admin/spillere/[id]/varsler` — Coach-varsler knyttet til én spiller
4. `/admin/coach-til-coach` — "Be om råd"-innboks for junior-coach til hovedcoach
5. `/admin/spillere/[id]/historikk` — Coach-handlinger-logg per spiller

---

## Konsept: Workbench som delt komponent

Workbench-flaten brukes både i **PlayerHQ** (`/portal/planlegge/workbench`, spillers eget verktøy) og **AgencyOS** (`/admin/spillere/[id]/workbench`, coach jobber med én spillers plan). Implementeres som én React-komponent med `role` prop:

```
<Workbench role="player" />     // PlayerHQ-kontekst
<Workbench role="coach" playerId={id} />  // AgencyOS-kontekst
```

Forskjeller i `role="coach"`:
- Spiller-context-bar øverst (avatar + navn + bytt spiller-knapp)
- Inspector (høyre 320px) viser coach-handlinger (godkjenn ukentlig plan, send melding, tildel oppgave)
- Sidemeny har ekstra seksjon "Coach-handlinger" (avvik fra plan, ønsker veiledning, kommende test)

---

## Skjerm 1 — `/admin/spillere/[id]/workbench` (desktop 1440px)

### Rute og hensikt

Coach jobber dypt med én spillers plan: ser samme kalender som spilleren ser, men med ekstra context og handlingsverktøy. Klikker fra `/admin/spillere/[id]` "Åpne workbench"-CTA, eller fra Innboks når en oppgave krever planjustering.

### ASCII-wireframe (desktop 1440px)

```
┌─────────┬──────────────────────────────────────────────────┬───────────┐
│ SIDEBAR │ ┌──────────────────────────────────────────────┐ │ INSPECTOR │
│ 240px   │ │ Emma Larsen · Pro · 14 år · WAGR 412         │ │ 320px     │
│ forest- │ │ [Bytt spiller ▾]            [Åpne profil →]   │ │           │
│ 900     │ └──────────────────────────────────────────────┘ │ COACH-    │
│         │                                                  │ HANDLINGER│
│ AKGOLF  │ Workbench — Emma Larsen                          │           │
│         │ Sesong-tre · Planer · Standardøkter · Mål · Stats│ Plan A     │
│ Oversikt│                                                  │ uke 24    │
│ Spillere│ ┌──────────┬──────────────────────────────────┐ │ avventer  │
│ ●       │ │ Sidemeny │ Kalender — Uke 24 (8-14 jun)     │ │ godkjenn  │
│ Grupper │ │ 280px    │ [Uke ▾] [‹] [›]    [Inspector ▶] │ │           │
│ Booking │ │          ├──────────────────────────────────┤ │ [Godkjenn]│
│ Tester  │ │ ▾ Sesong │ Man  Tir  Ons  Tor  Fre  Lør  Søn│ │ [Returnér]│
│ Innboks │ │   Tre    │  8    9   10   11   12   13   14 │ │           │
│ Drift   │ │ • Plan A │ ────────────────────────────────  │ ────────── │
│         │ │ • Plan B │ 08 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ Avvik fra │
│ Brukere │ │          │ 09 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ plan      │
│ Logg ut │ │ ▾ Stand- │ 10  ▓Putt              ▓Range    │           │
│         │ │ ardøkter │ 11        ▓Spill                 │ 14% under │
│         │ │ • Putt   │ 12                               │ planlagte │
│         │ │ • Range  │ 13        ▓Range      ▓Putt      │ økter d.  │
│         │ │ • Spill  │ 14                               │ uka       │
│         │ │ • Mental │ 15  ▓Mental    ▓Spill            │           │
│         │ │          │ 16                               │ ────────── │
│         │ │ ▾ Turn.  │ 17                ▓Range         │ Ønsker    │
│         │ │ • NM Jr  │ 18                               │ veiledning│
│         │ │ • Reg.M  │ 19                               │           │
│         │ │          │ 20                               │ Onsdag    │
│         │ │ ▾ Tren.- │ ────────────────────────────────  │ "Sliter    │
│         │ │ planer   │                                  │ med svik" │
│         │ │ • Vinter │ Klikk en økt for detaljer        │           │
│         │ │ • Sesong │                                  │ [Svar]    │
│         │ │          │                                  │           │
│         │ │ ▾ Mål    │                                  │ ────────── │
│         │ │ • CHS 95 │                                  │ Tildel    │
│         │ │          │                                  │ oppgave   │
│         │ │ ▾ Stats  │                                  │           │
│         │ │          │                                  │ [+ Ny]    │
│         │ └──────────┴──────────────────────────────────┘ │           │
└─────────┴──────────────────────────────────────────────────┴───────────┘
```

### Komponenter brukt

- `components-workbench-sidebar` — Venstre 280px med tre-struktur
- `components-workbench-week` — Hovedkalender uke-visning
- `components-workbench-day` — Klikk på økt → ekspanderer dag-detalj
- `components-agency-player-panel` — Inspector høyre 320px

### States

| State | Beskrivelse |
|---|---|
| **Default** | Sidemeny + kalender + inspector, alle tre synlige |
| **Uke-zoom** | 7 dager horisontalt, økter som blokker per tidsslot |
| **Dag-zoom** | Klikk dag → kalender zoomer til én dag, time-slot 6-22 |
| **Sesong-zoom** | Helt ut: 4-rad pyramide-visning av hele sesongen |
| **Bytt spiller** | Dropdown med søk, viser siste 5 + alle aktive |
| **Plan-godkjenning** | Inspector viser "Plan uke 24 avventer godkjenning" + Godkjenn/Returnér |
| **Avvik-tilstand** | Inspector viser % avvik fra plan med fargekoding |
| **Ønsker veiledning** | Inspector viser ulest besked fra spiller med Svar-CTA |
| **Inspector lukket** | Inspector slide ut, hovedkalender utvider seg |

### Claude Design-prompt (paste-ready)

```
Design /admin/spillere/[id]/workbench for AK Golf HQ — AgencyOS desktop
1440px.

Layout: 3 søyler. Venstre forest-900 sidebar 240px (standard AgencyOS-nav).
Midt-flate cream #FAFAF7 (variable bredde). Høyre inspector hvit bg 320px
med 1px forest-200 border-left.

Spiller-context-bar (over hele midt-flaten): hvit kort, sticky top,
forest-200 border-bottom, padding 16px 32px. Viser: avatar 40px + navn
"Emma Larsen" Inter Tight 20px medium + meta "Pro · 14 år · WAGR 412"
forest-600 13px. Høyre: [Bytt spiller ▾]-dropdown og [Åpne profil →]-
lenke forest-700.

Workbench-hovedrad: H1 "Workbench — Emma Larsen" Inter Tight 28px,
breadcrumb-style subtitle "Sesong-tre · Planer · Standardøkter · Mål ·
Stats" forest-600 13px.

Sidemeny 280px (venstre i midt-flaten): hvit bg, forest-200 border-right.
Padding 16px. Tre-struktur med expandable seksjoner: Sesong-tre, Planer,
Standardøkter, Turneringer, Treningsplaner, Mål, Stats. Hver seksjon:
chevron + tittel (Inter 14px medium forest-900) og barn (Inter 13px
forest-700 indented 16px). Aktiv barn: lime-tint bg + lime accent 3px
left.

Kalender (uke-view): top-toolbar [Uke ▾]-velger (Sesong/Måned/Uke/Dag),
[‹][›]-navigering, [Inspector ▶/◀]-toggle. Under: 7 kolonner Man-Søn,
14 rader 06-20. Bakgrunn cream, forest-100 separatorer. Økt-blokker
fyller relevante tidsslots med farge per type: putt=lime, range=forest-
700, spill=gold, mental=forest-400. Tekst i blokk: Inter 12px medium,
truncated.

Inspector høyre 320px: hvit bg, padding 24px. Innhold gruppert i
seksjoner med 24px gap:
1. Plan-godkjenning: status-pill + Godkjenn (lime) + Returnér (outline)
2. Avvik fra plan: stat "14% under planlagte økter" rød tekst + bar-chart
   mini
3. Ønsker veiledning: kortere meldings-snippet + Svar-CTA outline
4. Tildel oppgave: + Ny-knapp dashed-border-card

Coach-handlinger-knapper er kraftige lime CTAs eller forest-700 outline.

Bruk components-workbench-sidebar, components-workbench-week,
components-workbench-day, components-agency-player-panel.
```

---

## Skjerm 2 — `/admin/spillere/[id]/workbench` (mobil 430px)

### Rute og hensikt

Mobil-variant av Workbench. Coach kan jobbe med en spiller fra mobilen — typisk når en spiller sender melding kl 21:00 og coach vil sjekke planen før hen svarer. Sidemeny blir hamburger-meny, inspector blir bunn-sheet.

### ASCII-wireframe (mobil 430px)

```
┌──────────────────────────────────┐
│ ☰   AK Golf HQ          🔔 ●   │
├──────────────────────────────────┤
│ [Søk: Emma Larsen ▾]             │
├──────────────────────────────────┤
│ Emma Larsen                      │
│ Pro · 14 år · WAGR 412           │
│                                  │
│ Workbench                        │
│                                  │
│ [Uke ▾]  ‹ Uke 24  ›             │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Man 8/6                       │ │
│ │ 10:00  ▓ Putt — 60 min        │ │
│ │ 11:00  ▓ Spill — 90 min       │ │
│ │ 13:00  ▓ Range — 60 min       │ │
│ ├──────────────────────────────┤ │
│ │ Tir 9/6                       │ │
│ │ 15:00  ▓ Mental — 30 min      │ │
│ │ 16:00  ▓ Spill — 60 min       │ │
│ ├──────────────────────────────┤ │
│ │ Ons 10/6                      │ │
│ │ (Ingen økter)                 │ │
│ ├──────────────────────────────┤ │
│ │ Tor 11/6                      │ │
│ │ 10:00  ▓ Range — 60 min       │ │
│ ├──────────────────────────────┤ │
│ │ Fre 12/6                      │ │
│ │ 14:00  ▓ Booking m/coach      │ │
│ │ 17:00  ▓ Range — 60 min       │ │
│ ├──────────────────────────────┤ │
│ │ Lør 13/6                      │ │
│ │ 09:00  ▓ Spill 18 hull        │ │
│ ├──────────────────────────────┤ │
│ │ Søn 14/6                      │ │
│ │ (Restitusjon)                 │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ▾ Coach-handlinger (3)        │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

Hamburger åpner slide-over fra venstre:

```
┌──────────────────────────────────┐
│ Workbench-meny             [✕]  │
├──────────────────────────────────┤
│ ▾ Sesong-tre                     │
│   • Plan A — aktiv                │
│   • Plan B — utkast               │
│                                  │
│ ▾ Standardøkter                  │
│   • Putt                          │
│   • Range                         │
│   • Spill                         │
│   • Mental                        │
│                                  │
│ ▾ Turneringer                    │
│   • NM Junior                     │
│   • Region.mester                 │
│                                  │
│ ▾ Treningsplaner                 │
│   • Vinter '25-'26                │
│   • Sesong '26                    │
│                                  │
│ ▾ Mål                            │
│   • CHS 95 mph                    │
│   • Putt 3m: 8/10                 │
│                                  │
│ ▾ Stats                          │
└──────────────────────────────────┘
```

### Komponenter brukt

- `components-workbench-sidebar` (mobil-variant) — Slide-over fra venstre
- `components-workbench-week` (mobil) — Stack av dag-kort vertikalt
- `components-agency-player-panel` (mobil) — Bunn-sheet for coach-handlinger
- `components-inputs` — Søk-bar med spiller-autocomplete

### States

| State | Beskrivelse |
|---|---|
| **Default** | Spiller-context + uke-stack vertikalt + samlebånd-bottom |
| **Hamburger åpen** | Slide-over fra venstre med tre-struktur |
| **Bytt spiller** | Søk-bar ekspanderer, viser nylige + søk |
| **Dag tom** | "(Ingen økter)" forest-500 italic |
| **Restitusjon-dag** | Lime-tint bg på dag-rad, "(Restitusjon)" tekst |
| **Coach-handlinger bunnsheet** | Slide opp fra bunn, 3 stack: godkjenn plan, svar melding, tildel oppgave |
| **Økt klikket** | Sheet glir opp fra bunn med øktdetaljer + Marker fullført/Endre |

### Claude Design-prompt (paste-ready)

```
Design /admin/spillere/[id]/workbench (mobil 430px) for AK Golf HQ —
AgencyOS mobil-variant.

Layout: 1 kolonne, ingen sidebar synlig. Header 56px med hamburger
venstre + AK Golf HQ-tittel + varsel-bjelle høyre. Padding 16px.

Søk-bar under header: hvit kort, lime border når aktiv, viser valgt
spiller eller "[Søk spiller...]". Dropdown viser nylige 5 + søk.

Spiller-context-rad: avatar 40px + navn Inter Tight 18px + meta forest-
600 13px. Ingen "Åpne profil" på mobil (tap navn → profil).

H1 "Workbench" Inter Tight 24px.

Uke-toolbar: [Uke ▾] selector + [‹] [›]-piler + uke-label "Uke 24" Inter
14px medium. Horisontal scroll hvis nødvendig.

Dag-stack: vertikal kjede av dag-kort. Hvert kort:
- Header-rad: dag + dato "Man 8/6" Inter 14px medium forest-900,
  forest-50 bg
- Body: liste av økter, hver = farge-prikk + tid (JetBrains Mono 13px) +
  type-navn + varighet (Inter 13px forest-700)
- Tom dag: "(Ingen økter)" forest-500 italic 13px
- Restitusjon-dag: lime-tint bg over hele kortet

Bunn-CTA: ekspanderbart kort "▾ Coach-handlinger (3)" — tap ekspanderer
til bunn-sheet med tre handlinger:
1. Godkjenn ukentlig plan (lime CTA)
2. Svar på melding (outline)
3. Tildel oppgave (outline)

Hamburger-slide-over: 320px bredde, hvit bg, slide-in 250ms. Innhold =
tre-struktur identisk med desktop sidebar (Sesong, Standardøkter,
Turneringer, Treningsplaner, Mål, Stats). Tap kategori = expand barn.

Bruk components-workbench-sidebar (mobil), components-workbench-week,
components-agency-player-panel (mobil), components-inputs.
```

---

## Skjerm 3 — `/admin/spillere/[id]/varsler`

### Rute og hensikt

Spiller-spesifikk varsel-feed. Mens `/admin/varsler` viser alle på tvers, denne ruten filtrerer kun varsler knyttet til én spiller: avvik fra plan, ønsker veiledning, kommende test, tilknyttede gruppeøkter, foreldre-kommunikasjon. Coach kan handle direkte fra hver rad.

### ASCII-wireframe (desktop 1440px)

```
┌─────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR │ Topbar                                                         │
├─────────┼───────────────────────────────────────────────────────────────┤
│         │ ← Emma Larsens profil                                          │
│         │                                                                │
│         │  Varsler — Emma Larsen                                         │
│         │  Alle hendelser som krever oppmerksomhet for denne spilleren   │
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ Filter: [Alle typer ▾]  [Siste 30 d ▾]  [Uleste først ▾]   ││
│         │ │ 7 uleste · 23 totalt                                        ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ I dag                                                          │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ ● 14:23  Avvik fra plan                                    ││
│         │ │   Emma har avlyst 2 av 3 planlagte økter denne uka         ││
│         │ │   [Se planen] [Send påminnelse]                            ││
│         │ ├────────────────────────────────────────────────────────────┤│
│         │ │ ● 12:08  Ønsker veiledning                                 ││
│         │ │   "Jeg sliter med svikten — kan jeg få en kort sjekk?"     ││
│         │ │   [Svar] [Marker som lest]                                 ││
│         │ ├────────────────────────────────────────────────────────────┤│
│         │ │ ● 09:15  Booking opprettet                                 ││
│         │ │   Privatime fredag 12. jun kl 14:00 (Onsøy GK)             ││
│         │ │   [Se booking]                                             ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ I går                                                          │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │   16:42  Test fullført — CHS                               ││
│         │ │   Resultat: 95 mph (mål: 92 mph) → over mål                ││
│         │ │   [Se historikk]                                           ││
│         │ ├────────────────────────────────────────────────────────────┤│
│         │ │ ● 11:30  Foreldre-melding                                  ││
│         │ │   Anne Larsen (mor): "Når starter sommer-camp'en?"         ││
│         │ │   [Svar foresatt]                                          ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ Kommer opp                                                     │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ 14. jun  Kommende test                                     ││
│         │ │   Putt-test 3 m — frist fredag                             ││
│         │ │   [Se test]                                                ││
│         │ ├────────────────────────────────────────────────────────────┤│
│         │ │ 15. jun  Gruppeøkt                                         ││
│         │ │   Junior-elite mandag kl 17:00 (Onsøy GK)                  ││
│         │ │   [Se gruppen]                                             ││
│         │ └────────────────────────────────────────────────────────────┘│
└─────────┴───────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-notifications` — Varsel-rad mønster (samme som /admin/varsler)
- `components-buttons` — Inline handlings-knapper per rad
- `components-inputs` — Filter-dropdowns

### States

| State | Beskrivelse |
|---|---|
| **Default** | Tidsgruppert liste (I dag, I går, Tidligere, Kommer opp) |
| **Tom** | "Ingen varsler for Emma" + forest-400 illustration |
| **Filtrert** | Kun valgt type vises, andre grupper skjules |
| **Ulest** | ● lime-prikk venstre + fet font |
| **Lest** | Ingen prikk, lighter font |
| **Avvik** | Rød prikk i stedet for lime, advarsel-rad-stil |
| **Klikk rad** | Slide-over fra høyre med full context |
| **Handling** | Knapp klikket → toast "Påminnelse sendt", rad blir grå/lest |

### Claude Design-prompt (paste-ready)

```
Design /admin/spillere/[id]/varsler for AK Golf HQ — AgencyOS desktop
1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 900px.

Topp: tilbake-lenke "← Emma Larsens profil" forest-600 14px. H1
"Varsler — Emma Larsen" Inter Tight 28px, undertittel "Alle hendelser
som krever oppmerksomhet for denne spilleren" forest-600 14px.

Filter-kort: hvit, padding 16px, border forest-200. Tre dropdowns
(type, periode, sortering) + meta-tekst høyre "7 uleste · 23 totalt"
JetBrains Mono 13px.

Varsel-liste gruppert per tid: section-header "I dag", "I går",
"Tidligere", "Kommer opp" — Inter 12px uppercase forest-500 medium,
mb 8px.

Varsel-kort: hvit bg, forest-200 border, 16px radius, 16px gap mellom.
Hver rad i et kort: padding 16px, border-bottom forest-100 (siste:
ingen border).

Rad-struktur (left to right):
- Ulest-prikk 8px (lime for uleste, rød for avvik, transparent for leste)
- Tid (Inter 12px JetBrains Mono forest-500) + type-tag (forest-100 fill
  forest-700 tekst 11px uppercase) — i header
- Tittel/beskrivelse (Inter 14px forest-900 for ulest = medium, forest-
  600 for lest)
- Handlings-knapper (small outline, Inter 12px medium)

Per varsel-type, ulike handlinger:
- Avvik: [Se planen] [Send påminnelse]
- Ønsker veiledning: [Svar] [Marker som lest]
- Booking: [Se booking]
- Test: [Se historikk]
- Foreldre: [Svar foresatt]
- Kommende: [Se test/gruppen]

Klikk en rad (utenfor knapp) = slide-over åpner med full context.

Bruk components-notifications, components-buttons, components-inputs.
```

---

## Skjerm 4 — `/admin/coach-til-coach`

### Rute og hensikt

Intern "Be om råd"-innboks. Junior-coach (INSTRUCTOR) løfter saker til hovedcoach (ADMIN) når hen er usikker på beslutning: planjustering, vanskelig forelder, ny test-tildeling, taktisk valg. Trådsamtaler med spiller-referanse innbakt. Hovedcoach ser alle ubehandlede saker øverst.

### ASCII-wireframe (desktop 1440px)

```
┌─────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR │ Topbar                                                         │
├─────────┼───────────────────────────────────────────────────────────────┤
│         │  Coach-til-coach                              [+ Ny tråd]      │
│         │  Interne spørsmål og veiledning mellom coachene                │
│         │                                                                │
│         │ ┌─────────────────────┬─────────────────────────────────────┐ │
│         │ │ Innboks             │ Sondre Olsen → Anders Kristiansen   │ │
│         │ │ 3 ubehandlet        │ Om: Tobias Olsen · 28. mai 14:32   │ │
│         │ ├─────────────────────┤ "Hvordan bør jeg håndtere..."       │ │
│         │ │ ● Sondre Olsen      │                                     │ │
│         │ │   "Hvordan bør jeg  ├─────────────────────────────────────┤ │
│         │ │   håndtere Tobias?" │ ┌─────────────────────────────────┐ │ │
│         │ │   Om: Tobias Olsen  │ │ Sondre Olsen · 28. mai 14:32    │ │ │
│         │ │   28. mai           │ │                                  │ │ │
│         │ │                     │ │ Hei Anders, jeg coacher Tobias  │ │ │
│         │ │ ● Markus Berger     │ │ Olsen som har stagnert siste 4  │ │ │
│         │ │   "Plan B for Emma  │ │ uker på CHS. Han har forsøkt    │ │ │
│         │ │   – din vurdering?" │ │ tre ulike tilnærminger uten     │ │ │
│         │ │   Om: Emma Larsen   │ │ resultat. Bør jeg endre mål    │ │ │
│         │ │   27. mai           │ │ eller endre treningsfokus?      │ │ │
│         │ │                     │ │                                  │ │ │
│         │ │ ● Ingrid Holm       │ │ [Vedlegg: Tobias-stats.pdf]     │ │ │
│         │ │   "Forelder krever  │ │                                  │ │ │
│         │ │   refusjon"         │ │ Spiller-context:                 │ │ │
│         │ │   Om: Lukas P.      │ │ • Tobias Olsen, 13 år, Junior   │ │ │
│         │ │   26. mai           │ │ • Plan A: Junior Sesong         │ │ │
│         │ │                     │ │ • Coach: Sondre Olsen           │ │ │
│         │ │ ─── Tidligere ───   │ │ • Mål: CHS 95 mph (nå 88)       │ │ │
│         │ │                     │ │                                  │ │ │
│         │ │   Markus Berger     │ │ [Åpne Tobias' workbench →]      │ │ │
│         │ │   "Test-resultat..." │ └─────────────────────────────────┘ │ │
│         │ │   25. mai           │                                     │ │
│         │ │                     │ ┌─────────────────────────────────┐ │ │
│         │ │   Sondre Olsen      │ │ [Svar Sondre...]                │ │ │
│         │ │   "Booking-konflikt"│ │                                  │ │ │
│         │ │   24. mai (lukket)  │ │                                  │ │ │
│         │ │                     │ │ [📎 Vedlegg]    [Marker løst]   │ │ │
│         │ └─────────────────────┘ │                          [Send] │ │ │
│         │                         └─────────────────────────────────┘ │ │
│         │                                                                │
└─────────┴───────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-agency-inbox` — To-pane layout (liste + tråd)
- `components-notifications` — Tråd-rad-mønster
- `components-buttons` — Send, marker løst, åpne workbench
- `components-inputs` — Svar-textarea, vedlegg

### States

| State | Beskrivelse |
|---|---|
| **Default (ADMIN)** | Liste av åpne tråder + valgt tråd i høyre pane |
| **Default (INSTRUCTOR)** | Kun egne tråder, "+ Ny tråd"-CTA fremhevet |
| **Tom** | "Ingen åpne tråder" + tom-CTA "Spør hovedcoach om noe" |
| **Ulest tråd** | ● lime-prikk venstre + fet font |
| **Lukket tråd** | Grå-tint, "(lukket)" suffix |
| **Spiller-context** | Embedded kort i tråd med direkte lenke til workbench |
| **Vedlegg** | Filnavn + ikon + størrelse, klikk åpner i ny tab |
| **Send-spinner** | Send-knapp viser spinner |
| **Marker løst** | Knapp klikket → tråd flyttes til lukket-seksjon |

### Claude Design-prompt (paste-ready)

```
Design /admin/coach-til-coach for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1400px.

Topp: H1 "Coach-til-coach" Inter Tight 28px, undertittel "Interne
spørsmål og veiledning mellom coachene" forest-600 14px. Høyre: CTA
"+ Ny tråd" lime fyll.

To-pane layout (62/38 split eller 380/rest): venstre pane = tråd-liste,
høyre pane = valgt tråd.

Venstre pane (tråd-liste, 380px): hvit bg, forest-200 border, 24px
radius. Topp: "Innboks · 3 ubehandlet" Inter 13px medium. Liste av rader:
ulest-prikk 8px + avatar 32px + (avsender Inter 13px medium + snippet
Inter 12px forest-600 truncated 2 linjer + "Om: [spiller-navn]" forest-
500 11px italic + dato 11px JetBrains Mono høyre). Padding 12px, border-
bottom forest-100, hover forest-50 cursor pointer. Valgt rad: lime-tint
bg.

Separator-rad "── Tidligere ──" Inter 11px uppercase forest-500.
Lukkede tråder under, dim opacity 0.7.

Høyre pane (valgt tråd): hvit bg, forest-200 border, 24px radius,
padding 0 (innhold har egen padding).

Tråd-header: padding 24px, forest-200 border-bottom. Tittel "Sondre
Olsen → Anders Kristiansen" Inter Tight 18px + meta "Om: Tobias Olsen ·
28. mai 14:32" forest-600 13px.

Tråd-body: scrollable. Meldinger som chat-bobler: avatar venstre +
boble (forest-50 bg for mottatt, lime-tint bg for sendt) med tekst Inter
14px + meta-fot "Sondre Olsen · 28. mai 14:32" Inter 11px forest-500.
Padding 16px boble, 12px radius.

Embedded spiller-context-kort i tråd: forest-50 bg, lime-accent left 3px,
padding 12px, 8px radius. Innhold: bullet-liste med spiller-meta
(navn, alder, plan, coach, mål). Footer: "[Åpne Tobias' workbench →]"
lenke lime-tint pill.

Composer (bunn av tråd): padding 16px, forest-100 border-top. Textarea
80px høyde, placeholder "Svar Sondre...". Action-rad: venstre [📎 Vedlegg]
[Marker løst] outline-knapper, høyre [Send] lime fyll.

Bruk components-agency-inbox, components-notifications, components-
buttons, components-inputs.
```

---

## Skjerm 5 — `/admin/spillere/[id]/historikk`

### Rute og hensikt

Audit-spor av alle coach-handlinger på én spiller: godkjenninger, avvisninger, notater, tildelte oppgaver, plan-justeringer, kommunikasjon, ekstra-tildelte tester. Filter per handlings-type. Brukes for å gjenfinne hvorfor en beslutning ble tatt, eller for å se hva en junior-coach faktisk har gjort.

### ASCII-wireframe (desktop 1440px)

```
┌─────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR │ Topbar                                                         │
├─────────┼───────────────────────────────────────────────────────────────┤
│         │ ← Emma Larsens profil                                          │
│         │                                                                │
│         │  Historikk — Emma Larsen                          [Eksporter]  │
│         │  Alle coach-handlinger og endringer på denne spilleren         │
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ Type:   [Alle ▾]  Coach: [Alle ▾]  Periode: [Siste 90 d ▾] ││
│         │ │ Søk     [_______________]               142 hendelser       ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ Tidsserie                                                  ││
│         │ │ 30                                                         ││
│         │ │ 20  ▓                          ▓                            ││
│         │ │ 10  ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓                       ││
│         │ │  0 ─────────────────────────────────────────                ││
│         │ │     uke18    20      22      24       26                    ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ Idag · 28. mai 2026                                            │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ 14:23  Plan godkjent          Anders K.                     ││
│         │ │        Uke 24 plan A godkjent uten endringer                ││
│         │ ├────────────────────────────────────────────────────────────┤│
│         │ │ 12:08  Melding sendt          Anders K.                     ││
│         │ │        Svar på spørsmål om svikten                          ││
│         │ ├────────────────────────────────────────────────────────────┤│
│         │ │ 09:15  Booking opprettet      Anders K.                     ││
│         │ │        Privatime fredag 12. jun kl 14:00 (Onsøy GK)         ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ I går · 27. mai 2026                                           │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ 16:42  Test resultat lagret   Anders K.                     ││
│         │ │        CHS: 95 mph (mål: 92) → over mål                     ││
│         │ ├────────────────────────────────────────────────────────────┤│
│         │ │ 11:30  Notat lagt til         Markus B.                     ││
│         │ │        "Trenger fokus på utslag fra ru"                     ││
│         │ ├────────────────────────────────────────────────────────────┤│
│         │ │ 09:00  Oppgave tildelt        Anders K.                     ││
│         │ │        "Spille 9 hull med kun jern, frist 31. mai"          ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ Mandag · 26. mai 2026                                          │
│         │ ...                                                            │
└─────────┴───────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-notifications` — Tidsserie-rad-mønster (gjenbruk fra varsler)
- `components-kpi` — Mini-tidsserie-graf øverst
- `components-buttons` — Eksporter til PDF/CSV
- `components-inputs` — Filter-dropdowns

### States

| State | Beskrivelse |
|---|---|
| **Default** | Tidsserie-graf + liste gruppert per dag, scroll for mer |
| **Tom** | "Ingen historikk for Emma" + forest-400 illustration |
| **Filtrert** | Smal liste basert på type/coach/periode |
| **Last mer** | "Vis flere..." nederst, lazy-load 30 per side |
| **Klikk rad** | Slide-over åpner med full handlings-context (diff, undo-hvis-mulig) |
| **Eksporter** | Modal med format-velg (PDF/CSV/JSON) + datointervall |
| **Type-filter** | Liste: Plan, Booking, Test, Notat, Oppgave, Melding, Foreldre |

### Claude Design-prompt (paste-ready)

```
Design /admin/spillere/[id]/historikk for AK Golf HQ — AgencyOS desktop
1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1000px.

Topp: tilbake-lenke "← Emma Larsens profil". H1 "Historikk — Emma
Larsen" Inter Tight 28px, undertittel "Alle coach-handlinger og endringer
på denne spilleren". Høyre: [Eksporter]-knapp outline forest-700.

Filter-kort: hvit bg padding 16px. Type-dropdown, Coach-dropdown,
Periode-dropdown, søkefelt. Høyre: hendelse-teller "142 hendelser"
JetBrains Mono 13px forest-500.

Tidsserie-graf: hvit kort, padding 24px, border forest-200, 16px radius.
Tittel "Tidsserie" Inter Tight 16px. Bar-chart av antall hendelser per
uke. Y-akse 0-30, x-akse ukenummer 18-28. Forest-700 fyll, lime accent
for "denne uka". Høyde 120px.

Historikk-liste gruppert per dag: section-header "Idag · 28. mai 2026"
Inter Tight 16px forest-700 medium, mb 8px.

Hver dag = hvit kort med rader. Rad-struktur:
- Tid 14:23 (JetBrains Mono 13px forest-500, 60px width)
- Type-badge "Plan godkjent" (forest-100 fill forest-700 tekst, Inter
  12px medium, 6px radius, 4px 8px padding, 140px width)
- Coach (avatar 24px + navn Inter 13px forest-900, 140px)
- Beskrivelse (Inter 13px forest-700, flex)

Type-badges fargekodede:
- Plan = forest-700 bg / cream tekst
- Booking = lime fyll / forest-900 tekst
- Test = gold #B8975C bg / cream tekst
- Notat = forest-100 fill / forest-700 tekst
- Oppgave = forest-200 fill / forest-700 tekst
- Melding = blue-tint bg
- Foreldre = pink-tint bg

Hover rad: forest-50 bg, cursor pointer. Klikk = slide-over åpner.

Lazy-load: "Vis flere..." outline-knapp nederst når man scroller.

Eksport-modal: 480px, padding 32px. Format-velg radio (PDF, CSV, JSON),
datointervall, [Last ned]-CTA lime.

Bruk components-notifications, components-kpi, components-buttons,
components-inputs.
```

---

## Leveranse-status — Runde 6

**Skjermer dekket i denne filen (5):**
- /admin/spillere/[id]/workbench (desktop)
- /admin/spillere/[id]/workbench (mobil)
- /admin/spillere/[id]/varsler
- /admin/coach-til-coach
- /admin/spillere/[id]/historikk

**Total skjermtelling oppdatert:**

| Runde | Område | Skjermer |
|---|---|---|
| 1 | Onboarding + onboarding-flows | 8 |
| 2 | PlayerHQ kjerneflater | 10 |
| 3 | AgencyOS kjerneflater | 9 |
| 4 | Innboks, varsler, profil | 6 |
| 5 | AgencyOS resterende moduler | 6 |
| 6 | Coach-Workbench dybde | **5** |
| 7 | Booking 5-stegs flyt | (5 — Runde 7) |
| 8 | Foreldre + Marketing + Misc | (6 — Runde 8) |
| **Sum** | | **57 skjermer** |

Runde 6 ferdig. Klar for runde 7.
