# Foreldreportal og Innsyn — Arkitekturkart

Dokumentet kartlegger foreldreportalen (`/forelder`) og innsynsflaten (`/innsyn`) i AK Golf HQ per 26. september 2026.

---

## 1. Oversikt og formål

Foreldreportalen og Innsyn ivaretar to distinkte roller utenfor den aktive spiller- og coach-hverdagen:
1. **/forelder (17 ruter — 16 sider + 1 API-endepunkt):** Tilpasset foresatte til juniorspillere. Gir innsyn i barnets treningshverdag, timeplan, samtykkestyring (GDPR art. 8 for spillere under 16 år), booking av timer på vegne av barnet og fakturahistorikk.
2. **/innsyn (11 sider):** Ekstern lesetilgang for samarbeidspartnere (NGF / Team Norway, WANG-speidere) med begrenset `GUEST`-rolle. Gir kun tilgang til anonymiserte eller eksplisitt samtykkede testresultater, talentkriterier og benchmark-tall.

---

## 2. Ruteoversikt

### /forelder (17 ruter)
* `/forelder`: Dagens status for barnet («I dag»), ukens økter, neste booking og oppmøtestatus.
* `/forelder/barn`: Liste over koblede barn, biologisk/golf-alder, HCP og samtykkestatus.
* `/forelder/barn/[childId]`: Detaljert profil for valgt barn med treningshistorikk og skoletidsbekreftelser.
* `/forelder/bookinger`: Oversikt over aktive og historiske protimer for barna.
* `/forelder/bookinger/bekreftet`: Kvittering og detaljer for gjennomført bestilling.
* `/forelder/bookinger/ny`: Startpunkt for å bestille time.
* `/forelder/bookinger/ny/[barnId]`: Velg coach, tjeneste og dato for spesifikt barn.
* `/forelder/bookinger/ny/[barnId]/bekreft`: Oppsummering og bekreftelse av reservasjon.
* `/forelder/coach`: Presentasjon av barnets ansvarlige coach og kontaktinformasjon.
* `/forelder/fakturaer`: Fakturaliste, betalingshistorikk og kvitteringsnedlasting.
* `/forelder/okonomi`: Klippekortoversikt, saldo og gjenstående timer.
* `/forelder/innstillinger`: Forelderens egen profil, varslingspreferanser og passord.
* `/forelder/samtykke`: Hovedoversikt over juridiske samtykker (helse, bilde/video, data).
* `/forelder/samtykke/deling/[childId]`: Granulær styring av hvilke testdata som kan deles med skole/forbund.
* `/forelder/samtykke/eksport` (`route.ts`): API for GDPR-dataeksport av barnets data i JSON-format.
* `/forelder/ukerapport`: Ukentlig sammendrag av gjennomført trening, oppmøte og belastning (ACWR).
* `/forelder/varsler`: Notifikasjonssenter for viktige hendelser og bekreftelser.

### /innsyn (11 sider)
* `/innsyn`: Inngang og velkomst for eksterne observatører.
* `/innsyn/[spillerId]`: Spillerprofil med samtykkede nøkkeltall og tester.
* `/innsyn/talent`: Hovedhub for talentinnsyn.
* `/innsyn/talent/discovery`: Søk og filtrering på spillere etter ferdighetskriterier.
* `/innsyn/talent/kohort`: Sammenligning av årskull og grupper.
* `/innsyn/talent/radar`: Ferdighetsradar basert på standardiserte tester.
* `/innsyn/talent/region`: Geografisk fordeling av spillere.
* `/innsyn/talent/ressurser`: Dokumenter og retningslinjer for talentutvikling.
* `/innsyn/talent/sammenligning`: Side-om-side-sammenligning av utvalgte utøvere.
* `/innsyn/talent/wagr-benchmark`: Internasjonale referansetall mot World Amateur Golf Ranking.
* `/innsyn/talent/wagr-import`: Administrasjon av eksterne benchmark-datasett.

---

## 3. Sikkerhet og tilgangskontroll

Flaten har strenge tilgangskontroller for å hindre uautorisert innsyn i barns data:

1. **Rolle- og relasjonslås (`/forelder`):**
   * Alle ruter krever innlogget bruker med `role = "PARENT"`.
   * En forelder har kun tilgang til barn der det finnes en bekreftet relasjon i databasen: `ParentRelation.approved = true`.
   * Hvis en forelder forsøker å sende inn en annen `childId` i en Server Action, avvises forespørselen momentant.

2. **Kapasitetsbasert tilgang (`/innsyn`):**
   * Bruker `effectiveCapabilities` i stedet for rene roller. Eksterne lesere må ha `Capability.VIEW_SHARED_TEST_RESULTS` eller `Capability.VIEW_SHARED_STATS`.
   * Interne trenere og administratorer (`ADMIN`, `COACH`) slipper rett igjennom til talent-sidene.

---

## 4. Datamodeller som brukes

* **`ParentRelation`:** Kjerne-relasjonen mellom forelder (`parentId`) og barn (`childId`). Holder feltene `relationship` (`MOR`, `FAR`, `FORESATT`) og `approved` (`Boolean`).
* **`User` (barnet):** Holder `dateOfBirth` (for aldersberegning) og `guardianConsentGivenAt` (når foresatt godkjente opprettelsen).
* **`WorkbenchSession`:** Leser barnets treningsøkter med status `PUBLISHED`, `IN_PROGRESS` eller `COMPLETED`. Draft-økter vises aldri for foreldre.
* **`Booking`:** Viser og oppretter reservasjoner for barnet.
* **`DelingsSamtykke`:** Logger eksplisitt samtykke fra forelder for deling av testresultater med WANG Toppidrett og Team Norway.
* **`SkoletidBekreftelse`:** Brukes for å dokumentere gyldig fravær fra skole ved deltakelse på treninger eller turneringer.
* **`Invoice` / `Payment`:** Fakturaer og betalinger knyttet til familien.

---

## 5. Hva som virker i dag vs. stubs

### Hva som fungerer:
* **Komplett oversikt over barnas treningshverdag:** Foreldre ser publiserte økter i sanntid.
* **Booking på vegne av barn:** Forelder kan velge barn, velge ledig tid hos coach og booke direkte.
* **Samtykkehåndtering:** Aktivering og tilbaketrekking av delingssamtykker fungerer atomisk mot databasen.
* **Skoletidsbekreftelse:** Foresatte kan signere på skoletidstrening via Server Actions.
* **GDPR-eksport:** Laster ned reell JSON-fil med barnets samlede treningsdata.

### Stubs og begrensninger:
* **Ingen toveis chat:** `/forelder/coach` viser kun statisk kontaktinformasjon og e-postlenke til treneren. Det finnes ingen intern meldingsutveksling for foreldre.
* **Betalingsadministrasjon:** Foreldre kan se fakturahistorikk, men endring av betalingskort for faste abonnementer rutes ut til Stripe Billing Portal.

---

## 6. Kodebevis

### Godkjent ParentRelation kreves for innsyn
Fra `src/lib/forelder.ts` (linje 13–19):
```typescript
/** Kun godkjent ParentRelation gir innsyn, booking og barnbytte. */
const GODKJENT_FORELDER = { approved: true } as const;

export async function hentBarnForForelder(parentUserId: string) {
  const links = await prisma.parentRelation.findMany({
    where: { parentId: parentUserId, ...GODKJENT_FORELDER },
```

### Forelder-guarden sperrer alt annet enn PARENT
Fra `src/app/forelder/layout.tsx` (linje 10–13):
```typescript
export default async function ForelderLayout({ children }: { children: React.ReactNode }) {
  await requirePortalUser({ allow: ["PARENT"] });
  return <>{children}</>;
}
```

### Innsynsguarden krever eksplisitt delingskapasitet
Fra `src/app/innsyn/layout.tsx` (linje 38–44):
```typescript
  const erInternStab = user.role === "ADMIN" || user.role === "COACH";
  const caps = await effectiveCapabilities(user);
  const harTilgang =
    erInternStab ||
    caps.has(Capability.VIEW_SHARED_TEST_RESULTS) ||
    caps.has(Capability.VIEW_SHARED_STATS);
  if (!harTilgang) redirect("/auth/login");
```
