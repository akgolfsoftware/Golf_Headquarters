# Claude Design-prompter: PLAYERHQ COACH (8 skjermer)

> Lim inn felles designspec fra `00-shared-spec.md` øverst i HVER prompt.
> Hver prompt nedenfor er én skjerm — bestill HTML-fil med inline CSS, 1440px viewport.
> Bruker er Markus R, 16 år, A1-spiller, HCP 4.2, hjemmebane Bossum.

---

## PlayerHQ-shell (gjelder alle 8 prompter)

Alle skjermer bruker samme shell:
- **Sidebar 256px (mørk):** bakgrunn `#0F2A22`, lime accent `#D1F843` på aktiv. Logo "AK Golf" øverst. Profilbilde-sirkel 40px + "Markus R · HCP 4.2" nederst.
- **Sidebar-moduler:** Hjem · Trening · Turneringer · Analyse · Coach (aktiv) · Booking · Meg
- **Sub-nav for Coach (horisontal tab-strip øverst i innhold):** Oversikt · Planer · Meldinger · Notater · Videoer · AI-coach
- **Hovedinnhold:** lyst tema `#FAFAF7`, max-width 1184px, padding 48px 64px.
- **PageHeader:** eyebrow (mono 11px uppercase) · tittel (Inter Tight 36px med ett italic Instrument Serif-ord) · sub (16px muted-foreground).
- **Du-form, norsk bokmål, ingen emoji, JetBrains Mono på alle tall.**

---

## Prompt 7.1 — Coach-oversikt

```
Du er senior UI/UX-designer for AK Golf HQ. Design COACH-OVERSIKT i PlayerHQ — Markus' inngang til alt som har med coach Anders å gjøre.

[LIM INN HELE 00-shared-spec.md HER]

## Skjerm: Coach-oversikt
URL: /portal/coach
Bruker: Markus R (16, A1, HCP 4.2)

### Layout
PlayerHQ-shell. Sub-nav: Oversikt (aktiv) · Planer · Meldinger · Notater · Videoer · AI-coach.

### Header (full bredde)
Eyebrow: "PLAYERHQ · COACH"
Tittel: "Bli kjent med din *coach.*" — italic på "coach"
Sub: "Anders har vært coachen din siden januar 2024. To år, 187 økter, 14 turneringer."

### Hero-kort (full bredde, 320px høyde)
To-kolonne 40/60.

**Venstre — Profilbilde + bio**
- Stort firkantet bilde 280×280 (rounded-2xl) av Anders Kristiansen
- Under: "Anders Kristiansen" (Inter Tight 24px) · "PGA Class A · 12 år som coach" (mono 11px uppercase muted)
- Tre badges på rad: "Mac O'Grady-skolen" · "TPI-sertifisert" · "AK Golf Academy"

**Høyre — Bio + neste 1-1**
- Sitat (Instrument Serif italic 22px): "Jeg ser etter de små bevegelsene som låser opp de store."
- Bio (16px, 4 linjer): "Anders har jobbet med deg på approach-spill og mental rutine siden vinteren 2024. Hovedfokus nå: konsistens i 100-150m og pre-shot på par-3-er."

- **Neste 1-1-card** (sub-card inni hero):
  - Eyebrow: "NESTE 1-1"
  - "Torsdag 14. mai · 14:00 · 45 min"
  - "TEK approach 150m · Bossum range"
  - CTA-knapp: [Se økt-detaljer →]

### KPI-strip (4 kort, like brede)
1. **Aktive planer:** 02 · "1 venter på godkjenning"
2. **Uleste meldinger:** 03 · "siste fra Anders i går"
3. **Nye notater:** 01 · "1-1 6. mai"
4. **Videoer fra coach:** 07 · "siste lagt opp 9. mai"

### Kontakt-rad (2 kort, like brede)
**Kort 1: Kontakt-info**
- Eyebrow: "KONTAKT"
- "E-post: anders@akgolf.no" (mono 14px)
- "Telefon: +47 950 12 345" (mono 14px)
- "Responderer typisk: innen 4 timer på hverdager"
- CTA: [Send melding →]

**Kort 2: Ledige tider**
- Eyebrow: "LEDIGE TIDER NESTE 14 DAGER"
- Liste med 4 slots (mono 13px):
  - "Tir 13. mai · 10:00-11:00 · Bossum"
  - "Tor 15. mai · 09:00-10:30 · Performance Studio"
  - "Lør 17. mai · 14:00-15:00 · Bossum"
  - "Ons 21. mai · 11:00-12:00 · Performance Studio"
- CTA: [Bestill time →]

### AI-coach 24/7-kort (full bredde, accent-bakgrunn lys lime tint #F4FBC5)
- Eyebrow: "PRO · TILGJENGELIG NÅ"
- Tittel (Inter Tight 22px): "Anders sover. AI-coachen din gjør ikke."
- Sub: "Still spørsmål om planen din, putting-statistikk eller en spesifikk drill. Bygget på Anders' coaching-filosofi."
- CTA: [Snakk med AI-coach →]

### Editorial moment
"coach" italic i tittel · sitat Instrument Serif italic 22px

Lever som én HTML-fil med all inline CSS.
```

---

## Prompt 7.2 — Planer-liste

```
[LIM INN 00-shared-spec.md]

## Skjerm: Planer-liste
URL: /portal/coach/plans
Bruker: Markus R

### Layout
PlayerHQ-shell. Sub-nav: Planer (aktiv).

### Header
Eyebrow: "PLAYERHQ · COACH · PLANER"
Tittel: "Planene som *former året.*"
Sub: "Anders lager planer i bolker. Du ser dem her, godkjenner dem, og kommenterer."

### Filter-rad
Chips: Alle (4) · Aktive (2) · Venter på godkjenning (1) · Pauset (0) · Arkivert (1)
Søk: "Søk i 4 planer..."

### Plan-grid (én kolonne, full bredde)
4 plan-kort stablet, hver 140px høyde:

**Kort 1 — PENDING_PLAYER (gul venstrekant 4px)**
- Eyebrow: "VENTER PÅ DEG"
- Tittel: "Spesialisering Sommer 2026" (Inter Tight 22px)
- Sub: "Uke 19-30 · 11 uker · 132 økter generert"
- Status-pill: "VENTER PÅ GODKJENNING" (mono 11px, gul bg #FFF7D6, mørk tekst)
- Pyramide-strip: 11% FYS / 37% TEK / 23% SLAG / 25% SPILL / 4% TURN
- CTA: [Vurder plan →]

**Kort 2 — ACTIVE (grønn venstrekant 4px)**
- Eyebrow: "AKTIV"
- Tittel: "Grunntrening Vår 2026"
- Sub: "Uke 8-18 · 11 uker · 124 økter · 87% gjennomført"
- Status-pill: "AKTIV" (mono 11px, grønn bg #DCFCE7)
- Progresjons-bar 4px: 87% lime fill
- "Slutter om 6 dager"
- CTA: [Åpne →]

**Kort 3 — ACTIVE**
- Eyebrow: "PARALLELL — FYS"
- Tittel: "Styrkeprogresjon Q2 2026"
- Sub: "Uke 14-26 · 13 uker · 39 økter · 64% gjennomført"
- Status-pill: "AKTIV"
- CTA: [Åpne →]

**Kort 4 — ARCHIVED (grå venstrekant 4px)**
- Eyebrow: "ARKIVERT"
- Tittel: "Turneringsforberedelse Høst 2025"
- Sub: "Uke 33-42 2025 · fullført 12. oktober"
- Status-pill: "ARKIVERT" (mono 11px, grå bg)
- CTA: [Se sammendrag →]

### Tom-state-eksempel (vises ikke her, men i komponent)
Når 0 planer: "Anders har ikke laget en plan ennå. Be om en melding."

### Editorial moment
"former året" italic

Lever som én HTML-fil.
```

---

## Prompt 7.3 — Plan-detalj

```
[LIM INN 00-shared-spec.md]

## Skjerm: Plan-detalj
URL: /portal/coach/plans/[planId]
Bruker: Markus R, ser "Grunntrening Vår 2026" (ACTIVE-status)

### Layout
PlayerHQ-shell. Sub-nav: Planer (aktiv).
Hovedinnhold to-kolonne 70/30.

### Header (full bredde over kolonner)
Eyebrow: "PLAYERHQ · COACH · PLAN"
Tittel: "Grunntrening *Vår 2026.*" — italic på "Vår 2026"
Sub: "Uke 8-18 · 11 uker · 124 økter · 87% gjennomført"

Pill-rad under: AKTIV · STARTET 16. FEB 2026 · SLUTTER 17. MAI 2026

### VENSTRE — Hovedinnhold

#### Sammendrag-kort
4 KPI-felter i én rad:
- Uker totalt: 11
- Økter generert: 124
- Gjennomført: 108 (87%)
- Suksess-snitt: 76%

Tekst-blokk (16px, 3 linjer): "Periodens fokus er å bygge teknisk og slag-fundament. Volum er moderat. Den siste uka går ut på evaluering før Spesialisering tar over."

#### Periode-breakdown
Vertikal liste, 3 periode-segmenter:

**1. GRUNN · uke 8-11 (4 uker)** — pyramide-strip grønnskala
- "Fundament. Lave volumer, høy konsistens."
- 44 økter · 96% gjennomført

**2. EVALUERING · uke 12-13 (2 uker)** — grå
- "Tester og 9-hull-runder for å måle effekt."
- 18 økter · 89% gjennomført

**3. UTBYGGING · uke 14-18 (5 uker)** — mellomgrønn
- "Bygger volum gradvis mot Spesialisering."
- 62 økter · 81% gjennomført

#### Uker-breakdown (akkordion, uke 16 åpen som default)
Liste over 11 uker, hver kollapset:
- Uke 8: GRUNN · 11 økter planlagt · 11 fullført · 73% snitt
- Uke 9: GRUNN · 11 økter · 10 fullført · 78%
- ... (uke 10-15 kollapset)
- **Uke 16: UTBYGGING · 13 økter · 11 fullført · 81%** (utvidet)
  - Mandag 13. mai: FYS 17:00 (Styrke underkropp) · fullført
  - Tirsdag 14. mai: TEK 09:00 (Putting 3m) + SLAG 14:00 (Wedge 50-100m)
  - Onsdag 15. mai: WANG Toppidrett 08:00 (TEK)
  - Torsdag 16. mai: TEK 10:00 (Approach 150m) + Coach 1-1 14:00
  - Fredag 17. mai: SLAG 09:00 + FYS 17:00 (Power)
  - Lørdag 18. mai: SPILL 09:00 (18 hull Bossum)
  - Søndag 19. mai: hvile
- Uke 17-18 kollapset

#### Øvelser-bibliotek (sub-seksjon)
"12 unike drills i denne planen — klikk for å se detaljer."
Grid 3 kolonner, kompakte kort: "Putt 3m konsistens", "Approach gate 150m", "Wedge 50-100m landing", "Driver gate-test", osv.

### HØYRE — Sidepanel 320px

#### Kort 1: Coach-notat
- Profilbilde Anders 48px + navn
- Dato: "skrevet 14. feb 2026"
- Tekst (16px Instrument Serif italic): "Vi bygger fra bunnen. Volum er nede med vilje — kvalitet over kvantitet. Når vi går inn i Spesialisering, har du fundamentet."

#### Kort 2: Status
- "Aktiv — slutter om 6 dager"
- Progress-bar: 87% lime
- Liste: "Neste sjekkpunkt: 17. mai · Evaluering"

#### Kort 3: Handlinger
- [Be om endringer →]
- [Snakk med Anders →]
- [Last ned plan (PDF) →]

### Editorial moment
"Vår 2026" italic · coach-notat Instrument Serif italic

Lever som én HTML-fil.
```

---

## Prompt 7.4 — Plan-godkjenning

```
[LIM INN 00-shared-spec.md]

## Skjerm: Plan-godkjenning
URL: /portal/coach/plans/[planId]/godkjenn
Bruker: Markus R, vurderer "Spesialisering Sommer 2026" (PENDING_PLAYER)

### Layout
PlayerHQ-shell. Sub-nav: Planer (aktiv). Tilbake-pil øverst: "← Tilbake til planer".

### Header (full bredde)
Eyebrow: "PLAYERHQ · COACH · PLAN · VURDERING"
Tittel: "Anders har laget en *plan til deg.*" — italic på "plan til deg"
Sub: "Spesialisering Sommer 2026 · 11 uker · 132 økter · ventet siden 7. mai"

### Sammendrag-bånd (full bredde, lys lime bakgrunn #F4FBC5)
"Du har til 14. mai på å vurdere. Etter det aktiveres planen automatisk."
Mono 13px, padding 16px 24px.

### To-kolonne 60/40

#### VENSTRE — Plan-sammendrag (kompakt versjon)

**Periode-strip:**
- SPESIALISERING · uke 19-26 (8 uker)
- TURNERING · uke 27-30 (4 uker, Oslo Open uke 28)

**Pyramide-fordeling (donut + tabell side-om-side):**
- FYS 11% · TEK 37% · SLAG 23% · SPILL 25% · TURN 4%

**Volum-oppsummering:**
- 132 økter totalt
- 16.5 timer/uke i snitt
- 1812 minutter teknisk approach-trening
- 9 turnerings-spesifikke økter

**Anders' kommentar (Instrument Serif italic, 18px, 6 linjer):**
"Vi går inn i den viktigste perioden før Oslo Open. Vi øker SLAG-volumet, men holder TEK-fundamentet vi har bygd. Den siste blokken er ren turneringssimulering. Hvis du vil endre noe, si ifra — vi tilpasser. Du har vært utrolig konsistent siste 3 måneder."

**Ukentlig oppsett (kort liste):**
- 3× FYS (60 min) · Man/Ons/Fre
- 4× TEK (90 min) · Tir/Tor
- 3× SLAG (75 min) · Tir/Tor/Lør
- 1× SPILL (240 min) · Lør
- 1× TURN (60 min, 1-1) · Søn

#### HØYRE — Din vurdering

**Eyebrow:** "DIN VURDERING"

**Kommentar (textarea, 200px høyde):**
Placeholder: "Skriv hva du tenker. Anders leser dette før planen aktiveres."

Eksempel-tekst i grå preview: "Ser bra ut. Kan vi ha mer fokus på bunker første 2 uker?"

**Tegn-teller mono:** "47 / 1000"

**To primær-handlinger (stablet):**

1. **[Godkjenn planen →]** (full grønn primary, høyde 56px)
   - Sub-tekst under: "Aktiveres umiddelbart. Du kan be om justeringer senere."

2. **[Be om endringer →]** (sekundær, full bredde, høyde 56px)
   - Sub-tekst: "Sender kommentaren til Anders. Han svarer typisk innen 4 timer."

**Mikrolinker nederst:**
- [Last ned som PDF]
- [Diskuter i melding først]

### Editorial moment
"plan til deg" italic · Anders' kommentar Instrument Serif italic

Lever som én HTML-fil.
```

---

## Prompt 7.5 — Meldinger

```
[LIM INN 00-shared-spec.md]

## Skjerm: Meldinger
URL: /portal/coach/melding
Bruker: Markus R i chat med coach Anders

### Layout
PlayerHQ-shell. Sub-nav: Meldinger (aktiv).
Hovedinnhold to-kolonne 30/70 (samtaler venstre, chat-tråd høyre).

### Header (full bredde)
Eyebrow: "PLAYERHQ · COACH · MELDINGER"
Tittel: "Korte beskjeder, *raskt svar.*" — italic på "raskt svar"
Sub: "Anders svarer typisk innen 4 timer på hverdager. Bruk for kortere ting — be om 1-1 for det viktige."

### VENSTRE — Samtale-liste 360px

Søk øverst: "Søk i samtaler..."

3 samtaler stablet:

**1. Coach Anders (aktiv, lime venstrekant 3px)**
- Profilbilde 48px
- "Anders Kristiansen" (15px medium)
- "Husker du hva vi snakket om..." (13px muted)
- "I går · 16:42" (mono 11px)
- Ulest-prikk lime 8px

**2. Foreldre-tråd**
- Profilbilde gruppe (2 personer)
- "Mamma + Pappa"
- "Skal vi sponse Oslo Open?"
- "3 dager siden"

**3. AK Golf Academy (system)**
- Logo-sirkel
- "AK Golf Academy"
- "Fakturaen din er klar..."
- "6 dager siden"

### HØYRE — Chat-tråd

**Topp-header:**
- Profilbilde Anders 40px + "Anders Kristiansen" (16px medium) + grønn prikk + "Online nå" (mono 11px muted)
- Høyre: ikon-knapper [📞] (kun lucide phone) [video] [...]

**Meldings-area (scrollbar, 600px høyde):**

Dato-divider: "Mandag 13. mai"

- **Anders (venstre, hvit boble):** "Hei Markus. Hvordan gikk søndag på bunker-økten?"
  - Mono 11px: "13. mai · 09:14"

- **Du (høyre, grønn boble #005840 hvit tekst):** "Bedre. Fikk inn 6 av 10 på 10m-feltet. Men jeg sliter med sand-bunker."
  - Mono 11px hvit muted: "13. mai · 11:02 · sett"

- **Anders:** "Sand vs. naturlig sand er to forskjellige spill. Vi tar 30 min på torsdag bare på sand. Avtale?"
  - "13. mai · 11:08"

- **Du:** "Yes. Skal jeg ta med ny LW?"
  - "13. mai · 11:09 · sett"

Dato-divider: "I går"

- **Anders:** "Forresten — så Skjeggestad-runden din. 32 putts er bra, men 3-puttene på hull 14 og 17 var samme mønster. Bremset for tidlig."
  - "14. mai · 16:39"

- **Anders (sammenhengende):** "Husker du hva vi snakket om i mars? Aksellerere gjennom ballen. Vi tar det opp på torsdag."
  - "14. mai · 16:42"

**Skrive-indikator:**
"Anders skriver..." (mono 11px italic muted) med tre pulserende prikker.

**Inputs nederst (full bredde):**
- Vedlegg-knapp (lucide paperclip)
- Input-felt: "Skriv en melding..."
- Send-knapp (lucide send, primary grønn rounded-full 40px)

### Editorial moment
"raskt svar" italic

Lever som én HTML-fil.
```

---

## Prompt 7.6 — Notater

```
[LIM INN 00-shared-spec.md]

## Skjerm: Notater
URL: /portal/coach/notes
Bruker: Markus R leser Anders' coach-observasjoner

### Layout
PlayerHQ-shell. Sub-nav: Notater (aktiv).
Hovedinnhold to-kolonne 40/60.

### Header (full bredde)
Eyebrow: "PLAYERHQ · COACH · NOTATER"
Tittel: "Det Anders så, *skrevet ned.*" — italic på "skrevet ned"
Sub: "Etter hver 1-1 og hver bane-runde sammen, skriver Anders et notat. Du har 24 notater siste 6 måneder."

### Filter-rad (full bredde)
Chips: Alle (24) · Siste 30d (8) · TEK (11) · SLAG (7) · SPILL (4) · TURN (2)
Søk: "Søk i notater..."
Datovelger: "Velg dato-intervall"

### VENSTRE — Notat-liste 480px

8 notater stablet, hver 96px:

**1. (valgt, lime venstrekant 4px)**
- Eyebrow: "1-1 · TEK · 06. MAI"
- Tittel: "Approach 150m — strike-mønster"
- Sub (2 linjer): "Markus' midten av køllen treffer 2cm under sweet spot på fade-baner..."
- Mono 11px: "10 min · 1 video"

**2.**
- Eyebrow: "BANE-RUNDE · SPILL · 04. MAI"
- "Skjeggestad 18 hull — putting"
- "32 putts. Mønster på 3-putts hull 14 og 17..."
- "8 min · 0 vedlegg"

**3.**
- Eyebrow: "1-1 · SLAG · 28. APR"
- "Bunker 10m + greenside"
- "Sand-bunker vs. naturlig sand: aksellerasjon..."
- "12 min · 2 videoer"

**4.**
- Eyebrow: "1-1 · TEK · 21. APR"
- "Putt 3m konsistens"
- "Tempo er stabilt. Linje-lesning rundt..."
- "6 min · 1 video"

**5.**
- Eyebrow: "BANE-RUNDE · SPILL · 14. APR"
- "Bossum 9 hull — pre-shot"
- "Pre-shot-rutinen forsvinner under press..."
- "9 min"

**6.**
- Eyebrow: "1-1 · SLAG · 09. APR"
- "Wedge 50-100m landing"
- "Landingspunkt blir mer konsistent..."
- "11 min · 1 video"

**7.**
- Eyebrow: "1-1 · TEK · 02. APR"
- "Driver gate-test"
- "Set-up endring fra mars holder seg..."
- "7 min"

**8.**
- Eyebrow: "TURNERING · TURN · 28. MARS"
- "Bossum Open dag 1"
- "Først runde under press. Mental rutine..."
- "14 min · 3 videoer"

### HØYRE — Notat-detalj 640px (viser valgt notat)

**Top-meta:**
- Eyebrow: "1-1 · TEK · 06. MAI 2026"
- Tittel (Inter Tight 28px): "Approach 150m — strike-mønster"
- Anders' profilbilde 40px + "Skrevet av Anders Kristiansen · 6. mai 17:42"

**Tags-rad:** Pyramide-pill TEK · L-fase L-BALL · "10 min lesetid"

**Notat-innhold (16px line-height 1.7, 600px):**
"Vi kjørte 8 baller med 7-jern fra 150m mot gate-mål. Strike-mønsteret er tydelig: midten av køllen treffer ca. 2cm under sweet spot, særlig på baller du forsøker å fade.

Tre observasjoner:
1. Set-up er stabilt. Du har ikke endret stance siden mars.
2. Backswing-toppen er litt høyere enn vanlig — vi snakket om dette i februar.
3. Strike er bedre på rette skudd enn på fades.

Forslag til torsdag: 30 min på simulator med Trackman, fokus på dynamic loft og angle of attack. Vi vil se om backswing-høyden faktisk påvirker strike, eller om det er noe annet.

Husk: dette er ikke en bekymring — bare en observasjon. Du spiller solid golf akkurat nå."

**Vedlegg-seksjon:**
Header: "1 VIDEO"
Video-card 320×180px:
- Thumbnail (mørk gradient + lucide play-icon midt)
- "Approach 150m — slo-mo · 0:42"
- "Lagt opp 6. mai 17:38"

**Handlinger:**
- [Marker som lest]
- [Be om oppfølging]
- [Last ned (PDF)]

### Editorial moment
"skrevet ned" italic · valgt notat-tekst i lesbart 16px

Lever som én HTML-fil.
```

---

## Prompt 7.7 — Videoer

```
[LIM INN 00-shared-spec.md]

## Skjerm: Videoer
URL: /portal/coach/videoer
Bruker: Markus R

### Layout
PlayerHQ-shell. Sub-nav: Videoer (aktiv).

### Header (full bredde)
Eyebrow: "PLAYERHQ · COACH · VIDEOER"
Tittel: "Svingen din, *frame for frame.*" — italic på "frame for frame"
Sub: "Anders deler swing-analyser, slow-motion og side-by-side-sammenligninger. Du har 23 videoer."

### Filter-rad
Chips: Alle (23) · TEK (14) · SLAG (7) · TURN (2) · Sist 30d (9)
Sortering: "Nyest først / Eldst først / Mest sett"
Søk: "Søk i video-titler..."

### Video-grid (3 kolonner, 16:9 thumbnails)

9 video-kort stablet, hver:

**Kort 1**
- Thumbnail 320×180 (mørk gradient + lucide play-icon 64px sentrert)
- Pyramide-pill øverst-venstre: "TEK" (mono 11px)
- Varighet nederst-høyre: "0:42"
- Under thumbnail: "Approach 150m — slow-motion"
- Mono 11px muted: "06. mai 2026 · sett 3 ganger"
- Notat-tekst (2 linjer, 13px): "Backswing-toppen er litt høyere enn i mars. Se 0:18-0:24."

**Kort 2 — TEK**
- "Putt 3m tempo · side-by-side"
- "21. apr · sett 5 ganger"
- "Sammenligning av deg vs Anders. Tempo er identisk."
- Varighet: "1:24"

**Kort 3 — SLAG**
- "Bunker 10m — aksellerasjon"
- "28. apr · sett 2 ganger"
- "Se hvordan du bremser ved kontakt på siste tre. Slow-mo."
- "0:58"

**Kort 4 — SLAG**
- "Wedge 50m landing"
- "09. apr · sett 4 ganger"
- "Tre baller, samme landingspunkt. Bra repetisjon."
- "1:12"

**Kort 5 — TEK**
- "Driver gate-test 3 angle"
- "02. apr · sett 1 gang"
- "Fra front, side, ned. Set-up er stabil."
- "2:05"

**Kort 6 — TURN**
- "Bossum Open dag 1 — pre-shot"
- "28. mars · sett 6 ganger"
- "Pre-shot-rutinen forsvinner på hull 11."
- "1:38"

**Kort 7 — TEK**
- "Approach 100m — strike-zone"
- "24. mars · sett 2 ganger"
- "Trackman-data overlay. Spin er konsistent."
- "1:15"

**Kort 8 — SLAG**
- "Chip 15m — landingsmark"
- "18. mars · sett 3 ganger"
- "Landingsmarkøren treffer på 4 av 5."
- "0:54"

**Kort 9 — TEK**
- "Putt 6m linje-lesning"
- "11. mars · sett 8 ganger"
- "Sammenligning før/etter mars-justering."
- "1:47"

### Footer
[Last opp egen video til Anders →] (sekundær)

### Editorial moment
"frame for frame" italic

Lever som én HTML-fil.
```

---

## Prompt 7.8 — AI-coach

```
[LIM INN 00-shared-spec.md]

## Skjerm: AI-coach
URL: /portal/coach/ai
Bruker: Markus R (PRO-tier) chatter med AI-coach

### Layout
PlayerHQ-shell. Sub-nav: AI-coach (aktiv).
Hovedinnhold: chat-tråd full bredde, max-width 880px sentrert.

### Header (full bredde)
Eyebrow: "PLAYERHQ · COACH · AI · PRO"
Tittel: "Anders sover. *Jeg gjør ikke.*" — italic på "Jeg gjør ikke"
Sub: "AI-coachen din kjenner planen din, statistikken og notatene fra Anders. Still spørsmål om spillet, treningen eller en spesifikk drill."

### Info-bånd (full bredde, lys lime #F4FBC5)
Tekst: "Trent på Anders' coaching-filosofi · Bygget på Mac O'Grady-skolen · Skiller seg fra Caddie ved at jeg fokuserer på utvikling, ikke kjøps-beslutninger."
Mono 12px, padding 12px 24px.

### Chat-tråd (sentrert, max 800px)

**AI-melding 1 (venstre, hvit boble med lime venstrekant 2px):**
- AI-avatar 32px (sirkel med lime gradient + lucide sparkles)
- "Hei Markus. Du har bestemt seg for å gå inn i Spesialisering om en uke. Hvor vil du sette fokus?"
- Mono 11px muted: "AI-coach · for 4 timer siden"

**Foreslåtte spørsmål-strip (3 chips, like brede):**
- [Hvordan kan jeg forbedre putting?]
- [Vis meg statistikk for approach 150m]
- [Hva er forskjellen på CS80 og CS90?]

**Du-melding 1 (høyre, grønn boble #005840 hvit tekst):**
- "Jeg sliter med 3-puttene mine. Hva sier statistikken?"
- Mono 11px hvit muted: "for 12 minutter siden"

**AI-melding 2 (streaming-indikator avsluttet — full melding):**
- "Ut fra de 12 rundene siste 30 dager har du 8 stk 3-puttere. Mønsteret er tydelig:
  
  1. **Avstand:** 7 av 8 var fra 8-15m. Korte og lange putts er ikke problemet.
  2. **Hull-posisjon:** 6 av 8 var hull 14-17 — slutten av runden.
  3. **Brems:** Anders skrev 14. mai at du bremser for tidlig under press. Det matcher det jeg ser.
  
  Forslag: 15 min hver dag på 10m-putts mot et mål — fokuser på å la putteren svinge gjennom, ikke stoppe ved ballen. Vil du jeg legger til en drill i ukens plan?"
- Knapp under: [Legg til i plan →] [Send til Anders først →]
- Mono 11px muted: "AI-coach · streamer..."

**Streaming-indikator (pulserende lime prikk + "Skriver svar...")**
Eller (avsluttet variant): "AI-coach · for 8 sekunder siden"

**Foreslåtte oppfølginger:**
- [Vis meg de spesifikke 3-puttene]
- [Hvilken drill anbefaler du?]
- [Hva sier Anders om dette?]

**Du-melding 2:**
- "Ja, legg til drillen. Men sjekk med Anders først."
- "akkurat nå"

**AI-melding 3 (kortere svar, samme stil):**
- "Sendt forslag til Anders. Han pleier å svare innen 4 timer. Imens — vil du jeg viser deg en video av Brad Faxons putting-tempo?"
- [Ja, vis →] [Senere]

**Inputs nederst (full bredde, sticky):**
- Input-felt 720px: "Spør om spillet ditt..."
- Send-knapp (lucide send, primary grønn rounded-full 44px)
- Mono 11px under: "AI-coach bruker dataen din. Personvern: Anders ser ikke samtalen med mindre du sender den."

### Sidebar høyre (240px sticky, valgfritt)
**Kontekst AI bruker:**
- Aktiv plan: Grunntrening Vår 2026
- Siste 1-1: 6. mai
- Siste runde: 14. mai (Skjeggestad, 32 putts)
- 24 notater fra Anders
- 156 økter logget

### Editorial moment
"Jeg gjør ikke" italic · AI-avatar med subtilt lime gradient

Lever som én HTML-fil med både streaming-state og avsluttet state synlig.
```
