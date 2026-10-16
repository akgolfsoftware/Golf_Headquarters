# Etterlevelse — kontroll 01.10.2026

Bestilling: designuavhengig samordning av etterlevelse i spiller-, admin-, foresatt- og stallvisninger. Arbeidsgren `codex/etterlevelse-2026-10-01`, utgangspunkt `89b757464` (PR #1064). Ingen publisering bestilt i denne chatten.

## Regel og avgrensning

Kilde: `.claude/rules/beslutninger.md`, «Kartleggingsøkt fjernes + etterlevelse = tid mot plan» (26.09.2026), særlig punkt 4. Etterlevelse er gjennomførte minutter delt på planlagte minutter i et rullerende 28-dagersvindu. Øktstart må være fra og med `nå − 28 døgn`; planlagt slutt må være passert. Alle statuser følger samme tidskrav. Tomt grunnlag er `null`/«—», ikke 0 %.

Minuttgrunnlaget er planlagt øktvarighet på økter med status `COMPLETED`, som i den eksisterende Workbench-formelen. Det er ikke målt aktiv tid eller belastningsfeltet `actualMinutes`. Øktantall, oppmøte, slag/repetisjoner, ukestriper og aktivitet er egne mål. Fireukerstallet følger nåtid selv når en annen uke eller analyseperiode vises. Stallrapport summerer minutter før prosentberegningen; kohortens eksplisitte snitt/median er fortsatt spillerstatistikk.

Synlighetsgrunnlaget er eksisterende `loadVisibleSessionRange`: V2, publisert/godkjent Workbench og eldre aktive/godtatte planøkter. DRAFT/REJECTED, skjult Workbench og forslag som venter på godkjenning inngår ikke. Gamle planøkter med V2-speil fjernes også når speilet har blitt flyttet ut av intervallet. Modeller, skjema og tilgangsregler er bevart.

## Koblinger og berørte filer

- Felles regel: `src/lib/domain/etterlevelse.ts`, med minuttgrunnlag, fireukersgrense, tom tilstand og summering for stallen. `src/lib/workbench/compliance.ts` bruker samme regel.
- Felles serverleser: `src/lib/portal/etterlevelse-data.ts`. Stalloppslag begrenser samtidige spilleroppslag til åtte; ingen cache på tvers av brukere/forespørsler.
- Spiller/coach: `portal/ukesdigest.ts`, `portal-analyse/treningsanalyse-data.ts`, `workbench/load-workbench.ts`, `plan-engine/load-signals.ts`, `admin-spiller/spiller360-data.ts` under `src/lib/`. Tom navigert Workbench-uke mister ikke historisk etterlevelse.
- Foresatt/stall: `src/lib/forelder.ts`, `src/lib/admin/ukesrapport.ts`, `src/lib/admin/stallen-data.ts`, `src/lib/admin-compliance/compliance-data.ts`, `src/lib/agencyos/fokus-spillere.ts`. Foreldres godkjente relasjon og coachens spillerfilter brukes før felles lesing. Siste logg bruker registrerte loggtider, ikke planlagt slutt.
- Visning: eksisterende tallkomponent viser foresattes etterlevelse; oppmøte beholdes. Etterlevelsesfanen låses til fire uker, og spillervalg beholder riktig fane. Måleenhet/periodetekst er rettet i AdminCompliance, Workbench, digest, analyse, AG07/AG08 og hjelpeteksten. `src/app/admin/analyse/page.tsx` sender fast fireukersperiode.

## Testbevis

Sluttkjøringen `npm run verify` bestått, exit 0: 3 894 modul-/enhetstester og 17 komponenttester, ingen feil eller hoppede. Prisma-validering/generering, TypeScript, ESLint (ingen advarsler), statiske tilgangs-/design-/prosjektkontroller, Next.js 16.3.3-produksjonsbygg og Serwist/service worker består. Kjørt med Node 24.14.0 og `NODE_OPTIONS=--max-old-space-size=8192` i den separate arbeidskopien; ingen miljøfiler kopiert.

Målrettet sluttkjøring: 43/43 modulprøver (etterlevelse, rapport, felles leser, åtte lastere og eksisterende foresatt-/stalltilgang), samt 3/3 nye HTML-komponentprøver. `git diff --check` består. Privat kjørelogg: `/tmp/ak-etterlevelse-verify2.log`.

Tidlig typekjøring traff minnegrensen ved standard Node-oppløsning; sluttkontrollen brukte eksplisitt prosjektets Node 24. Filhodekontrollen stoppet dessuten på gamle ufullstendige Fasit-kommentarer. De berørte kommentarene dokumenterer nå faktisk funksjonskontroll og gjenstående visuell kontroll; ingen kontroll er slått av.

Målrettede tester bruker bare syntetiske personer og simulerte databaseoppslag:

- Domene: ulik varighet (30/120 minutter = 25 %, ikke 1/2 økter), inklusiv 28-dagersgrense, sluttid på millisekundet, eldre/fremtidige/pågående økter i alle statuser, ugyldig varighet, avvik og minuttvektet stallrapport.
- `src/lib/portal/etterlevelse-kjede.test.ts`: faktiske åtte datalastere med samme synlige syntetiske økter gir 50 %. Delt digestuke, navigert Workbench-uke og reps-/analysefilter endrer ikke etterlevelsesvinduet. Tomt grunnlag og avviste roller/barn prøves.
- `src/lib/portal/etterlevelse-grunnlag.test.ts`: faktisk felles leser og gamle planleser med simulerte Prisma-svar; synlighetsfiltre, V2-speil, flyttet speil og Oslo-veggklokke etter sommertidsskift.
- `tests/komponenter/forelder-etterlevelse.test.ts`: faktisk HTML viser prosent/periodetekst, beholder oppmøte og viser strek/tom tilstand uten feil spilleridentitet.

## Sikkerhet og personvern

1. Uvedkommende innsyn: eksisterende spiller-/coachvakter og godkjent foresattrelasjon beholdes. Felles leser er intern/server-only, uten ny server action eller API-rute. Negative prøver og eksisterende scope-tester dekker avvist lesing.
2. Persondata/hemmeligheter: ingen nye logger, miljøvariabler, offentlige flater, ekstern AI eller datafelt. Klienten mottar eksisterende rapportfelter og beregnede tall; testsvar inneholder bare syntetiske data.
3. Barn/samtykke/sletting: ingen endring i samtykke-/eierskapsreglene eller lagring. Foresatttallet følger det godkjente barnet; ugyldig barn-ID faller ikke tilbake til et annet barn.

## Rester og praktiske grenser

- Ingen ny CI-kjøring, publisering eller produksjonskontroll fra denne grenen.
- De nye prøvene kjører med simulerte databaseoppslag, ikke en faktisk innlogget database-/nettleserreise. Stallens belastning med mange spillere er ikke målt mot en database.
- Visningsendringene er funksjonskobling/tekst i eksisterende komponenter. Sammenligning på 390 px/desktop mot den konkrete valgte Precision-eksporten og Anders' visuelle godkjenning gjenstår som del av designintegrasjonen.
- Andre uketall (oppmøte, øktantall, aktivitet/volum) er bevart som egne mål; dette arbeidet gjør dem ikke til fireukersetterlevelse.
