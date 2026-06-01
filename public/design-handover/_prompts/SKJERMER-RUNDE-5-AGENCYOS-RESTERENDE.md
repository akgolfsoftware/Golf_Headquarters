# Runde 5 — AgencyOS resterende moduler (6 skjermer)

> Plattform: **Desktop-first 1440px** med mørk forest-900 sidebar (240px).
> Master DS: Forest #005840, Lime #D1F843, Cream #FAFAF7, Inter + Inter Tight + JetBrains Mono, 8pt-grid.
> Konsistent med Runder 1-4. Norsk bokmål, norsk komma.

---

## Innhold

1. `/admin/bookinger` — Booking-tabell + inline ny booking-form
2. `/admin/bookinger/ny` — Booking-opprettelse, 5-stegs full skjerm
3. `/admin/tester` — Tester-matrise (spillere × tester)
4. `/admin/drift` — Drift-panel landing med tabs/accordion
5. `/admin/drift/team` — Team-administrasjon med CBAC-roller
6. `/admin/drift/plan-maler` — Plan-mal-bibliotek

---

## Layout-rammeverk (AgencyOS, gjelder alle skjermer)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1440px viewport                                                          │
├─────────┬───────────────────────────────────────────────────────────────┤
│         │ Topbar 64px — Søk · Varsler · Bytt portal · Profil           │
│ Sidebar ├───────────────────────────────────────────────────────────────┤
│ 240px   │                                                                │
│ forest- │  Hovedinnhold (max-width 1200px, padding 32px)                │
│ 900     │                                                                │
│ cream   │                                                                │
│ text    │                                                                │
│         │                                                                │
│ Logo    │                                                                │
│ Nav:    │                                                                │
│ Oversikt│                                                                │
│ Spillere│                                                                │
│ Grupper │                                                                │
│ Booking │                                                                │
│ Tester  │                                                                │
│ Innboks │                                                                │
│ Drift   │                                                                │
│         │                                                                │
│ Foot:   │                                                                │
│ Brukere │                                                                │
│ Logg ut │                                                                │
└─────────┴───────────────────────────────────────────────────────────────┘
```

Sidebar-aktiv item: lime-tint bakgrunn (rgba(209,248,67,0.12)) + lime-tekst.

---

## Skjerm 1 — `/admin/bookinger`

### Rute og hensikt

Sentral oversikt over alle bookinger på tvers av coacher og lokasjoner. Hovedcoach (ADMIN) ser alt, junior-coach (INSTRUCTOR) ser egne pluss tilknyttede. Tabell støtter inline opprettelse via "+ Ny booking"-CTA som åpner form i top av tabellen uten å forlate skjermen.

### ASCII-wireframe (desktop 1440px)

```
┌─────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR │ Topbar                                                         │
├─────────┼───────────────────────────────────────────────────────────────┤
│ AK GOLF │                                                                │
│         │  Bookinger                                              [+ Ny] │
│ Oversikt│  Alle bookinger på tvers av coacher og anlegg                  │
│ Spillere│                                                                │
│ Grupper │ ┌────────────────────────────────────────────────────────────┐│
│ Booking ●│ │ Filter:  [Denne uke ▾] [Alle coacher ▾] [Alle status ▾]    ││
│ Tester  │ │          Søk spiller [____________]              42 treff   ││
│ Innboks │ └────────────────────────────────────────────────────────────┘│
│ Drift   │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│ Brukere │ │ Spiller         Dato     Tid    Coach   Type   Credits  ▾ ││
│ Logg ut │ ├────────────────────────────────────────────────────────────┤│
│         │ │ Emma Larsen     12. jun  14:00  Anders  60 min 1/12  ●Bekr.││
│         │ │ Ole Hansen      12. jun  15:30  Anders  90 min 2/8   ●Bekr.││
│         │ │ Lukas Pedersen  12. jun  17:00  Markus  60 min upfr  ◐Avv. ││
│         │ │ Sofie Andresen  13. jun  09:00  Anders  60 min 3/12  ●Bekr.││
│         │ │ Tobias Olsen    13. jun  11:00  Markus  Test    -    ●Bekr.││
│         │ │ Jonas Berg      13. jun  13:00  Anders  60 min 0/0  ✕Mangl.││
│         │ │ Mathilde Vik    14. jun  10:00  Markus  60 min 4/12 ●Bekr. ││
│         │ │ ...                                                         ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ Viser 1-20 av 42                       [‹ Forrige] [1] 2 [›]  │
└─────────┴───────────────────────────────────────────────────────────────┘
```

Når "+ Ny"-CTA klikkes, ekspanderes inline form over tabellen:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Ny booking                                                       [✕]   │
├────────────────────────────────────────────────────────────────────────┤
│ Spiller        [Søk navn... ▾]   Coach     [Anders Kristiansen ▾]      │
│ ↳ Emma Larsen, Pro, 1/12 credits                                       │
│                                                                         │
│ Dato           [12. jun 2026 📅]  Tid     [14:00 ▾]                    │
│ Type økt       [60 min ▾]         Anlegg  [Onsøy GK ▾]                 │
│                                                                         │
│ Credit-sjekk:  ●  Tilgjengelig (1 credit gjenstår)                     │
│                                                                         │
│ ☐  Betal upfront (Stripe) i stedet for credit-trekk                    │
│                                                                         │
│                                            [Avbryt]  [Bekreft booking] │
└────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-agency-bookings` — Tabell + filter-rad + paginering
- `components-credit-indicator` — Viser brukt/saldo + status-prikk
- `components-inputs` — Søkefelt, dropdown, datepicker
- `components-buttons` — Primær lime CTA, sekundær outline

### States

| State | Beskrivelse |
|---|---|
| **Default** | Tabell fylt med bookinger denne uken |
| **Tom** | "Ingen bookinger ennå" + tom-CTA "Opprett første booking" |
| **Form åpen** | Inline form ekspanderer over tabell, focus i Spiller-felt |
| **Credits=0** | "Bekreft booking"-knapp disabled, hint: "Spiller mangler credits. Toggle upfront-betaling eller fyll på saldo." |
| **Credit OK + upfront** | Begge alternativ aktive, default credit-trekk |
| **Lagrer** | Knapp viser spinner, alle felt disabled |
| **Suksess** | Inline form lukkes, ny rad blinker grønn 2s i tabellen |
| **Feil** | Rød toast øverst: "Coach ikke tilgjengelig. Velg annen tid." |

### Claude Design-prompt (paste-ready)

```
Design /admin/bookinger for AK Golf HQ — AgencyOS desktop 1440px.

Layout: mørk forest-900 sidebar 240px med cream-tekst, hovedflate cream
#FAFAF7. Padding 32px, max-width 1200px.

Header: H1 "Bookinger" (Inter Tight 32px/40px forest-900), subtitle "Alle
bookinger på tvers av coacher og anlegg" (Inter 14px forest-600). Høyre:
primær CTA "+ Ny booking" (lime #D1F843 bg, forest-900 tekst, 40px høyde,
16px radius).

Filter-rad: hvit kort, 16px padding, border forest-200. Fra venstre:
Periode-dropdown (Denne uke), Coach-dropdown (Alle coacher), Status-
dropdown (Alle status), søkefelt "Søk spiller". Høyre: treff-teller
"42 treff" (Inter 13px forest-500).

Tabell: hvit kort, border forest-200, 24px radius. Header-rad: forest-50
bg, Inter 12px uppercase forest-700, padding 12px 16px. Kolonner:
Spiller (200px), Dato (100px), Tid (80px), Coach (120px), Type (100px),
Credits (140px), Status (140px), Actions (60px). Datarad: hover forest-50,
border-bottom forest-100, padding 16px. Spiller-cell: avatar 32px +
navn (Inter 14px forest-900). Credits-cell: "1/12" (JetBrains Mono 13px)
+ status-prikk (●bekreftet forest-700, ◐avventer gold #B8975C, ✕mangler
red-500). Actions: tre-prikk-meny (rediger, kanseller, sende SMS).

Paginering nederst: forest-600 tekst "Viser 1-20 av 42", sidesveksler høyre.

Inline ny-booking form (ekspanderer når "+ Ny" klikkes): lime-tint
bakgrunn (rgba(209,248,67,0.08)), border lime, padding 24px, 16px radius.
Grid 2 kolonner med 24px gap. Felt: Spiller (autocomplete med spiller-
hint som viser navn + plan + credits), Coach, Dato, Tid, Type økt, Anlegg.
Credit-sjekk-rad: ikon-prikk + tekst "Tilgjengelig (1 credit gjenstår)".
Toggle "Betal upfront (Stripe)". Footer: Avbryt + Bekreft booking-knapp
(disabled hvis credits=0 og ikke upfront).

Bruk components-agency-bookings, components-credit-indicator,
components-inputs, components-buttons fra preview-biblioteket.
```

---

## Skjerm 2 — `/admin/bookinger/ny`

### Rute og hensikt

Full-skjerm bookingflyt når coach kommer fra eksternt sted (deep-link, kalender, varsel). Samme 5-stegs flyt som offentlig `/booking/*` (Runde 7), men med coach-context: kan velge spiller, bypasse upfront, sette tidsslot manuelt utenfor publisert tilgjengelighet.

### ASCII-wireframe (desktop 1440px)

```
┌─────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR │ Topbar                                                         │
├─────────┼───────────────────────────────────────────────────────────────┤
│         │ ← Tilbake til bookinger                                        │
│         │                                                                │
│         │  Ny booking                                                    │
│         │  Steg 3 av 5 — Velg tid                                        │
│         │                                                                │
│         │  ●━━●━━●━━○━━○                                                 │
│         │  Spiller Anlegg Coach Tid Bekreft                              │
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ Emma Larsen · Onsøy GK · Anders Kristiansen                ││
│         │ │ 1/12 credits gjenstår                                       ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ Uke 24 — 8. til 14. jun         [‹ Forrige uke] [Neste uke ›] │
│         │                                                                │
│         │ ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐            │
│         │ │ Man  │ Tir  │ Ons  │ Tor  │ Fre  │ Lør  │ Søn  │            │
│         │ │ 8/6  │ 9/6  │ 10/6 │ 11/6 │ 12/6 │ 13/6 │ 14/6 │            │
│         │ ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤            │
│         │ │ 09:00│ 09:00│ -    │ 09:00│ 09:00│ -    │ -    │  ●Ledig    │
│         │ │ 10:00│ 10:00│ -    │ 10:00│ 10:00│ -    │ -    │  ●Ledig    │
│         │ │ ░░░░░│ 11:00│ -    │ 11:00│ ░░░░░│ -    │ -    │  ▒Opptatt  │
│         │ │ ░░░░░│ 12:00│ -    │ ░░░░░│ ░░░░░│ -    │ -    │            │
│         │ │ 13:00│ 13:00│ -    │ 13:00│ 13:00│ -    │ -    │            │
│         │ │ 14:00│ 14:00│ -    │ 14:00│[14:00]│-    │ -    │  ◉Valgt    │
│         │ │ 15:00│ 15:00│ -    │ 15:00│ 15:00│ -    │ -    │            │
│         │ │ ░░░░░│ 16:00│ -    │ 16:00│ 16:00│ -    │ -    │            │
│         │ │ 17:00│ ░░░░░│ -    │ 17:00│ 17:00│ -    │ -    │            │
│         │ └──────┴──────┴──────┴──────┴──────┴──────┴──────┘            │
│         │                                                                │
│         │ Valgt: fredag 12. jun kl 14:00 — 60 min                        │
│         │                                                                │
│         │                            [‹ Tilbake]  [Fortsett til bekreft] │
└─────────┴───────────────────────────────────────────────────────────────┘
```

Steg 5 (bekreft):

```
┌────────────────────────────────────────────────────────────────────────┐
│  Bekreft booking                                                       │
│  ●━━●━━●━━●━━●                                                          │
│                                                                         │
│ ┌────────────────────────────────────────────────────────────────────┐│
│ │ Spiller         Emma Larsen                              [Endre]   ││
│ │ Anlegg          Onsøy GK, Range 2                        [Endre]   ││
│ │ Coach           Anders Kristiansen                       [Endre]   ││
│ │ Dato/tid        fredag 12. jun 2026 kl 14:00 (60 min)    [Endre]   ││
│ │ Type            Privatime — full økt                                ││
│ │ Pris            1 credit (forblir 0/12 etter trekk)                ││
│ │                                                                     ││
│ │ ⚠ Spiller har kun 1 credit igjen. Vurder å minne om plan-fornyelse.││
│ └────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ Notat til spiller (valgfritt)                                          │
│ [____________________________________________________________]         │
│                                                                         │
│ ☐  Send SMS-bekreftelse til spiller                                    │
│ ☐  Legg til i Google Calendar                                          │
│                                                                         │
│                            [‹ Tilbake]  [Bekreft og send booking]      │
└────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-onboarding` — Steg-progress (5 prikker med tekst-label)
- `components-agency-bookings` — Tidsslot-grid
- `components-credit-indicator` — Credit-sjekk + advarsel
- `components-inputs` — Notat-textarea, checkbox

### States

| State | Beskrivelse |
|---|---|
| **Steg 1: Spiller** | Søk-felt + spiller-liste (siste 5) + ny spiller-CTA |
| **Steg 2: Anlegg** | Kort-grid med 4 lokasjoner |
| **Steg 3: Coach** | Coach-velger med ledig-status |
| **Steg 4: Tid** | Uke-kalender, opptatte slots ░░ disabled |
| **Steg 5: Bekreft** | Sammendrag + notat + bekreft-CTA |
| **Slot opptatt** | ░░ tekstur, cursor not-allowed, hover-tooltip "Markus har booking" |
| **Outside availability** | Vises blekt, hover-tooltip "Utenfor publisert tilgjengelighet. Override?" |
| **Credits=0** | Advarsel-banner i steg 5: "Spiller har 0 credits. Aktivér upfront-betaling for å fortsette." |

### Claude Design-prompt (paste-ready)

```
Design /admin/bookinger/ny for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream. Padding 48px,
max-width 960px sentrert.

Topp: tilbake-lenke "← Tilbake til bookinger" (forest-600 14px), H1
"Ny booking" Inter Tight 32px, undertittel "Steg 3 av 5 — Velg tid".

Steg-progress: 5 prikker forbundet med linjer. Aktiv = lime-fyll forest-
900 border + cream tekst, ferdig = forest-900 fyll med checkmark,
kommende = forest-200 fyll. Tekst-label under: Spiller, Anlegg, Coach,
Tid, Bekreft (Inter 12px forest-700 / forest-400).

Context-kort: lime-tint bakgrunn, viser valg fra forrige steg "Emma
Larsen · Onsøy GK · Anders Kristiansen, 1/12 credits gjenstår".

Uke-kalender (steg 4): 7 kolonner (Man-Søn), 12 rader (08:00-20:00).
Header: dag + dato. Cell-tilstander: ledig = cream bg + forest-100 border,
opptatt = forest-200 bg med diagonal stripe-tekstur cursor not-allowed,
valgt = lime fyll forest-900 border 2px, utenfor tilgjengelighet =
forest-50 bg 50% opacity. Hover: forest-100 bg. 64x40px per slot.

Forrige/Neste uke-knapper øverst i kalender.

Valgt-rad under kalender: "Valgt: fredag 12. jun kl 14:00 — 60 min"
(Inter 16px forest-900 medium).

Footer: venstre Tilbake-knapp (outline forest-600), høyre Fortsett-knapp
(lime fyll), disabled hvis ingen slot valgt.

Steg 5: sammendrag-kort med rader, [Endre]-lenker høyre per rad,
warning-banner gul-tint hvis credits lave, notat-textarea 80px høyde,
to checkboxes (SMS, kalender), CTA "Bekreft og send booking".

Bruk components-onboarding, components-agency-bookings,
components-credit-indicator, components-inputs.
```

---

## Skjerm 3 — `/admin/tester`

### Rute og hensikt

Matrise-visning av alle spillere mot alle definerte tester (f.eks. CHS, ballhastighet, putte-3m, chip-test). Fargekodede celler gir umiddelbart overblikk over hvem som henger etter. Coach kan filtrere per gruppe, tildele test til en spiller, eller åpne historikk per celle.

### ASCII-wireframe (desktop 1440px)

```
┌─────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR │ Topbar                                                         │
├─────────┼───────────────────────────────────────────────────────────────┤
│         │  Tester                                       [+ Definer test] │
│         │  Spillere × tester — ytelse-matrise                            │
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ Gruppe: [Alle ▾]   Tidsrom: [Siste 30 dager ▾]   Søk[__]   ││
│         │ │ Legende: ●Over mål  ●Nær mål  ●Under mål  ○Ikke testet     ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ Spiller        │CHS  │Ballh│Putt3│Chip │Wedge│Drift│ +Test ││
│         │ │                │mph  │mph  │/10  │%    │%    │%    │       ││
│         │ ├────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼───────┤│
│         │ │ Emma Larsen    │ ●95 │ ●142│ ●9  │ ●78 │ ●72 │ ○-  │ [+]  ││
│         │ │ Ole Hansen     │ ●102│ ●155│ ●8  │ ●65 │ ●55 │ ●45 │ [+]  ││
│         │ │ Lukas Pedersen │ ●88 │ ●130│ ●6  │ ●60 │ ●68 │ ○-  │ [+]  ││
│         │ │ Sofie Andresen │ ●98 │ ●148│ ●9  │ ●82 │ ●75 │ ●60 │ [+]  ││
│         │ │ Tobias Olsen   │ ○-  │ ○-  │ ●7  │ ●62 │ ●52 │ ○-  │ [+]  ││
│         │ │ Jonas Berg     │ ●90 │ ●135│ ●5  │ ●55 │ ●48 │ ●40 │ [+]  ││
│         │ │ Mathilde Vik   │ ●93 │ ●140│ ●8  │ ●70 │ ●65 │ ●50 │ [+]  ││
│         │ │ Henrik Storm   │ ●105│ ●158│ ●9  │ ●85 │ ●78 │ ●65 │ [+]  ││
│         │ │ ...            │     │     │     │     │     │     │       ││
│         │ └────────────────┴─────┴─────┴─────┴─────┴─────┴─────┴───────┘│
│         │                                                                │
│         │ Klikk celle for historikk · Klikk [+] for å tildele test       │
│         │                                                                │
│         │ ┌──────────────────────────────────┬─────────────────────────┐│
│         │ │ Gruppe-snitt (synlige spillere)   │ Trender (siste 30 d)    ││
│         │ │ CHS:    95.1 mph (+2.3)           │ Bedring 5 spillere       ││
│         │ │ Ballh:  143.4 mph (+1.8)          │ Stagnasjon 2 spillere    ││
│         │ │ Putt3:  7.6/10                    │ Tilbakegang 1 spiller    ││
│         │ │ Chip:   69.6% (+4.1)              │                          ││
│         │ └──────────────────────────────────┴─────────────────────────┘│
└─────────┴───────────────────────────────────────────────────────────────┘
```

Tildel-test-modal (åpnes når [+] klikkes):

```
┌────────────────────────────────────────────────────────────────────────┐
│ Tildel test til Tobias Olsen                                    [✕]    │
├────────────────────────────────────────────────────────────────────────┤
│ Test         [CHS-måling ▾]                                            │
│ Mål          [105 mph]      Frist [14. jun 2026 📅]                    │
│ Lokasjon     [Onsøy GK — TrackMan-rom ▾]                               │
│ Notat        [Forventer 5% bedring siden mai-måling]                   │
│                                                                         │
│              [Avbryt]              [Tildel og varsle spiller]          │
└────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-agency-tests` — Matrise, celle-renderer, legende
- `components-inputs` — Filter-dropdowns, modal-felt
- `components-kpi` — Gruppe-snitt-kort nederst
- `components-buttons` — "+ Definer test", "[+] Tildel"

### States

| State | Beskrivelse |
|---|---|
| **Default** | Matrise med ca 20 spillere, 6 tester, fargekoder |
| **Tom** | "Ingen tester definert" + tom-CTA "Definer første test" |
| **Filter aktiv** | Smal-matrise med kun valgte gruppe-spillere |
| **Celle hover** | Tooltip: "Emma Larsen, CHS 95 mph, målt 28. mai, mål 92 → over mål" |
| **Celle klikk** | Slide-over fra høyre med historikk-graf (siste 10 målinger) |
| **Ikke testet** | Tom sirkel ○, hover-tooltip "Ikke testet ennå. Klikk [+] for å tildele." |
| **Modal åpen** | Backdrop forest-900 60% opacity, modal sentrert |
| **Lagrer** | Modal-CTA viser spinner, felt disabled |

### Claude Design-prompt (paste-ready)

```
Design /admin/tester for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1200px.

Header: H1 "Tester" Inter Tight 32px forest-900, undertittel "Spillere
× tester — ytelse-matrise" forest-600 14px. Høyre: CTA "+ Definer test"
outline forest-600.

Filter-kort: hvit bg, padding 16px, border forest-200, 16px radius.
Innhold: Gruppe-dropdown, Tidsrom-dropdown, søkefelt, og legende-rad
til høyre med fargeprikker (forest-700 = over mål, gold #B8975C = nær
mål, red-500 = under mål, forest-200 hule = ikke testet).

Matrise-tabell: hvit kort, sticky første kolonne (spiller-navn 200px),
sticky header-rad (test-navn + enhet). Test-kolonner 80px hver. Padding
12px per celle.

Celle-design: tall i JetBrains Mono 14px medium + fargeprikk 8px diameter
foran. Bakgrunn cell: forest-700 = light forest-100 bg, gold = light
gold-50, red = light red-50, ikke testet = forest-50 hul sirkel.
Hover: hele cellen forest-100 bg, tooltip fade in.

Siste kolonne "+Test": kun [+]-ikon-knapp (24x24px lime-tint bg, lime
border, forest-900 ikon).

Under tabell: helpe-tekst "Klikk celle for historikk · Klikk [+] for å
tildele test" Inter 12px forest-500.

Nederst: to KPI-kort side om side (50/50). Venstre "Gruppe-snitt"
viser test-snitt + endring i lime/red. Høyre "Trender" lister antall
spillere i bedring/stagnasjon/tilbakegang.

Tildel-test-modal: 480px bredde, sentrert, padding 32px, hvit bg, 24px
radius. Felt: Test (dropdown), Mål (number), Frist (datepicker),
Lokasjon (dropdown), Notat (textarea 80px). Footer: Avbryt outline +
Tildel-knapp lime fyll.

Bruk components-agency-tests, components-inputs, components-kpi,
components-buttons.
```

---

## Skjerm 4 — `/admin/drift`

### Rute og hensikt

Landing for drift-modulen. Accordion-stil seksjoner samler alt operasjonelt: innstillinger, team, plan-maler, tilgjengelighet, audit-log, WAGR-import. To seksjoner åpne by default (Team + Plan-maler) for å vise hva som finnes. Brukes av hovedcoach (ADMIN) — junior-coach ser kun lese-tilgang til Team og Audit-log.

### ASCII-wireframe (desktop 1440px)

```
┌─────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR │ Topbar                                                         │
├─────────┼───────────────────────────────────────────────────────────────┤
│         │  Drift                                                         │
│         │  Innstillinger, team og operasjonelle verktøy                  │
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ ▸ Innstillinger                                          ▼ ││
│         │ │   Branding, tidssoner, betalingsleverandører                ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ ▾ Team                                       [Se alle 8 →] ││
│         │ │   Coacher og roller                                         ││
│         │ │ ┌──────────────────────────────────────────────────────┐  ││
│         │ │ │ ◉ Anders Kristiansen   ADMIN     Alle capabilities    │  ││
│         │ │ │ ◉ Markus Berger        INSTRUCTOR coach.bookings,     │  ││
│         │ │ │                                  coach.players.read   │  ││
│         │ │ │ ◉ Sondre Olsen         INSTRUCTOR coach.bookings      │  ││
│         │ │ │                              [+ Inviter coach]         │  ││
│         │ │ └──────────────────────────────────────────────────────┘  ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ ▾ Plan-maler                              [Se alle 12 →]  ││
│         │ │   Forhåndsdefinerte sesong-planer for ulike nivå            ││
│         │ │ ┌────────┬────────┬────────┬────────┐                     ││
│         │ │ │ Junior │ Elite  │ Hobby  │ Vinter │                     ││
│         │ │ │ Sesong │ 16 uke │ 8 uke  │ 12 uke │                     ││
│         │ │ │ 40/30/ │ 30/40/ │ 20/30/ │ 10/40/ │                     ││
│         │ │ │ 20/10  │ 20/10  │ 30/20  │ 30/20  │                     ││
│         │ │ └────────┴────────┴────────┴────────┘                     ││
│         │ │                              [+ Ny mal]                    ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ ▸ Tilgjengelighet                                          ││
│         │ │   Standard arbeidstider og spesielle perioder              ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ ▸ Audit-log                                                ││
│         │ │   Alle handlinger i systemet (siste 90 dager)              ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ ▸ WAGR-import                                              ││
│         │ │   Importer ranking-data fra wagr.com                       ││
│         │ └────────────────────────────────────────────────────────────┘│
└─────────┴───────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-agency-drift` — Accordion-container, accordion-section
- `components-buttons` — "Se alle"-lenker, "+ Inviter coach", "+ Ny mal"
- `components-kpi` — Plan-mal-cards som mini-cards med fordeling

### States

| State | Beskrivelse |
|---|---|
| **Default** | 6 accordion-seksjoner, 2 åpne (Team, Plan-maler) |
| **Alle lukket** | Kun titler synlige, kompakt visning |
| **Alle åpne** | Veldig lang side, smooth-scroll |
| **CBAC: Junior-coach** | Innstillinger + Tilgjengelighet + WAGR skjult, Audit-log read-only |
| **Lasting** | Skeleton-rader i åpne seksjoner |
| **Tomt team** | "Ingen coacher ennå" + tom-CTA |

### Claude Design-prompt (paste-ready)

```
Design /admin/drift for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1000px.

Header: H1 "Drift" Inter Tight 32px forest-900, undertittel
"Innstillinger, team og operasjonelle verktøy" forest-600 14px.

Accordion-seksjoner: hvit kort hver, 24px radius, border forest-200,
mb 16px. Header-rad: padding 24px, klikkbar, hover forest-50. Layout:
chevron 16px (▸ lukket / ▾ åpen) + tittel Inter Tight 20px forest-900
+ subtitle Inter 13px forest-600. Høyre: "Se alle X →" lenke
forest-700 medium.

Body når åpen: padding 0 24px 24px 24px. Animasjon: 200ms ease.

Team-seksjon body: liste av coach-rader. Hver rad: avatar 32px +
navn (Inter 14px medium) + rolle-badge (ADMIN = lime fyll forest-900
tekst, INSTRUCTOR = forest-100 fyll forest-900 tekst) +
capabilities-pills (forest-50 fyll forest-700 tekst, font-mono 11px).
Footer-rad: "+ Inviter coach"-knapp lime outline.

Plan-maler-seksjon body: 4-kolonne grid. Hver mal-card: hvit bg,
forest-100 border, 16px radius, padding 16px. Innhold: tittel "Junior
Sesong" Inter Tight 16px + meta "16 uker" forest-600 13px +
pyramide-fordeling "40/30/20/10" JetBrains Mono 14px lime-tinted bg-pill.
Hover: lime border, scale 1.02. "+ Ny mal"-knapp som ekstra card,
dashed lime border, lime-tint bg.

CBAC: dim/skjul seksjoner basert på rolle.

Bruk components-agency-drift, components-buttons, components-kpi.
```

---

## Skjerm 5 — `/admin/drift/team`

### Rute og hensikt

Detalj-side for team-administrasjon (linket fra `/admin/drift` "Se alle" på Team-seksjon). Full-skjerm liste av alle coacher med CBAC-rolle (ADMIN/INSTRUCTOR), tildelte capabilities, status (aktiv/inaktiv), siste innlogging. Hovedcoach kan invitere ny, endre rolle, suspendere konto. Invite-modal med rolle-velger.

### ASCII-wireframe (desktop 1440px)

```
┌─────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR │ Topbar                                                         │
├─────────┼───────────────────────────────────────────────────────────────┤
│         │ ← Tilbake til Drift                                            │
│         │                                                                │
│         │  Team                                       [+ Inviter coach]  │
│         │  Coacher, roller og capabilities                               │
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ Filter: [Alle roller ▾]   Status: [Aktive ▾]   Søk[___]    ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ Coach                Rolle      Capabilities         Sist  ││
│         │ ├────────────────────────────────────────────────────────────┤│
│         │ │ ◉ Anders Kristiansen ●ADMIN     Alle (12)           i dag ││
│         │ │   anders@akgolf.no                                         ││
│         │ │ ◉ Markus Berger      ●INSTRUCTOR coach.bookings           ││
│         │ │   markus@akgolf.no              coach.players.read i går  ││
│         │ │                                 coach.notes.create        ││
│         │ │ ◉ Sondre Olsen       ●INSTRUCTOR coach.bookings    3 d   ││
│         │ │   sondre@akgolf.no              coach.tests.assign        ││
│         │ │ ◉ Ingrid Holm        ●INSTRUCTOR coach.bookings    1 uke ││
│         │ │   ingrid@akgolf.no                                         ││
│         │ │ ○ Pål Bekkesett      ◐Pending   (Invitert 2 d siden) -    ││
│         │ │   pal@akgolf.no                                            ││
│         │ │ ◉ Eline Sand         ●INSTRUCTOR coach.bookings    aldri ││
│         │ │   eline@akgolf.no                                          ││
│         │ │ ✕ Jens Bråten        ✕Inaktiv   Suspendert        14 d   ││
│         │ │   jens@akgolf.no                                           ││
│         │ │ ◉ Sara Lyng          ●INSTRUCTOR coach.bookings    i dag ││
│         │ │   sara@akgolf.no                coach.players.read        ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ Klikk en coach for å redigere capabilities og rolle            │
└─────────┴───────────────────────────────────────────────────────────────┘
```

Invite-coach-modal:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Inviter coach                                                   [✕]    │
├────────────────────────────────────────────────────────────────────────┤
│ Navn        [______________________________]                           │
│ E-post      [______________________________]                           │
│ Telefon     [______________________________] valgfritt                 │
│                                                                         │
│ Rolle                                                                  │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ ○ ADMIN       Full tilgang til alt, kan administrere team         │ │
│ │ ◉ INSTRUCTOR  Standard coach — håndterer egne spillere/økter      │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ Capabilities (kun INSTRUCTOR)                                          │
│ ☑ coach.bookings        Opprette og redigere bookinger                 │
│ ☑ coach.players.read    Se tilknyttede spillere                        │
│ ☐ coach.players.write   Redigere spiller-info                          │
│ ☐ coach.tests.assign    Tildele tester                                 │
│ ☐ coach.notes.create    Skrive notater                                 │
│ ☐ coach.plans.approve   Godkjenne ukentlige planer                     │
│                                                                         │
│              [Avbryt]                    [Send invitasjon]             │
└────────────────────────────────────────────────────────────────────────┘
```

### Komponenter brukt

- `components-agency-drift` — Team-tabell-variant
- `components-onboarding` — Invite-modal (samme struktur som spiller-invite)
- `components-inputs` — Felt, radio, checkbox
- `components-buttons` — Send invitasjon CTA

### States

| State | Beskrivelse |
|---|---|
| **Default** | Liste med 8 coacher, blandet aktiv/pending/inaktiv |
| **Tom** | "Du er den eneste coachen ennå" + tom-CTA |
| **Rad hover** | Forest-50 bg, cursor pointer |
| **Rad klikk** | Slide-over fra høyre med rediger-detaljer |
| **Modal åpen** | Backdrop, modal sentrert 520px |
| **Pending** | Rad med ◐-ikon gold-tint, meta "Invitert X dager siden" + reSend-knapp |
| **Inaktiv** | Rad med ✕-ikon red-tint, alle capabilities dim |
| **Velg ADMIN** | Capabilities-seksjon skjules (alle gis automatisk) |
| **Send-spinner** | Send-knapp viser spinner, modal forblir åpen |

### Claude Design-prompt (paste-ready)

```
Design /admin/drift/team for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1000px.

Topp: tilbake-lenke "← Tilbake til Drift" forest-600 14px. H1 "Team"
Inter Tight 32px, undertittel "Coacher, roller og capabilities"
forest-600. Høyre: primær CTA "+ Inviter coach" lime fyll.

Filter-kort: hvit bg padding 16px, border forest-200. Tre felt:
Rolle-dropdown, Status-dropdown, søkefelt.

Team-tabell: hvit kort, border forest-200, 24px radius. Header-rad:
forest-50 bg, kolonner Coach (300px), Rolle (140px), Capabilities (flex),
Sist sett (120px). Datarad: padding 20px, border-bottom forest-100,
hover forest-50, cursor pointer.

Coach-cell: status-ikon 12px (◉ aktiv forest-700, ○ pending gold,
✕ inaktiv red-500) + avatar 32px + navn (Inter 14px medium forest-900)
+ e-post under (Inter 12px forest-500).

Rolle-cell: badge-pill. ADMIN = lime #D1F843 fyll, forest-900 tekst.
INSTRUCTOR = forest-100 fyll, forest-900 tekst. Pending = gold-50 fyll,
gold tekst. Inaktiv = red-50 fyll, red-700 tekst. Inter 12px medium,
padding 4px 8px, 6px radius.

Capabilities-cell: enten "Alle (12)" for ADMIN, eller liste av pills
(forest-50 fyll, forest-700 tekst, JetBrains Mono 11px, padding 2px 6px,
4px radius), maks 3 synlige + "..." for flere.

Sist sett-cell: relativ tid (i dag, i går, 3 d, 1 uke, aldri) Inter 13px
forest-500.

Invite-modal: 520px bredde, padding 32px, hvit bg, 24px radius.
Felt: Navn, E-post, Telefon. Rolle-radio: to kort side om side i en
kontainer med border forest-200 padding 16px, valgt = lime border 2px.
Capabilities-checkboxes: kun synlig hvis INSTRUCTOR valgt. Footer:
Avbryt outline + Send invitasjon lime fyll.

Bruk components-agency-drift, components-onboarding, components-inputs,
components-buttons.
```

---

## Skjerm 6 — `/admin/drift/plan-maler`

### Rute og hensikt

Bibliotek av sesong-plan-maler som kan tas i bruk når en spiller får ny plan. Hver mal har navn, beskrivelse, pyramide-fordeling (turnering/turneringslignende/standard/restitusjon), antall uker, hvem som har laget den. Hovedcoach kan opprette nye, redigere, dele med team. Forhåndsvisning slide-over når mal klikkes.

### ASCII-wireframe (desktop 1440px)

```
┌─────────┬───────────────────────────────────────────────────────────────┐
│ SIDEBAR │ Topbar                                                         │
├─────────┼───────────────────────────────────────────────────────────────┤
│         │ ← Tilbake til Drift                                            │
│         │                                                                │
│         │  Plan-maler                                       [+ Ny mal]   │
│         │  Forhåndsdefinerte sesongplaner for ulike nivåer               │
│         │                                                                │
│         │ ┌────────────────────────────────────────────────────────────┐│
│         │ │ Kategori: [Alle ▾]   Sortér: [Sist endret ▾]   Søk[_____]  ││
│         │ └────────────────────────────────────────────────────────────┘│
│         │                                                                │
│         │ ┌─────────────┬─────────────┬─────────────┬─────────────┐    │
│         │ │ Junior      │ Elite       │ Hobby       │ Vinter      │    │
│         │ │ Sesong      │ Konkurranse │ Lørdag      │ Innetrening │    │
│         │ │             │             │             │             │    │
│         │ │ 16 uker     │ 12 uker     │ 8 uker      │ 12 uker     │    │
│         │ │             │             │             │             │    │
│         │ │ ▓▓▓▓░░░░░░  │ ▓▓░░░░░░░░  │ ░▓░░░░░░░░  │ ░░░░░░░░░░  │    │
│         │ │ ▓▓▓░░░░░░░  │ ▓▓▓▓░░░░░░  │ ░░░▓▓▓░░░░  │ ░▓▓▓▓░░░░░  │    │
│         │ │ ░░▓▓░░░░░░  │ ░░▓▓░░░░░░  │ ░░░░░░▓▓▓░  │ ░░░░░▓▓▓░░  │    │
│         │ │ ░░░░▓░░░░░  │ ░░░░▓░░░░░  │ ░░░░░░░░░▓  │ ░░░░░░░░▓▓  │    │
│         │ │ 40/30/20/10 │ 30/40/20/10 │ 20/30/30/20 │ 10/40/30/20 │    │
│         │ │             │             │             │             │    │
│         │ │ Anders K.   │ Anders K.   │ Markus B.   │ Anders K.   │    │
│         │ │ 12. mai     │ 28. apr     │ 10. mai     │ 15. nov '25 │    │
│         │ └─────────────┴─────────────┴─────────────┴─────────────┘    │
│         │                                                                │
│         │ ┌─────────────┬─────────────┬─────────────┬─────────────┐    │
│         │ │ Tour-pro    │ Comeback    │ Putt-uke    │ +           │    │
│         │ │ 24 uker     │ 8 uker      │ 1 uke       │ Ny mal      │    │
│         │ │             │             │             │             │    │
│         │ │ 50/30/15/5  │ 10/20/40/30 │ 30/40/30/0  │             │    │
│         │ │             │             │             │             │    │
│         │ │ Anders K.   │ Markus B.   │ Anders K.   │             │    │
│         │ │ 2. mai      │ 18. apr     │ 21. mai     │             │    │
│         │ └─────────────┴─────────────┴─────────────┴─────────────┘    │
│         │                                                                │
│         │ 7 maler totalt                                                 │
└─────────┴───────────────────────────────────────────────────────────────┘
```

Slide-over (når mal klikkes):

```
                                  ┌─────────────────────────────────────┐
                                  │ Junior Sesong              [✕]     │
                                  ├─────────────────────────────────────┤
                                  │ 16 uker · 40/30/20/10 fordeling     │
                                  │ Sist endret av Anders K, 12. mai    │
                                  │                                     │
                                  │ Brukes av: 5 aktive spillere        │
                                  │                                     │
                                  │ Ukestruktur                         │
                                  │ ┌─────────────────────────────────┐ │
                                  │ │ Uke 1 — Restitusjon · 2 økter   │ │
                                  │ │ Uke 2 — Standard · 3 økter      │ │
                                  │ │ Uke 3 — Standard · 3 økter      │ │
                                  │ │ Uke 4 — Turn.lik · 4 økter      │ │
                                  │ │ Uke 5 — Turnering · 5 økt+spill │ │
                                  │ │ Uke 6 — Restitusjon · 2 økter   │ │
                                  │ │ ... 16 uker totalt              │ │
                                  │ └─────────────────────────────────┘ │
                                  │                                     │
                                  │ [Forhåndsvis i kalender]            │
                                  │ [Dupliser mal]                      │
                                  │ [Rediger mal]                       │
                                  │ [Bruk på spiller →]                 │
                                  └─────────────────────────────────────┘
```

### Komponenter brukt

- `components-agency-drift` — Mal-card grid + slide-over
- `components-kpi` — Mini-pyramide-visning i hver card
- `components-buttons` — "+ Ny mal", CTAs i slide-over
- `components-inputs` — Filter-dropdowns

### States

| State | Beskrivelse |
|---|---|
| **Default** | Grid av 7 maler + ny-mal-card |
| **Tom** | "Ingen maler ennå" + stor "Opprett første mal"-CTA |
| **Card hover** | Lime border, scale 1.02, cursor pointer |
| **Slide-over åpen** | 480px fra høyre, backdrop forest-900 40% opacity |
| **Filter aktiv** | Færre cards, "X av Y maler" som teller |
| **Lasting** | 4 skeleton-cards |

### Claude Design-prompt (paste-ready)

```
Design /admin/drift/plan-maler for AK Golf HQ — AgencyOS desktop 1440px.

Layout: sidebar 240px forest-900, hovedflate cream padding 32px,
max-width 1200px.

Topp: tilbake-lenke "← Tilbake til Drift". H1 "Plan-maler" Inter Tight
32px, undertittel "Forhåndsdefinerte sesongplaner for ulike nivåer".
Høyre: CTA "+ Ny mal" lime fyll.

Filter-kort: hvit, padding 16px, border forest-200. Kategori-dropdown,
Sortér-dropdown, søkefelt.

Mal-grid: 4 kolonner, 16px gap. Hver mal-card: hvit bg, 20px radius,
border forest-200, padding 20px, hover lime border + scale 1.02
transition 150ms.

Card-innhold (top to bunn):
- Tittel "Junior Sesong" Inter Tight 18px forest-900 bold
- Meta "16 uker" Inter 13px forest-600
- Pyramide-visualisering: 4 rader á 10 kolonner, der hver firkant
  representerer 10% av ukene. Turnering rad 1 = forest-700 fyll
  (40%), Turn.lik rad 2 = lime-tint fyll (30%), Standard rad 3 =
  forest-100 fyll (20%), Restitusjon rad 4 = forest-50 fyll (10%).
  Kompakt 6x6px per firkant.
- Fordeling-tekst "40/30/20/10" JetBrains Mono 13px forest-700 i
  lime-tint pill.
- Footer: skapt av "Anders K." + dato "12. mai" Inter 12px forest-500.

Siste card i grid = "+ Ny mal" som dashed lime border, lime-tint bg,
sentrert "+" 32px + "Ny mal"-tekst Inter 14px medium.

Slide-over (når mal klikkes): 480px fra høyre, hvit bg, 24px radius
venstre, padding 32px. Innhold: tittel + meta + brukt-av-rad + ukestruktur-
liste (hver uke = rad med type-badge og økt-tall) + CTA-stack nederst
(forhåndsvis, dupliser, rediger, bruk på spiller — primær lime fyll).

Bruk components-agency-drift, components-kpi, components-buttons,
components-inputs.
```

---

## Leveranse-status — Runde 5

**Skjermer dekket i denne filen (6):**
- /admin/bookinger
- /admin/bookinger/ny
- /admin/tester
- /admin/drift
- /admin/drift/team
- /admin/drift/plan-maler

**Total skjermtelling oppdatert:**

| Runde | Område | Skjermer |
|---|---|---|
| 1 | Onboarding + onboarding-flows | 8 |
| 2 | PlayerHQ kjerneflater | 10 |
| 3 | AgencyOS kjerneflater | 9 |
| 4 | Innboks, varsler, profil | 6 |
| 5 | AgencyOS resterende moduler | **6** |
| 6 | Coach-Workbench dybde | (5 — Runde 6) |
| 7 | Booking 5-stegs flyt | (5 — Runde 7) |
| 8 | Foreldre + Marketing + Misc | (6 — Runde 8) |
| **Sum** | | **57 skjermer** |

Runde 5 ferdig. Klar for runde 6.
