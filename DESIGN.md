---
name: AK Golf HQ · Precision Athletics
description: Sportsarbeid med tydelige handlinger, målbare tall og egne organisasjonsprofiler.
colors:
  primary: "#141413"
  primary-hover: "#3a3935"
  primary-press: "#2a2926"
  white: "#ffffff"
  surface-flat: "#faf8f3"
  surface-sunken: "#f1eee8"
  border-hairline: "#ddd9d1"
  border-control: "#686560"
  text-secondary: "#46443f"
  text-muted: "#686560"
  signal: "#9b2415"
  signal-hover: "#7d1c10"
  signal-tint: "#fbebea"
  ok: "#2f6b3a"
  ok-tint: "#eaf2ea"
  warn: "#7e6110"
  warn-tint: "#fbf4e4"
  info: "#1d3557"
  info-tint: "#e8edf4"
  night-page: "#0c0d0c"
  night-flat: "#141513"
  night-card: "#1b1c1a"
  night-selected: "#2f302c"
  night-secondary: "#a9a59d"
  night-body: "#cfcbc2"
  axis-fys: "#788c5d"
  axis-tek: "#b8852a"
  axis-slag: "#2563eb"
  axis-spill: "#c46686"
  axis-turn: "#a32d2d"
  wang-navy: "#17446F"
  wang-action: "#D12A5C"
  wang-action-hover: "#B32450"
  wang-active: "#49CA9F"
  wang-page: "#F2F5F8"
  wang-secondary: "#4A6A8A"
  tn-navy: "#012B5D"
  tn-navy-hover: "#001F45"
  tn-red: "#D40E3A"
  tn-page: "#F7F7F5"
  tn-ink: "#141414"
  tn-secondary: "#6B6B6B"
typography:
  page-heading:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.08
  wang-title:
    fontFamily: "Montserrat, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.18
  wang-body:
    fontFamily: "Quattrocento Sans, IBM Plex Sans Fallback, Georgia, serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  tn-title:
    fontFamily: "Jost, Futura, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 300
    lineHeight: 1.22
  tn-body:
    fontFamily: "Lato, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.62
  display:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.05
  title-l:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.15
  title-m:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 600
    lineHeight: 1.25
  title-s:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  instruction:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  source:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.25
  button:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Fallback, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1
  num:
    fontFamily: "IBM Plex Mono, IBM Plex Mono Fallback, ui-monospace, monospace"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.2
  metric:
    fontFamily: "IBM Plex Mono, IBM Plex Mono Fallback, ui-monospace, monospace"
    fontSize: "1.625rem"
    fontWeight: 600
    lineHeight: 1
  metric-l:
    fontFamily: "IBM Plex Mono, IBM Plex Mono Fallback, ui-monospace, monospace"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1
  clock-run-s:
    fontFamily: "IBM Plex Mono, IBM Plex Mono Fallback, ui-monospace, monospace"
    fontSize: "4rem"
    fontWeight: 600
    lineHeight: 1
  clock-run:
    fontFamily: "IBM Plex Mono, IBM Plex Mono Fallback, ui-monospace, monospace"
    fontSize: "5.5rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  radius: "8px"
  modal: "12px"
  pill: "999px"
  mark: "0"
  inner: "4px"
  wang-control: "8px"
  wang-card: "4px"
  wang-modal: "8px"
  tn-card: "0px"
  tn-control: "2px"
  tn-modal: "4px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-8: "32px"
  space-10: "40px"
  space-12: "48px"
  space-16: "64px"
  space-20: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.radius}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    rounded: "{rounded.radius}"
    padding: "0 16px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.radius}"
    padding: "0 16px"
    height: "44px"
  button-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.white}"
    rounded: "{rounded.radius}"
    padding: "0 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    rounded: "{rounded.radius}"
    padding: "0 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface-flat}"
    rounded: "{rounded.radius}"
    padding: "16px"
  wang-button-action:
    backgroundColor: "{colors.wang-action}"
    textColor: "{colors.white}"
    rounded: "{rounded.wang-control}"
    padding: "0 16px"
    height: "44px"
  group-filter-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "44px"
  desktop-navigation:
    width: "184px"
---
# Design System: AK Golf HQ

## Overview

**Creative North Star: "Precision Athletics"**

Precision Athletics er den fastlagte retningen i beslutning HQ-UPGRADE-2026-10-12. Lyse arbeidsflater, grafitt som handling og Precision natt i Live videreføres fra eksisterende kode. WANG og Team Norway beholder egen skrift, farge og form gjennom hele innholdet.

Dette dokumentet registrerer den samordnede lokale koden etter fem reviewrettinger 13.10.2026. Reviewerens «ship» gjelder disse fem rettingene og 45 syntetiske skjermprøver ved 390, 1440 og 1882 px i `.impeccable/review/calibration-20261013/`. Det er ikke bevis på full kontroll av alle 198 innganger, Anders' visuelle godkjenning, fysisk telefon, mikrofon, VoiceOver, backendlagring, CI eller publisert produksjon.

**Key Characteristics:**

- Ord og tall har ulike skriftroller.
- Lyst arbeid, natt for aktiv gjennomføring.
- Organisasjonens profil følger innholdet, ikke bare logoen.
- Rolige flater, fylt valg og separat fokus.

Kildegrunnlag: `src/styles/precision-athletics.css`, `precision-komponenter.css`, `precision-live.css`, `precision-month.css`, `precision-player-coach-upgrade.css`, `wang-tokens.css`, `team-norway-tokens.css`, `precision-grupper.css`, `src/components/precision/pa.tsx`, PH/AG-skall, `GroupContextShell.tsx`, gruppekomponentene og WANGs `iup-samtale.tsx`/tilhørende stilfil. Ferske kontrollbilder viser samme hierarki, fylt valg, organisasjonsprofil og forskjellen mellom IUP-lesing og redigering. PRODUCT.md og retning-og-kvalitetskrav-2026-10-12.md forklarer autoriteten. Speilet i designsystem/ er referanse, ikke bevis på gjeldende utførelse.

## Colors

### Primary

Grafitt styrer AKs primærhandling og tekst. Natt bytter primærhandlingen til lys flate med mørk tekst. Den eksisterende sandfamilien brukes på underflater; grunnflaten er hvit, ikke en sandfarget helside.

### Secondary

Rust brukes til viktige signaler. Grønn, rav og blå beskriver status og informasjon. FYS, TEK, SLAG, SPILL og TURN har egne identitetsfarger med egne tekst- og bakgrunnsvarianter i koden. Fortegn i datagrafer har egne over/under-farger og synlig fortegn; disse er ikke feilstatus.

WANG bruker navy til struktur og valgt kontroll, rosa (`action`) til primærhandling og mint til profilmarkering i skallet. Mint er ikke generell valgt-state-farge. Team Norway bruker navy til handling og skinne; rødt bærer identitet/aksent. Eldre TN-komponenter har en separat statuspalett: ikke likestill merkevarerødt med all feilstatus.

### Neutral

Hvit, dempede sandflater og grafitt danner AKs lyse lag. Natt har egne mørke flater og lysere tekst, kanter og aksedata. WANG har blågrå grunnflate og navytekst; Team Norway har nøytral lys grunnflate, hvite kort og grå tekst.

**The Farge har oppgave Rule.** Grafitt bærer AK-handling. Rust bærer viktige signaler. Aksefarger identifiserer treningsinnhold, ikke knapper.

## Typography

**Display Font:** IBM Plex Sans, med navngitt fallback.
**Body Font:** IBM Plex Sans.
**Label/Mono Font:** IBM Plex Mono for mål, klokker og tabelltall.

Sideoverskriften står først, med kontekst under. Den bruker page-heading-rollen; den underliggende display-rollen beholdes for andre store titler. Lik kontekst og tittel gjentas ikke.

Titteltrappen går fra title-s via title-m og title-l til display. Brødtekst og instruksjon er ulike roller; instruksjon og forklaring bruker den større instruction-rollen. Source er lesbar kildeinformasjon. De eldre meta-rollene på 10–11 px er ikke en standard for oppgaver eller forklaringer.

Måltrappen går fra num via metric og metric-l til clock-run. Live viser mindre tittel og tall på smal telefon, større på bred flate. Fontstørrelsene er i rem. WANG bruker Montserrat i titler og Quattrocento Sans i tekst; Team Norway bruker Jost i titler og Lato i tekst. Begge beholder IBM Plex Mono til tall. TNs egne eldre komponenter har en annen titteltrapp enn de felles Precision-flatene; ikke overskriv dem med AKs vekter.

**The Overskrift før kontekst Rule.** Oppgave eller sidens navn leder; dato, område og forklaring følger under.

**The Ord og tall Rule.** Instruksjon, navigasjon og forklaring bruker tekstfonten; mål, tid og mengde bruker IBM Plex Mono med tabelltall.

## Layout

Avstandsrytmen bygger på 4/8-rutenettet i frontmatter. PlayerHQ har topplinje (56 px) og bunnfaner (64 px) på mobil; fra 1024 px blir navigasjonen en venstreskinne (184 px) med ikon og synlig navn; radene er 52 px høye. AgencyOS har meny/skuff på mobil og samme navngitte skinne på desktop. Den eldre 56 px ikonskinnen finnes som grunnkomponent, men beskriver ikke dagens desktopskall. WANG og Team Norway har egne navy-skall og organisasjonsmenyer.

Vanlig Precision-innhold har content-max (1200 px). Live har eget maksimum (1120 px), og fra 1024 px legges øvelseslisten (280 px) ved siden av arbeidsinnholdet. Under 480 px forenkles Live til én leseretning. Månedsplanen går fra fire til to oppsummeringskolonner under 600 px; redigering går til én kolonne.

Treffflater er minst 44 px i felles kontroller og minst 56 px i Live/utendørs; tellerknappene har mer rom. Fast Live-bunn bruker safe-area og avsatt plass i innholdet. SportsCover er et faktisk rasterfoto uten tekst oppå; standard kompakt variant er 120 px. Koden har også en 180 px variant, så 120 px er dagens bildekontrakt, ikke et universelt bilde-token.

## Elevation & Depth

Arbeidskort er flate: tone og luft organiserer innholdet; funksjonelle skillelinjer markerer rader og kontroller. Oppgraderingslaget gir vanlige arbeidskort tonal flat-flate uten kant; nestede kort har transparent bakgrunn. Andre komponenter, som dialoger og sekundærknapper, beholder sin funksjonelle kant. Valgt kontroll kan ha svak raised-skygge i lyst AK; natt har ingen raised-skygge. Popover og modal har etablerte myke skygger. WANGs aktuelle app-overstyring bruker en svak navytintet raised-skygge; eldre store kortskygger er ikke gjeldende felles retning. Team Norway bruker ingen skygger.

**The Flate før skygge Rule.** Arbeidsinnhold skilles med tone, luft og presise linjer; popover og modal kan ha den etablerte myke skyggen. Team Norway er uten skygger.

## Shapes

AK bruker radius for kort, knapper og felt, inner for tett innhold, modal for dialog og pill for statusmerker. Datamerker er rette. WANGs aktuelle kort er strammere enn eldre WANG-kort, med egne kontroll- og modalhjørner. Team Norway bruker rette kort og små hjørner på kontroller og modal. Ikke utled et globalt forbud mot piller eller runde former: AK har piller og radioknapper i eksisterende språk.

## Components

### Buttons

Primær, sekundær, ghost og signal deler høyde, tekstrolle og form. Primær har fyll; sekundær har kant; ghost får tonal hover; signal bruker signalpaletten. Standardhøyden er 44 px, xl er 56 px. WANGs primærknapp i gruppeinnhold bruker rosa action-fyll med egne hover/press-farger; valgt filter bruker navy primary-fyll. Team Norway bruker navy til begge roller. Natt har statisk trykkrespons. Lasting beholder etikettplass og viser «Lagrer …»; disabled demper kontrollen.

### Chips

Gruppefiltre har fylt valgt verdi med tekst som følger fyllet, og egen fokusmarkering. Medlemsfilteret bruker organisasjonens pill-radius: avrundet i AK og WANG, små hjørner i Team Norway (4 px). Andre kontroller bruker radius, og kort bruker radius-card; disse rollene skal ikke likestilles.

Aksemerker knytter tekst til treningsakse. Statusmerker kombinerer tekst og prikk. De skal beskrive innhold/status, ikke erstatte forklaring eller valgt kontroll.

### Cards / Containers

Gjeldende arbeidskort bruker flat-flate uten kant og organisasjonens kortform. Grunnkomponentens eldre card-flate/hairline overstyres i oppgraderingslaget. Vanlig kortpadding er 16 px. Store arbeidsseksjoner har større luft og tonal flat-flate. Månedsplanen samler innhold og åpner bare delen som redigeres.

### Inputs / Fields

Lyst felt har card-bakgrunn, control-kant, radius og 44 px høyde. Fokus får tydelig ring; feil bruker signal-ink. Nattfelt bruker flat-bakgrunn og større treffflate. Faktisk kontrolltekst bruker minst 1rem i oppgraderingslaget for å være lesbar og unngå telefonzoom. Tekstmerking og markør følger paletten. Gruppefelt og IUP bruker sekundær tekstfarge med full synlighet i hjelpetekst inne i tomme felt; kontrastsvak standard fra eldre felt arves ikke.

### Navigation

Aktiv side markeres med aria-current og egen tekst/fyllbehandling. Mobilfaner bruker ikon og navn; AK-desktopskinner bruker Lucide og synlig navn, i tillegg til tilgjengelig navn. Valgt AK-side har grafittfyll og lys tekst. Organisasjonenes egne skall og brand frames viderefører egne skrifter, farger og former i gruppeinnholdet. WANG og TN har egne farger og skallsystemer. Fokus er separat fra aktivt valg.

### IUP

WANGs coachvisning beholder redigerbare vurderinger, status, kommentar og fokusområder med synlig lagringshandling. Spiller og forelder leser samme delte innhold som tekst og navngitte verdier, med forklaring om at treneren endrer forslagene. Leseflaten viser ingen skjema eller lagringsknapp; tom kommentar beskrives med ord. Dette er registrert visningsoppførsel, ikke bevis på backendtilgang eller gjennomført lagring.

### Live

Øvelsens navn og instruksjon får ordhierarkiet; registreringen får tallhierarkiet. Steglisten bytter fra horisontal rekke til vertikal liste på desktop. Notater åpnes ved behov. Lagret lokalt, bekreftet lagret og delt er ulike tilstander; designet skal ikke gjøre ukjent verdi til null eller planlagt tid til gjennomført trening.

Bevegelse bruker korte fargeskift og etablert ease-out. Redusert bevegelse fjerner skalering og forkorter/skipper relevante overganger. Dokumentet registrerer eksisterende regler, ikke en bekreftelse på full tilgjengelighetstest.

## Do's and Don'ts

### Do:

- **Do** bruk organisasjonens profil også i felt, tabeller og arbeidsinnhold.
- **Do** sett sidens navn før kontekst og behold synlige navn i desktopmenyen.
- **Do** skill WANGs rosa handling fra navy valgt kontroll.
- **Do** vis delte IUP-verdier som tekst for leseren og kontroller for coachen.
- **Do** bruk fyll og tydelig tekst eller hake for valg, og egen fokusmarkering.
- **Do** behold tydelig navn og bredde på knappen mens lagring pågår.
- **Do** bruk faktiske sportsfoto som atmosfære med dokumentert proveniens.

### Don't:

- **Don't** bruk aksefarger som generell handlingsfarge.
- **Don't** bruk monoskrift til vanlig instruksjon eller generell navigasjon.
- **Don't** legg viktig instruksjon oppå sportsfoto.
- **Don't** arve overskriftens kicker eller eyebrow som ny husstil.

**Ikke kanonisert:** Kicker/eyebrow over overskrift som fortsatt finnes i eldre spesialflater, er en kjent craft-floor-feil. Sidehode viser nå konteksten under tittelen; prop-navnet kicker er ikke en ny regel for visuell rekkefølge. Eldre 10–11 px meta som bærer viktig lesetekst, kompakte segmentvalg under treffkravet og eventuelle glyph-symboler som ikonimitasjon er heller ikke husregler. Deres tilstedeværelse gir ikke nye flater rett til å arve dem; omfanget er ikke fullstendig kartlagt her.
