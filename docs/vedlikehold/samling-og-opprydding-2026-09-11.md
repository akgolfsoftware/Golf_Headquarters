# Samling og opprydding — 11.09.2026

Anders bestilte fullføring av neste oppgaver, fletting av ferdig arbeid, opprydding i prosjektet og oppdatert masterplan på GitHub. Samlingen bygger på main `97ff9b1bb` (PR #837) og den lokale Plan-commiten `0c060141c`.

## Leveransen

- Plan-adapteren for eldre godtatte økter, med egne modeller og vern mot dobbelttelling.
- PH-06 med valgt resultathierarki, synlige lagrede ord/vurdering, feilbehandling og interaktiv rigg med appens skrifter.
- Separate, atomiske oppdateringer av notat-/vurderingsfelt. Vurdering og planspeil lagres i én transaksjon; ingen databaseoppsett eller migrasjon er endret.
- Tre dokumenter fra produktplan/intervju-grenen, bevart som arbeidsunderlag. Funksjonsregisteret omfatter også baneguide, vind og eldre bestillinger, med tydelige avklaringer.
- Én oppdatert [masterplan](../MASTERPLAN-GJENSTAAENDE.md), [nåstatus](../STATUS-NÅ.md), arbeidsdeling og korrigert PH-06-rapport. Tidligere påstand om ferdig PH-06 i PR #837 er ikke videreført.

## Grenregnskap

| Arbeid | Før samlingen | Behandling |
|---|---|---|
| PR #833/#834/#835 | Tidligere samlet hovedgrunnlag | Beholdt i main-historikken |
| Manuell SG | PR #836 flettet, lokal gren på `04984a113` uten unike commits | Arbeidskopien beholdes fordi den fortsatt betjener designpakke og prototype på localhost 5180. Ingen SG-kode flettes på nytt |
| Claude PH-06 | PR #837 flettet, gren og to arbeidskopier ryddet | Original testpakke beholdes, tre reviewfunn rettet i oppfølgingen |
| Plan | Lokal commit `0c060141c` uten push | Inngår i denne samlingen |
| Produktplan/intervju | Tre usporede dokumenter og én masterplanhenvisning, ingen unik commit | Originaler og diff bevares privat; dokumentene og henvisningen integreres i gjeldende plan |
| Fem historiske stasher | Private sikkerhetskopier fra tidligere arbeid | Beholdes; de er ikke aktive funksjonsgrener og slettes ikke som cache |

## Prosjektets områder

Appkode, tester, offentlige ressurser, datamodeller, designoriginaler, integrasjoner og miljøoppsett beholder sin funksjon og plassering. Gjeldende fil-/dokumentregister regenereres fra sporede og ikke-ignorerte filer. Det tidligere [prosjektkartet](prosjektkart.md) beskriver områdene; denne rapporten oppdaterer arbeidsstatusen.

Ruteinventaret er kontrollert på nytt: **479 sideruter, 703 komponentfiler og 227 registrerte flatefiler**. Antall er inventar, ikke ferdig design eller full funksjonsdekning. Ingen rute eller eldre datamodell er slettet ut fra navnet alene.

Private bilder, opprinnelige arbeidskopidiffer og øvrige kontrollbevis ligger under `_archive/`. De publiseres ikke i Git. Installerte avhengigheter og aktivt miljø beholdes. Avsluttede arbeidskopier ryddes først etter at kode, unike filer og bevis er tatt vare på. Ingen seed/import, utsending, betaling eller databasekommando mot produksjon er kjørt som opprydding.

## Kontroll

- Fem nye tester av sammendragslagring og 11 nye Plan-kontrolltilfeller består målrettet.
- PH-06: 64 skjermvarianter, 200 prosent tekst og interaktive prøver av notater/vurdering, feil, venting, bevaring, fokus, nytt forsøk, simulert gjenåpning og lukking. Ingen ubehandlede klientfeil. 70 bilder fra riggen, pluss separat lys originalreferanse.
- Faktisk SQL er prøvd i isolert PostgreSQL/PGlite med minimal syntetisk tabell: feltsammenslåing, tilbakeføring, status/ID, sitater og eldre/null-JSON. Ikke en full appdatabase eller produksjonsprøve.
- Typekontroll og streng lint for berørte produksjonsfiler bestod.
- Samlet `npm test`: **2367 enhetstester + 4 komponenttester = 2371 bestått**, ingen feilet eller hoppet over. Full `npm run verify` bestod i separat arbeidskopi uten aktivt produksjonsmiljø, inkludert produksjonsbygg. `npm run prosjekt:sjekk` bestod.
- Kildehenvisninger som falt ut i PH-06-omskrivingen, er gjenopprettet. Dekningskontrollen er fortsatt 153/219; ingen baseline er senket. Eksisterende 25 globale kontrastvarsler står fortsatt som restarbeid.
- GitHub-kontrollene for inngående main `97ff9b1bb` bestod (CI `34593663537`, røyktest `34593663561`). Ny PR-/main-kjøring må vurderes på den nye samlingsversjonen.

Innlogget full reise, faktisk betaling, produksjonsgjenoppretting og Anders' visuelle godkjenning gjenstår. Ingen grønn test eller merge erklærer hele appen lanseringsklar.
