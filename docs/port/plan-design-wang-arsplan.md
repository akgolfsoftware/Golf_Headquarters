# Designplan — WANG Toppidrett Fredrikstad, årsplan/treningsplan

Status: **utkast til beslutning** · Opprettet 2026-08-10 · Eier: Anders

Dekker alle skjermer i WANG-flaten (elev/foreldre + trener) og grensesnittet mot AgencyOS,
der innholdet i treningsplanen faktisk skal lages. Skrevet etter samme mal som
`docs/port/plan-designport-alle-skjermer.md`, men med WANG-merkevaren som fasit i stedet for
Claude Paper.

---

## 0. Sammendrag — tre beslutninger som må tas først

| # | Beslutning | Anbefaling |
|---|---|---|
| B1 | Egen git-repo for WANG? | **Nei — behold i monorepoet.** Se §1. |
| B2 | Hvilket Claude Design-prosjekt er fasit? | **`be77fcdb` «WANG Toppidrett - Software»**, utvidet med `golf-*`-templates. Ikke et nytt, tredje WANG-prosjekt. Se §3. |
| B3 | Skal AgencyOS-skjermene WANG-brandes? | **Nei — AgencyOS forblir Claude Paper.** WANG-merkevaren gjelder kun elev-/foreldreflaten. Se §2. |

Resten av dokumentet er skjermregnskapet, bølgene og ferdig-definisjonen som følger av dette.

---

## 1. Egen git-repo? — nei, ikke nå

**Kort svar: nei.** Innholdet i treningsplanen skal lages i AgencyOS under gruppa «WANG
Toppidrett Fredrikstad». Da er AgencyOS CMS-et, og WANG-flaten er en presentasjonsflate oppå
samme database. Det binder de to sammen på fire punkter som en repo-splitt gjør dyrere, ikke
billigere:

1. **Én database, to skrivende Prisma-klienter.** Innholdet lever i `Group`,
   `GroupPeriodBlock`, `GroupSchedule` og `SchoolScheduleEntry` — samme skjema som AgencyOS
   skriver til. Repoet har allerede 81 migrasjoner og en *baselinet* `_prisma_migrations`
   (`gotchas.md` §Schema-endringer: `migrate dev`, `db push` OG `migrate deploy` er alle
   blokkert). En andre klient med eget skjema mot samme base er nøyaktig den drift-situasjonen
   som allerede har kostet oss tid.
2. **Auth er cookie-basert på ett domene.** `proxy.ts` gater `/team-wang`, og
   `requirePortalUser` deles. Egen repo = eget domene = elevene må logge inn på nytt et annet
   sted, og PII om mindreårige spres til én flate til.
3. **Delt kode er reell, ikke tilfeldig.** `requirePortalUser`, `prisma.ts`, `uke-helpers.ts`
   (Oslo-tid), `hent-gruppe-kalender/`, `wang-turneringer.ts` — alt brukes av begge sider.
4. **`.claude/rules/arkitektur.md` sier det allerede:** «Splitting til separate repos er ikke
   aktuell før etter lansering — du jobber i dette ene repoet med alt.»

**Motargumentet er likevel ekte, og bør noteres.** Claude Design-prosjektet
«WANG Toppidrett - Software» beskriver i `readme.md` noe langt større enn golfgruppa:
en *multi-tenant, white-label treningsplattform for toppidrettsgymnas*, multi-idrett
(golf, fotball, håndball, langrenn, tennis), med elev/trener/skoleadmin/eier/foresatt/
klubbtrener-roller. **Det er et annet produkt enn AK Golf HQ.** Hvis det er produktet som
skal bygges, er egen repo riktig til slutt.

**Anbefalt utløser for splitt:** skole nr. 2 som betaler. Ikke før.

**Gode nyheter — sømmen er allerede lagt.** Dagens struktur er ekstraksjonsklar uten videre
arbeid, og bør holdes slik:

- `src/app/team-wang/` er selvstendig (egne `_components/`, `_data/`, eget `layout.tsx`).
- `src/styles/wang-tokens.css` er scopet under `.wang-tp` — paletten lekker aldri ut.
- Egne fonter lastes kun i WANG-layoutet (Montserrat + Quattrocento Sans).
- Egen PWA-identitet (`/team-wang/manifest.webmanifest`, «WANG Golf»).
- **All databasetilgang går gjennom én fil:** `_data/hent-wang-gruppe.ts`. Den er
  ekstraksjonspunktet — den dagen splitten kommer, blir den et API-kall i stedet for et
  Prisma-kall, og ingenting annet i flaten trenger å endres.

**Regel som følger av dette:** ingen ny WANG-skjerm får kalle `prisma` direkte. All lesing
går via `hent-wang-gruppe.ts` (eller en søsterfil i samme mappe). Dette er den eneste
arkitekturregelen denne planen legger til.

---

## 2. Branding-grensen — hvor WANG slutter og Paper begynner

Dette er den viktigste avklaringen i planen, og den følger direkte av at innholdet lages i
AgencyOS.

| Flate | Publikum | Merkevare | Begrunnelse |
|---|---|---|---|
| `/team-wang/*` | Elever, foreldre | **WANG** | Skolens flate. Elever og foreldre skal møte WANG, ikke AK Golf. |
| `/team-wang/coach` | Anders som sportssjef | **WANG** | Ligger i skolens flate, brukes i skolesammenheng (se §2.1 — skal trolig kollapses). |
| `/admin/grupper/*` | Anders som coach | **Claude Paper** | AgencyOS er Anders' eget verktøy på tvers av WANG, GFGK og Mulligan. Ett verktøy = én merkevare. |

**Konsekvens:** AgencyOS-skjermene i §4.C skal **ikke** redesignes med WANG-farger. De skal
redesignes etter Claude Paper-fasiten, som all annen AgencyOS-kode, og hører derfor hjemme i
`docs/port/plan-designport-alle-skjermer.md` — ikke her. De står i skjermregnskapet under
fordi de eier dataene WANG-flaten viser, og fordi feltdekningen deres bestemmer hva
WANG-flaten kan vise uten demo-data.

Å WANG-brande AgencyOS ville dessuten bryte invariant 2 i `CLAUDE.md` (Paper vinner alltid).

### 2.1 Åpen redundans: to trener-årsplaner

Det finnes i dag **to** trenerflater for den samme årsplanen:

- `/team-wang/coach` — WANG-branded, men kjører på **hardkodet demo** (`_data/coach-arsplan.ts`,
  som selv sier «kobling til ekte gruppe-/spillerdata er et senere steg»). `hent-wang-gruppe.ts`
  legger ekte perioder oppå, men periodeinnholdet (pyramide, mål, tester, IUP) er demo.
- `/admin/grupper/[id]/arsplan` + `/workbench` — Paper-branded, **ekte data**, og det er her
  Anders faktisk skal redigere.

To flater for samme jobb, der bare den ene har ekte data. **Anbefaling: `/team-wang/coach`
avvikles som redigeringsflate** og blir enten (a) en ren lesevisning for skolens ledelse i
WANG-drakt, eller (b) en redirect til AgencyOS. Dette er beslutning **B4** — se §7.

---

## 3. Designkilde og fasit

**Fasit: Claude Design-prosjektet `be77fcdb-7e1e-4341-aa67-23f21370ad8a` —
«WANG Toppidrett - Software».**

Prosjektet er allerede komplett som designsystem og trenger ikke bygges på nytt:

- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `motion.css`, `base.css`
- `guidelines/` — 17 spesimen-kort (farger, typografi, spacing, brand, brekkpunkter, kontrast,
  bevegelse, white-label)
- `components/` — ~40 komponenter i 8 grupper (core, cards, charts, chips, inputs, data,
  navigation, feedback, chat)
- `assets/` — ekte vektorlogo: `wang-crest.svg`, `wang-logo-vertical.svg`,
  `wang-logo-horizontal.svg`
- `uploads/wang-designmanual-2021.pdf` — skolens offisielle designmanual (30 sider)
- ~60 ferdige skjermmaler under `templates/`

`src/styles/wang-tokens.css` i repoet er allerede et speil av `tokens/colors.css` +
`tokens/spacing.css` derfra. **Speilet er ikke kilden** — samme regel som for Paper.

### 3.1 Hvorfor ikke et nytt prosjekt

Repoet har brent seg på parallelle token-systemer før (`CLAUDE.md` arbeidsregel 5: «ikke
opprett nye parallelle token-systemer»). Et tredje WANG-prosjekt ved siden av `be77fcdb` ville
divergere fra `wang-tokens.css` innen en måned. Nye skjermer legges derfor **inn i `be77fcdb`**
med slug-prefiks `golf-`, slik at de eksisterende `elev-`/`trener-`/`admin-`-malene for
den generiske treningsplattformen ikke blandes med golfgruppas flate.

### 3.2 Hva som mangler i fasiten

De 60 eksisterende malene dekker den generiske treningsplattformen — ikke golfgruppas årsplan.
**Ingen av skjermene i §4.A og §4.B har fasit i dag.** Nærmeste slektninger å bygge videre på:

| Ny skjerm | Nærmeste eksisterende mal | Gjenbrukbare komponenter |
|---|---|---|
| Årshjul | `templates/kalender-sesong` | `YearView`, `calendarUtils` |
| Tidslinje/gantt | `templates/trener-arsplan` | `YearView`, `TimelineFeed` |
| Måned/uke-kalender | `templates/elev-arsplan-kalender` | `CalendarView`, `WeekPlanner` |
| Økt-detalj | `templates/elev-logg-okt` | `SessionCard`, `Modal`/`BottomSheet` |
| Skole-vurdering | `templates/trener-proveplan-vurdering` | `CompetencyMatrix` |
| Foreldre | `templates/foresatt-oversikt` | `ChatBubble`, `ChatListItem` |
| Coach periode-detalj | `templates/trener-arsplan` | `DistributionDonut`, `StatCard` |
| Logg inn | `templates/onboarding` | `FormSection`, `ProgressStepper` |

---

## 4. Skjermregnskap

Alle skjermer i og rundt WANG-årsplanen. «Fasit» = finnes ferdig i `be77fcdb`.
«Data» = ekte fra AgencyOS-basen (E), delvis (D), eller hardkodet demo (H).

### A. Elev-/foreldreflaten — `/team-wang` (WANG-branding)

| # | Skjerm | Rute/tilstand | Kode i dag | Fasit | Data |
|---|---|---|---|---|---|
| A1 | Logg inn | `/team-wang/logg-inn` | `wang-login.tsx` | Nei | E |
| A2 | Oversikt | `?fane=oversikt` | `wang-fellesside.tsx` → `Oversikt` | Nei | D |
| A3 | Plan › Sesong › Årshjul | `?fane=plan` | `arshjul.tsx` | Nei | D |
| A4 | Plan › Sesong › Tidslinje | `?fane=plan` | `wang-fellesside.tsx` → `Plan` | Nei | D |
| A5 | Plan › Kalender › Årskalender | `?fane=plan` | `fane-kalender.tsx` | Nei | D |
| A6 | Plan › Kalender › Måned + dagdetalj | `?fane=plan` | `fane-kalender.tsx` → `MaanedGrid`/`DagDetalj` | Nei | D |
| A7 | Plan › Kalender › Uke | `?fane=plan` | `fane-kalender.tsx` → `UkeListe` | Nei | D |
| A8 | Plan › Samlinger | `?fane=plan` | `fane-samlinger.tsx` | Nei | H |
| A9 | Skole › Vurdering (kompetansemål) | `?fane=skole` | `fane-skole.tsx` → `Vurdering` | Nei | H |
| A10 | Skole › Timeplan | `?fane=skole` | `fane-skole.tsx` → `Timeplan` | Nei | H |
| A11 | Skole › Skolerute og prøver | `?fane=skole` | `fane-skole.tsx` | Nei | E |
| A12 | Foreldre | `?fane=foreldre` | `fane-foreldre.tsx` | Nei | H |
| A13 | Økt-detalj | overlegg | `okt-detalj.tsx` | Nei | H |
| A14 | Hendelse-detalj | overlegg | `hendelse-detalj.tsx` | Nei | E |

### B. Trenerflaten — `/team-wang/coach` (WANG-branding)

| # | Skjerm | Kode i dag | Fasit | Data |
|---|---|---|---|---|
| B1 | Coach årsplan — oversikt | `coach/coach-arsplan.tsx` → `Oversikt` | Nei | D |
| B2 | Coach årsplan — periode-detalj | `coach/coach-arsplan.tsx` → `PeriodeDetalj` | Nei | H |

Begge er avhengige av **B4** (§7) — bygg dem ikke før redundansen i §2.1 er avklart.

### C. AgencyOS — der innholdet lages (Claude Paper, **ikke** WANG)

Står her fordi feltdekningen deres bestemmer hva §A og §B kan vise uten demo-data.
Designarbeidet på disse hører til Paper-porten.

| # | Skjerm | Rute | Skriver til |
|---|---|---|---|
| C1 | Gruppeliste | `/admin/grupper` | — |
| C2 | Gruppedetalj + medlemmer | `/admin/grupper/[id]` | `GroupMember` |
| C3 | Gruppe-årsplan (kalenderkjerne) | `/admin/grupper/[id]/arsplan` | lesing |
| C4 | Skoledata-skjema | `/admin/grupper/[id]/arsplan/skoledata` | `SchoolScheduleEntry` |
| C5 | Gruppe-timeplan (faste tider) | `/admin/grupper/[id]/timeplan` | `GroupSchedule` |
| C6 | Gruppe-workbench (periodisering) | `/admin/grupper/[id]/workbench` | `GroupPeriodBlock` |

**Sum: 22 skjermer** — 16 med WANG-branding (A+B), 6 i AgencyOS/Paper (C).

---

## 5. Datagapet — det som faktisk blokkerer

Sju av 16 WANG-skjermer viser i dag hardkodet demo. Dette er ikke et designproblem, men det
avgjør om en skjerm kan sies å være ferdig. **Design kan tegnes parallelt; kode kan ikke
merges med demo-data i produksjon.**

| Skjerm | Mangler i basen | Nærmeste eier |
|---|---|---|
| A8 Samlinger | Samlingsdetaljer (program, utstyr, kostnad, påmelding) | `GroupSchedule.kind = SAMLING` mangler felter |
| A9 Skole › Vurdering | Kompetansemål-matrise (fag × trinn × nivå) | Ingen modell finnes |
| A10 Skole › Timeplan | Skoletimeplan per klasse | Ingen modell finnes |
| A12 Foreldre | Meldingstråd | Ingen modell finnes (`CHAT_SEED` er demo) |
| A13 Økt-detalj | Drill-innhold per økt | `OktMal`/`DrillMal` finnes — ikke koblet til `GroupSchedule` |
| B1/B2 Coach | Pyramide, mål, tester, IUP per periode | `GroupPeriodBlock` har kun `focus` + `weeklyVol*` |

**Anbefaling:** ikke bygg nye tabeller for A9/A10/A12 nå. Det er skoleadministrasjon, ikke
trening, og hører til produktet i §1-motargumentet. Behold demo bak en synlig
«Demo-innhold»-merking til beslutning B5 (§7).

Det reelle, korte gapet er **B1/B2**: `GroupPeriodBlock` mangler feltene coach-årsplanen viser.
Additivt og trygt via mønsteret i `gotchas.md` (`CREATE TABLE/ALTER … IF NOT EXISTS` via
tsx + `PrismaPg`, aldri `migrate dev`).

---

## 6. Bølger

Hver bølge = én PR per skjerm. Aldri merge til main uten Anders' «ja».

**Bølge 0 — beslutninger og fundament** (ingen skjermer)
- B1–B5 avklart (§0, §7).
- `golf-*`-navnekonvensjon opprettet i `be77fcdb`.
- Verifiser at `wang-tokens.css` fortsatt matcher `tokens/colors.css` i fasiten. Speilet er
  fra prosjektets v2-generasjon; sjekk avvik før noe bygges oppå.

**Bølge 1 — skallet** (A1, A2)
Header, faner, hero-kortet, bunnmeny. Alt annet arver herfra — ikke gå videre før A2 er
godkjent av Anders. Samme regel som `uploads/00-les-meg-forst.md` selv setter: «Ikke godta
skjerm 1 før den ser riktig ut — ALT annet arver stilen derfra.»

**Bølge 2 — planen** (A3, A4, A5, A6, A7)
Kjernen i produktet, og den eneste delen som er 100 % dekket av ekte AgencyOS-data.
Høyest verdi per skjerm. `YearView`/`CalendarView`/`WeekPlanner` gjenbrukes fra fasiten.

**Bølge 3 — detaljer og hendelser** (A13, A14, A8)
A14 har ekte data. A13 og A8 krever datagapet i §5 eller synlig demo-merking.

**Bølge 4 — trener** (B1, B2)
Blokkert av B4. Kjøres bare hvis `/team-wang/coach` skal overleve som egen flate.

**Bølge 5 — skole og foreldre** (A9, A10, A11, A12)
A11 har ekte data og kan tas først. Resten er blokkert av B5.

Rekkefølgen er valgt slik at alt som kjører på ekte data ligger tidlig, og alt som krever nye
datamodeller ligger sist.

---

## 7. Åpne avklaringer

| # | Spørsmål | Blokkerer |
|---|---|---|
| B1 | Egen repo? (anbefaling: nei) | Alt |
| B2 | `be77fcdb` som fasit, `golf-*`-prefiks? (anbefaling: ja) | Bølge 0 |
| B3 | AgencyOS forblir Paper? (anbefaling: ja) | §C |
| B4 | Skal `/team-wang/coach` overleve, eller redirecte til AgencyOS? | Bølge 4 |
| B5 | Skal skole-/foreldredata (A9, A10, A12) modelleres, eller forbli merket demo? | Bølge 5 |
| B6 | Er WANG-flaten kun golf, eller alle idretter ved skolen? Fasiten i `be77fcdb` antar multi-idrett; koden antar golf. | Omfang totalt |

B6 er den som kan velte planen: svarer Anders «alle idretter», er §1-motargumentet det
gjeldende produktet, og da endres både repo-svaret og skjermregnskapet.

---

## 8. Ferdig-definisjon per skjerm

Arves fra `docs/port/plan-designport-alle-skjermer.md` §Ferdig-definisjon, med to WANG-tillegg.

En skjerm er ferdig når **alle** punktene er sanne:

1. **Skjermbilde-gaten:** Anders har SETT skjermen — faktisk skjermbilde av kjørende app
   (Vercel-preview, innlogget testbruker), sendt **direkte i samtalen** (synlig fra iPhone).
2. **Mobil 390px alltid først**, deretter desktop 1280px.
3. **Fasit-utsnittet ved siden av** — den tilsvarende `golf-*`-malen fra `be77fcdb`.
4. **Alle fire tilstander:** Suksess · Tom · Laster · Feil.
5. **Maks én primær handling** per skjerm (`beslutninger.md` §Enkelhet).
6. **Klikk-verifisert** — ikke bare fotografert.
7. **Norsk bokmål**, Lucide-ikoner, aldri emoji.
8. **`npm run verify && npm test` grønt.**
9. **WANG-tillegg 1 — ingen tema-toggle.** `.wang-tp` er enpalett med vilje, som `.gfgk-jr`
   (`gotchas.md` §Tema). Ikke legg til en mørk gren.
10. **WANG-tillegg 2 — ingen direkte `prisma`-import.** All data via `_data/hent-wang-gruppe.ts`
    (§1). Dette er ekstraksjonssømmen og skal holdes ren.

**Lys/mørk-punktet fra Paper-gaten gjelder ikke her** — WANG-flaten har ingen mørk modus.
Til gjengjeld er punkt 9 og 10 harde.

### 8.1 Kjent felle å teste for

`gotchas.md` §Rutenett-kolonne uten `min-width: 0` (oppdaget 10.08.2026): enhver flex/grid-
beholder med `nowrap`-tekst eller lange strenger MÅ ha `minWidth: 0`. WANG-flaten har flere
`grid`-oppsett med lange øktnavn. Verifiser med `document.documentElement.scrollWidth` mot
`window.innerWidth` på hver skjerm i bølge 2 og 3.

---

## 9. Ikke i omfang

- Redesign av AgencyOS-skjermene i §C — hører til Paper-porten.
- `/gfgk-junior/` — egen skole/klubb, egen palett (`.gfgk-jr`), egen plan.
- De ~60 generiske malene i `be77fcdb` (`elev-*`, `trener-*`, `admin-*`, `eier-*`) — de
  tilhører WANG Treningsplattform som produkt, ikke golfgruppas årsplan. Røres ikke før B6
  er avklart.
