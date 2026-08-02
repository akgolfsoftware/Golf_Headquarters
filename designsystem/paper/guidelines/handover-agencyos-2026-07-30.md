# Handover til Claude Design — AgencyOS, komplett komponent- og skjermgrunnlag

Prosjekt: **AK Golf HQ — Claude Paper** (`605a48cc-81e8-44bd-94d2-07d50a97370a`)
Skrevet 30.07.2026. Samler `brief-skjermkontrakt.md`, `agencyos-komponentkart.md`,
`agencyos-funksjonskart.md`, `agencyos-profil-workbench-plan.md`,
`ordre-gulvretting-v2.md` og `brief-timegrid.md` til ett dokument.

Denne fila erstatter behovet for å lime inn de seks. Den er referansen resten av
fase 2 måles mot. (Lagret i prosjektet fra Claude Code 30.07 — se også
`kart/masterordre-fase2-2026-07-30.md` som utvider den til hele plattformen.)

---

## 0 · Les dette først

**Tre ting som annullerer eldre ordrer, slik at du ikke bygger dobbelt:**

1. **`TimeGrid` finnes allerede.** `components/calendar/TimeGrid.jsx` med
   `.d.ts`, `.prompt.md` og `timegrid.card.html`. `brief-timegrid.md` er
   annullert som byggeordre. Komponenten er referanseimplementasjonen for
   gulvregelen — `::after` måler 43,99 px over en 20 px synlig boks [målt
   29.07]. Rør den ikke.
2. **Lagmigreringen er ferdig.** Inventaret står på **350 klassenavn, 0
   ulagrede** [målt 29.07]. Tallene 302/174 i `klasseinventar.md` og
   `readme.md` er utdaterte og skal rettes, ikke siteres.
3. **`agencyos-hq.html` er flyt, ikke stil.** Ingen klasse derfra skal portes.
   Den viser arrangement og oppførsel. Alt visuelt eies av akhq-biblioteket.

**Fasit for alle mål:** `kart/revisjon-gulv-rigg.html`. Ingenting meldes grønt
uten måling etter rettelsen. Alt du legger til skal ligge i `@layer`.

---

## 1 · Produktet i én setning

AgencyOS er drifts- og coachingverktøyet for én person som er både golfcoach og
daglig leder i fem selskap. Én kø for begge hattene, fordi det er samme menneske
med samme begrensede oppmerksomhet.

Konsekvensene for design, i rekkefølge etter hvor mye de styrer:

- **Køen er hjertet, og den er blandet.** «Godkjenn ukeplan for Emma» og
  «WANG-fakturaen er 12 dager på overtid» hører i samme kø.
- **Agentene er avsendere, ikke destinasjoner.** Du går ikke til Plan-vakten;
  den melder seg i køen. Det fjerner en hel navigasjonsgren.
- **Ingenting når en spiller uten godkjenning.** Hvert agentforslag i køen har
  en «Hvorfor?» som folder ut agent, data og regel. Et forslag uten proveniens
  er ikke ferdig designet.
- **Invariantbrudd er anbefalinger, aldri sperrer.** Med «overstyr med
  begrunnelse» som alltid tilgjengelig utvei.

---

## 2 · De ufravikelige reglene

Disse gjelder hver komponent og hver skjerm i resten av dokumentet.

**Gulvet.** 44 px treffmål ved grov peker, målt på **elementet som mottar
klikket**, ikke containeren rundt. Er elementet visuelt mindre, utvides
*treffsonen* med `::after` etter `TimeGrid`-mønsteret — den synlige boksen
endres aldri. Unntak finnes kun for lenker i løpende prosa, og kun ved
navngiving i lista i `guidelines/gulvregel.md`. `--floor: 0` er forbudt som
stille mekanisme.

**Fargedisiplinen.** Biblioteket eier verdiene, komposisjonen eier bruken:

- **Oransje har monopol** på to ting: den ene viktigste handlingen på skjermen
  akkurat nå, og fokusringen. Maksimalt én oransje jobb per skjerm — eller
  ingen. To oransje elementer betyr at ingen av dem er viktigst.
- **Grønn, leire og blå er datasemantikk**, aldri dekor og aldri handling.
  `--up` opp, `--dn` ned (leire, `rgb(168, 85, 54)`), `--info` nøytral.
- **Rød finnes ikke.** En rød hardkodet verdi er et funn som meldes særskilt.
- **Alt annet er blekk på papir.** Primærknapper er blekk, ikke farge.

**To brytpunktmekanismer, ikke én.** Viewport styrer *skallet* (sidebar mot
bunnfaner, panel mot bunnark) via media queries. Container styrer
*komponentene* via container queries — alltid. En KPI-rad i et smalt panel skal
brekke til to kolonner selv om vinduet er 1500 px. Dette er kontraktens
viktigste tekniske punkt: brytes det, får man komponenter som ser riktige ut i
galleriet og feil i produktet.

**Nivåregelen.** En komponent som fungerer i et panel, skal ikke få egen flate.
Bygges den for en flate, skal den ikke krympes inn i et panel.

**Øvrig.** Norsk bokmål i all UI-tekst. Lucide som eneste ikonbibliotek. Ingen
nye tokensystemer — `--v2-*` er eneste kilde. Alt i `@layer`.

---

## 3 · Skallet

### Desktop (≥ 880 px) — tre kolonner

**Venstre: sidebar, fast bredde.** Bruker `Rail`. **Seks punkter og ikke
flere:** Hjem, Kø, Stall, Kalender, Workbench, Alt. Under dem to seksjoner som
er data, ikke navigasjon: «Trenger deg» (spillere med noe utestående) og
«Nylig». Nederst brukeren.

Antallet er en beslutning. Innsikt, AgenticOS og Økonomi finnes, men bor i Alt —
de kjemper ikke om plass i navet.

**Midt: hovedkolonnen.** Toppfelt med tittel og undertittel, deretter flaten.
Under flaten, festet: **komponisten**, som følger deg på alle flater slik at du
kan spørre om en spiller mens du står i Workbench. Nederst **statuslinjen** i
mono: versjon og periode, agentfeil, MRR, innsikter, CANON-status. De tre
midterste er klikkbare.

**Høyre: artefaktpanelet.** Skjult som standard, åpnes fra innhold eller
toppfelt. **Krymper hovedkolonnen, legger seg ikke over den.**

### Mobil (< 880 px) — samme produkt, ikke en redusert utgave

- **Sidebaren blir bunnfaner. Fem, ikke seks:** Hjem, Kø, Stall, Agenter, Alt.
  Kalender og Workbench nås gjennom Alt — de trenger bredde, og en bunnfane som
  alltid åpner noe trangt slutter å bli trykket.
- **Artefaktpanelet blir bunnark.** Maks 88 % høyde, dragehåndtak øverst,
  skjerm bak. Ikke modal — bakgrunnen skal lese som kontekst.
- **Komponisten vises kun på Hjem.** Tommelen er der, oppmerksomheten er ikke.
- **Statuslinjen skjules.** Periferisyn finnes ikke på en telefon.

`Panel` og `Sheet` finnes begge i biblioteket og **skal aldri divergere i
innhold**. Samme artefakt, to innfatninger.

---

## 4 · De tre nivåene — hver komponent hører til nøyaktig ett

**Nivå 1 · Samtale.** Standardflaten. Alt som starter som et spørsmål eller
ender i en beslutning. Rundt 35 funksjoner. Komponisten alltid tilgjengelig.

**Nivå 2 · Artefakt.** Alt som er et dokument du leser, godkjenner eller
sender. Rundt 55 dokumenttyper i **ett** panel/bunnark.

**Nivå 3 · Flate.** Full overtakelse av hovedkolonnen. Kun der romlig eller tett
interaksjon *er* jobben. En flate er ikke «en viktig side» — den er en side der
manipulasjon i to dimensjoner er selve arbeidet.

---

## 5 · Skjermregisteret

### 5.1 Navflater (nivå 3, i sidebaren)

| # | Flate | Jobb | Bærende komponenter |
|---|---|---|---|
| S1 | **Hjem** | Samtale som standard. Dispatch som første melding, «En ting nå» øverst, KPI-rad, komponist festet | `OneThingNow` · `StatTile`/`StatRow` · `Composer` · `ListGroup` |
| S2 | **Kø** | Blandet kø: coaching og drift. Godkjenn/avvis/utsett. Proveniens per rad | **`QueueCard`** · `ProvenanceDisclosure` · `SegmentControl` (filter) · `StatusBadge` |
| S3 | **Stall** | Spillerliste sortert etter hvem som trenger deg. Rad svarer «trenger hun meg?» på ett sekund | `ListRow`/`ListGroup` · `StatusBadge` · `Chip` · `SearchField` |
| S4 | **Kalender** | Uke- og dagsvisning, booking, kollisjoner | **`TimeGrid`** (finnes) · `SegmentControl` · `Panel` |
| S5 | **Workbench** | Ukeplanlegging. Dra økter mellom dager, se budsjettet endre seg | `TimeGrid` · **`SessionCard`** · **`BudgetBar`** · `SegmentControl` · `SearchField` |
| S6 | **Alt / indeks** | ⌘K på desktop, fane på mobil. Indeks over ~100 funksjoner med nivåmerke per rad | **`CommandPalette`** · `ListRow` |

Uten S6 er 100 funksjoner en meny ingen leser.

### 5.2 Øvrige nivå 3-flater (nås via Alt eller fra kontekst)

| # | Flate | Hvorfor nivå 3 | Nytt som trengs |
|---|---|---|---|
| S7 | **Live-økt** | TrackMan tilkoblet, sanntid, tett interaksjon | `ShotList` · `DispersionPlot` |
| S8 | **TrackMan-analyse** | Dispersion, lengdespredning, launch | **`DispersionPlot`** · `viz.jsx` |
| S9 | **Testkjøring** | 20 protokoller, sekvensiell registrering | `StepFlow`-mønster · `FormField` |
| S10 | **Videoanalyse** | Scrubbing mot P1.0–P10.0 | **`VideoScrubber`** · **`PositionMarker`** |
| S11 | **Økonomi** | Ledger per selskap, ett om gangen, konserntotal øverst | **`DataTable`** · `StatRow` |
| S12 | **Booking** | Simulatorbelegg, romlig | `TimeGrid` (variant) |
| S13 | **Varelager / ordre** | Skarpnord, tabelltungt | `DataTable` |
| S14 | **Marketing-editor** | Egen flate; vurderes som eget produkt på samme tokens | — utenfor denne runden |
| S15 | **Årshjul / sesongplan** | Årslinje med perioder GRUNN/SPES/TURN | **`YearTimeline`** |

### 5.3 Nivå 2 — artefakttypene

Ett panel, mange dokumenttyper. De som må designes eksplisitt:

Ukeplan · **Spillerprofil (fem faner, se 5.4)** · Periodeplan · Testresultat ·
Øktnotat · Spillerrapport · Grupperapport · Klubbrapport (GFGK) · IUP ·
Faktura · Kontrakt/avtale · Kundekort · Agentkjøring · Møtereferat.

Felles anatomi for alle: hode med tittel og status, innhold, **og en handling
til slutt — aldri en tabell som siste element**. «Åpne alt» der artefaktet har
en full flate bak seg.

### 5.4 Spillerprofilen — fem faner

Tre nivåer, hver med én jobb: **raden i Stall** svarer «trenger hun meg?» på ett
sekund, **artefaktet** svarer «hvordan ligger hun an?» på ti sekunder, **full
flate** er der du jobber.

| Fane | Jobb | Innhold |
|---|---|---|
| **Status** | det du trenger før en økt | kategori A–K, pyramidefordeling siste 8 uker mot periodens min/maks, ukevolum mot aldersregelen, neste økt og test, aktive agentvarsler |
| **Utvikling** | retningen over tid | SG per kategori med trend, testhistorikk mot kategorikrav, mål med fremdrift, turneringer og WAGR, AK-stigen / Veien til lavere score |
| **Teknikk** | MORAD-apparatet | teknisk plan P1.0–P10.0, posisjonsoppgaver med tosporet fremdrift, TrackMan-mål med baseline og hit-rate, køllemål, dispersion |
| **Plan** | det som er avtalt | ukeplan med AK-formel per økt, periodeblokker, fysisk plan, låste ankere, ventende forespørsler |
| **Person** | rammen rundt | utstyr, fasiliteter, skole og kompetansemål (WANG), foresatte og samtykke, LIFE-notater, abonnement, permisjon/skade |

To regler holder profilen ren: **tall er nøytrale til tallet selv er
semantikken** — retningen bæres av deltaer. Og **hver fane slutter med en
handling**: Status ender i «Spør om …», Teknikk ender i «Åpne i Workbench».

### 5.5 Workbench — tre soner

**Ukelerretet** i midten: sju kolonner, økter som kort med pyramideområde og
AK-formel, dra mellom dager, klikk for editor. Låste ankere med hengelås,
gjentakende med rrule-merke, delte økter med deltakertelling. Gruppetimer og
bookinger som bakgrunnslag (`.akhq-tg-ev--bg`) så kollisjoner er synlige før de
skjer.

**Budsjettlinjen** øverst: ukevolum mot periodens min/maks, fordeling per
pyramideområde, TEK-prosent, aldersregel-status. Oppdateres på hver endring.
Det er den som gjør CANON levende — invariantene kjører på hvert slipp, brudd
vises som anbefaling med «overstyr med begrunnelse», **aldri som sperre**.

**Sidestolpen** til høyre, tre innhold: økt-editor (AK-aksene som segmenterte
valg: L-fase, CS, M, PR, P-posisjoner; drill-liste filtrert på kategori og
fasiliteter; L-trappens tre rep-felter per drill), innboks (SessionRequests og
PlanAdjustments med godkjenn/avvis), og Caddie (utkast som kan dras rett inn på
lerretet).

---

## 6 · Komponentregisteret

### 6.1 Bekreftet i biblioteket [målt 29.07]

`Button` · `Chip` · `StatusBadge` · `ListRow` · `ListGroup` · `SegmentControl` ·
`TextInput` · `FormField` · `SearchField` · `FieldMessage` · `Panel` · `Sheet` ·
`BottomSheet` · `Rail` · `Modal` · `ConfirmDialog` · `DropdownMenu` · `Tabs` ·
`Banner` · `OneThingNow` · `StickyActionBar` · `ThemeToggle` · `QuickLinkBar` ·
`Breadcrumbs` · `SkipLink` · `TimeGrid` · `viz.jsx`

Klasseprefikser bekreftet til stede: `.akhq-now-*`, `.akhq-kpi-*`,
`.akhq-sgbar-*`, `.akhq-pyr-*`, `.akhq-lrow`/`.akhq-lgroup`, `.akhq-kvg-*`,
`.akhq-panel-*`, `.akhq-sheet-*`, `.akhq-seg-btn`, `.akhq-chip`, `.akhq-badge`,
`.akhq-tg-*`.

**Én uavklarthet du må måle før du bygger:** `agencyos-komponentkart.md` melder
KPI-flisene (`.sum`) som «mangler», mens inventaret 29.07 lister `.akhq-kpi-*`
som eksisterende. Det ene av de to er feil. Mål før du bygger `StatTile` — det
kan hende jobben er å innramme en eksisterende komponent, ikke å lage en ny.

### 6.2 Må bygges — prioritert etter hvor mange flater som venter

| # | Komponent | Brukes på | Hvorfor den er her |
|---|---|---|---|
| K1 | **`QueueCard`** + `ProvenanceDisclosure` | S2, S1 | Produktets hjerte. Kø-kort med «Hvorfor?»-utfelling: agent, data, regel. Finnes ikke |
| K2 | **`StatTile` / `StatRow`** | S1, S3, S5, S11, profil | KPI-fliser. Går igjen på ti flater. Container queries obligatorisk |
| K3 | **`SessionCard`** | S5, S4, profil/Plan | Øktkort med pyramideområde, AK-formel (`TEK_TEE_L-BALL_CS60_M2_PR2`), hengelås, rrule-merke, deltakertelling |
| K4 | **`BudgetBar`** | S5 | Ukevolum, pyramidefordeling, TEK-prosent, aldersregel. Invariantbrudd som anbefaling |
| K5 | **`CommandPalette`** | S6, alle | Indeks over ~100 funksjoner med nivåmerke per rad. Erstatter global-search |
| K6 | **`Composer`** | alle flater desktop, kun Hjem mobil | Festet under flaten. Må virke i alle tre nivåer uten å ta plass fra dem |
| K7 | **`StatusBar`** | desktop | Mono. Versjon/periode, agentfeil, MRR, innsikter, CANON. Tre midterste klikkbare. Skjult < 880 px |
| K8 | **`TabSet`** (profilfanene) | profil nivå 2 og 3 | Fem faner som må se identiske ut i panel og full flate. Bygger på `Tabs` — verifiser at `Tabs` sitt gulv er rettet (38,0 px før retting) |
| K9 | **`DataTable`** | S11, S13 | Sorterbar kolonneheader. 0 av 3 målte skjermer krever den i dag — riktig prioritert etter 1. september |
| K10 | **`DispersionPlot`** | S7, S8, profil/Teknikk | TrackMan-spredning. Sjekk om `viz.jsx` allerede dekker SG-baren og hvor langt den rekker |
| K11 | **`YearTimeline`** | S15 | Årshjul med GRUNN/SPESIALISERING/TURNERING |
| K12 | **`VideoScrubber`** + `PositionMarker` | S10 | P1.0–P10.0 mot video. Sist, fordi den er egen flate uten avhengigheter |

### 6.3 Kjent gjeld som må lukkes før K1

Fra `ordre-gulvretting-v2.md`, uendret gyldig:

- 14 gulvbrudd, 12 forklart (seks fra `Button --sm`, fire fra `--floor: 0`, to
  uten `--floor`), **to fortsatt uforklart** — navngis og kategoriseres før
  noe rettes.
- `gulvregel.md` skrives, med unntaksliste og begrunnelse per navn.
- `BottomSheet` mangler fokuserbar node i markup — fokuskontrakten kan ikke
  oppfylles, og riggen kan ikke måle den.
- 13 hardkodede farger, åtte i `Rail`. `Rail` er alltid mørk og fanges ikke av
  modus-paritetssjekker — må måles eksplisitt i begge temaer.
- Scrim: 40 % vs 42 % vs dokumentert 40 %. Velg én, gjør den til token.
- `klasseinventar.md` og `readme.md` sier 302/174. Bundelen sier 350/0.
- `readme.md` lister `layout/` og `overlays/` to ganger hver med ulikt innhold.
- `Input` er PENSJONERT i `.prompt.md`, men ligger fortsatt med `.jsx` og
  `.d.ts`. Fullfør avviklingen eller opphev den.
- Riggen inn i portsjekkene, rød-testet først. Behold som `.html` — en løs
  `.js` kompileres inn i bundelen og knekker den.

---

## 7 · Byggerekkefølgen

**Bolk 0 — gjelden.** Hele `ordre-gulvretting-v2.md`. Uten `gulvregel.md`
bygges K1–K12 mot en regel som ikke er skrevet ned, og neste revisjon finner
samme feilklasse for tredje gang.

**Bolk 1 — køen.** K1 `QueueCard` + `ProvenanceDisclosure`. Køen er systemets
hjerte og den eneste komponenten som ingen annen kan stå i stedet for.

**Bolk 2 — skallet.** K6 `Composer`, K7 `StatusBar`, K5 `CommandPalette`.
Etter disse kan S1, S2, S3 og S6 rendres komplett.

**Bolk 3 — tallene.** K2 `StatTile`/`StatRow` (etter måling, jf. 6.1), K8
`TabSet`. Etter disse står spillerprofilen i begge innfatninger.

**Bolk 4 — Workbench.** K3 `SessionCard`, K4 `BudgetBar`. Tyngst. Krever
sammenhengende tid og `TimeGrid` urørt som underlag.

**Bolk 5 — analyse og drift.** K10 `DispersionPlot`, K9 `DataTable`, K11
`YearTimeline`, K12 `VideoScrubber`. Etter 1. september.

---

## 8 · Leveransekrav per komponent

Ingen komponent regnes som ferdig uten alle seks:

1. `.jsx` — alt i `@layer akhq-base` / `akhq-container` / `akhq-modifier`
2. `.d.ts`
3. `.prompt.md`
4. `<navn>.card.html` — høyden **målt** med `rendre.mjs`, pluss 10 %. Ikke
   anslått; to runder har allerede klippet beviset
5. Omtale i `readme.md`
6. Kollisjonsoppslag i klasseinventaret **kjørt på nytt** før lagring —
   biblioteket vokser mellom hver økt

Tilstandsmatrise per komponent: default, hover, focus-visible, active,
disabled, tom, laster, feil. En komponent uten focus-visible er ikke ferdig.

Kortinnhold: to containerbredder × to temaer × to pekermoduser.

**Assertionene skal ses feile først.** Forfalsk minst to per komponent og se
dem bli røde mens resten forblir grønne. En assertion som aldri er sett feile,
er ikke verifisert.

---

## 9 · Hva jeg vil ha tilbake før du bygger noe

Ikke en komponent. En **dekningsvurdering**, punkt for punkt mot avsnitt 3, 5
og 6:

- Hvilke deler av skallet kan biblioteket bygge i dag, og hvilke ikke?
- Er `.akhq-kpi-*` en KPI-flis eller noe annet? [mål det]
- Dekker `viz.jsx` SG-baren, og hvor langt rekker den mot dispersion?
- Er de to uforklarte gulvbruddene funnet og kategorisert?

Svar per punkt med komponentnavn der det finnes ett, og «mangler» der det ikke
gjør. Det svaret bestemmer om byggerekkefølgen i avsnitt 7 står, eller må
skrives om.

---

## 10 · Utenfor denne runden

Marketing-editoren (S14) — dekningsmatrisen målte 31 komponenter uten overlapp
mot appen. Det taler for eget produkt på samme tokens, ikke en flate i AgencyOS.

PlayerHQ deler ikke skallet. Spilleren har fire behov, ikke hundre, og alle er
«hva gjør jeg i dag».

De 47 «foreldreløse» komponentene er ikke et funn. Nevneren er 3 målte skjermer,
ikke 66. Pensjonering på det grunnlaget ville vært å pensjonere biblioteket.

Drag, resize og tastaturflytting i `TimeGrid` er **oppførsel**, ikke anatomi.
De hører til konsumenten (Workbench), ikke biblioteket.
