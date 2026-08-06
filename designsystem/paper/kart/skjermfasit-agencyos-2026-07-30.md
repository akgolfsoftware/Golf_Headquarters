# Skjermfasit AgencyOS — ordre til Claude Design

Skrevet 30.07.2026. Dette er hoveddokumentet for Fase B: alle hovedflater i AgencyOS,
med jobb, anatomi, komponenter, tilstander og interaksjon per skjerm.

Leses sammen med, og går foran ved motstrid:
`readme.md` (systemreglene) · `kart/arbeidsordre-komplett-system-2026-07-29.md` (nevneren)
· `kart/restanse-2026-07-30.md` (komponentrestansen) · `kart/ikke-bygget-enna.md`.

Referansene for form og oppførsel er de to prototypene som følger denne ordren:
`agencyos-konsoll-2026-07-30.html` (samtaleflaten) og `agencyos-wireframe-2026-07-30.html`
(dagsflaten, tråden, fangsten, maskinrommet). De er fasit for **komposisjon og tetthet**,
aldri for tokens — begge bruker baseline-tokens allerede, men enhver hex eller font som
avviker fra `tokens/akhq-tokens.css` er en feil i prototypen, ikke en beslutning.

---

## DEL 1 · Hva vi jobber med, og hva vi vil oppnå

### 1.1 Sammendrag

AK Golf HQ er én plattform med to produktflater. **PlayerHQ** er spillerens app,
mobil-først, 430 px kolonne. **AgencyOS** er eiers verktøy — coach og daglig leder i
samme system — desktop-først, mørk rail 64 px. Under dem ligger **Claude Paper**,
designsystemet: varmt papir `#FAF9F5`, varmt blekk `#141413`, oransje `#D97757` med
monopol på «Én ting nå» og fokus. Aldri ren sort/hvit, aldri kald grå, aldri rød.

Dagens tilstand, målt: 63 komponenter bygget av anslagsvis 151 · 2 av 223 skjermer
designet (0,9 %) · fire av syv kvalitetsporter åpne.

### 1.2 Problemet systemet finnes for å løse

Eier er coach for elitespillere og for vanlige kunder, og driver fem selskap. Hans
egen beskrivelse, gjengitt fordi den styrer hver designbeslutning under:

> Jeg er ekstremt dyktig til å se hva som må forbedres i spillerens teknikk.
> Men jeg klarer ikke holde en rød tråd, og jeg er dårlig på å følge opp.

Det er ett problem, ikke to: **innsikten dør når økta er over.** Ingen notat, ingen
dato den skal etterprøves, ingen kobling til neste økt. «Ingen rød tråd» er ikke en
planleggingssvikt — det er en fangstsvikt.

Tre konsekvenser som er bindende for alt design i denne ordren:

1. **Systemet skal aldri be om planlegging i forkant.** En tom ukeplan som venter på
   utfylling er det som låser eier. Planen skrives fra observasjonen, ikke omvendt.
2. **Fangst under tjue sekunder.** Én hånd, sollys, hansker. Alt annet kan være rikt;
   dette ene må være brutalt kort.
3. **Systemet forfatter, eier godkjenner.** Ingen skjerm ber om en tekst som ikke
   allerede finnes som utkast.

### 1.3 Den største risikoen

Ikke at systemet blir for tynt. At det blir imponerende og ubrukelig. Eier har ADHD
og 96 kartlagte funksjoner — det er nettopp mengden som paralyserer. **Et design som
ser dyrt ut og krever tre beslutninger for å komme i gang, har feilet uansett hvor
godt det er tegnet.**

### 1.4 De seks anti-paralyse-reglene — bindende for hver skjerm

1. **Én ting krever handling om gangen.** Hver flate har nøyaktig én primærhandling,
   og den er den eneste oransje flaten på skjermen. Alt annet er lesestoff.
   To oransje flater samtidig er en designfeil, ikke en smakssak.
2. **Ingen tom skjerm ber om utfylling.** Systemet foreslår alltid et utkast.
3. **Tommeltest** på alt som skjer under en økt: én hånd, 56 px mål (ikke 44).
4. **Ingenting går tapt ved passivitet.** Køen husker. Ingen badge-eskalering, ingen
   røde tellere, ingen «47 uleste». Én linje: «3 venter · eldste 4 dager».
5. **Maks fem arbeidsflater i railen.** Alt annet gjennom `⌘K`.
6. **Utkast før skriving, alltid.** Bindende beslutning 30.07.2026: ingen kommando
   endrer noe uten at eier har sett resultatet og trykket Publiser. Gjelder også
   interne notater. Én regel, ikke to.

### 1.5 Hva vi vil oppnå

| Mål | Målbart som |
|---|---|
| Innsikt fanges i øyeblikket | tid fra observasjon til lagret oppfølging under 3 min |
| Rød tråd per elitespiller | hver observasjon har sjekkpunkt med dato; andel etterprøvd |
| Oppfølging skjer uten manuelt arbeid | andel utgående meldinger som er godkjente utkast |
| Vanlig kunde koster lite tid | standardprogram fra onboarding uten eiers involvering |
| Frafall oppdages tidlig | stillhetsvakt melder før spiller avlyser |
| Drift og coaching i samme oppmerksomhet | én blandet kø, ikke to systemer |

---

## DEL 2 · Navn, skall og navigasjon

### 2.1 Navnevalg — «Stall» skal byttes

Eier har selv reist spørsmålet. Anbefaling: **«Spillere»**.

`Stall` er hesteveddeløps- og motorsportspråk. Det fungerer for elitegruppa og leses
feil for den vanlige kunden som tar en time i uka — og begge grupper bor på samme
flate. `Utøvere` utelukker mosjonisten. `Porteføljen` er drift-språk om mennesker.
`Laget` er feil fordi de ikke er et lag.

`Spillere` er kjedelig, presist og aldri feil. Kjedelig er riktig her: flaten heter
det den inneholder.

**Endring som følger:** `Stall` erstattes av `Spillere` i rail, palett, dokumentasjon
og komponentnavn. `stall-app`, `stall-data` og `stall-tidslinje` i gammel kanon beholder
sine navn som referanse — de skal ikke portes med navnet.

### 2.2 Flatene

| Rail | Flate | Ett spørsmål den svarer på |
|---|---|---|
| 1 | **Konsoll** | Hva vil jeg gjøre nå? *(hjem — erstatter «I dag»)* |
| 2 | **Spillere** | Hvem trenger meg, og hvorfor? |
| 3 | **Kø** | Hva venter på svar fra meg? |
| 4 | **Kalender** | Når skjer ting, og hva er ledig? |
| 5 | **Workbench** | Hva skal denne spilleren gjøre de neste ukene? |
| — | **Maskinrom** | Hvordan har systemet det? *(under strek, system ikke arbeid)* |

**Fangst** er ikke en flate. Den er en modus som åpner over hvilken som helst skjerm
når en økt starter, og lukkes når den er over.

**Spillerprofil** er ikke en flate. Den er et lag som åpner fra Spillere, fra Kø, fra
Kalender og fra `@navn` i konsollen — samme skjerm uansett inngang.

### 2.3 Skallet

**Desktop (basis).** Rail 64 px, alltid mørk (`--rail`), uansett modus. Ikon 18 px
Lucide stroke 1,5 over etikett 9 px versaler. Aktiv: `rgba(255,255,255,.12)` +
`--rail-active`. Railen har `hr` før Maskinrom.

Topbar 52 px: flatenavn · kontekstlinje (dato, antall) · modusvelger
(Coaching / Drift / Alt) · `⌘K`-hint · temabryter. Topbaren er **sticky**, railen er
`position: sticky; height: 100vh`.

**≤1100 px (iPad).** Rail kollapser til 56 px uten etiketter. Artefaktpanel går fra
sidestilt til overlegg.

**≤640 px (mobil).** Rail blir fem bunnfaner 56 px høye + Maskinrom flyttet inn i
«Mer». Artefakt blir `BottomSheet`. Konsollens komponist blir fast i bunn over fanene.

**`pointer: coarse`** hever alle mål til 44 px, og til 56 px inne i Fangst-modus.

### 2.4 Tre innganger, én modell

- **Fritekst** — når eier vet hva han vil ha, ikke hva det heter.
- **`⌘K` palett** — når han vet hva det heter.
- **`/` hurtigkommando** — det han gjør daglig, med parametere.
- **`@` nevning** — henter spiller, gruppe eller selskap inn i en setning.

Hver palettkommando viser sitt `/`-alias til høyre. Eier lærer hurtigkommandoen ved å
bruke paletten; ingenting skal pugges.

---

## DEL 3 · Konsollen (hjem)

### 3.1 Jobben
Én inngang til alt. Eier åpner AgencyOS og møter et skrivefelt, ikke en meny.

### 3.2 Layout
To kolonner: **tråd** (fleksibel, innhold sentrert i 760 px) og **artefaktpanel**
(440 px fast). Under 1180 px faller panelet bort og artefakter åpner som overlegg.
Komponisten er festet i bunn av trådkolonnen, ikke i bunn av vinduet.

### 3.3 Anatomi ovenfra og ned

**Dagskortet** — øverst i tråden, én gang per dag. `OneThingNow`: 3 px venstrekant
`--accent`, mono versaletikett med pulserende prikk, tittel 16/600, prosa-forklaring
i Lora, to knapper. Dette er dagens eneste oransje flate.

**Turer.** Hver tur har tre deler:

1. **Eiers melding** — avatar 26 px + `--soft` boble, radius `--r`, 14 px tekst.
2. **Arbeidslinjer** — mono 11,5 px, `--mid`, med grønt hakemerke per fullført steg og
   varighet høyrestilt i `--faint`. Feilende eller manglende grunnlag får `--dn` og
   varselglyf. **Arbeidslinjene er obligatoriske.** Et svar uten synlig arbeid er et
   svar eier må kontrollere, og et svar han må kontrollere har kostet mer enn å gjøre
   jobben selv.
3. **Svaret** — prosa i Lora når det er en vurdering, `answer`-kort når det er tall.

**Svarkortet** har alltid tre lag: overskrift med kildetag · innhold (KPI-tall i mono
40–56, eller `DataTable`) · `Hvorfor dette tallet` som `details`-utvidelse med kilde,
avgrensning og relevant invariant. Utvidelsen er lukket som standard og er **påkrevd**
på hvert tall systemet regner ut.

**Turhandlinger** — maks tre, alltid `--sm` ghost, aldri oransje.

**Komponisten.**
- Forslagsrad over feltet: 3–4 kontekstuelle forslag, alltid til stede, aldri tom.
  Første forslag får oransje prikk når det er dagens ene ting. Forslagene styres av
  klokkeslett og tilstand: 07:00 «Forbered dagen», 15:30 «Godkjenn Emmas notat»,
  fredag 16:00 «Ukesrapport til WANG».
- Feltet: `textarea` som vokser til maks 200 px, plassholder som nevner `/`.
- Verktøyrad: `/` · `@` · vedlegg · diktér · modellvelger · send.
- Fotlinje: hurtigtaster til venstre, forbruk til høyre («42 % av abonnement · 0,00 kr API»).

**Slash-menyen** åpner over komponisten når feltet starter med `/`. Gruppert
Coaching / Drift / System. Piltaster navigerer, Tab fyller første parameter.

### 3.4 Artefaktpanelet
Header: tittel · statusmerke (`Utkast` i `--accent-soft`/`--accent-fg`) · historikk ·
lukk. Kropp: artefaktets egen anatomi. Fot: `Publiser` (primær) · `Endre` · `Forkast`.

Statusmerket har tre verdier: `Utkast` · `Publisert` · `Endret siden publisering`.
Den tredje er den viktigste — den gjør Publiser trygg, og et utrygt Publiser blir
aldri trykket.

### 3.5 Tilstander
- **Første gang / tom tråd:** dagskortet + seks forslag i stedet for fire. Aldri
  «Ingen samtaler ennå».
- **Laster:** arbeidslinjer strømmer inn én om gangen; ingen spinner.
- **Feil:** `Banner` med `announce="alert"` kun når eier utløste noe som ikke gikk.
- **Uten svar:** systemet sier hva som mangler i grunnlaget, og tilbyr å hente det.

---

## DEL 4 · Spillere

### 4.1 Jobben
Vise hvem som trenger eier, og hvorfor — ikke en alfabetisk liste.

### 4.2 Anatomi
`PageHeader` med teller · `SegmentControl`: Alle / Elite / Vanlig / Junior / WANG ·
`SearchField` · sorteringsvelger.

Standardsortering er **behov**, ikke navn. Behovssignalet regnes av fire ledd:
dager siden sist økt · avvik mot plan · åpne LIFE-koder · lastavvik mot invariantene.

**Begrunnelsen er synlig på raden.** «9 dager siden sist» står som tekst, ikke som en
usynlig rangering. En sortering man ikke ser grunnen til, blir ikke stolt på — og en
sortering man ikke stoler på, overstyrer man.

Rader er `ListRow`: avatar · navn + begrunnelseslinje · kategori-`StatusBadge` ·
SG-delta i mono · chevron. Gruppert med `ListGroup` under `SectionHeader`:
**Trenger deg nå** · **Følger planen** · **Hviler / sesongslutt**.

### 4.3 Spillerprofilen (laget som åpner)
Fire faner (`Tabs`): **Tråden** · **Analyse** · **Plan** · **Meg**.

- **Tråden** er standardfanen og den viktigste skjermen for elitespillere.
  Vertikal tidslinje med prikk per observasjon, `--accent` på den aktive.
  Per punkt: dato + kilde («fra opptak») · overskrift · prosa-forklaring ·
  sitat fra opptaket i Lora kursiv med venstrekant. Lukket, åpen og delvis løst er
  tre tilstander med hver sin prikkfarge (`--mid`, `--accent`, `--info`).
- **Analyse**: `KpiStripe` · `SgBreakdown` · `DispersionMap` (med baseline og hit-rate,
  jf. K10) · `TrendBand` · `PyramidProgress`.
- **Plan**: gjeldende uke fra Workbench, skrivebeskyttet, med lenke til å redigere.
- **Meg**: `KeyValueGrid` med kontakt, foresatte, samtykke, utstyr, abonnement.

Sjekkpunkter ligger som eget `Panel` i høyrespalten på alle fire faner — de er
tråden gjort til datoer og skal aldri være mer enn ett blikk unna.

---

## DEL 5 · Kø

### 5.1 Jobben
Alt som venter på eier, blandet coaching og drift, sortert på hva som taper mest på å vente.

### 5.2 Anatomi
`PageHeader` uten teller-badge. Statuslinjen er tekst: «3 venter · eldste 12 dager».
Ingen tall i rail-ikonet. Ingen farge som eskalerer.

Rader er `QueueCard` (K1, ikke bygget): avsender-avatar · tittel · kontekstlinje ·
alder · **én primærhandling**. Avsender kan være menneske eller agent — agentens
avatar er `--accent-soft`, ikke fordi den er viktigere, men fordi opphavet skal være
lesbart uten å lese.

`ProvenanceDisclosure` (K1) på hver agent-rad: «Hvorfor?» viser hvilke noter og
hvilken regel som utløste raden.

### 5.3 Regler
- **Agenter er avsendere, aldri destinasjoner.** Eier går aldri til Plan-vakten;
  den melder seg her når lasten er for høy.
- **Utsettelse er synlig.** Utsatt rad forsvinner ikke — den får tilstand
  «Utsatt til 5.8» og flyttes til bunnen. *(Åpen beslutning fra 30.07: bekreft.)*
- Vanlig kunde genererer aldri kø-rad med mindre hun spør om noe. Uten den regelen
  drukner elitesporet i volum.

### 5.4 Tomtilstand
`EmptyState` med ekte tekst: «Ingenting venter. Sist du så denne skjermen var 09:12.»
Aldri «Ingen data».

---

## DEL 6 · Kalender

### 6.1 Jobben
Når skjer ting, hva er ledig, og hvor er vi i perioden.

### 6.2 Fire visninger
`VisningsVelger` (`SegmentControl`): **Dag · Uke · Måned · År**.
Standard: Uke på desktop, Dag på mobil. Valget huskes per enhet.

- **Dag** — `TimeGrid` i én kolonne, 04:00–23:00, 1 px = 1 minutt, 20-min raster.
- **Uke** — `TimeGrid` sju kolonner, sticky dagshode og timemarg.
- **Måned** — `MaanedKalender`, celler med maks tre hendelser + «+2 til».
- **År** — `YearTimeline` (K11), 12 rader, periodebånd og turneringer.

### 6.3 Perioder er bakgrunn, ikke hendelser
GRUNN / SPESIALISERING / TURNERING tegnes som svake bakgrunnsbånd i måned- og
årsvisning (`--soft` i tre metninger, aldri farge). En periode er en kontekst, ikke
noe som skjer klokka ti.

### 6.4 Selskapsfiltrering
`FilterPills`, ett selskap om gangen med «Alle» som eksplisitt valg — ikke som
standard. Fem selskap samtidig med farge per selskap er uleselig på telefon, og
telefonen er der spørsmålet stilles. *(Åpen beslutning fra 30.07: bekreft.)*

### 6.5 Tilstander
Ledig tid vises som `free`-hendelse, ikke som tomrom — eier skal kunne se hva som
er bookbart uten å regne. Konflikt merkes med `--dn`-kant og teller i dagshodet.

---

## DEL 7 · Workbench — full spesifikasjon

Dette er den tyngste flaten i systemet og den eneste bestilleren av `TimeGrid`.
Kravene under er uttømmende med hensikt.

### 7.1 Jobben
Bygge og justere en spillers uke, med invariantene håndhevet mens man bygger —
ikke etterpå.

### 7.2 Layout
Tre kolonner på desktop:

| Venstre 240 px | Midt (fleksibel) | Høyre 320 px |
|---|---|---|
| spillervelger · uke-navigator · periodekontekst | uke-canvas (`TimeGrid`) | øvelsesbank · invariant-status · diff mot forrige uke |

≤1100 px: høyre kolonne blir uttrekkbar `Drawer`.
≤640 px: canvas blir dagsvisning med `DayStrip` øverst; venstre og høyre blir `BottomSheet`.

Alle tre kolonner er **container query**-drevet, ikke viewport — de kan alle havne i
et smalere panel. Ingen `vw` inne i noen av dem.

### 7.3 Uke-canvas
`TimeGrid` sju kolonner. Hendelser er økter, ikke avtaler: hver blokk viser
klokkeslett · økt-tittel · **AK-formelen i mono** · varighet. Formelen er identiteten
til økta og skal aldri skjules under 430 px — den forkortes til modul + L-fase.

### 7.4 Drag and drop — komplett

**Operasjoner**
1. **Flytt** — dra en blokk til ny tid eller ny dag.
2. **Endre varighet** — dra topp- eller bunnkant.
3. **Sett inn** — dra en øvelse fra banken inn i canvas; den blir en økt.
4. **Kopier** — Alt/Option under drag lager duplikat.
5. **Fjern** — dra ut av canvas, eller Delete med blokken valgt.

**Raster og snapping**
Snap til 20 minutter. Shift under drag gir 5 minutter. Snap-linjer vises som 1 px
`--border` og en mono-etikett med klokkeslettet ved pekeren.

**Visuell oppførsel**
- Blokken som dras: opacity 1, `--shadow`, løftet 2 px, cursor `grabbing`.
- Slipp-sone: `--soft` fyll med 1 px `--fg`-kant.
- Ugyldig slipp: kanten blir `--dn`, ingen rysting, ingen rødt fyll.
- Overlapp: blokkene deler bredde 50/50 med 2 px mellomrom, som i kalendersystemer flest.
- Alt bevegelse `var(--dur) var(--ease)`. `prefers-reduced-motion` fjerner
  overgangene, ikke funksjonen.

**Tastaturekvivalens — påkrevd, ikke valgfritt**
Drag and drop uten tastaturekvivalent er utilgjengelig og bryter systemets egne krav.
- `Tab` flytter mellom blokker. Valgt blokk får `--focus`-ring.
- `Enter` går inn i flyttemodus (blokken får `--accent`-kant).
- Piltaster: opp/ned flytter 20 min, venstre/høyre bytter dag.
- `Shift` + pil: endrer varighet.
- `Enter` bekrefter, `Escape` angrer og setter tilbake.
- Skjermleser får `aria-live`-melding: «Flyttet til torsdag 14:20, varighet 90 minutter».

**Angre**
`⌘Z` angrer siste operasjon, minst 20 nivåer. Angre er billigere enn en bekreftelsesdialog,
og en bekreftelsesdialog per flytting gjør flaten ubrukelig.

### 7.5 Invarianter i sanntid
Høyre kolonne viser de 13 invariantene som gjelder denne spilleren, med grønt hakemerke
eller `--dn`-tilstand. De oppdateres **mens man drar**, ikke ved lagring:

- Ukentlige timer ≤ alder — teller live: «14,5 t / 16 t».
- TEK-andel minimum 15 %.
- CS50 minimum for all balltrening.
- Sjekkpunkt i tråden dekket denne uka.

Brytes en invariant under drag, blir slipp-sonen `--dn` og tallet i høyre kolonne
skifter — men **slippet blokkeres ikke**. Eier er fagpersonen; systemet opplyser, det
overstyrer ikke. Brutt invariant ved Publiser gir `ConfirmDialog` med begrunnelse.

### 7.6 Diff mot forrige uke
`DiffKort` i høyre kolonne: hva er nytt, hva er fjernet, hva er flyttet. Dette er det
som gjør versjonering ufarlig, og ufarlig versjonering er det som gjør at Publiser
faktisk trykkes.

### 7.7 Øvelsesbanken
Søkbar liste, gruppert på modul (FYS/TEK/SLAG/SPILL/TURN). Hver øvelse har mono-tag
med L-fase og CS-nivå. **Øverst: «Brukt før av deg»** — hentet fra ak-brain, ikke fra
en generisk database. Avviste forslag lagres og synker i rangeringen.

### 7.8 Tilstander
- **Tom uke:** ikke blank. Systemet foreslår en uke fra periode, kategori og åpent
  sjekkpunkt, merket `Forslag`. Eier drar det han vil beholde.
- **Publisert uke:** blokkene låses visuelt (1 px `--border` i stedet for fylt),
  endring setter status til «Endret siden publisering».
- **Konflikt med kalender:** blokk får `--dn`-kant og en linje: «Skoleprøve onsdag».

---

## DEL 8 · Maskinrom (AgenticOS)

### 8.1 Jobben
Vise hvordan systemet har det. **Ingenting her skal kreve handling for at coachingen
skal virke.** Er maskinrommet nede en uke, merker eier det ikke i øktene sine.

### 8.2 Fire seksjoner

**Kjøringer.** `ListGroup`: agent-avatar · navn + utfall · kontekstlinje · tidspunkt.
Feilede øverst med `--dn`. `ProvenanceDisclosure` per rad. Eneste handling:
«Kjør på nytt». Claude Code-kjøringer med ventende diff får `--accent-soft`-chip
«Godkjenn» som fører til diff-visningen.

**Skills.** `CardGrid` gruppert på hvor de kjører: Cowork · Claude Code · ClawdBot.
Per skill: navn · én linje om hva den gjør · sist brukt · antall kjøringer.
Denne seksjonen er verdt flaten alene — 23 skills uten oversikt er 23 skills som ikke brukes.

**Forbruk.** `KpiStripe` med fire tall: kjøringer i dag · andel av abonnement brukt ·
**API-kostnad** · antall skills. API-kostnaden er den viktigste og skal stå i `--up`
når den er null. En kjøring som plutselig koster penger skal være synlig samme dag,
ikke på fakturaen. Under: `DataTable` med forbruk per prosjekt og per dag.

**Modellruting.** Tabell: modell · jobb · andel. Claude (kode, struktur, design) ·
Grok (research-sveip) · Gemini (marked) · Kimi (sportsvitenskap) · NotebookLM
(kildesamling) · Hermes (agentkjøring). Rutingen er en beslutning eier har tatt —
den skal stå skrevet, ikke ligge i hodet.

**ak-brain-panel.** Noter totalt · nye i dag · **avviste forslag lagret**. Den siste
er systemets eneste ekte treningssignal og skal derfor være synlig, med én prosalinje
som forklarer hvorfor.

### 8.3 Faser
Fase 1 er lesing. Å *starte* en Claude Code-kjøring herfra er fase 2, og går da via
CLI-en på eiers egen maskin med hans innlogging — ikke som egen API-klient.
Designet skal ha plass til startknappen fra dag én, deaktivert med tooltip «Kommer i fase 2».

---

## DEL 9 · Fangst-modus

Åpner over hvilken som helst flate når en økt starter. Ikke en flate, ikke i railen.

**Under økt (430 px, men gjelder alle bredder):**
opptaksknapp 112 px sirkel, `--cta` fyll, pulserende `--accent`-ring når den lytter ·
spillernavn og gjenstående tid over · tre hurtigtagger (P-posisjon, L-fase, LIFE) på
44 px · AK-formelen forhåndsutfylt nederst i mono. **Ingenting annet.** Ingen felter,
ingen skjema, ingenting som krever at hansken tas av.

**Etter økt:** godkjenningskort med observasjon (fra transkripsjonen), foreslått
oppfølging (øvelse + sjekkpunkt) og ferdig melding til spilleren i Lora.
Tre knapper: `Godkjenn alt` · `Endre` · `Bare notatet`.

Alle mål i denne modusen er **56 px**, ikke 44.

---

## DEL 10 · Leveransekrav

### 10.1 Format
Hver skjerm leveres som `.dc.html` i `templates/<navn>/`, samme format som de to
eksisterende, og registreres i readme-indeksen i samme leveranse.

### 10.2 Portene
Hver skjerm må gjennom P1–P6 i `kart/restanse-2026-07-30.md`. Særlig:
- **Port A-krav 1:** begge moduser × alle tilstander × minst to containerbredder
  (~860 px og 430 px) for alt som legger om.
- **Port A-krav 2** (craft mot referanse) er verifikatørens alene. Forfatteren skal
  aldri melde den grønn — heller ikke som «ser riktig ut».

### 10.3 Tilstander per skjerm
Fylt · tom · laster · feil, i begge moduser. Tomtilstander skrives på ekte norsk.
«Ikke bygget ennå» har bevisst ingen komponent — den hører i `kart/`.

### 10.4 Blokkerende komponentrestanse
Disse må bygges før skjermen de tilhører kan designes ferdig:

| Skjerm | Blokkeres av |
|---|---|
| Konsoll | `Composer` (K6), `StatusBar` (K7), `CommandPalette` (K5) |
| Kø | `QueueCard` + `ProvenanceDisclosure` (K1) |
| Kalender | `UkeKalender`, `MaanedKalender`, `YearTimeline` (K11), `VisningsVelger`, `DayStrip` |
| Workbench | `DiffKort`, `Periodeplan`, `FilterPills`, utvidet `TimeGrid` |
| Maskinrom | `DataTable` (K9), `CardGrid` finnes |
| Spillere | `SpillerKort`, `Tidslinje` — resten finnes |

### 10.5 Rekkefølge
```
Bolk 0 (gulvet, 6 punkter)  →  Konsoll  →  Spillere  →  Kø
        →  Workbench  →  Kalender  →  Maskinrom
```
Konsollen først fordi den er hjem og fordi den tvinger fram `Composer` og
`CommandPalette`, som alt annet låner. Workbench før Kalender fordi `TimeGrid` er
avhengigheten under begge, og Workbench stiller de strengeste kravene til den.

---

## DEL 11 · Åpne beslutninger som må lukkes underveis

1. **Utsettelse i køen** — forsvinner raden, eller får den synlig «utsatt til»-tilstand?
2. **Timegrunnlag til faktura** — ett trykk fra øktloggen, eller egen godkjenningsrunde?
3. **Publiseringsrett på ukeplan** — kun eier, eller også Markus for junior? Rolle- og
   CBAC-spørsmål før det er et designspørsmål.
4. **Selskapsfiltrering i kalender** — bekreft «ett om gangen».
5. **Fullskjerm-familien** — hvordan avsluttes live økt, runde-føring og testkjøring?
6. **Varelager** — egen flate eller del av drift?
7. **Navnebyttet Stall → Spillere** — bekreft.

Ingen skjerm som avhenger av en åpen beslutning skal designes på antatt innhold.

---

## DEL 12 · Det som ikke er verifisert

- **Masterbrain (Mac Mini)** er ikke sveipet. Alt om faktisk datagrunnlag er [anslag].
- **Kodebasen** `~/Developer/akgolf-hq` er ikke lest direkte i denne runden. Hvilke av
  funksjonene som allerede finnes halvferdig, er ukjent, og det kan endre rekkefølgen.
- **Prototypene er ikke rendret** av noen som kunne måle dem. Høyder, kontrast og
  tetthet i `agencyos-konsoll-2026-07-30.html` er beregnet, ikke målt.
- **Tallene i prototypene er oppdiktede.** De viser format, ikke fakta.
