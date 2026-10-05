# Workbench — komplett beskrivelse

**Dato:** 05.10.2026 · **Grunnlag:** `main` på commit `9f39c7d44` · **Formål:** underlag for å tegne Workbench på nytt i Claude Design og deretter bygge den.

Dette dokumentet endrer ingenting. Det beskriver hva Workbench er, hva som finnes i koden i dag, hva som er beskrevet men ikke bygget, og hvor kildene sier imot hverandre.

**Slik leses kildemerkene:**

- **Kode:** «sett i koden (`fil:linje`)». Stier er relative til repoet.
- **Dok:** «beskrevet i dokument (`fil`)».
- **Antatt:** ikke bekreftet i noen fil. Brukes sjelden og står alltid uttrykkelig.

Tre kortnavn går igjen:

- **Masteren** er `docs/treningsplanlegging.md`, den eneste fasiten for ord og treningsmodell (AGENTS.md §Kildeorden).
- **Beslutningene** er `.claude/rules/beslutninger.md`.
- **Handoff** er `docs/design-handoff/` (pakken fra Claude Design 04.10).

Ord fra masteren brukes gjennomgående: *økt*, *øvelse* (aldri «drill»), *målsetning*, *Gjennomført*, *registrere*.

---

## 1. Workbench på én side

**Hva den er.** Workbench er treningsplanleggeren i AK Golf HQ. Her lages hele planen, fra årsplan ned til den enkelte øvelsen i en økt. Planen publiseres, gjennomføres og sammenlignes med det som faktisk ble trent. Spiller og coach bruker én og samme motor (dok: beslutningene §Workbench: «Spillerens `WorkbenchV2` er den ene motoren; coach får samme komponent med stall-velger og gruppe-modus»; kode: `src/lib/workbench/wb-actions.ts` brukes fra begge sider).

**Hvem bruker den:**

| Bruker | Hvor | Hva de gjør |
|---|---|---|
| Spiller | PlayerHQ, `/portal/planlegge/workbench` (fanen Plan › «Rediger») | Bygger og endrer sin egen plan, gjennomfører økter og ser planlagt mot gjennomført. |
| AK-coach | AgencyOS, `/admin/workbench/[spiller]` | Planlegger for spillere i stallen: perioder, uker, økter, publisering, analyse og tiltak. |
| AK-coach for gruppe | AgencyOS, `/admin/grupper/[id]/workbench` | Lager gruppeplanen, som medlemmene arver. |
| WANG- og Team Norway-trener | `/team-wang`, `/team-norway/workbench` | Ser planen bare når spilleren har delt den. Kan bare *foreslå* endringer, og spilleren bestemmer (dok: beslutningene 28.09 «WANG og Team Norway foreslår, spilleren bestemmer»). |

**Problemet den løser.** Planen ligger i dag spredt på papir, Excel, kalender og meldinger. Workbench samler planlegging, gjennomføring og oppfølging i én kjede: Målsetning → Årsplan → Periode → Måned → Uke → Økt → Øvelse → Gjennomføring → Resultat → Analyse → Neste tiltak (dok: masteren linje 316–341). Coachen ser om planen faktisk følges. Spilleren ser hva som skal gjøres i dag og hvorfor.

**Hvor langt den er kommet.** Grunnmotoren virker for uke, økt, periode og publisering. Ved lansering mangler fire ting:

- Varsling til spiller og coach ved endringer.
- Månedsplan.
- Én fungerende vei fra «Start» i I dag til registrert tid.
- Lukking av et tilgangshull for WANG- og TN-trenere (se §6.3).

Kildene er heller ikke enige om hvilken Workbench-design som er fasit (se §9, M1).

---

## 2. Byggesteinene og hvordan de henger sammen

### 2.1 Figur

```
MÅLSETNINGER (resultatmål · prosessmål) ─────────────┐ knyttes til ett nivå
                                                     ▼
ÅR  Årsplan (fra–til, f.eks. aug–jun eller jan–des)
 │   ├─ turneringer, testuker, samlinger, ferie   (hendelser i året)
 │   └─ total fordeling på FYS · TEK · SLAG · SPILL · TURN
 ▼
PERIODE  Grunnperiode · Spesialperiode · Turneringsperiode · Evaluering · Ferie · Restitusjon
 │   fokus · ukevolum (min) · øktbudsjett per akse per uke · periodemål
 ▼
MÅNED  fokus og mål · timer per akse fordelt på ukene · evaluering     (besluttet, ikke bygget)
 ▼
UKE   uketype · timer per akse · notat · kalender 05–22 · opptatt tid (skole, reise, booking)
 ▼
ØKT   dato · klokkeslett · varighet · akse (farge) · sted · status · opphav (Egen / Gruppe / Fra coach)
 ▼
ØVELSE  AK-formel: PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS
        + sted · måleutstyr · gjennomføring · mengde · mål · teknisk fokus (fra teknisk plan)
 ▼
GJENNOMFØRING  Start → Pågår → Gjennomført / Hoppet over / Avlyst
 ▼
REGISTRERT  faktisk tid · opplevd belastning 1–10 · slag/reps · notat
 ▼
PLANLAGT MOT REGISTRERT  per dag · uke · periode · sesong → etterlevelse (siste 4 uker)
 ▼
ANALYSE / TEST → TILTAK → tilbake til UKE (ny økt eller serie som utkast)

Ved siden av:  GRUPPEPLAN ──arves──► spillerens plan (endret kopi = «Egen»)
               ØVELSESBANK + ØKTMALER + STANDARDPLANER ──► fyller ÅR/UKE/ØKT
               TEKNISK PLAN (P1.0–P10.0) ──«Legg i økt»──► ØVELSE
               FYSISK PROGRAM (blokker á 6 uker) ──► økter i samme UKE
               TURNERINGSPLAN (reise, runder, forberedelse) ──► dager i UKE
```

### 2.2 Byggesteinene en for en

**År (årsplan).** Sesongen med fra- og til-dato, perioder, turneringer, tester, planlagte og gjennomførte timer, og fordeling på de fem aksene (dok: masteren 343–346).

- Både coach og spiller kan opprette årsplan.
- Forslaget til tidsrom er skoleåret (aug–jun) for WANG og kalenderåret ellers.
- Utgangspunktet kan være kopi av fjoråret, standardplan A–K, gruppas årsplan eller tom plan (dok: beslutningene 28.09 §Workbench over uka).
- Lagres i tabellen `SeasonPlan` (kode: `prisma/schema.prisma`, modellen `SeasonPlan`).

**Periode.** Synlige navn: Grunnperiode · Spesialperiode · Turneringsperiode · Evaluering · Ferie · Restitusjon (dok: beslutningene 28.09 §PERIODENE).

- Testuke, Treningssamling og Heldagssamling er *hendelser* i årsplanen, ikke treningsperioder (dok: masteren 784).
- Feltene er fra/til, fokus, ukevolum i minutter, øktbudsjett per akse og periodemål (dok: masteren 385–393).
- Lagres i `PeriodBlock`. Periodetypen ligger i feltet `lPhase` (kode: `prisma/schema.prisma`, enum `LPhase`).
- Kodenavnene er GRUNN, SPESIAL, TURNERING, EVALUERING, FERIE og RESTITUSJON.

**Måned.** Fire til seks uker ut fra periodens retning (dok: masteren 338). Måneden skal ha eget innhold:

- fokus og mål
- timer per akse fordelt på ukene
- tester og turneringer
- notat, og evaluering når måneden er over

Kilde: beslutningene 28.09. Måneden finnes i dag bare som lesevisning. Tabellen `MonthPlan` finnes ikke (kode: søk i `prisma/schema.prisma` gir ingen treff).

**Uke.** Arbeidsflaten der økter opprettes, flyttes, gjentas og publiseres (dok: masteren 397).

- Uka viser også opptatt tid: skole, booking, reise og helse. Den gir bare sammenheng og kan ikke trenes i (dok: masteren 399–412).
- Ukeplanen har uketype, timer per akse og notat. Den lagres i `WeekPlan`, unik per spiller, ISO-år og ukenummer (kode: `prisma/schema.prisma`, `WeekPlan`).
- Ny uke skal aldri starte tom. «Kopier forrige uke» er standard (dok: beslutningene §Workbench). Dette er ikke bygget, se §3.

**Økt.** Inneholder dato, starttid, varighet, navn, dominerende akse, type, sted, øvelser og notater. Økten er et utkast til den publiseres (dok: masteren 414–418).

- Lagres i `WorkbenchSession`. Startidspunktet lagres som dato pluss `startMinute`, altså minutter etter midnatt. Sluttid lagres ikke (kode: `prisma/schema.prisma`, `WorkbenchSession`).

**Øvelse.** En tellbar del av en økt (dok: masteren 93). Den planlegges i åtte trinn: Hensikt → Treningsområde → Sted og miljø → Måleutstyr → Gjennomføring → Press → Mengde → Mål (dok: masteren 420–431).

- Lagres i `WorkbenchDrill`. AK-formelen ligger som JSON i `akFormel`, og de åtte valgene ligger i `detaljer` (kode: `src/lib/domain/workbench/ovelse-detaljer.ts`).

**De fem aksene og pyramiden.** FYS Fysisk · TEK Teknisk · SLAG Golfslag · SPILL Spill · TURN Turnering (dok: masteren 446–452).

- Farge betyr alltid akse og ingenting annet (dok: beslutningene §FARGE BETYR AKSE).
- Pyramiden velges først og styrer kategorisering og øvelsesbank (dok: beslutningene 28.09 runde 8). Masteren sier at pyramiden «foreslår område og felt, men låser dem ikke» (dok: masteren 454). Se motsigelse M9.

**AK-formelen v2.** `PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS` (dok: masteren 770).

| Ledd | Synlig navn | Verdier |
|---|---|---|
| Område | Treningsområde | 19 områder (dok: masteren 489–496), se under |
| Motorikk | Læringssteg | Uten ball · Lav hastighet (25/50/75 % av Club Speed) · Automatikk (100 %) |
| Belastning | Treningsmiljø | Innendørs · Treningsområde · Bane · Konkurranse |
| Press | Press | Alene · Observert · Konkurranse · Turnering |

De 19 områdene (dok: masteren 489–496):

- **Utslag:** Tee totalt.
- **Innspill:** 200+, 150–200, 100–150 og 50–100 m.
- **Nærspill:** Chip, Pitch, Lob og Bunker.
- **Putting** (i fot): 0–3, 3–5, 5–10, 10–25, 25–40 og 40+.
- **Fysisk:** Styrke, Kondisjon og Bevegelighet.
- **Spill:** Bane.

Hastigheten lagres som `detaljer.hastighetProsent`. L-faser, CS-koder, M0–M5 og PR1–PR5 er utgått (dok: masteren 735).

**Mengde og budsjett per akse.**

- *Mengde* på øvelsen avhenger av området (dok: masteren 681–688):
  - slag eller putter
  - hull, tid eller oppgaver
  - styrke som «4 × 6 @ 90 kg · RIR 2»
  - kondisjon med pulssone S1–S5
- *Budsjett* er antall økter per akse per uke i perioden (`weeklySessionBudget`) og timer per akse i uka (`plannedHoursFys` … `plannedHoursTurn`) (kode: `prisma/schema.prisma`, `PeriodBlock` og `WeekPlan`).
- Budsjettet sperrer ingenting. Ingen treningsregel er låst (dok: beslutningene §Treningsfag).

**Målsetninger.** Spilleren sikter mot to typer målsetninger (dok: masteren 350–358):

- *Resultatmål* (f.eks. snittscore).
- *Prosessmål* (f.eks. antall teknikkøkter).

En målsetning knyttes til ett nivå: år, periode, måned, uke eller økt. Statusene er Ikke startet · På vei · Nådd (dok: masteren 312, 362–366).

- Lagres i `Goal`, med `category` OUTCOME (resultatmål) eller PROCESS (prosessmål) (kode: `prisma/schema.prisma`).
- `Goal` mangler startdato, selv om beslutningen 28.09 krever start og slutt.
- «Mål» alene brukes bare om måltall (dok: beslutningene 30.09 §ORDBOKA ER LÅST).

**Turneringer med reisedager.** En turnering i planen har:

- type (Treningsturnering · Utviklingsturnering · Prestasjonsturnering)
- reisedatoer og runder
- forberedelse dag for dag
- mål og evaluering

Kilder: dok: masteren 472–482. Kode: `prisma/schema.prisma`, `WorkbenchTournamentPlan` og `WorkbenchTournamentRound`.

Reise vises som eget spor og utløser konflikt ved flytting (kode: `src/lib/workbench/plan-handlinger-actions.ts:31-38`). Ordet *konkurransedager* er ikke definert i noen kilde. Antatt: konkurransedagene er rundedagene i turneringsplanen.

**Tester og testdager.** Tester planlegges i Workbench, og resultatet går til talentprofilen (dok: beslutningene §Treningsfag). En test teller bare når alle slag er registrert (dok: beslutningene 26.09).

- I dag vises bare gjennomførte tester (`TestResult`) i Sesongkart (kode: `src/components/workbench/WorkbenchSesongkart.tsx:66`).
- En *planlagt* testdag finnes bare som blokktypen TEST eller periodetypen Testuke.

**Teknisk plan.** Spillerens tekniske oppgaver på P-posisjonene P1.0–P10.0 (dok: masteren 647–662). «Legg i økt» lager en øvelse som husker oppgaven og hvilken revisjon den kom fra (dok: `docs/design-handoff/regler/skjermliste.md`, AG-10). Ingenting sperres. Kvalitetssjekken bare vises (dok: beslutningene 27.09).

**Maler og øvelsesbank.**

- **Øktmaler:** spillerens egne økter merket som mal (`isTemplate`) (kode: `wb-actions.ts:1996`).
- **Ukemaler og program:** `PlanTemplate`, per NGF-kategori og periodetype (kode: `prisma/schema.prisma`).
- **Fem standardplaner** (dok: masteren 205–209):
  - Weekend Warrior
  - Klubbspilleren
  - Junior-aspirant
  - Konkurransespilleren
  - Practice like the pros

  Innholdet er ikke skrevet (dok: beslutningene 28.09, punkt 4).
- **Øvelsesbanken:** `ExerciseDefinition` med kilde SYSTEM, COACH eller PLAYER og synlighet (kode: `prisma/schema.prisma`).

**Gruppeplan mot individuell plan.** Gruppeplanen er grunnmuren og arves av medlemmene. Tilpasser spilleren en arvet økt, merkes den «Egen» og følger ikke lenger gruppa (dok: beslutningene 28.09 runde 8).

- I koden får hvert medlem en egen kopi ved publisering (`sourceGroupSessionId`).
- En lokal endring setter `localOverride` (kode: `src/lib/workbench/group-session-actions.ts:198-233`).

**Planlagt mot registrert.**

- *Planlagt* er tiden i en publisert økt.
- *Gjennomført* er status på en utført økt. *Registrere* er å føre data (dok: masteren 215, 262–264).
- *Etterlevelse* er gjennomført tid delt på planlagt tid de siste fire ukene, og bare for økter der sluttiden er passert. Uten slike økter vises «—» (dok: beslutningene 26.09).
- Koden har nå ett felles mål (kode: `src/lib/domain/etterlevelse.ts:39`, `src/lib/workbench/compliance.ts:52`).

---

## 3. Funksjoner i koden i dag

Statusene betyr:

- **Virker:** knappen finnes og lagrer.
- **Delvis:** virker med vesentlige hull.
- **Bare skall:** knapp uten ekte lagring, eller lagring som ingen knapp bruker.
- **Mangler:** finnes ikke.

Status er satt ved å følge hvem som kaller koden, ikke ved å klikke i nettleseren.

### 3.1 Felles motor (brukes av både PlayerHQ og AgencyOS)

| # | Funksjon | Fil | Status | Hva som mangler |
|---|---|---|---|---|
| F1 | Opprette økt | `src/lib/workbench/wb-actions.ts:1301`, `useUkeMotor.ts:96-114` | Virker | Økten blir alltid utkast, også når spilleren lager den selv (`src/lib/domain/workbench/operations.ts:104`). Starttiden rundes uten varsel til nærmeste halvtime (`operations.ts:53,57`). |
| F2 | Endre innhold (formål, sted, målsetning) | `wb-actions.ts:1891`, `AG11Ark.tsx:147-149` | Virker | — |
| F3 | Slette økt | `wb-actions.ts:1847` | Virker | Blokkert når økten har gjennomføringshistorikk. En gruppekopi skjules i stedet for å slettes. |
| F4 | Dra og slipp, desktop | `src/components/workbench/WorkbenchUkeverksted.tsx:79,184-188` | Virker | Slipp runder til halvtime. |
| F5 | Dra og slipp, mobil | `WorkbenchUkeverksted.tsx:145` | Mangler | Den samlede flaten har bare «Plasser kl.». Den gamle AG11 har pekerdra (`AG11Workbench.tsx:146-174`). |
| F6 | Flytte, kopiere og gjenta med Angre | `src/lib/workbench/plan-handlinger-actions.ts:42-124` | Virker | Angre varer i 15 minutter og bare for den som gjorde handlingen (`plan-angre-token.ts:26`). Krever miljøvariabelen `WORKBENCH_UNDO_SECRET`. |
| F7 | Angre etter opprett eller flytt i uka | `useUkeMotor.ts:102-129` | Delvis | Bare som knapp i kvitteringen. Angre etter flytt sjekker ikke versjon. |
| F8 | Gjenta ukentlig (serie) | `wb-actions.ts:1351`, `src/lib/domain/workbench/schemas.ts:145` | Virker | 1–26 uker. |
| F9 | Gjenta annenhver uke | `plan-handlinger-kontrakt.ts:12-15` | Virker | Hver 1.–12. uke, opptil 52 ganger. Blir utkastkopier. |
| F10 | Gjenta til dato eller ut perioden | — | Mangler | Tegnet i handoff (`WB3.jsx.txt:146-152`). |
| F11 | Endre én, denne og fremover, eller hele serien | `schemas.ts:138`, `AG11Ark.tsx:147,218` | Delvis | Gjelder innhold og sletting. Dato og tid endres aldri på tvers av serien (`operations.ts:145-176`). |
| F12 | Kopier forrige uke som én handling | `session-actions.ts:217` (ingen kaller) | Bare skall | Bare økt for økt fra kilden «Forrige uke» (`WorkbenchUkeverksted.tsx:25,93`). |
| F13 | Publisere og trekke tilbake | `wb-actions.ts:1630`, `:1673` | Virker | Alt eller ingenting, med lås mot samtidig endring. |
| F14 | Ukeplan (uketype, timer per akse, notat) | `wb-actions.ts:552` | Virker | — |
| F15 | Treukerssyklus | `treukerssyklus-actions.ts` | Virker | — |
| F16 | Opprette årsplan | `wb-actions.ts:329`, `WorkbenchSesongkart.tsx:91` | Delvis | Sesongkart lager bare tom plan. «Kopi av fjoråret» finnes bare i gammel visning (`WorkbenchAar.tsx:132`). Standardplan A–K og gruppas plan mangler. |
| F17 | Endre årsplanens fra- og til-dato | `workbench-samlet-sesong-actions.ts:23` | Virker | — |
| F18 | Opprette, endre og slette periode | `wb-actions.ts:406,431`, `periode-core.ts` | Virker | — |
| F19 | Månedsplan | `WorkbenchSesongkart.tsx:59-60` | Mangler | Bare lesing. Tabellen `MonthPlan` finnes ikke. |
| F20 | Øvelse med AK-formel i åtte trinn | `useUkeMotor.ts:181-192`, `ovelse-detaljer.ts` | Virker | Økten selv har bare akse (`pyramid`). |
| F21 | Økt fra kilde (øvelse, øktmal, forrige uke, teknisk oppgave) | `wb-actions.ts:1409` | Virker | — |
| F22 | Ukemal eller program (`PlanTemplate`) inn i en uke | `apply-template-actions.ts:258` (ingen kaller) | Bare skall | Ingen vei fra Workbench. |
| F23 | Standardplaner (fem stk.) | — | Mangler | Ikke bygget, og innholdet er ikke skrevet. |
| F24 | Turneringsplan (reise, runder, forberedelse) | `fys-turnering-actions.ts`, `turneringsplan-actions.ts` | Virker | Lagring virker. Publisering er skjult for spilleren. |
| F25 | Hendelser (opptatt tid) | `hendelser-actions.ts` | Virker | Bare spilleren kan endre (`WorkbenchUkeverksted.tsx:150`). |
| F26 | Planlagt mot registrert per uke, periode og sesong | `workbench-samlet-data.ts:111,144-187`, `treningsvolum.ts` | Virker | — |
| F27 | Planlagt mot registrert per dag (sum) | — | Mangler | Bare per økt i inspektøren. |
| F28 | Etterlevelse (siste fire uker, minutter) | `src/lib/domain/etterlevelse.ts:39` | Virker | — |
| F29 | Lås mot samtidig endring | `wb-actions.ts:1622,1658,1685,1860` | Delvis | `moveSession` sammenligner med raden den nettopp leste, ikke med versjonen klienten har (`wb-actions.ts:1614`). |
| F30 | Varsling ved endring i planen | — | Mangler | Ingen av de aktive Workbench-handlingene varsler. Bare samlingsinvitasjon varsler (`samlingsinvitasjon-actions.ts:174`). |

### 3.2 PlayerHQ (spilleren)

| # | Funksjon | Fil | Status | Hva som mangler |
|---|---|---|---|---|
| P1 | Samlet Workbench (Sesongkart · Ukeverksted · Trenerbord · Stats) | `src/app/portal/planlegge/workbench/page.tsx`, `WorkbenchSamlet.tsx`, `samlet-url.ts:17-21` | Virker | Den gamle visningen (PH11/AG11 med År · Periode · Måned) nås bare med `?klassisk=1` og `?niva=malsetninger`. |
| P2 | Plan-fanen (se-modus, svar på forslag) | `src/components/portal/precision/PH10Plan.tsx:109-124` | Virker | «Rediger økt» vises bare når økten har `planSessionId`, og det har Workbench-økter aldri (`PH10Plan.tsx:177`). |
| P3 | Godta eller avslå forslag fra coach | `wb-actions.ts:2279` | Virker | Coachen varsles ikke om svaret. |
| P4 | Godta eller avslå trenerforslag fra WANG/TN | `src/lib/workbench/trenerforslag.ts:42,127` | Virker | — |
| P5 | Sende plan til coach | `src/app/portal/planlegge/bygger/actions.ts` (`sendPlanTilCoachV2`) | Delvis | Lager en gammel `TrainingPlan` uten økter. Beslutningen 28.09 sier at «Send til coach» skal fjernes. |
| P6 | Start fra I dag → live → registrert (vei A) | `/portal/live/[id]/brief`, `tapper`, `summary` | Bare skall | Faktisk tid lagres aldri. Slagtelleren lagrer siste trykk i stedet for totalen. Oppsummeringen viser hardkodede tall. Notatet går tapt (se §5f). |
| P7 | Gjennomføre fra Workbench eller `/portal/tren/wb/[id]` (vei B) | `wb-session-life-actions.ts`, `OktArk.tsx` | Delvis | `OktArk` fyller inn planlagt tid som faktisk tid (`OktArk.tsx:44`). «Lagre belastning» på en gjennomført økt feiler alltid (`OktArk.tsx:55` mot `wb-actions.ts:2096-2098`). |
| P8 | Fysisk program | `workbench/page.tsx:82` (`actions={}`) | Delvis | Spilleren kan lese, men ikke lage, flytte eller publisere. |
| P9 | Målsetninger | `/portal/mal`, `PH19` | Virker | Startdato mangler i datamodellen. |
| P10 | Tester i planen | `WorkbenchSesongkart.tsx:66` | Delvis | Viser bare gjennomførte tester, ikke planlagte testdager. |
| P11 | AI-ukeforslag | `AG11Workbench.tsx:243`, `Ukeforslag.tsx` | Virker | Er synlig for spilleren, mens beslutningen sier at AI-planbyggeren skal skjules ved lansering. |
| P12 | Tilgang FULL/TALENT/INGEN | `src/lib/auth/requirePortalUser.ts:39,64-72` | Delvis | Workbench krever FULL. Live-sidene sjekker i tillegg det gamle nivået `GRATIS` (`portal-live/actions.ts:17`). |

### 3.3 AgencyOS (coachen)

| # | Funksjon | Fil | Status | Hva som mangler |
|---|---|---|---|---|
| A1 | Åpne spillerens Workbench med spillervelger | `src/app/admin/workbench/[playerId]/page.tsx`, `workbench-samlet-data.ts:164` | Virker | Produksjonsbasen mangler tabellene for turnering og fysisk plan, og siden har React-feil #441 (dok: `docs/planer/backend-klar-for-portering-2026-10-05.md` fase 0. Fila ligger bare lokalt i hovedmappen og er ikke lagret i Git). |
| A2 | Coach redigerer spillerens perioder | Sesongkart → `saveSeasonPeriod` | Virker | `coachLagrePeriode` og `coachSlettPeriode` (`session-actions.ts:275,293`) har ingen kaller, men de trengs ikke lenger. |
| A3 | Gruppeplan: grunnøkter, publisering, tilbaketrekking | `group-session-actions.ts:67,149,154` | Virker | Tungt å nå (Trenerbord → «Gruppeøkter»). Gruppa har ingen egen ukekalender. Ny gruppeøkt kan bare lages fra én øvelse. |
| A4 | Arv og «Egen»-merke | `group-session-actions.ts:198-233`, `AG11Ark.tsx:50-51` | Delvis | Merket vises bare i den gamle AG11, ikke i Ukeverksted. |
| A5 | Gruppeperioder og utrulling av gruppeårsplanen | `gruppe-periode-actions.ts:28,64,95` | Delvis | Engangskopi uten varsel. Senere endringer følger ikke med. Bruker lokal tid i stedet for UTC. |
| A6 | Rulle ut `PlanTemplate` til gruppe | `apply-template-actions.ts:276` | Delvis | Skriver til den gamle økttabellen, ikke til Workbench. |
| A7 | Forslag fra coach til spiller | `plan-handlinger-actions.ts:83` | Delvis | Bare kopi og gjenta lager forslag. Forslaget vises først etter at coachen har publisert. Ingen varsel. |
| A8 | Agentforslag i Workbench | `WorkbenchTrenerbord.tsx:31,46` | Bare skall | Ingen kode setter `isAgentProposal: true`. Agentene skriver til den gamle tabellen (`plan-action-executor.ts:401-623`). |
| A9 | Fra analyse eller test til tiltak | `WorkbenchAnalyse.tsx:31-41` | Virker | Lager en utkastserie som kan angres. Det skjer ingenting automatisk. |
| A10 | Øvelsesbank, egne øvelser | `src/lib/actions/drills-actions.ts:38,82,129` | Delvis | Endre og slette sjekker ikke hvem som eier øvelsen. |
| A11 | Kalender viser Workbench-økter | `src/app/admin/kalender/data.ts:392` | Delvis | Ukevisningen leser den gamle `TrainingSessionV2`. |
| A12 | Head coach mot assistant coach | — | Mangler | `UserRole` har ikke disse rollene. |
| A13 | WANG/TN-trenerforslag og samlingsinvitasjon | `trenerforslag.ts`, `samlingsinvitasjon-actions.ts` | Virker | WANG-årsplanen viser demodata med ekte datoer (`src/app/team-wang/coach/coach-arsplan.tsx:3-5`). |

### 3.4 Telling

| Status | Felles | PlayerHQ | AgencyOS | Sum |
|---|---|---|---|---|
| Virker | 18 | 6 | 5 | **29** |
| Delvis | 4 | 5 | 6 | **15** |
| Bare skall | 2 | 1 | 1 | **4** |
| Mangler | 6 | 0 | 1 | **7** |
| **Sum** | 30 | 12 | 13 | **55** |

---

## 4. Beskrevet, men ikke bygget

| Funksjon | Kilde |
|---|---|
| «Opprett årsplan»-veileder i tre steg (utgangspunkt, tidsrom, navn) med fire utgangspunkter | Beslutningene 28.09; `docs/design-handoff/regler/skjermliste.md` PH-11-NY |
| Fritt tidsrom og `createdById` på årsplanen. I dag er den unik på spiller og år | Beslutningene 28.09, punkt 2 |
| Månedsplan med fokus, timer per akse fordelt på uker, tester, turneringer og evaluering | Beslutningene 28.09, punkt 3; skjermliste PH-11-MND |
| Gjenta «valgte dager», «til dato» og «ut perioden» | `docs/design-handoff/design/shared/WB3.jsx.txt:146-152` |
| Ny uke starter som kopi av forrige uke | Beslutningene §Workbench |
| Varsel til coach når spilleren endrer en turnering eller en økt coachen la inn | Beslutningene 28.09 runde 8 (PlayerHQ › Plan) |
| Varsel til spiller ved flytting i kalenderen, med angre i 10 sekunder | Beslutningene 28.09 runde 8 (AgencyOS › Kalender) |
| Justeringsforslag ved fire signaler (SG-gap, tre runder over snitt, under 70 % eller over 130 % to uker på rad) | Beslutningene 28.09 runde 8 (Motoren) |
| Google-kalender begge veier. Coach ser bare opptatt tid | Beslutningene 28.09 runde 8 |
| De fem standardplanene per kategori A–K | Beslutningene 28.09, punkt 4 og 8 |
| Felles testdag, testdager i planen | `docs/planer/workbench-fullforing-2026-10-02.json` R11 |
| Oppvarming, varianter og progresjon i økt | `docs/design-audit/workbench-samlet-kontroll-2026-10-02.md:48` |
| Treningssamling som blokk, og «Be coach endre planen» | `docs/beslutningsgrunnlag/mulighetskart-playerhq-agencyos-2026-09-28.md` B7, B8 |
| Planforslag for hel gruppe (B4), tegnet men skjult ved lansering | `WB3.jsx.txt:101` |
| «Fra test» som opphav på øktkort | `docs/planer/portering-skjermer-2026-09-27.md` §9 |
| Lokal kø for ulagrede endringer uten nett | `WB3.jsx.txt:124` |
| Ukes- og månedsevaluering fra spiller og coach hver for seg | Skjermliste:129 |
| IUP-måltall i Målsetninger, bare for WANG- og TN-medlemmer | `docs/design-handoff/README.md:97-111`; `kodestatus-2026-10-04.md:17` |
| TrackMan-parametere foreslått per teknisk fokus | Masteren 778 |
| Strukturert mengde i alle flater (ikke fritekst) | `docs/KARTLEGGING-TRENINGSPLANLEGGING.md:164,295` |
| Turneringstype som databasefelt | `docs/KARTLEGGING-TRENINGSPLANLEGGING.md:291` |
| Dra periodedatoer på tidslinjen | `docs/KARTLEGGING-TRENINGSPLANLEGGING.md:153` |
| Eksport av årsplan | Skjermliste PH-24 |
| Lagring av «Egen»-merke og gjentakelsesregel som egne felt | Beslutningene 28.09, punkt 9 |

---

## 5. Brukerflytene

Hver flyt har tre lag: hva som skal skje (dok), hva koden gjør i dag (kode), og hva som lagres.

### a. Lage årsplan med perioder

**Skal (dok: skjermliste PH-11-AR/NY, beslutningene 28.09):**

1. Spiller eller coach åpner nivået År. Uten plan er «Opprett årsplan» eneste knapp.
2. Veilederen spør først om utgangspunkt: kopi av fjoråret, standardplan, gruppas årsplan eller tom.
3. Deretter tidsrom (forslaget er aug–jun for WANG, ellers jan–des), og til slutt navn.
4. Årsplanen vises som et tynt tekstbånd med perioder. Under ligger et lag med samlinger, testuker og ferie.
5. Hver periode viser kilden: FRA GRUPPA, FRA ANDERS eller EGEN.
6. «Ny periode» åpner periodeskjemaet: type, fra/til, fokus, timer per akse og notat.

**Koden i dag:**

1. Sesongkart → «Opprett årsplan» kaller `createSeasonPlan` med tom plan (`wb-actions.ts:329`). Raden lagres i `SeasonPlan` med `year` = startåret.
2. «Ny periode» kaller `saveSeasonPeriod`. Perioden må ligge innenfor årsplanen, og lagringen skjer i en streng transaksjon (`periode-core.ts:39-64`).
3. Veilederen, standardplan og gruppas plan som utgangspunkt finnes ikke.

**Lagres:** `SeasonPlan` (navn, start, slutt, år). `PeriodBlock` (type, datoer, fokus, `weeklyVolMin`/`Max`, `weeklySessionBudget`).

### b. Planlegge en uke

**Skal (dok: WB3.jsx.txt:132-152):**

- *Fra mal:* velg øktmal i sidefeltet og dra den inn på et klokkeslett.
- *Fra bibliotek:* velg akse først, deretter øvelse fra en filtrert bank, og dra inn. «Egen øvelse» åpner AK-formelskjemaet.
- *Rett i kalenderen:* på desktop dras en akse ut og slippes på et klokkeslett. På mobil trykker man aksen og deretter klokkeslettet. Så kommer arket «Gjenta?», så «Legg inn», og en kvittering med «Angre».
- Bunnlinjen viser planlagt mot fordelt tid per akse.

**Koden i dag:**

- Ukeverksted har «Ny økt», «+» i en time og drag fra kilder på desktop (`WorkbenchUkeverksted.tsx:79,85-96,127,155`).
- Økten lagres som utkast. Ukeplan og treukerssyklus virker.
- Mobil mangler dra og slipp.

**Lagres:** `WorkbenchSession` (status `DRAFT`, `origin` PLAYER eller COACH). `WorkbenchDrill` med `akFormel` og `detaljer`. `WeekPlan`.

### c. Gjenta en økt og endre én eller alle

**Skal:** arket «Gjenta?» har valgene Ikke gjenta · Hver uke · Annenhver uke · Valgte dager · Til dato · Ut perioden. Trykker man på en gjentatt økt, velger man «Endre bare denne» eller «Endre alle framover» (dok: WB3.jsx.txt:146-153).

**Koden i dag:**

- Hver uke i 1–26 uker (`createSessionSeries`).
- Hver n-te uke via «Flytt, kopier eller gjenta» (`plan-handlinger-kontrakt.ts:12-15`).
- Endring gjelder DENNE, DENNE_OG_FREMOVER eller HELE_SERIEN for innhold og sletting, men aldri tid og dato (`operations.ts:145-176`).
- Serien lagres med `seriesId` og `seriesIndex`. Selve regelen («annenhver til 15.12») lagres ikke.

### d. Flytte, kopiere og slette med Angre

**Skal (dok: `docs/planer/workbench-rest-designkontrakt-2026-10-02.md:11`):**

- Brukeren ser måluke, berørte økter og konflikter før handlingen utføres.
- En kopi får nytt opphav og tar ikke med gjennomføringslogg.
- Angre bevarer nyere endringer og viser konflikt hvis noe er endret siden.

**Koden har to veier med ulike regler:**

| | `moveSession` (dra og slipp, øktark) | `flyttWorkbenchPlanOkt` (Flytt/kopier/gjenta) |
|---|---|---|
| Fil | `wb-actions.ts:1595` | `plan-handlinger-actions.ts:42` |
| Coach kan flytte spillerens økt | Ja | Nei, coach kan bare foreslå en kopi (`:46`) |
| Konfliktsjekk | Nei | Ja: overlapp, opptatt tid, gruppetimer, turnering og reise. Ved konflikt blir økten et utkast |
| Over midnatt | Godtas (23:30 + 120 min) | Avvises |
| Angre | Knapp i kvitteringen | 15 minutter, bare for den som gjorde handlingen |

**Sletting:** økter med gjennomføringshistorikk kan ikke slettes. En gruppekopi skjules (`hiddenByPlayer`) i stedet for å slettes (`wb-actions.ts:1848-1866`).

### e. Publisere, og forskjellen på utkast og publisert

- **Utkast** (`DRAFT`) ser bare den som planlegger. Spillerens I dag og Plan viser bare publiserte, pågående, gjennomførte og hoppet over-økter (kode: `src/lib/workbench/wb-map.ts:137`).
- **Publisert** (`PUBLISHED`) vises for spilleren og kan startes. Publisering lagrer `publishedAt` og `publishedBy`.
- «Publiser · N» publiserer alt eller ingenting (`wb-actions.ts:1630`). «Trekk tilbake» gjør økten til utkast igjen (`:1673`).
- **Viktig:** økter spilleren selv lager blir også utkast, og spilleren må publisere sin egen økt for å se den i I dag (kode: `operations.ts:104`). Se M3 og spørsmål 2.
- Gruppeutkast er usynlige for medlemmene til coachen publiserer (dok: WB3.jsx.txt:120. Kode: `group-scope.ts:10`).
- Publisering varsler ikke spilleren (kode: ingen varselkall i `wb-actions.ts`).

### f. Gjennomføre en økt

**Skal:**

1. I dag → «Start» → live-økt med økt- og øvelsesklokke og fire tellere per øvelse (Uten ball · Lav hastighet · Automatikk · Slag) mot plan. Neste øvelse åpnes automatisk.
2. Etter økta: belastning 1–10 og fokus 1–10 for golføkt, eller «Hvor tungt» 1–10 for fysisk økt (dok: beslutningene 28.09 runde 8, Live-økt).
3. Fasen (start, pause, fullfør, avbryt) holdes adskilt fra lagringsstatus.
4. Avbrutt og avlyst er ulike tilstander. Etterregistrering krever årsak (dok: workbench-rest-designkontrakt:12).

**Koden har to veier:**

- **Vei A (I dag):** `/portal/live/[id]/brief` → `tapper` → `summary`.
  - `startPlanSession` setter `IN_PROGRESS`. «Avslutt» setter bare `COMPLETED`, uten faktisk tid (`tapper/actions.ts:60`).
  - Slagtelleren sender økningen (+1 eller +5) og lagrer den som totalt antall (`PH06Slagteller.tsx:54-64` mot `tapper/actions.ts:63-79`).
  - Oppsummeringen viser hardkodede tall (`src/lib/portal-live/load-ph04-07.ts:286-293`).
  - Notatet lagres bare for den gamle økttypen og går tapt uten feilmelding for Workbench-økter (`summary-field.ts:10-15`, `summary/page.tsx:49-57`).
- **Vei B (Workbench «Gjennomfør økta» eller `/portal/tren/wb/[id]`):**
  - `mutateSessionExecution` lagrer pause, fortsett, fullfør, avbryt og etterregistrering, med hendelseslogg, faktisk tid og opplevd belastning (`wb-session-life-actions.ts`).
  - `OktArk` fyller feltet for faktisk tid med planlagt tid (`OktArk.tsx:44`).

**Hvordan registrert tid kommer tilbake i planen:** bare økter med status `COMPLETED` *og* `actualMinutes` teller som registrert tid. Gjennomførte økter uten tid telles som «ukjent» (`treningsvolum.ts:95-98,144-150`). Vei A gir derfor alltid «Registrert —».

### g. Planlagt mot registrert per dag, uke, periode og sesong

- Uke, periode, måned og sesong summeres i `workbench-samlet-data.ts:111,144-187` og vises i `TreningsvolumVisning`.
- Dag har ingen sum, bare per økt.
- Planlagt tid, registrert null, ukjent, fremtidig og eldre anslått tid holdes adskilt (dok: `workbench-fullforing-2026-10-02.json` R07.3). Eksempel: 60 minutter planlagt og 45 gjennomført teller som 45 overalt.
- Etterlevelse: minutter gjennomført mot planlagt, siste 28 dager. Fullført teller hele planlagt varighet (kode: `src/lib/domain/etterlevelse.ts`). Antatt avvik: når faktisk tid finnes, burde den kanskje telle i stedet. Bør avklares sammen med M12.

### h. Gruppeøkt med tilpasning for én spiller

1. Coach: Trenerbord → «Gruppeøkter» → velg øvelse, dato og tid → `saveGroupWorkbenchSession`. Originalen lagres som utkast, eid av coachen, med id `wb-group-…` (`group-session-actions.ts:67`).
2. «Publiser» kopierer økten til hvert aktive spillermedlem (`wb-group-copy-…`, publisert, `sourceGroupSessionId`).
3. Spilleren eller coachen endrer kopien. Da settes `localOverride`, og neste gruppepublisering lar den være i fred. Dette er «Egen».
4. Spilleren sletter kopien. Da skjules den (`hiddenByPlayer`) i stedet for å slettes.
5. En spiller som meldes ut, får publiserte kopier satt tilbake til utkast.

Designet sier at endringer i gruppeplanen slår gjennom til alle som ikke har egen versjon (dok: WB3.jsx.txt:155). Koden gjør det samme ved ny publisering.

### i. Turnering med reisedager og konkurransedager

- **Spiller:** I dag → «Legg til turnering» (dok: PH-01). I Workbench åpner `?pille=turn` turneringsplanarket, som kan lagre (kode: `AG11Moduler.tsx:250-262`).
- **Coach:** AG-WB-TURN har konfliktstripe, format, reisedager, runder og forberedelse dag for dag. Hvert forberedelsespunkt kan være synlig eller skjult for spilleren. Etter turneringen kommer brutto score, SG og «Lag tiltak» (dok: `designsystem/precision-athletics/overlevering/workbench-fys-turnering-2026-09-27.md`).
- **Lagres:** `WorkbenchTournamentPlan` (reisedatoer, fokus, prioritet), `…Round` (unik per rundenummer, brutto score), `…Preparation`, `…Goal` og `…Evaluation`. Konflikter lagres i `WorkbenchPlanConflict` (type REISE, SKOLE, TURNERING, TESTUKE, BELASTNING eller DOBBELBOOKING).
- Runder må ligge innenfor turneringsdatoene. Reise krever både fra- og til-dato (kode: `turneringsplan-kontrakt.ts`).
- Påmeldinger under `/portal/tren/turneringer` er et eget, eldre system (`TournamentEntry`) i det gamle skallet.

### j. Forslag mellom spiller og coach

| Retning | Skal | Koden i dag |
|---|---|---|
| AI → spiller | Spilleren godkjenner selv, og «Send til coach» fjernes (beslutningene 28.09) | AI-ukeforslag kan tas i bruk av spilleren (`applySuggestedWeek`). «Send til coach» finnes fortsatt i planbyggeren. |
| AK-coach → spiller | Coach endrer direkte, og spilleren kan angre (beslutningene 28.09) | Kopi og gjenta blir forslag med `needsPlayerApproval`. Spilleren svarer med Godta eller Avslå. Avslag skjuler økten. Ved dra og slipp flytter coachen økten direkte. |
| WANG/TN → spiller | Forslag med før og etter, begrunnelse og planversjon. Godtas eller avvises samlet, én gang. Er planen endret siden, blir det konflikt (`docs/design-handoff/regler/overforing-wang-tn.md:6`) | `lagTrenerforslag` → `PlanAction` → `svarPaTrenerforslag`. Konflikt gir status CONFLICT (kode: `trenerforslag.ts`). |
| Spiller → coach | «Be coach endre planen» (mulighetskart B8). Ny teknisk plan sendes som forslag (WB3.jsx.txt:94) | `createPlanChangeRequest` har ingen skjerm. |

### k. Fra analyse eller test til tiltak i planen

- **Skal:** AG-15 Testdetalj → coachens tre valg → «Legg i økt» → utkast i Workbench → kilden vises på øktkortet (dok: `overlevering/codex.md` §15). Turneringsevalueringen har «Lag tiltak».
- **Koden:** Stats-flaten i samlet Workbench viser runder, tester og TrackMan i valgt periode. Coach skriver vurdering, velger øvelse A eller B, og en serie med utkast lages (`createSessionSeries`). Tiltaket kan angres med `deleteSessionSeries` (`WorkbenchAnalyse.tsx:31-41`).
- Kildemerket «Fra test» på øktkortet finnes ikke.

### l. Fysisk program i samme plan

- **Skal:** fysisk trening og turneringer ligger i samme plan. Egne kalender-, fysisk- og turneringssider utgår (dok: beslutningene 28.09 runde 8).
  - «Legg til fysisk program» legger inn faste økter ut perioden (dok: WB3.jsx.txt:85-99).
  - AG-WB-FYS har blokker, ukevolum, tonnasje (kg løftet totalt), RIR, Publiser, Trekk tilbake og Angre.
  - Spilleren fører sett, repetisjoner og kg.
- **Koden:** egne tabeller `WorkbenchPhysicalBlock`, `…Week`, `…Session`, `…Exercise` og `…Log`, med handlinger i `fys-turnering-actions.ts`.
  - Spilleren har bare lesing (`workbench/page.tsx:82`).
  - Ifølge backend-planen 05.10 mangler tabellene i produksjonsbasen (dok: fila nevnt under A1).

---

## 6. Regler

### 6.1 Hvem eier planen, og hvem kan endre hva

| Regel | Kilde |
|---|---|
| Spilleren eier sin plan og kan alltid bygge økter selv | Dok: beslutningene 28.09 runde 8 (Motoren) |
| AK-coach kan endre uten spillerens godkjenning, men spilleren kan angre | Dok: samme sted |
| Spiller uten coach: Anders ser ikke planen og kan ikke skrive til den | Dok: samme sted |
| WANG og Team Norway foreslår, og spilleren bestemmer | Dok: beslutningene 28.09 §ÉN IUP |
| Skole- eller testdeling gir ikke skriverett til den personlige planen | Dok: workbench-rest-designkontrakt:22 |
| Bare spilleren kan endre egne hendelser (opptatt tid) | Kode: `WorkbenchUkeverksted.tsx:150` |
| Spilleren kan bare endre turneringsplaner hen har laget selv | Kode: `turneringsplan-actions.ts:26` |
| Coach kan ikke flytte spillerens økt via «Flytt», men kan via dra og slipp | Kode: `plan-handlinger-actions.ts:46` mot `wb-actions.ts:1595` |
| Gruppeplan krever rettigheten `EDIT_GROUP_PLANS` pluss eierskap eller aktivt trenermedlemskap. Assistenter kan ikke redigere | Kode: `src/lib/workbench/group-scope.ts:15` |
| Økonomi og visse flater bare for head coach | Dok: beslutningene 28.09. Rollen finnes ikke i koden (`UserRole`) |

### 6.2 Varsling

| Regel | Kilde | I koden |
|---|---|---|
| Coach varsles når spilleren endrer en turnering eller en økt coachen la inn | Beslutningene 28.09 | Mangler |
| Flytting i kalenderen varsler spillerne, med angre i 10 sekunder | Beslutningene 28.09 | Mangler |
| Over 130 % eller under 70 % to uker på rad gir forslag og varsel til coach | Beslutningene 28.09; skjermliste PH-10 | Mangler |
| Samlingsinvitasjon varsler alle aktive medlemmer | — | Virker (`samlingsinvitasjon-actions.ts:174`) |
| Jarvis forbereder alt og sender ingenting. Alt som når et menneske krever Anders' ja | Beslutningene §Produkt og tilgang | Gjelder agentene, ikke planendringer |

### 6.3 Publisering, konflikter og Angre

- **Publisering:** kjeden er utkast hos coach → valgt økt eller revisjon → publisert øyeblikksbilde → spillerens visning. «Nyere utkast skal aldri lekke automatisk» (dok: `docs/design-handoff/regler/spesifikasjon-workbench-og-datakontrakt.md:23`). Koden publiserer alt eller ingenting med lås (`wb-actions.ts:1630`).
- **Konflikt:**
  - Er konsekvensen uklar, lagres endringen som utkast og ingenting slettes (dok: R06.5. Kode: `plan-handlinger-actions.ts:58`).
  - To samtidige lagringer gir én lagring. Låsen er feltet `updatedAt` (sist endret), siden versjonsfelt ikke finnes (kode: `wb-actions.ts:1622` m.fl.).
- **Angre:** skal reversere handlingen der det faktisk støttes. «Avvis» er ikke Angre (dok: masteren 282–283). I koden kan bare den som gjorde handlingen angre den (`plan-angre-token.ts:26`), så spilleren kan ikke angre coachens endring. Se M2.

### 6.4 Tilgang og deling

| Regel | Kilde |
|---|---|
| Workbench krever nivået FULL (299 kr/mnd). TALENT ser I dag uten plan | Kode: `requirePortalUser.ts:39`; `src/app/portal/page.tsx:54,57` |
| Coach ser bare egne spillere (stall eller gruppe) | Kode: `src/lib/auth/coached.ts:80-104`; `wb-actions.ts:167-176` |
| Coach ser bare «Opptatt» og klokkeslett for spillerens private avtaler, aldri tittel | Dok: beslutningene 28.09; kode: personverntester `workbench-personvern` |
| Innsyn for WANG og TN krever uttrykkelig deling: spilleren sender lenke til @wang.no eller @golfforbundet.no, lenken varer i sju dager, og forelder godkjenner under 16 år. Trekkes delingen, mister treneren tilgangen med en gang | Dok: beslutningene 28.09 §ÉN IUP |
| Automatisk trenerinnsyn uten ja fra spiller eller forelder venter på juridisk avklaring | Dok: beslutningene 04.10 |
| TN-flaten sjekker navngitt samtykke (`medNavngittProfil`). Tilbaketrukket deling stopper nye forslag | Kode: `src/lib/deling/navngitt.ts`; test `trenerforslag` |
| **Hull:** en coach som er aktivt trenermedlem i spillerens gruppe, får full skrivetilgang i `/admin/workbench/[spiller]` uten samtykke. Dette gjelder også WANG- og TN-grupper | Kode: `src/lib/auth/coached.ts:96-102` (tredje gren). Bryter beslutningene 28.09 og 04.10 |

---

## 7. Data

### 7.1 Tabeller og felt

Status lagres oftest som tekst og kontrolleres i koden med zod, et valideringsbibliotek (kode: `src/lib/domain/workbench/schemas.ts`).

**`SeasonPlan`: årsplanen**

| Felt | Betyr |
|---|---|
| `userId` | Spilleren planen gjelder |
| `year` | Startåret. Unik sammen med spilleren, så hver spiller kan ha én plan per startår |
| `name`, `startDate`, `endDate`, `notes` | Navn, fra, til, notat |
| *(mangler)* `createdById` | Hvem som laget planen. Besluttet 28.09 |

**`PeriodBlock`: periode i årsplanen**

| Felt | Betyr |
|---|---|
| `lPhase` | Periodetype (GRUNN, SPESIAL, TURNERING, EVALUERING, FERIE, RESTITUSJON m.fl.) |
| `startDate`, `endDate`, `focus` | Fra, til, fokus i fritekst |
| `weeklyVolMin`, `weeklyVolMax` | Minutter per uke, laveste og høyeste |
| `weeklySessionBudget` | Økter per akse per uke, f.eks. `{"FYS":4}` |
| `sourceGroupId` | Fylt når perioden er rullet ut fra en gruppe |

**`GroupPeriodBlock`** har samme felt for gruppas årsplan. **`GroupPeriodGoal`** er elevens fokus per periode i WANG, med status og egen- og trenervurdering 1–5.

**`WeekPlan`: uka**

| Felt | Betyr |
|---|---|
| `playerId`, `isoYear`, `weekNumber` | Spiller og ISO-uke (unik kombinasjon) |
| `weekType` | UTVIKLING, VEDLIKEHOLD eller TURNERING |
| `plannedHoursFys` … `plannedHoursTurn` | Planlagte timer per akse |
| `notes` | Merker som FERIE, TEST, SAMLING |
| `loadCeiling` | Belastningstak (bare veiledende) |
| `planningDetails` | Prioritet, fokus og budsjett per akse, og eventuell treukerssyklus |

**`WorkbenchSession`: økten**

| Felt | Betyr |
|---|---|
| `playerId`, `coachId`, `groupId` | Hvem økten gjelder, hvem som eier den som coach, og gruppe |
| `date`, `startMinute`, `durationMinutes` | Dag, start i minutter etter midnatt, varighet |
| `title`, `pyramid` | Navn og akse |
| `status` | DRAFT (utkast), PUBLISHED (publisert), IN_PROGRESS (pågår), COMPLETED (gjennomført), SKIPPED (hoppet over), CANCELLED (avlyst), ABANDONED (avbrutt) |
| `blockType` | OEKT, GRUPPEOEKT, SKOLE, BOOKING, TURNERING, REISE, TEST, SJEKKPUNKT, HELSE |
| `origin` | PLAYER, COACH eller GROUP: hvem som la inn økten |
| `sourceGroupSessionId`, `localOverride` | Kopi av gruppeøkt / spilleren har endret kopien («Egen») |
| `needsPlayerApproval`, `approvalStatus` | Forslag som venter på spilleren (PENDING, ACCEPTED, REJECTED) |
| `publishedAt`, `publishedBy` | Når og av hvem økten ble publisert |
| `seriesId`, `seriesIndex` | Gjentatt økt og plass i serien |
| `isTemplate` | Lagret som øktmal |
| `hiddenByPlayer` | Skjult av spilleren (slettes ikke) |
| `isAgentProposal`, `planActionId` | Forslag fra agent (brukes ikke i dag) |
| `actualMinutes`, `perceivedEffort` | Registrert tid og opplevd belastning 1–10 |
| `liveSnapshot` | Tilstanden under live-økt, med hendelseslogg |
| `maalsetning`, `rationale`, `skillArea`, `pPosisjoner` | Mål for økten, begrunnelse, område og P-posisjoner (fra OW-3) |
| `lFase`, `miljo`, `csNivaa` | Utgåtte v1-koder, bare for historikk |

**`WorkbenchDrill`: øvelsen**

| Felt | Betyr |
|---|---|
| `title`, `description`, `durationMinutes`, `sortOrder` | Navn, beskrivelse, minutter, rekkefølge |
| `akFormel` | JSON med akse, område, læringssteg, miljø, press, og `detaljer` med de åtte valgene |
| `techniqueFocus` | Teknisk fokus |
| `exerciseId` | Kobling til øvelsesbanken |
| `repType`, `repAntall`, `repMinutter`, `repSett`, `repReps` | Mengde |
| `positionTaskId` | Oppgave i teknisk plan |

**Andre tabeller Workbench bruker**

- **`WorkbenchPhysicalBlock` / `Week` / `Session` / `Exercise` / `Log`:** fysisk program med seksukersblokker, ukevolum, tonnasje, sett, reps, kg, RIR og det spilleren har ført.
- **`WorkbenchTournamentPlan` / `Preparation` / `Round` / `Goal` / `Evaluation`:** turneringsplan med reise, runder (brutto score og SG), forberedelse, mål og evaluering.
- **`WorkbenchPlanConflict`:** konflikt med type, alvorlighet og løsning (OPEN, ACCEPTED, MOVED, DISMISSED).
- **`PlanTemplate` og `PlanTemplateSession`:** maler per kategori og periodetype, med prosent per akse og varighet i uker.
- **`ExerciseDefinition`:** øvelsesbanken, med kilde (SYSTEM, COACH, PLAYER), synlighet og AK-formelfelt.
- **`PlanAction`:** forslag fra agent eller trener, med status PENDING, ACCEPTED eller REJECTED, før- og etterbilde og opphav.
- **`Goal`:** målsetning (resultat eller prosess), status, nådd-dato og kobling til akse eller test.
- **`TestResult` og `TestAssignment`:** testresultat og test tildelt av coach.
- **`Group`, `GroupMember` og `GroupSchedule`:** gruppe, medlemskap (`endedAt` tom betyr aktiv) og faste gruppetider.
- **`DelingsSamtykke` og `TrenerDelingsInvitasjon`:** samtykke til deling. Tilbaketrekking lagres som ny rad, og lenkenøkkelen lagres bare som avtrykk.
- **`PlayerBusyBlock`:** opptatt tid.
- **Eldre økttabeller:** `TrainingPlan`, `TrainingPlanSession` og `TrainingSessionV2`, se §7.3.

### 7.2 Hvordan data leses og skrives

Workbench har nesten ingen egne API-adresser. Den bruker *server-handlinger*, det vil si funksjoner som kjører på serveren og kalles direkte fra skjermen.

| Fil | Viktigste handlinger | Tabeller |
|---|---|---|
| `src/lib/workbench/wb-actions.ts` | `createSeasonPlan`, `saveSeasonPeriod`, `deleteSeasonPeriod`, `loadWeek`/`Month`/`Year`/`Period`, `saveWeekPlan`, `createSession`, `createSessionSeries`, `createSessionFromSource`, `moveSession`, `publishSessions`, `unpublishSession`, øvelser (legg til, endre, sorter, fjern), `deleteSession`, `updateSeriesSession`, `start`/`complete`/`skipSession`, `resolvePlayerApproval` | WorkbenchSession, WorkbenchDrill, SeasonPlan, PeriodBlock, WeekPlan |
| `wb-session-life-actions.ts` | `mutateSessionExecution` (pause, fortsett, fullfør, avbryt, etterregistrer) | WorkbenchSession |
| `plan-handlinger-actions.ts` | `flyttWorkbenchPlanOkt`, `kopierWorkbenchPlanOkt`, `angreWorkbenchPlanHandling` | WorkbenchSession, turneringsplan, GroupSchedule |
| `group-session-actions.ts` | Gruppeøkt: lagre, publisere, trekke tilbake | WorkbenchSession, GroupSchedule |
| `gruppe-periode-actions.ts` | Gruppeperioder, rull ut gruppeårsplan | GroupPeriodBlock, SeasonPlan, PeriodBlock |
| `fys-turnering-actions.ts`, `turneringsplan-actions.ts` | Fysisk blokk, økt og sett. Turneringsplan og runder | WorkbenchPhysical\*, WorkbenchTournament\* |
| `hendelser-actions.ts`, `treukerssyklus-actions.ts`, `workbench-samlet-sesong-actions.ts` | Opptatt tid, treukerssyklus, årsplanens grenser | PlayerBusyBlock, WeekPlan, SeasonPlan |
| `trenerforslag.ts`, `samlingsinvitasjon-actions.ts` | WANG/TN-forslag, samlinger | PlanAction, WorkbenchSession |

API-adressene som berører plan er `src/app/api/ai-plan/generate/route.ts`, `api/admin/ai-plan/route.ts` og `.../batch/route.ts` (alle via den gamle `TrainingPlan`), og `api/portal/live/[sessionId]/snapshot/route.ts` (gammel `TrainingPlanSession`). Ingen API-adresse skriver `WorkbenchSession` (kode: grep, se rapport fra datalesingen).

### 7.3 Tre øktmodeller samtidig

`WorkbenchSession` skal bli den ene økttabellen (dok: beslutningene §Workbench). Sammenslåingen OW-3 har gjort fase 3 av 6 (kode: commit `4ed8a5c54` 28.09). Det gamle lever fortsatt:

- `TrainingPlanSession` brukes fra omtrent 60 filer.
- Agentenes forslag, malutrulling og live-snapshot skriver til den gamle tabellen.
- Kalenderens ukevisning leser `TrainingSessionV2`.

`docs/platform/AGENT-BRIEF.md:57` sier fortsatt «fase 1–2 er gjort».

### 7.4 Endringer siste 60 dager

114 commits rørte Workbench-filene mellom 6.8. og 5.10 (kode: `git log --since="60 days ago"`). Hovedlinjene:

- **Grupper og utrulling (15.–16.08):** kildesporing (`462b7d122`), varsel til coach ved planendring (`17156a8d3`).
- **Treningsregler låst opp (18.08):** alle invarianter fjernet (`70b366e0e`).
- **Datamodell, dra og slipp, serie, godta/avvis (20.–26.08):** `e7c0d6d98`, `1616ff457`, `396cb51bf`.
- **Train-lock-porteringen (25.08–04.09):** nå utgått.
- **Tilgang og Oslo-tid (13.09):** `224c323a8`, `4940472e2`.
- **Én motor for coach og spiller, OW-3 fase 1–2 (16.–17.09):** `5fe35d7fb`, `a235444b0`.
- **Faglig innhold (22.–28.09):** P-posisjoner, ukeplan som eget objekt (`e29205fe9`), fysisk plan og turnering (`aa5e88bc1`), OW-3 fase 3 (`4ed8a5c54`), periodenavn og Restitusjon.
- **Precision-porteringen (29.09–04.10):** fire visninger, felles etterlevelse (`6e447b420`), treukerssyklus, trenerforslag (`98ae25807`), samlingsinvitasjoner (`e098278b9`), PH-11 for spiller (`a27eae681`).

---

## 8. Tilstander og kanttilfeller

| Tilstand | Skal | Koden i dag |
|---|---|---|
| **Tom plan** | Uten årsplan er «Opprett årsplan» eneste handling. En tom uke viser «Uke 40 er tom» (dok: skjermliste:125; WB3.jsx.txt) | Sesongkart viser advarsel og knappen. En tom dag viser «Ingen økter denne dagen». Ny uke starter tom |
| **Første gang** | Veileder trinn for trinn som kan hoppes over, deretter «?» på hvert nivå (dok: grillingen runde 8 §2) | Ingen egen førstegangsflyt |
| **Utkast** | Bare synlig for den som planlegger | Som designet, men spillerens egne økter blir også utkast (se M3) |
| **Publisert** | Synlig for spilleren og kan startes | Virker. Ingen varsel |
| **Ingen tilgang** | Spiller under FULL ser låst plan. Fremmed coach avvises | `requirePortalUser` og `kreverTilgangTilSpiller`. Personverntester låser alle åtte visninger |
| **Trukket deling** | Treneren forsvinner med en gang | Gjelder TN-flaten og trenerforslag. AgencyOS-veien sjekker ikke samtykke (§6.4) |
| **Lagringsfeil** | «Workbench kunne ikke lastes. Endringer som ikke er lagret ligger på enheten og sendes når nettet er tilbake» (dok: WB3.jsx.txt:124) | Kvittering med feil og «Prøv igjen» (`useUkeMotor.ts:66-79`). Ingen lokal kø. Slagteller og oppsummering svelger feil uten beskjed |
| **Samtidig endring fra to enheter** | To samtidige lagringer gir én lagring, og den andre får konflikt | Lås på `updatedAt` i de fleste handlinger. `moveSession` sjekker mot sin egen lesing, ikke klientens versjon. `removeWbSession` har ingen lås, men ser ut til å være død kode (`wb-session-write.ts:201-213`) |
| **Uke 53 og årsskifte** | ISO-uke etter norsk kalender | Håndtert og testet for 2020–2030 (`ukeplan-schema.ts:51-58`, `uke-helpers.ts:67-74`) |
| **Sesong over årsskiftet (aug–jun)** | Planen skal gjelde hele skoleåret | **Feil:** samlet Workbench henter årsplan på kalenderåret til valgt uke (`workbench-samlet-data.ts:76-77`, `wb-actions.ts:938,1021`). En uke i februar 2027 finner ikke planen som startet august 2026. I tillegg kan en kalenderårsplan for 2026 og en skoleårsplan som starter i 2026 ikke finnes samtidig (`SeasonPlan` er unik på spiller og år) |
| **Økter over midnatt** | Ikke avklart i dokumentene | Flytt/kopier avviser. `createSession`/`moveSession` sperrer bare start etter 23:30. Overlappsvarselet ser bare samme dag (`operations.ts:57,696-707`) |
| **Sommertid** | Ingen dag hoppes over eller dobles | Håndtert. Klokkeslett som ikke finnes eller finnes to ganger avvises (`hendelser-kontrakt.ts:13-20`) |
| **«—» mot 0** | «—» betyr at verdien mangler, 0 betyr målt null (dok: handoff; gotchas) | Holdes adskilt i registrert tid, etterlevelse og belastning. Unntak: tonnasje teller tomme felt som 0 (`fys-turnering-kontrakt.ts:88-93`), og AG11Moduler viser 0 kg som «—» (`AG11Moduler.tsx:52`). `OktArk` gjør planlagt tid til faktisk tid |
| **Endring etter gjennomført** | Krever årsak og historikk | Krever årsak, versjon og forespørsels-ID (`wb-actions.ts:2096-2098`). Framtidig etterregistrering avvises |

---

## 9. Motsigelser mellom kildene

| # | Tema | Kilde A | Kilde B |
|---|---|---|---|
| M1 | **Hvilken Workbench-design gjelder** | Handoff 04.10 og Precision WB3: nivåene År · Periode · Måned · Uke · Økt · Målsetninger (+ Volum) (`docs/design-handoff/design/shared/WB3.jsx.txt:8`) | Eksport 77, valgt 02.10 og bygget: fire visninger Sesongkart · Ukeverksted · Trenerbord · Stats (`docs/design-audit/workbench-samlet-kontroll-2026-10-02.md`; kode `samlet-url.ts`). I tillegg kaller `docs/workbench-handover.md` (20.09, åtte valg) seg «aktiv bestilling» (`AGENT-BRIEF.md:10`, `designsystem/README.md:12-19`) |
| M2 | **Spilleren kan alltid endre egne økter, eller endringer går som forslag** | Spilleren endrer selv. Coach endrer uten godkjenning, og spilleren kan angre (beslutningene 28.09 runde 8) | Planstatus DRAFT → PENDING_PLAYER → ACCEPTED (`docs/platform/BUSINESS-RULES.md:317`). Masteren har statusene «Venter på spiller» og «Venter på coach» (masteren 307). Koden gjør coachens kopi til et forslag (`plan-handlinger-actions.ts:83`), og angre er bundet til den som gjorde handlingen (`plan-angre-token.ts:26`) |
| M3 | **Spillerens egne økter som utkast** | Utkast er et coachbegrep. Spilleren eier planen (beslutningene 28.09) | Alle nye økter blir DRAFT, også spillerens (`operations.ts:104`) |
| M4 | **Coach flytter spillerens økt** | «Den opprinnelige økten flyttes bare av spilleren» (`plan-handlinger-actions.ts:46`) | Dra og slipp lar coach flytte direkte (`wb-actions.ts:1595`) |
| M5 | **WANG/TN kan bare foreslå** | Beslutningene 28.09; `overforing-wang-tn.md:6` | En trener som er medlem i gruppen, får skrivetilgang i AgencyOS (`src/lib/auth/coached.ts:96-102`) |
| M6 | **Innsyn for WANG og TN** | Spilleren deler med lenke og kan trekke tilbake (beslutningene 28.09). Automatisk innsyn venter (beslutningene 04.10) | Gruppen får innsyn automatisk, og det kan ikke trekkes (`docs/design-handoff/README.md:32-37`; `regler/claude-code.md` punkt 3). PH-27 har likevel «Trekk tilgang» |
| M7 | **Hvilket dokument er master** | `docs/treningsplanlegging.md` (AGENTS.md; beslutningene 29.–30.09) | `docs/treningsplanlegging-og-sprak.md:3-5` kaller seg «eneste gjeldende master», og skillen `playerhq-arkitektur` peker dit. Beslutningene §Treningsfag sier at valgtreet eies av `treningsplanlegging-og-sprak-gjennomgang.md` |
| M8 | **Låste treningsregler** | Ingen regel er låst, alt er veiledende (beslutningene §Treningsfag, 18.08) | `treningsplanlegging-og-sprak.md` §2–3 og §11 har faste prosentfordelinger og tak. Skillen `playerhq-agents` har `junior-guard` med maks 4 økter per uke under 16 år |
| M9 | **Pyramiden styrer eller foreslår** | Pyramiden velges først og styrer kategorisering og bank (beslutningene 28.09) | Pyramiden «foreslår område og felt, men låser dem ikke». Området styrer feltene (masteren 454, 498) |
| M10 | **«Send til coach»** | Fjernes (beslutningene 28.09) | Finnes i planbyggeren (`bygger/actions.ts` `sendPlanTilCoachV2`). Status «Venter på coach» står i masteren |
| M11 | **AI-planbygger ved lansering** | Skjules for spillere (beslutningene 28.09, punkt 8) | AI-ukeforslag er synlig for spilleren (`AG11Workbench.tsx:243`) |
| M12 | **Én økttabell** | `WorkbenchSession` er den ene (beslutningene §Workbench; BUSINESS-RULES:180) | BUSINESS-RULES:168: tre modeller «skal ikke slås sammen». Agentforslag, malutrulling og kalender bruker de gamle (§7.3) |
| M13 | **`WorkbenchUke`** | Skal ikke bygges videre (beslutningene §Workbench) | `docs/AARSPLAN-MOTOR-STATUS.md:15` beskriver ukeplanredigering bygget i `WorkbenchUke`. `KARTLEGGING-TRENINGSPLANLEGGING.md:11` sier at ingen ukemodell finnes |
| M14 | **De åtte feltene i en øvelse** | Pyramide · område · sted · måleutstyr · gjennomføring · press · mengde · mål (beslutningene §Treningsfag; masteren 420–431) | «8 + ?»: Pyramide · Område · Motorikk · Belastning · Press · Hensikt · Måte · Målsetning (`docs/workbench-handover.md`) |
| M15 | **Måleutstyr** | Fire valg: Med TrackMan · Uten · Annen radar · Ikke relevant (masteren 585–590; `ovelse-detaljer.ts`) | Seks valg: TRACKMAN, FLIGHTSCOPE, GARMIN_R10, MEVO_PLUS, ANNET, UTEN (`treningsplanlegging-og-sprak-gjennomgang.md:621`) |
| M16 | **Uketyper** | UTVIKLING · VEDLIKEHOLD · TURNERING (`WeekPlan.weekType`; workbench-handover) | UTVIKLING · TURNERING · AVLASTNING · TEST (`AARSPLAN-MOTOR-STATUS.md`). Fire nyere uketyper (`workbench-fullforing` R06.3, avvik X09 åpent) |
| M17 | **Tidsrom i uka** | 05–22 (workbench-handover; Cockpit) | 07–20 (`designsystem/precision-athletics/ui_kits/_shared/data-wb3.js:6`) |
| M18 | **Uten ball** | Eget læringssteg (masteren 599–610; beslutningene §Treningsfag) | En egenskap ved øvelsen, ikke et steg (`BUSINESS-RULES.md:367-369`) |
| M19 | **Utgåtte PR-koder** | PR1–PR5 er utgått (masteren 735) | `sanitizeAkFormel` godtar dem fortsatt, og `createWbSession` skriver `pressureLevel` (`ak-formel.ts:31-43`; `wb-session-write.ts:105`) |
| M20 | **Fysisk og turnering: egne sider eller samme plan** | Samme plan, egne sider utgår (beslutningene 28.09) | Egne flater for spilleren (`overlevering/codex.md` §11). `/portal/tren/turneringer` lever i det gamle skallet |
| M21 | **Hvem endrer fysisk og turnering** | Spilleren endrer alt selv, og coach varsles (beslutningene 28.09) | «Du endrer ikke planen» (AG-WB-FYS/PH-WB-FYS). Anbefaling om at spilleren foreslår og coach godkjenner (codex.md §11). Koden gir spilleren bare lesing av fysisk |
| M22 | **Hvor målsetninger bor** | Workbench › Målsetninger (handoff; beslutningene 28.09) | «Mål bor i Oversikt» (`BUSINESS-RULES.md:334`) |
| M23 | **Samlinger (R13)** | «Planlagt» (`workbench-fullforing-2026-10-02.json`) | Levert i PR #1099 (`arbeidsliste-restoppgaver-2026-10-02.md` C02). Koden har `samlingsinvitasjon-actions.ts` |
| M24 | **Gruppeukeplan** | Finnes ikke i motoren (kommentar i `AG11Gruppe.tsx`) | Finnes: `group-session-actions.ts` og Trenerbord |
| M25 | **Beslutningsfila er utdatert** | Coach kan ikke redigere spillerens perioder. Ingen kan opprette øvelser. To etterlevelsesmål (beslutningene 27.–28.09) | Kode: Sesongkart redigerer perioder, AG14 oppretter øvelser, og etterlevelse er samlet (`compliance.ts:52`) |
| M26 | **UTC-regelen** | Dagsdatoer med `Date.UTC` (gotchas §Tid; kommentar `periode-core.ts:15-17`) | `new Date(year, 0, 1)` i `periode-core.ts:84-85` og i utrullingen av gruppeårsplanen |
| M27 | **Periodenavn** | «Spesialiseringsperiode» er forbudt (beslutningene 28.09) | Brukes i `docs/design/workbench-handover/SKILL.md:36` |
| M28 | **Demodata i live-økt** | Ingen demodata i produksjon (beslutningene 04.10 §LANSERING) | `load-ph04-07.ts:94-145,217,260,286-293` har hardkodede tall |
| M29 | **Spillerens tekniske plan** | «Ny teknisk plan» i spillerens sidefelt (skjermliste PH-11) | Spilleren kan bare sende forespørsel via PH-21 (`spesifikasjon-workbench-og-datakontrakt.md:101`) |
| M30 | **Utdaterte skills** | Beslutningene 28.09 | `playerhq-arkitektur` (planendring via coachens godkjenning), `agencyos-arkitektur` (gammel meny, tema uavklart), `ak-hq-design/references/workbench-design-og-kode.md` (20.09-masteren), og `playerhq-agents` (50 %-terskel, reaksjon på én runde, CS/PR-koder) |

**Totalt: 30 motsigelser.**

---

## 10. Spørsmål til Anders

Dette er bare spørsmål som ikke kan avgjøres ved å lese filene. Hvert spørsmål har en anbefaling.

1. **Hvilken Workbench skal tegnes: nivåene (År · Periode · Måned · Uke · Økt · Målsetninger) eller de fire visningene (Sesongkart · Ukeverksted · Trenerbord · Stats)?**
   *Anbefaling:* bruk de fire visningene som ramme, siden du valgte dem 02.10 og de er bygget. Tegn detaljene fra nivåene inn i dem: Gjenta-arket, «Egen»-merket, øktarket, periodeskjemaet og månedsskjemaet. Da kastes ingenting, og det blir én fasit.

2. **Skal økter spilleren lager selv vises med en gang, uten å måtte publiseres?**
   *Anbefaling:* ja. Spilleren eier planen, og et utkast som spilleren må publisere for seg selv er et ekstra trykk uten nytte. Utkast og «Publiser» bør bare gjelde det coachen lager.

3. **Når AK-coachen endrer spillerens plan, skal endringen gjelde med en gang, eller gå som forslag?**
   *Anbefaling:* med en gang, slik du bestemte 28.09, og med varsel til spilleren. Forslag beholdes bare for WANG og Team Norway. Da kan statusen «Venter på spiller» for AK-coach og koden som gjør kopi til forslag tas bort.

4. **Hvordan skal spilleren angre en endring coachen har gjort, og hvor lenge?**
   *Anbefaling:* fra varselet og i øktarket, helt til økta starter. Angre gjenoppretter forrige versjon, og coachen får beskjed. I dag kan bare den som gjorde endringen angre, og bare i 15 minutter.

5. **Skal en AK-coach som også er trener i en WANG- eller TN-gruppe kunne endre spillerens plan direkte i AgencyOS?**
   *Anbefaling:* nei. Tilgang skal komme fra AK-stallen (avtale eller AK-gruppe). Organisasjonsgrupper gir bare innsyn når spilleren har delt, og bare forslag. Dette bør rettes før lansering, fordi det i dag er et personvernhull.

6. **Kan en spiller ha to årsplaner som overlapper, for eksempel én skoleårsplan fra WANG og én kalenderårsplan fra AK?**
   *Anbefaling:* nei. Én aktiv årsplan om gangen, med fritt tidsrom. Gruppas plan rulles inn i den som perioder merket «Fra gruppa». Det løser feilen ved årsskiftet og passer med «gruppeplanen er grunnmuren».

7. **Skal månedsplanen være med ved lansering?**
   *Anbefaling:* nei, ikke som eget skjema. Vis måneden som lesevisning med planlagt mot gjennomført per akse ved lansering. Bygg månedsskjemaet med evaluering rett etter, når demospillerne har brukt planen noen uker.

8. **Hvilken vei skal «Start økt» gå ved lansering?**
   *Anbefaling:* Workbench-veien (fullfør med faktisk tid og belastning), som virker. Slagtelleren og oppsummeringen fra I dag kobles på den samme lagringen før de vises igjen. I dag lagrer de feil tall eller ingenting.

9. **Skal spilleren kunne lage og endre sitt eget fysiske program ved lansering?**
   *Anbefaling:* ved lansering lager coachen programmet, og spilleren fører sett, reps og kg og kan flytte økter. Spillerens egen redigering kommer etterpå. Beslutningen 28.09 sier at spilleren kan endre alt, så dette er et bevisst, midlertidig unntak du må godta.

10. **Hva er en konkurransedag i planen?**
    *Anbefaling:* hver rundedag i turneringsplanen blir automatisk en konkurransedag i uka, låst mot nye treningsøkter med bare advarsel. Reisedager er egne dager rett før og etter. Begrepet er ikke definert noe sted, og designet trenger det for kalenderen.

---

## 11. Forslag til lanseringsomfang

*Dette er et forslag og ikke besluttet.*

### Må være med ved lansering

1. **Én Workbench-ramme** (spørsmål 1) for spiller og coach, i mobil 390 px og desktop, med tom-, laste- og feiltilstand.
2. **Årsplan:** opprett med fritt tidsrom og to utgangspunkt (tom og kopi av fjoråret), perioder med type, datoer, fokus og budsjett. Feilen med årsplan over årsskiftet rettes.
3. **Uke:** ny økt, øvelse med AK-formel, økt fra mal, bank og forrige uke, gjenta (ukentlig og annenhver), endre én eller alle framover, flytte, kopiere og slette med Angre. Dra og slipp på desktop, og trykk på akse og så klokkeslett på mobil.
4. **Publisering** for det coachen lager. Spillerens egne økter vises direkte (spørsmål 2).
5. **Gjennomføring** gjennom én vei som lagrer faktisk tid og belastning, og planlagt mot registrert per uke, periode og sesong, med «—» for ukjent.
6. **Gruppeplan:** gruppeøkter som arves, med «Egen»-merke synlig i ukevisningen.
7. **Tilgang:** tilgangshullet for WANG- og TN-trenere lukkes (spørsmål 5).
8. **Varsel til spilleren** når coachen publiserer eller endrer, og **varsel til coachen** når spilleren endrer coachens økt eller en turnering.
9. **Ingen demodata:** live-skjermene vises ikke med hardkodede tall.
10. **Turnering:** turneringsplan med reisedager vises i uka.
11. **Produksjonsdatabasen** har tabellene for turnering og fysisk plan, slik at `/admin/workbench/[spiller]` ikke krasjer.

### Kan vente

- Månedsplan med eget skjema og evaluering (spørsmål 7)
- Standardplan A–K og gruppas plan som utgangspunkt for årsplan, og de fem standardplanene
- Gjenta «valgte dager», «til dato» og «ut perioden»
- Spillerens egen redigering av fysisk program (spørsmål 9)
- Justeringsforslag fra de fire signalene, og AI-ukeforslag (skjules ved lansering)
- Google-kalender begge veier
- Felles testdag og planlagte testdager med egen flyt
- «Fra test» som kildemerke, planforslag for hel gruppe, «Be coach endre planen»
- Lokal kø uten nett, eksport av årsplan
- Ferdigstilling av OW-3 (fase 4–6), med agentforslag og malutrulling over på `WorkbenchSession`
- Head coach og assistant coach som egne roller

---

## Vedlegg: filer lest

230 filer er lest helt eller i relevante utdrag. Stier er relative til repoet når ikke annet står.

**Instrukser og regler**

- AGENTS.md
- CLAUDE.md
- docs/platform/AGENT-BRIEF.md
- docs/platform/BUSINESS-RULES.md
- .claude/rules/beslutninger.md
- .claude/rules/gotchas.md

**Språk og treningsmodell**

- docs/treningsplanlegging.md
- docs/treningsplanlegging-og-sprak.md
- docs/treningsplanlegging-og-sprak-gjennomgang.md
- docs/ordbok.md
- docs/KARTLEGGING-TRENINGSPLANLEGGING.md
- docs/AARSPLAN-MOTOR-STATUS.md
- docs/workbench-handover.md
- docs/TERMINOLOGI.md finnes ikke

**Design-handoff 04.10**

- docs/design-handoff/README.md
- docs/design-handoff/regler/treningsplanlegging-master.md
- docs/design-handoff/regler/spesifikasjon-workbench-og-datakontrakt.md
- docs/design-handoff/regler/skjermliste.md (44 KB, lest i utdrag)
- docs/design-handoff/regler/claude-code.md
- docs/design-handoff/regler/kodestatus-2026-10-04.md
- docs/design-handoff/regler/iup-i-playerhq.md
- docs/design-handoff/regler/overforing-wang-tn.md
- docs/design-handoff/design/shared/WB3.jsx.txt
- docs/design-handoff/design/agencyos/AG-360.jsx.txt
- docs/design-handoff/design/agencyos/AG-08-IUP.jsx.txt
- docs/design-handoff/design/playerhq/PH-01.jsx.txt
- docs/design-handoff/design/playerhq/PH-IUP.jsx.txt

**Planer, kontroller og beslutningsgrunnlag**

- docs/planer/workbench-fullforing-2026-10-02.md
- docs/planer/workbench-fullforing-2026-10-02.json
- docs/planer/workbench-rest-designkontrakt-2026-10-02.md
- docs/planer/codex-fullforing-claude-design-2026-09-30.md
- docs/planer/portering-skjermer-2026-09-27.md
- docs/planer/arbeidsliste-restoppgaver-2026-10-02.md
- docs/planer/lanseringsplan-2026-10-01.md
- docs/planer/backend-klar-for-portering-2026-10-05.md (bare i hovedmappen, ikke lagret i Git)
- docs/design-audit/workbench-samlet-kontroll-2026-10-02.md
- docs/design-audit/workbench-okt-og-syklus-kontroll-2026-10-02.md
- docs/design/workbench-handover/manifest.md
- docs/design/workbench-handover/SKILL.md
- docs/beslutningsgrunnlag/grillingen-runde8-skjermer-2026-09-28.md
- docs/beslutningsgrunnlag/mulighetskart-playerhq-agencyos-2026-09-28.md
- docs/beslutningsgrunnlag/ordbok-og-workbench-analyse-2026-09-15.md
- docs/arkitektur/agencyos.md
- docs/platform/user-flows.md
- docs/platform/DATA-MODEL.md

**Designsystem**

- designsystem/README.md
- designsystem/precision-athletics/skjermliste.md
- designsystem/precision-athletics/readme.md
- designsystem/precision-athletics/ui_kits/katalog.js
- designsystem/precision-athletics/ui_kits/_shared/WB3.jsx
- designsystem/precision-athletics/ui_kits/_shared/data-wb3.js
- designsystem/precision-athletics/ui_kits/agencyos/screens/AG-11.jsx
- designsystem/precision-athletics/ui_kits/agencyos/screens/AG-11-wb3.jsx
- designsystem/precision-athletics/overlevering/workbench-fys-turnering-2026-09-27.md
- designsystem/precision-athletics/overlevering/codex.md

**Skills**

- .claude/skills/playerhq-arkitektur/SKILL.md
- .claude/skills/agencyos-arkitektur/SKILL.md
- .claude/skills/ak-hq-design/SKILL.md
- .claude/skills/ak-hq-design/references/workbench-design-og-kode.md
- ~/.claude/skills/playerhq-agents/SKILL.md (global)

**Datamodell og kontrakter**

- prisma/schema.prisma (stor fil, lest i utdrag per modell)
- src/lib/workbench/fys-turnering-kontrakt.ts
- src/lib/workbench/hendelser-kontrakt.ts
- src/lib/workbench/plan-handlinger-kontrakt.ts
- src/lib/workbench/turneringsplan-kontrakt.ts
- src/lib/workbench/samlingsinvitasjon-kontrakt.ts
- src/lib/workbench/ak-formel.ts
- src/lib/workbench/perioder.ts
- src/lib/workbench/ukeplan-schema.ts
- src/lib/workbench/wb-session-life.ts
- src/lib/domain/workbench/schemas.ts
- src/lib/domain/workbench/ovelse-detaljer.ts
- src/lib/domain/workbench/operations.ts
- src/lib/uke-helpers.ts

**Workbench-logikk**

- src/lib/workbench/wb-actions.ts
- src/lib/workbench/wb-session-write.ts
- src/lib/workbench/wb-session-life-actions.ts
- src/lib/workbench/wb-map.ts
- src/lib/workbench/wb-drill-write.ts
- src/lib/workbench/periode-core.ts
- src/lib/workbench/gruppe-periode-actions.ts
- src/lib/workbench/group-session-actions.ts
- src/lib/workbench/group-scope.ts
- src/lib/workbench/session-actions.ts
- src/lib/workbench/plan-handlinger-actions.ts
- src/lib/workbench/plan-angre-token.ts
- src/lib/workbench/plan-tilgang.ts
- src/lib/workbench/plan-kontekst.ts
- src/lib/workbench/publish-actions.ts
- src/lib/workbench/compliance.ts
- src/lib/workbench/trenerforslag.ts
- src/lib/workbench/samlingsinvitasjon-actions.ts
- src/lib/workbench/apply-template-actions.ts
- src/lib/workbench/fys-turnering-actions.ts
- src/lib/workbench/turneringsplan-actions.ts
- src/lib/workbench/bank-referanser.ts
- src/lib/workbench/treukerssyklus-core.ts
- src/lib/workbench/samlet-url.ts
- src/lib/workbench/visning-url.ts
- src/lib/workbench/workbench-samlet-data.ts
- src/lib/workbench/workbench-samlet-typer.ts
- src/lib/workbench/workbench-samlet-volum.ts
- src/lib/workbench/workbench-samlet-sesong-actions.ts
- src/lib/workbench/treningsvolum.ts

**Øvrig domene, tilgang og deling**

- src/lib/domain/etterlevelse.ts
- src/lib/domain/tn-workbench.ts
- src/lib/domain/grupper.ts
- src/lib/portal/etterlevelse-data.ts
- src/lib/portal/plan-data.ts
- src/lib/portal/visible-session-range.ts
- src/lib/portal/workbench-week.ts
- src/lib/portal/session-hrefs.ts
- src/lib/portal/idag-visning.ts
- src/lib/portal-live/resolve-live-session.ts
- src/lib/portal-live/live-route.ts
- src/lib/portal-live/actions.ts
- src/lib/portal-live/load-ph04-07.ts
- src/lib/portal-live/summary-field.ts
- src/lib/auth/coached.ts
- src/lib/auth/requirePortalUser.ts
- src/lib/admin/stallen-scope.ts
- src/lib/admin/stallen-data.ts
- src/lib/deling/profil-lesing.ts
- src/lib/deling/navngitt.ts
- src/lib/actions/drills-actions.ts
- src/lib/agents/plan-revision-actions.ts
- src/lib/agents/accept-plan-action.ts
- src/lib/agents/plan-action-executor.ts
- src/lib/notifications/plan-endring.ts

**Ruter i PlayerHQ**

- src/app/portal/page.tsx
- src/app/portal/layout.tsx
- src/app/portal/actions.ts
- src/app/portal/planlegge/page.tsx
- src/app/portal/planlegge/workbench/page.tsx
- src/app/portal/planlegge/workbench/actions.ts
- src/app/portal/planlegge/bygger/page.tsx
- src/app/portal/planlegge/bygger/actions.ts
- src/app/portal/(fullscreen)/tren/page.tsx
- src/app/portal/(fullscreen)/tren/wb/page.tsx
- src/app/portal/(fullscreen)/tren/wb/[sessionId]/page.tsx
- src/app/portal/(fullscreen)/live/[sessionId]/page.tsx
- src/app/portal/(fullscreen)/live/[sessionId]/brief/page.tsx
- src/app/portal/(fullscreen)/live/[sessionId]/active/page.tsx
- src/app/portal/(fullscreen)/live/[sessionId]/tapper/page.tsx
- src/app/portal/(fullscreen)/live/[sessionId]/tapper/actions.ts
- src/app/portal/(fullscreen)/live/[sessionId]/summary/page.tsx
- src/app/portal/(fullscreen)/live/[sessionId]/logger/page.tsx
- src/app/portal/(fullscreen)/live/[sessionId]/actions.ts
- src/app/portal/kalender/page.tsx
- src/app/portal/kalender/opptatt/page.tsx
- src/app/portal/tren/kalender/page.tsx
- src/app/portal/periodeplan/page.tsx
- src/app/portal/(legacy)/tren/aarsplan/page.tsx
- src/app/portal/(legacy)/tren/[sessionId]/page.tsx
- src/app/portal/(legacy)/ny-okt/page.tsx
- src/app/portal/(legacy)/tren/fys-plan/[planId]/page.tsx
- src/app/portal/fysisk/page.tsx
- src/app/portal/tren/fys-plan/page.tsx
- src/app/portal/live/page.tsx
- src/app/portal/tren/[sessionId]/planlagt/page.tsx
- src/app/portal/tren/turneringer/page.tsx
- src/app/portal/tren/turneringer/[id]/page.tsx
- src/app/portal/tren/tester/page.tsx
- src/app/portal/mal/page.tsx
- src/app/portal/tren/teknisk-plan/page.tsx
- src/app/portal/utviklingsplan/page.tsx
- src/app/portal/talent/min-plan/page.tsx
- src/app/portal/gjennomfore/page.tsx
- src/app/portal/gjennomfore/[id]/page.tsx
- src/app/portal/trening/logg/page.tsx
- src/app/portal/tren/feiring/[planId]/page.tsx
- src/app/portal/onskeligokt/page.tsx
- src/app/portal/coach/plans/page.tsx
- src/app/portal/tren/ovelser/page.tsx

**Ruter i AgencyOS, WANG og Team Norway**

- src/app/admin/workbench/[playerId]/page.tsx
- src/app/admin/plan/page.tsx
- src/app/admin/planlegge/page.tsx
- src/app/admin/plans/page.tsx
- src/app/admin/plan-templates/page.tsx
- src/app/admin/plan/maler/page.tsx
- src/app/admin/plan/teknisk/page.tsx
- src/app/admin/uka/page.tsx
- src/app/admin/okter/page.tsx
- src/app/admin/calendar/page.tsx
- src/app/admin/kalender/page.tsx
- src/app/admin/kalender/data.ts
- src/app/admin/stall/dag/page.tsx
- src/app/admin/grupper/[id]/workbench/page.tsx
- src/app/admin/grupper/[id]/arsplan/page.tsx
- src/app/admin/grupper/[id]/timeplan/page.tsx
- src/app/admin/godkjenninger/page.tsx
- src/app/admin/tester/foreslatte/actions.ts
- src/app/admin/(legacy)/coach-workbench/page.tsx
- src/app/admin/(legacy)/stall/page.tsx
- src/app/admin/(legacy)/tester/tildel/[spillerId]/page.tsx
- src/app/admin/drills/[id]/rediger/page.tsx
- src/app/team-wang/_data/wang-tilgang.ts
- src/app/team-wang/coach/page.tsx
- src/app/team-wang/coach/coach-arsplan.tsx
- src/app/team-norway/workbench/page.tsx
- src/app/api/ai-plan/generate/route.ts
- src/app/api/admin/ai-plan/route.ts
- src/app/api/admin/ai-plan/batch/route.ts
- src/app/api/portal/live/[sessionId]/snapshot/route.ts

**Komponenter**

- src/components/workbench/WorkbenchSamlet.tsx
- src/components/workbench/WorkbenchSesongkart.tsx
- src/components/workbench/WorkbenchUkeverksted.tsx
- src/components/workbench/WorkbenchTrenerbord.tsx
- src/components/workbench/WorkbenchAnalyse.tsx
- src/components/workbench/WorkbenchPlanHandlinger.tsx
- src/components/workbench/WorkbenchHendelserArk.tsx
- src/components/workbench/WorkbenchTreukerssyklus.tsx
- src/components/workbench/WorkbenchTurneringsplanArk.tsx
- src/components/workbench/SamlingsprogramKontroll.tsx
- src/components/workbench/Ukeforslag.tsx
- src/components/workbench/useUkeMotor.ts
- src/components/portal/precision/PH11Workbench.tsx
- src/components/portal/precision/PH10Plan.tsx
- src/components/portal/precision/PH06Slagteller.tsx
- src/components/portal/precision/PH05LiveAktiv.tsx
- src/components/portal/precision/PH07Oktoppsummering.tsx
- src/components/portal/precision/PH12VelgPlan.tsx
- src/components/portal/precision/PH19Enkeltmal.tsx
- src/components/portal/workbench/OktArk.tsx
- src/components/portal/live/PlanSessionBrief.tsx
- src/components/admin/precision/AG11Workbench.tsx
- src/components/admin/precision/AG11Ark.tsx
- src/components/admin/precision/AG11Moduler.tsx
- src/components/admin/precision/AG11Gruppe.tsx
- src/components/admin/precision/AG14PlanHub.tsx
- src/components/admin/precision/AG08Faner.tsx

**Tester:** 104 testfiler med omtrent 633 testtilfeller ble kartlagt ved søk på workbench, periode, årsplan og plan i `src/` og `tests/`. De er ikke kjørt.

**Git:** `git log --since="60 days ago"` på Workbench-stiene ga 114 commits.

**Ikke tilgjengelig:**

- Claude Design-prosjektet kunne ikke åpnes, fordi tilkoblingen avviste innloggingen.
- `designsystem/precision-athletics/ui_kits/_shared/WB3-ar.jsx` og `ui_kits/playerhq/` finnes ikke i repoet, selv om skjermlista peker dit. År, Periode og Måned er derfor bare beskrevet i tekst.
- PNG-bildene og `Workbench WB-05-11.dc.html` i `docs/design/workbench-handover/` er ikke åpnet.
