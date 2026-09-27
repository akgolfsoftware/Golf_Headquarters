# Team Norway — Landslagsflaten

Dato: 26. september 2026
Plassering i kodebasen: `src/app/team-norway/`, `src/components/team-norway/`, `src/lib/domain/tn-*`

---

## 1. Hva Team Norway-flaten er

Team Norway-flaten er en dedikert seksjon bygget for Norges Golfforbund (NGF) og Team Norway Golf. Den skiller seg ut fra resten av AK Golf HQ ved å ha sin helt **egen visuelle autoritet og profil** (beslutning 22.09.2026): Claude Design «Team Norway App» med dyp marineblå (`#012B5D`), signalrød aksent (`#D70232`), lys bakgrunn (`#F2F7FC`), og skrifttypene **Jost** (display) og **Lato** (brødtekst), scoped i `src/app/team-norway/layout.tsx`.

Formålet er å samle fellestesting, referansenivåer, uttakskriterier, samlinger, månedsplaner og en lukket oppslagstavle for landslagets utøvere, trenere og foresatte.

---

## 2. Ruter og struktur (21 ruter)

Alle 21 ruter under `/team-norway` er `page.tsx`-filer:

1. `/team-norway` (rot — overordnet dashbord)
2. `/team-norway/spillere` (workdesk med utøverliste)
3. `/team-norway/spiller/[spillerId]` (tidslinje og dialog for én utøver)
4. `/team-norway/[groupId]` (oppslagstavle for én gruppe)
5. `/team-norway/[groupId]/dokumenter` (delte dokumenter med lesekvittering)
6. `/team-norway/fellestesting` (oversikt over gjennomførte fellestester)
7. `/team-norway/protokoller` (testprotokoll-bibliotek)
8. `/team-norway/protokoller/[id]` (forsøk, mål og målefelt for én protokoll)
9. `/team-norway/referansenivaer` (krav og referansetall fra Excel-v3)
10. `/team-norway/samlinger` (oversikt over treningssamlinger)
11. `/team-norway/samlinger/[id]` (program og innhold for én samling)
12. `/team-norway/manedsplan` (landslagets felles aktivitetsplan)
13. `/team-norway/uttak` (uttakstabell basert på offisielle kriterier)
14. `/team-norway/rangliste` (bruttoresultater og ranking)
15. `/team-norway/turneringer` (turneringsoversikt)
16. `/team-norway/turneringer/ny` (opprettelse av turnering)
17. `/team-norway/skoler` (spillere gruppert etter skole, f.eks. WANG)
18. `/team-norway/college` (oppfølging av utøvere på college i USA)
19. `/team-norway/apparatet` (trenerkatalog for Team Norway)
20. `/team-norway/tilgang` (styring av trenere og sportssjef-tilgang)
21. `/team-norway/inviter` (invitasjon av nye utøvere)

### Tilgang og roller
Tilgang styres på serveren i `src/components/team-norway/tn-registrerte-skjermer.tsx`. Brukeren må være innlogget (`requirePortalUser`), og funksjonen `hentTnArbeidskontekst` krever at brukeren er registrert i den kanoniske Team Norway-gruppen. Utøvere ser sine egne data, mens trenere (`COACH` eller `ADMIN`) har utvidet oversikt.

---

## 3. Datamodeller som brukes

Team Norway oppretter ikke parallelle tabeller for data som allerede finnes i plattformen:

- **Grupper og medlemskap:** `Group` (med slug `team-norway`), `GroupMember`.
- **Kommunikasjon:** `TnPost`, `TnPostAttachment`, `TnPostLesekvittering` (eget datalag i `src/lib/domain/tn-post.ts`).
- **Tester og målinger:** `TestDefinition`, `TestResult`, samt den statiske TypeScript-katalogen `TN_CATALOG` (`tn-excel-v3-2026-09-10`).
- **Turneringer:** `Tournament`, `TournamentEntry`, `TournamentResult`.

---

## 4. Hva som virker faktisk i dag

1. **Gruppeposter og oppslagstavle (`/team-norway/[groupId]`):** Fullt fungerende enveis oppslagstavle. Trenere kan opprette innlegg, og utøvere/foresatte kan lese og avgi lesekvittering (`opprettGruppepostAction`).
2. **Enkeltspiller-dialog (`/team-norway/spiller/[spillerId]`):** Meldingstråd direkte til én utøver. Viser eksplisitt hvem som har innsyn («Synlig for foresatte» dersom utøveren er under 18 år, jf. idrettens åpenhetsprinsipp).
3. **Dokumentdeling med lesekvittering (`/team-norway/[groupId]/dokumenter`):** Filer kan lastes opp og deles i gruppen, med sporing av hvem som har åpnet dokumentet.
4. **Protokollkatalog (`/team-norway/protokoller`):** Henter 18 offisielle testprotokoller definert i `src/lib/portal-tester/tn-catalog.ts`, med direkte lenke til gjennomføring i PlayerHQ.
5. **Tilgangsstyring for sportssjef (`/team-norway/tilgang`):** Sportssjef kan tildele trener- og hjelpetrenerroller med gyldighetsdato, sikret mot degradering av siste aktive trener (`src/lib/domain/tn-tilgang.ts`).

---

## 5. Hva som er stubs eller uferdig

- **Rot-siden (`/team-norway`) er en frittstående mock:** `/team-norway/page.tsx` rendrer `TeamNorwayAppView.tsx` med hardkodede mock-tilstander (knebøy 140 kg, ball speed 176 mph, pakkeliste med avkrysningsbokser). Den er ikke koblet til databasen.
- **Kun ÉN Team Norway-gruppe i databasen:** `src/lib/domain/tn-tilgang.ts` linje 8–15 bekrefter:
  > *«Datamodellen har per 08.09.2026 kun ÉN kanonisk Team Norway-gruppe (`KANONISKE_GRUPPER` i grupper.ts, slug "team-norway", kind "ekstern") — det finnes ingen `Group.parentId` eller annen kobling som samler flere underliggende TN-lag (Junior/Elite/Collegegruppen) under én paraply.»*
- **Uttakskriterium 3 mangler modell:** I `src/components/team-norway/tn-registrerte-skjermer.tsx` linje 90–93 er Kriterium 3 («Prosess og adferd») tomt:
  > *«Trenerens vurdering av arbeid, oppmøte og holdning. Ikke registrert i noen modell i dag — feltet står tomt framfor å gjette. Kilde: ingen — krever godkjent vurderingsmodell.»*
- **Purring av lesekvitteringer:** Knappen «Purr de som mangler» på gruppeposter sender ingenting fordi varslingskanalen (SMS/e-post) ikke er ferdigstilt.
