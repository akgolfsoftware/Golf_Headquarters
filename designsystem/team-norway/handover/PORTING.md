# PORTING — fra Claw-skjerm til kode

Målgruppe: Claude Code i AK Golf HQ-repoet (Next.js 16.2 · React 19 · TS strict · Tailwind v4).
Mønster: `designsystem/train-lock/PORTING.md`. Denne fila er dens motstykke for Claw
og gjelder **kun** `/team-norway/*`.

Claw og Train-lock er to parallelle, ikke-konkurrerende systemer. En skjerm bruker
alltid bare ett sett (`.claude/rules/beslutninger.md` §TEAM NORWAY-SKJERMENE DESIGNES
I CLAUDE-BRANDINGEN). Unntaket står i §4: Analyse og DataGolf under `/team-norway/*`
er Train-lock med TN-skinn og porteres aldri herfra.

---

## 0 · Regel nummer én

Les den faktiske `.dc.html`-filen. Ikke skjermbilde, ikke hukommelse, ikke dette dokumentet.
Hver ramme har inline `style`-attributter med eksakte verdier — men merk forskjellen fra
Train-lock: **Claw-malene bruker `var(--token)`, ikke rå px og hex.** Verdien du skal
kopiere er tokennavnet, ikke tallet det løser seg til.

Rekkefølge per skjerm:

1. `SKJERMREGISTER.md` — finn filen, ruten, rollene og statusen.
2. `TILGANGSMATRISE.md` — finn hva rollen faktisk får se. Gjør dette før du skriver loaderen.
3. Les `.dc.html`-filen. Finn rammen: Mac-rammene er `width:1440px`, mobil `width:390px`.
   Rammene har `data-screen-label` der de er navngitt.
4. Sjekk om komponenten finnes i `src/components/team-norway/` fra før (§3). Finnes den: gjenbruk.

Telefon- og Mac-rammen er **presentasjonschrome**, ikke app-UI: `width:390px`,
`height:844px`, `border-radius`, statuslinjen med «09.41» og den grå `border`-en rundt
skal ikke porteres. Port innholdet.

## 0b · Filhode

Samme regime som Train-lock (`scripts/check-fasit-sitering.mjs` i `npm run verify`),
med Claw-sti:

```ts
/**
 * TN-18 Trenere og tilgang — rolle per gruppe.
 * Fasit: designsystem/team-norway/templates/tn-trenere-tilgang/TnTrenereTilgang.dc.html
 * Avvik:
 *   - Ingen riggrad: den visuelle riggen dekker Train-lock, ikke Claw ennå.
 *   - Fasiten tegner fire grupper i inspektøren; koden viser alle gruppene brukeren
 *     administrerer, og scroller etter fire.
 */
```

`Fasit:`-linjen skal peke på **full sti inkludert `templates/<mappe>/`** — Claw-filene
ligger i undermapper, i motsetning til Train-locks flate filnavn. Skriptet validerer at
filen finnes; en sti uten mappen finner den ikke.

Har skjermen ingen riggrad (det har ingen Claw-skjerm per 08.09.2026), er `Avvik:` med
minst ett punkt obligatorisk. `Avvik:` uten punkt blokkerer.

---

## 1 · Hva som blir server component, og hva som må være klient

Utgangspunktet er **server component**. Claw-skjermene er lesetunge: lister, tabeller,
kildelinjer, dekningsgrad. Ingenting av det trenger JavaScript i nettleseren.

Skjermene i designet ser interaktive ut fordi malene er skrevet som Design Components med
en logikklasse — filtre som lyser opp, rader som kan velges, felt som kan fylles. **Det er
prototypemekanikk, ikke et krav om klientkomponent.** Regelen:

| I designfilen | I koden |
|---|---|
| Filterpiller som bytter aktiv rad (TN-13, TN-19) | `<Link>` + `searchParams` — server component leser filteret fra URL-en |
| Radvalg som fyller et inspektørpanel (TN-06, TN-18) | Rute-segment eller `searchParams`, ikke `useState`. Panelet er en server component som får `valgtId` |
| Faner (TN-13 Kommende/Historikk, TN-03) | `searchParams`, samme som over |
| Skjema med kontrollerte felt (TN-17, TN-19) | `"use client"` **kun på skjemaet**, server action for lagring |
| Beregning som svarer mens du skriver (TN-17 «til par») | Del av skjemaets klientkomponent |
| Opplasting av fil (TN-11, TN-17 belegg) | `"use client"` — filvelger krever det. Mønster finnes: `tn-dokument-opplasting.tsx` |
| Ark/skuff som glir opp (TN-01 organisasjonsbytte, mobil) | `"use client"` — animasjon og fokusfelle |
| Søkefelt som filtrerer i sanntid (TnMerMobil) | `"use client"`, men bare feltet + listen under det |
| Toggle som skriver umiddelbart (TN-12 samtykke) | `"use client"` + server action. Samtykke er append-only, se `DATAMODELL.md` §4 |

Grensen legges så lavt som mulig: en `"use client"` på sideroten drar hele treet med seg,
og da mister du både strømming og muligheten til å lese tilgangen på serveren. Del i stedet
siden i en server-skall som gjør oppslaget og et lite klient-øy som tar imot input.

**Tilgangssjekken skal alltid ligge i server-delen.** En klientkomponent som skjuler en
knapp er ikke tilgangsstyring.

---

## 2 · Tokenbroen

Tokenlaget **finnes allerede** — bruk det, ikke lag et nytt:

- CSS-variabler: `src/styles/team-norway-tokens.css`, alle med prefiks `--tn-*`.
- TS-speil: `src/lib/v2/team-norway.ts`, eksportert som `TN`.

Oversettelsen er mekanisk: designfilens `var(--X)` blir `var(--tn-X)` i CSS og `TN.<camelCase>`
i TSX. Verdiene er identiske — produksjonsspeilet har **ingen** verdiavvik fra `tokens/`,
bare navnerommet.

| I `.dc.html` | I CSS | I TSX |
|---|---|---|
| `var(--navy-900)` | `var(--tn-navy-900)` | `TN.navy900` |
| `var(--red-600)` | `var(--tn-red-600)` | `TN.red600` |
| `var(--status-amber-bg)` | `var(--tn-status-amber-bg)` | `TN.status.amberBg` |
| `var(--surface-page)` | `var(--tn-surface-page)` | `TN.surfacePage` |
| `var(--border-subtle)` | `var(--tn-border-subtle)` | `TN.borderSubtle` |
| `var(--text-secondary)` | `var(--tn-text-secondary)` | `TN.textSecondary` |
| `var(--radius-lg)` | `var(--tn-radius-lg)` | `TN.radius.lg` |
| `var(--shadow-sm)` | `var(--tn-shadow-sm)` | `TN.shadow.sm` |
| `var(--text-h1)` | `var(--tn-text-h1)` | `TN.text.h1` |
| `var(--text-micro)` | `var(--tn-text-micro)` | `TN.text.micro` |
| `var(--weight-semibold)` | `var(--tn-weight-semibold)` | `TN.weight.semibold` (tall, ikke streng) |
| `var(--tracking-eyebrow)` | `var(--tn-tracking-eyebrow)` | `TN.tracking.eyebrow` |
| `var(--leading-normal)` | `var(--tn-leading-normal)` | `TN.leading.normal` |
| `var(--data-3)` | `var(--tn-data-3)` | `TN.data.d3` |
| `var(--clip-diagonal-b)` | `var(--tn-clip-diagonal-b)` | `TN.clipDiagonalB` |
| `var(--font-mono)` | `var(--tn-font-mono)` | `TN.font.mono` |
| `var(--space-5)` | `var(--tn-space-5)` | `TN.space.s5` |

### Når du leser `TN` fra TS i stedet for CSS

- **`TN` (TS):** inline `style`-objekter i `.tsx`. Alle Claw-primitivene i repoet gjør
  dette allerede (`core.tsx`). Fordelen er at ESLint-regelen mot hex-litteraler og
  typesjekken fanger skrivefeil i tokennavnet.
- **`var(--tn-*)` (CSS):** i `globals.css`, i en `@theme`-mapping mot Tailwind, i
  `loading.tsx` og andre filer som ikke kan importere fra en `"use client"`-modul (§5),
  og i media-/`prefers-*`-spørringer.

Regelen ett-nivå-ned: `TN.*` er strenger som *inneholder* `var(--tn-*)`. De kan derfor
brukes overalt en CSS-verdi kan stå, men de kan **ikke** brukes i beregning
(`calc()` med `TN.space.s5` fungerer, `parseInt(TN.space.s5)` gjør det ikke).

### Verifikasjon av speilet — utført 08.09.2026

Alle `var(--*)` i `templates/` og `guidelines/` er trukket ut og holdt mot
`src/styles/team-norway-tokens.css`:

- **97 unike tokens brukes** av de 21 TN-skjermene, de 10 malene og de 18 kortene.
- **Alle 97 finnes i produksjonsspeilet.** Ingen skjerm er blokkert av et manglende token.
- Ingen mal bruker et token som ikke er definert i `tokens/` — ingen døde referanser.

#### Må legges til i produksjonsspeilet før porting — hvis de tas i bruk

Tre tokens er definert i `tokens/effects.css`, men mangler i `--tn-*`-speilet. **Ingen av
de 21 skjermene bruker dem i dag**, så de blokkerer ingen porting nå. De må inn før en
portert flate trenger dem:

| Token | Verdi i `tokens/effects.css` | Når det trengs |
|---|---|---|
| `--angle-cut` | `4deg` | Skrå kutt som ikke er den store diagonalen. `--clip-diagonal-*` dekker hero og seksjonsskille; dette er den lille vinkelen |
| `--spring-ui` | `0 bounce, .35s response` | Gestdrevne flater — mobilarket i TN-01 hvis det skal kunne gripes og snus midt i bevegelsen |
| `--spring-momentum` | `.2 bounce, .4s response` | Samme, når gesten selv bar fart |

Fjærverdiene er notert i Apple-syntaks (bounce/response) fordi det er formen designsystemet
beskriver bevegelse i. Skal de inn i `--tn-*`, må de oversettes til den fjærimplementasjonen
repoet faktisk bruker — verdien er 0 bounce, 0,35 s respons; ikke en cubic-bezier.

### Font

`--tn-font-display` og `--tn-font-body` peker til `var(--font-schibsted-grotesk)`, som
lastes av `src/app/team-norway/layout.tsx` med `next/font` — **scoped til `/team-norway/*`**.
`--tn-font-mono` er `var(--font-ibm-plex-mono)`, allerede lastet globalt. Ikke last noen av
dem på nytt per skjerm, og ikke sett en fontstack manuelt i en portert skjerm.

### Mørk flate

Det finnes **ingen** `html[data-tn-tema="dark"]` her, og den skal ikke innføres. Mørk er en
rolle: `TN.dark.*` og `TN.surfaceDark*` brukes eksplisitt på hero, seksjonsskille og
presentasjon. Skjema og tabell er alltid lyse. Dette er motsatt av Train-lock, der mørk er
et tema med bryter.

---

## 3 · Komponentene — hva som finnes, hva som må bygges, hva som ikke skal bygges

### Finnes i `src/components/team-norway/`

| Kodekomponent | Fil | Dekker designkomponenten |
|---|---|---|
| `TnKort` | `core.tsx` | `Card` |
| `TnPille` | `core.tsx` | `Badge` (seks toner: navy, green, amber, red, info, nøytral) |
| `TnKnapp` | `core.tsx` | `Button` — **delvis, se under** |
| `TnAvatarInitialer` | `core.tsx` | (ikke en designkomponent — kodens eget primitiv) |
| `TnRail` | `core.tsx` | TN-01s sidepanel |
| `TnRailMobil` | `rail-mobil.tsx` | TN-01s fanerad og meny |
| `TnPostTidslinje` | `tn-post-tidslinje.tsx` | TN-09/TN-10 |
| `TnPostKomponer` | `tn-post-komponer.tsx` | TN-09/TN-10 |
| `TnDokumentTabell` | `tn-dokument-tabell.tsx` | TN-11 |
| `TnDokumentOpplasting` | `tn-dokument-opplasting.tsx` | TN-11 |

**`TnKnapp` er ikke i takt med designet.** Den har `height: 40`, og designsystemet hevet
`Button` til 44 / 48 / 56 px (sm/md/lg) 08.09.2026 fordi 40 px er under minste trykkmål.
Dette er den ene kjente divergensen mellom kode og fasit, og den skal rettes **i `core.tsx`
før neste skjerm porteres** — ikke overstyres per skjerm. `TnKnapp` mangler også
størrelsesprop; legg til `size?: "sm" | "md" | "lg"` med 44/48/56.

`TnRail` har `width: 232`, designet har `252`. Rett i `core.tsx`, ikke i skjermen.

### Må bygges

| Designkomponent | Brukes av | Merknad |
|---|---|---|
| `Input` | TN-17, TN-19, TN-03 | `error`-prop: rød ramme, feilteksten **erstatter** hint |
| `Select` | TN-03, TN-06 | Samme `error`-kontrakt som `Input` |
| `MetricTile` | TN-02, TN-07, TN-08, TN-16 | `source`-prop er egen linje i mono `--text-micro`. Skal aldri smugles inn i `caption` |
| `StatBar` | TN-07, TN-08, TN-21 | |
| `ScaleRating` | TN-06, evaluering | Tre trinn, samme kanon som `PeriodGoalStatus` |
| `DataTable` | TN-07, TN-13, TN-18, TN-19 | `loading` tegner skjelettrader i tabellens egen rytme; `empty` tar streng eller node. Skjermene skal ikke tegne tabellskjelett selv |
| `CoverageCard` | TN-02, TN-08 | Dekningsgrad med segmenter og kildelinje |
| `Logo` | overalt | Rendres **alltid fra fil** (`assets/logo/team-norway-golf.png`). Aldri gjenskapt i markup, aldri farget om. Ingen negativ versjon finnes — på mørk flate settes merket på hvit plate |
| `Hero` | TN-02, TN-15, presentasjon | `meta[].source` — hvert nøkkeltall bærer sin egen kilde |
| `SectionHeader` | flere | Diagonalen hører hit, aldri på kort |
| `PyramidDiagram` | utøverdashboard, TN-06 | FYS → TEK → SLAG → SPILL → TURN |

Port primitivene **før** skjermene. En skjerm bygget før `DataTable` finnes får sin egen
tabell, og da divergerer de innen en måned.

### Skal ikke bygges her

| Flate | Eier | Hvorfor |
|---|---|---|
| Analyse (`AnalyseTerminal`, `SpredningsAnalyse`, `KohortUtvikling`, `ResultatVsFelt`) | Train-lock | Bekreftet av Anders 31.08.2026. Claw bidrar kun med logo og skinnefarge i skallet |
| DataGolf (`DataGolfProfil`, `TruthLayer`) | Train-lock | Samme |
| `/cockpit`, `/testbatteri` | Train-lock | Plattformflater |
| Registrering av ny konto (TN-19s siste steg) | PlayerHQ | TN-19 slutter der invitasjonen forlater flaten |
| Ikonsett | `@/components/v2` `Icon` | Lucide-wrapperen er generisk, ikke Train-lock-spesifikk. Claw-kortet `15-icons` fastsetter 20 px og strek 1,75 — **ikke** et nytt ikonbibliotek |

Menypunktene for Analyse og DataGolf står i TN-01 og skal porteres som lenker. Selve
skjermene er Train-lock.

---

## 4 · Oversettelsestabell — designfil til kode

| I `.dc.html` | I koden |
|---|---|
| `background:var(--surface-card)` | `background: TN.surfaceCard` |
| `border:1px solid var(--border-subtle)` | `border: \`1px solid ${TN.borderSubtle}\`` |
| `border-radius:var(--radius-full)` | `borderRadius: TN.radius.full` |
| `box-shadow:var(--shadow-sm)` | `boxShadow: TN.shadow.sm` |
| `font-variant-numeric:tabular-nums` | `fontVariantNumeric: "tabular-nums"` — på **hvert** element med tall |
| `min-height:44px` på trykkflate | behold verbatim. Aldri under 44 |
| `width:1440px` / `width:390px` på ytterramme | **droppes** — presentasjonschrome |
| `height:844px`, `border-radius:38px` på mobilramme | droppes |
| statuslinjen med `09.41` | droppes |
| `<sc-for list="{{ x }}">` | `.map()` i server component |
| `<sc-if value="{{ x }}">` | vanlig `&&`/ternær |
| `ref="{{ x.someRef }}"` + `setStyle` | inline `style`-objekt beregnet i samme render |
| `role="button"` på en `<div>` | ekte `<button>` eller `<a>`. Designfilen bruker `div` fordi malen ikke kan navigere |
| `letter-spacing:var(--tracking-eyebrow)` + `text-transform:uppercase` | eyebrow-mønsteret: mono, `TN.text.micro`, `TN.tracking.eyebrow`, `uppercase` |
| `— eksempel` i navn og `08.09.2026` i kildelinjer | **eksempeldata.** Erstattes av ekte felt. Fjern suffikset, behold kildelinjens format |

Fallgruver som ødelegger pikselnærhet:

- **`min-width: 0`** på enhver grid- eller flex-kolonne med `nowrap`-tekst. Uten den sprenger
  lange navn kolonnen i stedet for å ellipse. Designfilene har den overalt — kopier den.
  (`.claude/rules/gotchas.md` §Rutenett-kolonne.)
- **`tabular-nums` mangler oftere enn noe annet.** Alt som måles settes i mono med tabulære tall.
- **Norsk format.** `Intl.DateTimeFormat('nb-NO')` for dato (`08.09.2026`), `Intl.NumberFormat('nb-NO')`
  for tall med desimal (`−3,4` med komma). Aldri manuell strengbygging. Merk at designfilene bruker
  U+2212 minus (`−`), ikke bindestrek, på negative tall.
- **Merkevarerød er aldri status.** `TN.red600` er identitet: logo, skinne, «denne utøveren» i data.
  Advarsel er `TN.status.red` (`#C2352B`). Blandes de, leser brukeren en rød stripe som en feil.
- **`TN.ink400` er lyseste gråtone som får bære tekst.** `ink300` og lysere er kanter og linjer —
  gjelder også 9–11 px etiketter.
- **Ingen `ease-in`.** `TN.ease.out` inn og ut, `TN.ease.inOut` på flytting, `TN.ease.sheet` på ark.
- **Diagonalen kun på hero og seksjonsskille.** Aldri kort, aldri kontroller.
- **Ingen emoji.** Ikke i UI, ikke i strenger, ikke i poster.

---

## 5 · Tom, laster og feil

Alle 21 TN-skjermer har de tre tilstandene tegnet. Rammene er merket `TOM`, `LASTER`, `FEIL`
i mobilseksjonen av hver malfil. Innholdet er ikke pynt — tomteksten navngir årsaken, sier
om det er en feil eller ikke, og gir én vei videre. Kopier teksten.

### Hvilken mekanisme

| Tilstand | Mekanisme | Hvorfor |
|---|---|---|
| **Laster** — hele skjermen | `loading.tsx` ved siden av `page.tsx` | Suspense-grensen Next.js gir gratis når serverkomponenten venter |
| **Laster** — én liste i en ellers ferdig side | `<Suspense fallback={…}>` rundt den delen | Skallet og skinnen skal stå stille; bare listen skjelettrenders |
| **Laster** — tabell | `DataTable loading` | Skjelettrader i tabellens egen rytme, ikke en spinner |
| **Tom** | Tilstand i komponenten | Tom er et **gyldig svar fra loaderen**, ikke en feil. Loaderen returnerte 0 rader; komponenten tegner tomkortet |
| **Feil** — uventet unntak | `error.tsx` | Client component som Next.js krever. `reset()` er «Forsøk på nytt»-knappen |
| **Feil** — kilden svarte ikke, men vi har sist kjente verdi | Tilstand i komponenten, **ikke** `error.tsx` | Dette er en vellykket render av delvise data. TN-13 og TN-01 tegner sist kjente utsnitt med dato og «ingen tall er gjettet» — `error.tsx` ville tømt flaten |
| **Feil** — kollisjon eller validering (TN-17 dobbel rad, TN-19 ikke levert) | Tilstand i skjemakomponenten, fra server actionens returverdi | Ikke en unntakstilstand. Skjemaet skal stå med brukerens verdier intakt |

Skillet mellom de to feiltypene er den viktigste her: **`error.tsx` er for det uventede.**
En kilde som svarer sent er ventet, og skjermene er tegnet for det.

### Kjent gotcha — `loading.tsx` kan ALDRI importere fra en `"use client"`-modul

Dette er en **kjent felle i dette repoet**, ikke en preferanse. `loading.tsx` evalueres i
et miljø der `"use client"`-modulgrensen ikke er etablert, og en import derfra bryter
byggingen eller gir en tom skjelettflate i produksjon.

Praktisk betyr det:

- `loading.tsx` importerer **ikke** `TnKort`, `TnPille`, `TnKnapp`, `TnRail` eller noe annet
  fra `src/components/team-norway/core.tsx` — hele fila er `"use client"`.
- `loading.tsx` importerer **ikke** `TN` fra `src/lib/v2/team-norway.ts` heller. Selv om fila
  i seg selv er en ren konstant, går den gjennom samme modulgraf.
- **Skeletons er ren markup.** Skriv `<div style={{ background: "var(--tn-surface-sunken)", height: 14, borderRadius: "var(--tn-radius-full)" }} />`
  med CSS-variabelen som streng, direkte i `loading.tsx`.

Det er også grunnen til at §2 sier at `var(--tn-*)` fortsatt har en jobb ved siden av `TN`:
`loading.tsx` er nettopp filen som må lese CSS-variabelen rått.

Trenger skjelettet å ligne innholdet mer enn ren markup klarer, er svaret `<Suspense>`
inne i `page.tsx` med et fallback som *er* en server component — ikke en smartere `loading.tsx`.

---

## 6 · Rekkefølge for en porteringsøkt

1. **Rett `core.tsx` først:** `TnKnapp` til 44/48/56 med `size`-prop, `TnRail` til 252 px.
   Én PR, ingen skjermer. Ellers arver hver ny skjerm avviket.
2. **Primitivene:** `Input`, `Select`, `DataTable`, `MetricTile`, `CoverageCard`. Én PR.
3. **TN-18 Trenere og tilgang** som første skjerm. Grunnen: den er den eneste nye skjermen
   som kan bygges helt på eksisterende modell (`GroupMember.role` + `joinedAt`/`endedAt`),
   og den er forutsetningen for at tilgangsmatrisen kan håndheves i praksis.
4. **TN-01 skallet** — layout, meny, mobilfaner. Alt annet henger i den.
5. Resten etter `SKJERMREGISTER.md`, én PR per menygruppe.

Lever alltid: filer endret · hvilke rammer som er dekket · hva som gjenstår · hvilke
`Avvik:`-punkter du måtte skrive.

---

## 7 · Stopp-regler

Stopp og spør i stedet for å gjette:

- **Et tall i UI-et finnes ikke i datamodellen.** Svaret er tomtilstand med hel setning
  eller «venter på data», aldri en plassholderverdi. Se `DATAMODELL.md`.
- **Du er i ferd med å innføre en farge, radius eller avstand som ikke finnes i `--tn-*`.**
- **Du er i ferd med å bruke merkevarerød på en status,** eller statusrød på en identitet.
- **Du er i ferd med å lese `UserRole.COACH` for å avgjøre tilgang.** Rollen bor på gruppen.
  Se `TILGANGSMATRISE.md` §0.
- **Designfilen mangler en tilstand koden trenger.** Den skal tegnes først, ikke improviseres.
- **Du er i ferd med å vise et navn på en flate der matrisen sier aggregat.** TN-08 er tegnet
  med navn-varianten som låst tilstand nettopp for at spørsmålet ikke skal dukke opp i kode.
