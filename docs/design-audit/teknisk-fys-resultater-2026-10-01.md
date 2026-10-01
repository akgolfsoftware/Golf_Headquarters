# Teknisk oppgave, fysisk dose og treningsresultat — 01.10.2026

Arbeidsgren: `codex/teknisk-fys-resultat-2026-10-01`, grunnlag `6e447b420` (oppdatert til hovedgrenens PR #1066).
Designuavhengig datakjede. Ingen endring av databaseskjema, produksjonsoppsett
eller tilgangssystem; ingen publisering, merge eller deploy.

## Lagring og lesing

| Del | Faktisk lagring | Leser og betydning |
|---|---|---|
| Workbench-øvelse | `WorkbenchSession.liveSnapshot.drillResults` | Resultat per eksisterende `WorkbenchDrill.id`, kildekobling, akse, dose, målt tid eller `null`. Oppsummering, historikk og analyse leser samme objekt. |
| V2-øvelse | `DrillLogV2` og `TrainingSessionV2.completedSummary.drillResults` | Eksisterende tellere beholdes. Den strukturerte målingen beskriver golfrepetisjoner eller fysisk dose. Fullføring bevarer målingen. |
| Teknisk oppgave | `PositionTask`, `PositionTaskRepLog`, målmatrise | Absolutt resultat gir differanse fra forrige lagring. Normalhastighet er automatisk + treff; disse er separate registreringer. Rettelser nedover rekalkulerer målmatrisen. |
| Fysisk serie | `WorkbenchPhysicalLog` | Samme øvelse og serienummer gir samme logg-ID ved gjentakelse og retting. Reps, kg og RIR beholdes hver for seg. `note` har versjonert kildeobjekt og brukerens notat. Analyse avkoder dette. |

Første strukturerte måling beholder kilden gjennom senere rettelser og
oppsummeringen bruker den lagrede dosen også etter en planendring: kilde-ID,
kilderevisjon når den er kjent, øktens radrevisjon ved første måling, tittel,
akse, formel og planlagt dose. Radrevisjonen er ikke bevis på en historisk
planversjon fra før første måling. Ukjent kilderevisjon er `null`. Retting av en
eldre fysisk logg uten kildeobjekt oppfinner ikke en historisk kildeversjon.

Golfantall inkluderer ikke FYS-minutter, sekunder eller styrkerepetisjoner.
Detaljresultater og den eldre slagtelleren er alternative kilder for samme økt;
de summeres ikke dobbelt. Planlagte minutter er ikke en målt varighet. Et
resultat er heller ikke automatisk en ferdigmarkering. Blandede Workbench-økter
bruker hver øvelses akse og eksplisitte planlagte varighet.

## Skrivevern og tilgang

- Ny Workbench-handling bruker `requirePortalUser`, `canAccessPlayer`, øktstatus,
  øvelsens tilhørighet og forventet radrevisjon. Ukjent eksisterende resultatformat
  overskrives ikke. En endret akse eller måleenhet krever ny øvelse.
- Resultat og teknisk differanse skrives i samme transaksjon. Lagringsfeil ruller
  begge tilbake. Samtidige endringer i Workbench avvises med beskjed om ny innlasting.
- V2-logging og fullføring låser samme øktrad. Golfantall må stemme med de fire
  registreringstypene; en ny logg kan ikke skrives etter fullføring.
- Fysisk serielogging låser øvelsesraden. Kilderevisjonen leses under låsen;
  tidligere kildeobjekt beholdes ved retting.
- Teknisk kildevalg kontrollerer oppgavens planeier før lesing. Analysens nye
  resultatlesere ligger bak eksisterende kontroll av egen spiller/trenertilgang.

Personvern: Ingen nye åpne sider eller AI-kall. Innlogging og samtykkevaktene er
beholdt. Prøvene bruker bare syntetiske data i det separate lokale miljøet
`ak-hq-brukere-20261001`; databaseidentitet og lokale mål kontrolleres før skriving.
Eksport/sletting av de eksisterende Workbench-modellene har fortsatt den
dokumenterte uavklarte dekningen i [datakartet](../gdpr/datakart.md).

## Kontroll og bevisgrense

Databaseprøve: `tests/local-users/technical-results.test.ts` dekker plan → logging
→ retting → fullføring → ny lesing → oppsummering/historikk/analyse. Den bruker
ekte lokal database og syntetiske eiere, med erstattet innloggingsidentitet og
rammeverkets cachefunksjoner. Den kontrollerer også fremmed eier/øvelse, feil
enhet, foreldet revisjon, parallelle forsøk og faktisk tilbakerulling ved DB-feil.

Nettleserprøve: `tests/local-users/result-journey.spec.ts` bruker lokal Supabase
Auth og appens vakter på desktop 1440 px og mobil 390 px. Plan og tidligere
fysisk logg opprettes som syntetisk prøvegrunnlag; golflogging, teknisk teller,
fullføring og oppsummering prøves gjennom appen. Det er ikke en prøve av
planforfatterens skjerm eller oppretting av fysisk dose gjennom skjermen.

- Lokal database: 9 beståtte prøver, ingen feil.
- Lokal nettleser: 2 beståtte reiser, desktop og mobil, ingen feil.
- Målrettede modulprøver: 179 beståtte, ingen feil eller hoppede.
- `npm run verify` på grunnlag `6e447b420`: 3 908 modul-/enhetstester og
  17 komponenttester bestått, ingen feil eller hoppede. Typekontroll, ESLint,
  statiske kontroller, `npm run prosjekt:sjekk`, Next.js-bygg og Serwist bestått.
- Databasens ni prøver er kjørt på nytt etter samordning med PR #1066.
  Nettleserprøvene gjelder resultatkjeden før denne samordningen; den eneste
  berørte resultatfilen fikk den nye felles etterlevelsesleseren i tillegg.
  Hovedgrenen fikk senere PR #1067 med røykprøver for innlogging. Disse
  testfilene inngår ikke i denne grenen.

## Gjenstående skjermarbeid

Workbench-handlingen `saveWorkbenchDrillResult` er klar for binding fra den
valgte skjermversjonen. Den eksisterende Workbench-slagskjermen kaller fortsatt
den tidligere slagtelleren. Fysisk dose og kilde er tilgjengelig i datakontrakten;
en ny Workbench-registreringsskjerm er ikke bygget eller visuelt godkjent her.
Dette arbeidet gir ikke visuell godkjenning av utgående skjermdesign.

Eldre fritekst uten gjenkjennelig fysisk format er fortsatt fritekst. Ukjente
målinger og kildeversjoner blir ikke fylt inn i ettertid. Lokal kontroll er ikke
CI eller produksjonskontroll; gruppeøkter er ikke prøvd i denne avgrensede reisen.
