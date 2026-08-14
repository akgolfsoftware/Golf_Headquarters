# AVVIKSRAPPORT — hvorfor skjermene fortsatt ikke er like fasiten (13.08.2026, kveld)

> Gransking, ikke bygging. Målt mot `designsystem/paper/` (verifisert CRC-identisk med
> zip (3), 752/752 filer) på **main per commit `7c44ad0c`** — dvs. ETTER at hele
> nattkøen (#432→#436→#435, #434) og hele W4-runden (#437–#443) ble merget 13.08.
> App fotografert lokalt med screentest-brukerne (fiktive navn), m390 + d1280, lys + mørk.
> Galleri: `screenshots/paper/avvik/` (22 skjermer, app|fasit-montasjer + `index.html`).

## 1. Hovedkonklusjon (ærlig)

Det store bildet: **plattformen er ikke lenger «feil bygget» — de fleste målte flater
ligger nær fasiten i struktur og tokens.** Token-drift og speil-drift, de to klassiske
mistankene, er **avkreftet med måling** (se §1.1). Avstanden som gjenstår kommer fra
fem rotårsaker, rangert etter hvor mange skjermer hver forklarer:

### Rotårsak 1 — fasiten er ikke enig med seg selv om skallet (rammer ALLE admin-skjermer)
Fase 2-fasitene (`fase2/agencyos/*`) tegner en **annen rail** enn fase 1:
7 punkter, mixed case — *Cockpit · Innboks · Kalender · Stall · Plan · Innsikt · Oppsett* —
mens fase 1-konsollfasiten (og appen) har 8–9 punkter i versaler
(*Konsoll · Innboks · Spillere · Kalender · Workbench · AgenticOS · Økonomi · Innstillinger · Mer*).
Alle 10 admin-skjermene i galleriet «ser feil ut» ved siden av sin fase 2-fasit **uansett
hvor riktig selve flaten er**, fordi skallet på venstre side aldri kan matche begge fasitene
samtidig. Dette er GYLDIGHET-konfliktregel 3 («aldri to sannheter») internt i fasiten —
rail-avklaringen står allerede som åpen i `beslutninger.md`, men konsekvensen er
undervurdert: den forgifter hver eneste side-om-side-sammenligning.
**Tall: 10 av 10 målte admin-skjermer.**

### Rotårsak 2 — artefaktkolonnen/master–detalj er ikke bygget (4 av 5 W4-flater + godkjenninger)
Fase 2-fasitene har konsekvent inspektørpanel til høyre (380 px): «Køen i tall»
(godkjenninger), malinspektøren med «Rull ut» (planbibliotek), tabell + kapasitet
(bookinger). Appen bruker liste-side → egen detaljrute. Dette er et **dokumentert
arkitekturvalg** (PP-W4-VARIANTS: «samme mønster som resten av AgencyOS»), ikke slurv —
men det er også galleriets hovedfunn fra 12.08 om igjen: uten artefaktkolonnen kjennes
flatene som oppslagstavler, ikke Claude-flater. Unntaket som beviser mønsteret:
`/admin/grupper` HAR master–detalj og ligger nærmest fasiten av alle W4-flatene.
**Tall: 4 av 5 W4-målinger + godkjenninger. Venter på Anders-beslutning (fiksplan d).**

### Rotårsak 3 — clay-banner-mønsteret: «Én ting nå»-komponenten brukes til vanlige knapper
Fasiten bruker clay ÉN gang per skjerm: knappen inne i «Én ting nå»-kortet. Skjermens
øvrige handlinger er ink-knapper i topplinjen («Ny plan», «Ny booking» = svarte).
Appen har gjort fullbredde clay-banner til standard listeside-CTA: «+ Ny plan»,
«+ Ny booking», «Ta 2 saker som haster», til og med ren navigasjon («Tilbake til Meg»
på innstillinger). Statisk teller: 307 `T.handling`-forekomster i 126 filer,
**flere clay-CTA-er på samme flate** i minst 10 filer (verst: `InnstillingerIntegrasjonerV2`
med 4), clay i 5 av 65 `error.tsx`, clay som uleste-markør i `VarslerV2`, clay som
seleksjonsfarge i `WorkbenchV2Sheets`. Dette er et *mønster*-avvik som er kodifisert i
variant-tabellene («Ny plan (enTing)») — dokumentene har normalisert avviket.
**Tall: målt på 5 av 22 galleri-skjermer + 10+ filer statisk.**

### Rotårsak 4 — typografiskalaen er dokumentasjon, ikke praksis (systemisk)
**2 398 av 3 937 inline `fontSize`-deklarasjoner (61 %) ligger utenfor token-skalaen.**
De to vanligste fontstørrelsene i hele kodebasen er 13px (558) og 12.5px (433) — begge
finnes ikke i skalaen. Avviket er tettest i kjernebiblioteket (`datavis.tsx`,
`domene.tsx`, `design-lab-v2.tsx`, `WorkbenchV2.tsx` med 81), så det **reproduseres ved
kopiering**. I tillegg: JetBrains Mono (gammel Presis-mono) hardkodet 14 steder i
`PutteLabV2`/`BreakTabellV2`, og Presis-paletten lever videre innkapslet i
`src/lib/v2/tokens.ts` (`T.wrapped.bgForest #005840`, `T.brand #D1F843`) pluss en hel
skygge-palett i faktura-PDF-en. Hex-disiplinen i komponentfilene er ellers god
(17 reelle treff i 5 filer).

### Rotårsak 5 — rest-chrome og skall-hull (lav synlighet, høy tilbakefallsrisiko)
4 aktive F1-brudd: `(legacy)/mal`- og `(legacy)/coach`-layoutene rendrer gammel `SubNav`
inne i `V2Shell` (dobbel nav), sg-hub-hodet legger et tredje lag, og **`/meg` står helt
utenfor skall-monopolet** (ingen `V2Shell`). Pluss 11 døde chrome-komponenter med null
importører (`PortalShell`-klyngen, `ForelderSidebar`, `admin-hero`/`player-hero`,
hele `hubs/`) som neste utvikler kan «finne» og gjenbruke. Legacy-lekkasjen for øvrig er
avkreftet: 53 av 80 legacy-sider er rene redirects, resten kjører v2-komponenter,
0 bekreftede tilfeller av gammel komponent der v2-motpart finnes.

### 1.1 Avkreftede mistanker (målt, ikke antatt)

| Mistanke | Resultat |
|---|---|
| Token-drift (`paper-tokens.css` vs fasit v3.1) | **0 verdiavvik** — alle overlappende tokens identiske, lys og mørk |
| Speil-drift (`designsystem/paper/` vs siste zip) | **752/752 filer CRC-identiske** med «AK Golf HQ — Claude Paper (3).zip» |
| UTGÅTT-stemplene fra #432 | Alle 6 stikkprøvede filer har stempelet |
| «Ikke merget ennå»-avvik | **Merge-køen er tom.** #432/#434/#435 merget, #433 gjenåpnet som #436 og merget, W4-runden #437–#443 merget 13.08 |
| Checklist-råte ([~]-rader uten rute) | **0** — alle 58 `[~]`-rader har eksisterende rute/komponent |
| Mørk modus-kollisjoner (lime/primary-klassen) | Ingen funnet på de målte flatene — mørk inverterer rent |

## 2. Avvikstabell (22 målte skjermer)

Klasser: TOKEN · STRUKTUR · CHROME · TILSTAND · DATA · COPY · STALE. Fiks: S/M/L.

| Skjerm (rute) | Fasit-fil | Viktigste avvik | Klasse | Rotårsak | Fiks |
|---|---|---|---|---|---|
| /portal (hjem/chat) | playerhq-chat-mobil/desktop | Nær fasit. Ekstra «Dagens økt»-pille i hodet; composer mangler synlige `/`- og `@`-chips-layout fra fasit | STRUKTUR | — | S |
| /portal/planlegge/workbench | workbench-mobil/desktop | Header-mønster avviker (mangler tilbake-sirkel + tittellinje); ekstra Std/Pro-toggle og Etterlevelse-knapp som ikke finnes i fasit | STRUKTUR | 3 (ekstra kontroller) | M |
| /portal/booking | playerhq-booking | Nær 1:1 — Én ting nå-kort, kortstruktur og clay-bruk korrekt | DATA/COPY | — | S |
| /portal/meg/innstillinger | playerhq-innstillinger | **Clay-banner «Tilbake til Meg» (ren navigasjon)**; fasitens inline e-postfelt/abonnement-rad mangler; header-mønster | STRUKTUR | 3 | M |
| /portal/meg/abonnement | playerhq-abonnement | Nær; to fyllknapper der fasit har én ghost («Endre coaching-pakke») | STRUKTUR | 3 | S |
| /portal/meg/helse | playerhq-helse | App viser opt-in-porten (ærlig tilstand); fasitens aktive tilstand ikke målbar uten aktivering. Symptom/ny-som-BottomSheet står åpen (nattspm. 5) | TILSTAND | — | ? |
| /portal/coach | playerhq-coach-hub | Nær — fokus/meldinger/timer/videoer-kortene matcher, clay kun på «Book time» | DATA | — | S |
| /portal/talent/mitt-niva | playerhq-talent | Viser forklarende gate i stedet for `notFound()` ved FEATURES.TALENT av — bedre UX, men avviker fra rutefasit | TILSTAND | — | S (avklaring) |
| /admin/agencyos (konsoll) | agencyos-konsoll-desktop/mobil | Rail-typografi (versaler vs fasitens mixed case); composer mangler mic/`/`/`@`/Send-utformingen fra fasit; ellers: artefaktkolonne, ⌘K, Én ting nå på plass | CHROME/STRUKTUR | 1 | S–M |
| /admin/godkjenninger | agencyos-godkjenninger | **Artefaktkolonnen («Køen i tall») mangler; kildefaner (Agent/Caddie/Økt-fsp) mangler; «Dette endres»-blokk per kort mangler; Endre først/Utsett mangler; stor clay-banner** | STRUKTUR | 2 + 3 | L |
| /admin/agenticos | agencyos-agenticos-hub | Nær — KPI, Drift i tall, ruter-samles-her, ærlige tomdata. Fasitens agenttabell (kolonner) er liste i appen | STRUKTUR | 2 (lett) | S |
| /admin/agents/round-agent | agencyos-agent-detalj | Nær — men **TRIGGER-KPI-teksten renner ut av flisen** (synlig layoutbug); «Neste kjøring»→«Trigger» er dokumentert avvik (#435) | TOKEN | 4 | S |
| /admin/grupper | agencyos-gruppe-detalj | **Nærmest fasit av alle W4-flatene** — master–detalj bygget, ink-CTA-er | — | — | S |
| /admin/bookinger | agencyos-bookinger | Clay-banner «+ Ny booking»; fasitens tabell (NÅR/HVEM/TJENESTE…) er kortliste; heatmap grå der fasit bruker sky-blå; hub-faner over tittelen | STRUKTUR | 2 + 3 | M |
| /admin/plans | agencyos-planbibliotek | **Fasitens éne flate (maler + inspektørpanel + «Rull ut») er splittet i Planer-side + Maler-knapp + egne detaljruter; clay-banner «+ Ny plan»**; pyramidefordelings-barene mangler | STRUKTUR | 2 + 3 | L (venter beslutning) |
| /admin/tournaments | agencyos-turneringer | Nær — Kommende/Spilte-faner, ink «Ny turnering», Fellesmelding per rad (#442 leverte) | DATA | — | S |
| /admin/settings | agencyos-oppsett | «System og logg»-fanen mangler (dokumentert STOPP); periodenavn-skjemaet ligger på egen rute, ikke på flaten; «Innstillinger» vs «Oppsett» henger på rail-avklaringen | STRUKTUR | 1 + 2 | M |
| / (forside) | marketing-side | Følger malen (hero+bevis-varianten); egen copy er tillatt per malens natur | COPY | — | S |
| /coacher · /blogg | marketing-katalog | Stikkprøve (montasje i galleriet) — §10-liste-mønsteret gjenkjennelig; ingen slug i marketing-koden gjør maskinell verifisering umulig | STRUKTUR? | 6 (sporbarhet) | S |
| /auth/logg-inn | auth-flyt / innlogging | App er mørk per default; #444 («lys Paper-innlogging som default») ble lukket uten merge — tilstanden er altså bevisst, men fasit-spørsmålet står åpent | TILSTAND | — | avklaring |
| 404 | system-tilstander | Matcher mønsteret (mørk systemtilstand, To utganger) — signert 13.08 | — | — | — |

**Tverrgående (alle skjermer):** dev-badgen «N / 1–3 Issues» nederst til venstre i
app-skjermbildene er Next.js-devtools, ikke appen — MEN den viser at `/portal/booking` og
`/admin/godkjenninger` har konsollfeil i dev som bør sees på (`read_console` neste økt).

## 3. STALE-listen

**Tom.** Alt som lå i nattens merge-kø er i main (#432, #436 som gjenåpnet #433, #435,
#434 — pluss W4-runden #437–#443 og docs #443). Det finnes altså ingen «fikset, venter
på merge»-unnskyldning for noen av avvikene over: main ER siste kjente tilstand.

Derimot er **checklisten selv stale på PR-referanser**: `PAPER-ZIP-CHECKLIST.md` sier
fortsatt «fiks i åpen #413» (merget 11.08), «åpen PR #414» (merget 12.08) og «åpen PR
#419» (merget 12.08). Kun #431 (lanseringsbryter) og #406 (WANG-deling) er reelt åpne.
Rader som bør oppdateres ved neste dokumentpass: `playerhq-live-tapper`, `playerhq-okt-detalj`,
`playerhq-turnering-detalj`, `playerhq-turneringer`, `playerhq-trackman-detalj`,
`spillerprofil`, `wang-coach-arsplan`, `gfgk-veileder-artikkel`.

## 4. Galleri

`screenshots/paper/avvik/` — 22 skjermer × (app m390/d1280 × lys/mørk + fasit m390/d1280)
= 132 PNG, pluss `sammen-*.png`-montasjer (app|fasit side om side) og `index.html`.
Tatt 13.08 kveld mot lokal dev på main med screentest-spiller (`screentest@akgolf.test`)
og screentest-coach (`coachtest@akgolf.test`) — fiktive navn, ingen elevdata.

## 5. Fiksplan (rekkefølge)

### (a) Merge-køen
Ingenting å merge — køen er tom. Vedlikehold: oppdater de stale PR-referansene i
checklisten (se §3) i neste dok-PR.

### (b) Systemfikser som retter mange skjermer på én gang
1. **Rail-avklaringen (rotårsak 1)** er nå den mest lønnsomme enkeltbeslutningen i hele
   porten: én beslutning + én endring i `V2Shell`/fasit retter «feil skall» på samtlige
   admin-flater. Blokkerer også «Innstillinger vs Oppsett»-tittelen.
2. **Clay-normen (rotårsak 3):** vedta regelen «clay kun i Én ting nå-kortet + fokus;
   skjermhandlinger er ink i topplinjen». Deretter én mekanisk sweep: bytt
   `enTing`-bannerne på plans/bookinger/godkjenninger/innstillinger til ink-header-knapper,
   konformer de 5 `error.tsx` til `V2Feil`, fjern clay-prikken i `VarslerV2` (→ `--dn`
   eller nøytral), og rett `InnstillingerIntegrasjonerV2` (4 → 1).
3. **Typografi-gate (rotårsak 4):** lint-regel (forslag i §6) + rydd kjernebiblioteket
   først (`datavis.tsx`, `domene.tsx`, `core.tsx`) så nye skjermer arver riktig. Bytt
   JetBrains Mono → `T.mono` i `PutteLabV2`/`BreakTabellV2` (14 steder, ren mekanikk).
4. **Composer som delt komponent (rotårsak 2-slektning):** rutefasit sier «festet
   spørrefelt nederst på alle desktop-flater (komponent `Composer`)» — komponenten
   finnes ikke; composer er inline-markup på 3 chat-flater. Ekstraher og monter i
   skallet, så arver alle flater den.
5. **Chrome-rydding (rotårsak 5):** slett de 11 døde chrome-komponentene + de 2
   foreldreløse rutesegene (`admin/(legacy)/agencyos/`, `(legacy)/spillere/ny/`),
   fjern `SubNav` fra `(legacy)/mal`- og `coach`-layoutene (samme grep som
   statistikk/varsler allerede gjorde), og gi `/meg` `V2Shell` (eller legg ruta død).

### (c) Per-skjerm-fikser (etter b)
- `agent-detalj`: TRIGGER-KPI-overflow (S).
- `konsoll`: composer-detaljer (mic, `/`, `@`, Send) + rail-typografi når (b)1 er avgjort (S).
- `workbench`: header-mønsteret mot fasit; avklar Std/Pro/Etterlevelse-kontrollene (M).
- `w3-innstillinger`: struktur mot fasitens inline-felter (M).
- `w4-bookinger`: tabellform + sky-heatmap (M).
- `w4-settings`: periodenavn-skjema inn på flaten (M).

### (d) Krever Anders-beslutning eller ny fasit (de 8 nattspørsmålene er innarbeidet, ikke duplisert)
1. **Rail-fasiten** — fase 1-rail (dagens kode) eller fase 2-rail (Cockpit/Stall/Plan…)?
   Én må vinne, den andre fasit-familien oppdateres (GYLDIGHET regel 3). *(Ny — viktigst.)*
2. **Master–detalj i AgencyOS** — skal fasitens inspektørpanel bygges (godkjenninger,
   planbibliotek, bookinger), eller skal fasitene tegnes om til liste→detalj-mønsteret
   appen har standardisert? Rammer også nattspm. om plans/[planId]-komponentisering. *(Ny.)*
3. **Clay-normen** — bekreft regelen i (b)2 slik at variant-dokumentene slutter å
   kodifisere `enTing` som liste-CTA. *(Ny.)*
4. **Mørk vs lys innlogging** — #444 ble lukket; er mørk auth endelig? (Fase 1-fasiten
   `innlogging.html` er signert — hvilken tilstand var det som ble signert?)
5. Nattspm. 1–3 (oppgavesystem KommandoTask/Notion; dispatch/morgenbrief-redirect;
   AiCost før/etter signering) — står ubesvart, blokkerer resten av drift-sporet.
6. Nattspm. 4–8: `innstillinger/okter`-datamodell · `helse/symptom/ny` som BottomSheet ·
   FeedbackForm · «Åpne feilloggen»-mål · `/portal/talent`-hub. I tillegg fra denne
   granskingen: talent-gaten (forklarende side vs `notFound()`).
7. **Templates-fasitene (8 × `.dc.html`)** — de er Open Design-komponentkontrakter, ikke
   HTML-skjermer, og har null kodemotpart. Beslutning: egen portingskontrakt eller ut av
   checklisten (referer `guidelines/kompilerte-filtyper.md`).

## 6. Forslag til CI-vakter (hindre gjentakelse)

Token-gaten finnes. Det som mangler, i prioritert rekkefølge:

1. **Typografi-gate:** ESLint-regel (evt. utvidelse av `kvalitet.mjs`) som flagger inline
   `fontSize` med verdier utenfor skala-lista i nye/endrede filer. Start som warning på
   diff (ikke repo-bredt — 2 398 eksisterende treff ville stoppet alt), vipp til error
   når kjernebiblioteket er ryddet.
2. **Clay-gate:** grep-sjekk i CI: maks én `T.handling`-*fylt* knapp per komponentfil
   utenfor en tillatt-liste; forby `T.handling` i filer som matcher `error|varsel|alert`.
   (Grov, men fanger nettopp de bruddene som er funnet.)
3. **`data-paper-slug`-krav:** skjermkomponenter under `src/components/*/v2/` og
   `src/app/(marketing)` uten slug flagges — marketing-flaten (13 sider) og
   `workbench-turnering` er i dag usporbare for verifikatoren, og to `[x]` er signert
   uten slug (`marketing-katalog`, delvis `agencyos-kalender-mobil` som ikke har noen
   kodereferanse i det hele tatt — bør nedgraderes eller dokumenteres).
4. **Bredde-gate:** Playwright-sjekk på nøkkelruter:
   `document.documentElement.scrollWidth <= window.innerWidth` på 390 px (samme klasse
   som innboks-bomben 10.08, gotchas §rutenett-kolonne).
5. **Skall-gate:** grep i CI etter `<nav`/`<header` i nye filer under
   `src/app/{portal,admin,forelder}` utenfor tillatt-liste (V2Shell, PaperChrome,
   fullscreen) — F1-bruddene i (legacy) hadde vært fanget.
6. **Screenshot-diff mot seeds:** verdifullt, men dyrest — anbefales som natt-jobb
   (ikke PR-gate) mot Vercel-preview med screentest-seeds, med `sammen-*`-montasjene
   fra dette galleriet som baseline.

---
*Metode: 3 parallelle statiske granskinger (skall/legacy, hardkoding/clay, fasit-dekning
i git) + CRC-verifisering av speilet mot zip (3) + 132 skjermbilder lokalt på main.
Ingen skjermfiler endret; ingen `[x]` satt; ingen gate senket.*
