# WANG / Team Norway — gjennomføring 02.10.2026

Anders har bestilt gjennomføring av [hele planen](wang-team-norway-playerhq-komplett-plan-2026-10-02.md) og merge til main etter verifisering. Denne filen er arbeidsstatus, ikke en ferdigmelding for appen.

## Arbeidsgren og avgrensning

- Første gren: `codex/wang-tn-iup-plan-2026-10-02`, merget via PR #1077.
- Aktiv neste gren: `codex/iup-sesongevaluering-2026-10-02`, fra main `7430f5410`.
- Worktree: `.claude/worktrees/codex-wang-tn-iup-plan` under prosjektets hovedmappe.
- Startgrunnlag for kodearbeidet: `da40e700a`, etter PR #1076.
- Andre aktive oppgaver arbeider med DataGolf/pipelines, Workbench, statistikk og testbatteriet. Deres endringer skal bevares og vurderes ved integrasjon.
- Nattlig oppfølging er opprettet i denne samtalen hvert 30. minutt til kl. 07:00 norsk tid. Automatiseringen er fortsettelse av arbeidet, ikke dokumentasjon på fullføring.

## Første leveranse: originaltro spørsmålskatalog

Implementert i `src/lib/iup/utviklingssjekk.ts`, tilhørende JSON og tester:

- IUP 2025: 154 spørsmål — Ung 34, Junior 41, Amatør 41, Profesjonell 38.
- IUP 2027: 162 spørsmål — Ung 34, Junior 43, Amatør 47, Profesjonell 38.
- Sju kategorier, original ordlyd, kildecelle, kildeår og kontrollsum er bevart.
- Originalskalaen er **1–5**, også i de lokale originalfilenes veiledning.
- Utkast tillater ubesvarte spørsmål. Levering krever samtlige spørsmål på valgt nivå.
- Ugyldige verdier, ukjent spørsmål, feil år/nivå og det eldre åttespørsmålsformatet avvises.
- Historikksammenligning krever samme kildeår, samme nivå og to leverte svar.
- Ingen aktiv standardversjon endres. Det tidligere godkjente 2025-grunnlaget og det nye 2027-grunnlaget holdes adskilt inntil versjonsvalget er avklart.

`scripts/check-iup-original.py` er en skrivebeskyttet kontroll mot de to kjente originalfilene. Den kontrollerer filenes SHA-256 før spørsmål leses og sammenligner alle 316 spørsmål med katalogen. Ingen besvarelser, kontaktfelt eller originale arbeidsbøker legges i Git. Kjør med `python3 scripts/check-iup-original.py --iup-2025 <lokal-2025-fil> --iup-2027 <lokal-2027-fil>`.

**Viktig begrensning:** Dette er en kilde- og valideringsmodul. Den er ennå ikke koblet til spillerens lagring, års-/fireukerssjekk eller trenernes skjermer. Ingen brukerreise eller Excel-dekning er derfor ferdigmeldt på grunnlag av disse testene.

## Påviste integrasjonsavvik

| Område | Funn | Nødvendig neste arbeid |
|---|---|---|
| PR #1060, `oppfolging/regler.ts` | Validerer åtte spørsmål og skala 1–4 | Bruk originaltro katalog, eksplisitt kildeår og nivå; gamle svar beholdes som historiske data |
| PR #1060, trenerforslag | Godkjenning endrer forslagets status, men anvender ikke økt-/planendring i Workbench | Spillerhandling med før/etter, autorisasjon, versjonskonflikt og atomisk anvendelse |
| PR #1060, fireukerssjekk | Gruppe-/flateavgrenset lagring kan gi to IUP-er for én spiller | Kanonisk spillereid besvarelse og organisasjonsspesifikk frist/oppfølging må skilles |
| Spiller360 på main | Viser utviklingssjekk som ikke implementert og feil etikett «skala 1–8» | Koble faktisk besvarelse og godkjent skjermdesign; ikke bare endre etiketten |
| PR #1004 | Omfattende WANG/TN-port med avhengigheter; visuell godkjenning var oppgitt som uavklart | Kontroller nåstatus, valgt design og avhengigheter før gjenbruk; ikke blind merge |
| Personvern | Eldre fullprofil-samtykke omfatter ikke automatisk helse/private notater | Bevar gjeldende grenser; ikke utvid gammelt samtykke ved å gjenbruke navnet |
| DataGolf | Kundedistribusjon er ikke dokumentert lisensiert | Precision-design først med syntetiske data; lisens og feltfiltrering før ekte kundeaktivering |

## Neste leveranse: komplett sesongevaluering som datakontrakt

`src/lib/iup/sesongevaluering.ts` og tilhørende kildekatalog bevarer begge originalenes tre fritekstspørsmål og ti vurderingsspørsmål. Originalens skala 1–4 brukes separat fra utviklingssjekkens 1–5. Eksplisitt sesongstart/-slutt hindrer at et gammelt årstall i originalteksten blir ny datoperiode. Faktisk og planlagt fordeling skal hver inneholde FYS/TEK/SLAG/SPILL/TURN og summere til 100 prosent ved levering. Minst tre utfylte forbedringspunkter kreves. Utkast bevarer mangler og får ikke automatisk nullverdier.

Alle 26 sesongspørsmål er kontrollert mot originalfilene. Sju målrettede prøver bestod. Full `npm run verify` for andre leveranse bestod: 3 969 kodeprøver, 18 komponentprøver og Next-/Serwist-bygg. Også denne modulen er foreløpig en datakontrakt uten lagring eller montert skjerm. Serverlagets neste oppgave må dekke begge skjematypene med ett spillereid, versjonert grunnlag, slik at WANG og TN ikke lager hver sin besvarelse. GitHub CI og merge for denne leveransen gjenstår i skrivende stund.

## Kontrolljournal

- Katalog mot originalfiler: bestått, 154 + 162 spørsmål.
- Målrettede kilde-/besvarelsestester: 8 bestått.
- Første fullkontroll stoppet ved TypeScript på grunn av Node-minnegrense. Ny kjøring med prosjektets Node 24 og 8 GiB minnegrense bestod; ingen kontroller ble fjernet.
- Full `npm run verify`: bestått, 3 962 kodeprøver + 18 komponentprøver, ingen hoppet over; Next- og Serwist-bygg bestått. Bygget kjørte uten produksjonsmiljø og meldte manglende lokale databasetabeller/AI-konfigurasjon; dette er ikke bevis på produksjonsdata eller integrasjoner.
- Første leveranse: [PR #1077](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1077), GitHub `verify` og Vercel bestått. Merget 02.10.2026 kl. 01:52 norsk tid som `7430f5410`. Kontrollert PR-head `0544b7590`; ingen produksjonsbrukerreise er prøvd.
- Nettleserreiser, ekte lagring, begge trenerroller, eksport/sletting for nye svar og visuell sammenligning: gjenstår.

## Observert DataGolf-design

Claude Design har en leveranse under `ui_kits/datagolf-komplett/` i [Precision-prosjektet](https://claude.ai/design/p/7d7c2994-cf63-4c5f-9bdc-fdaf67655a70?file=ui_kits%2Fdatagolf-komplett%2Fdesktop.html&present=1). Designverktøyet rapporterer DG-01–DG-17, tilstander og overleveringskontrakt. Denne rapporteringen er ikke alene godkjenning.

Egen nettleserkontroll: desktopoversikt sett; valgt «SG innspill» og «Sesong 2025» i topplisten, åpnet syntetisk spiller, åpnet sammenligning og gått tilbake to ganger. Begge filtrene var bevart. Profilen skilte målt SG fra modell og opplyste at katalogprofilen ikke hadde PlayerHQ-konto eller privat IUP. Mobiloversikten er sett i den faktiske 390-rammen. Resterende skjermer, tallberegning, tastatur og alle tilstander er ikke kontrollert her. Prototypen er ikke koblet til appdata, og TN/WANG-versjonene må kontrolleres separat.

## Neste etapper

1. Fullfør lokal kvalitetskontroll og kildekontroll; lag en avgrenset PR for kildegrunnlaget og planen. Merge først etter grønn kontroll på gjeldende commit.
2. Kontroller ny main og status i eksisterende WANG/TN-arbeid. Gjenbruk verifiserte endringer; ikke kopier de påviste feilene fra #1060.
3. Implementer kanonisk spillereid IUP med versjonert historikk, utkast, levering, eksport og sletting. Verifiser i separat lokalt miljø med syntetiske brukere.
4. Koble PlayerHQ og begge autoriserte trenerflater til samme data etter valgt design. WANG-testdeling til TN skal ikke gi komplett profil eller TN-medlemskap.
5. Implementer forslag/godkjenning, samlingsprogram/invitasjon og kalenderkobling med samtidighets- og duplikatvern. Prøv ingen ekte utsending som test.
6. Integrer testbatteri/testdag og pipeline-resultater med de andre oppgavenes verifiserte leveranser.
7. Følg DataGolf-rekkefølgen Precision → Team Norway/WANG. Kontroller hele feltregisteret og lisens før aktivering.
8. Kjør planens 26 akseptanseprøver, ark-for-ark-dekning og visuelle kontroller. Rapporter bestått, blokkert og uverifisert hver for seg. Hele planen er ikke ferdig før avvikene er lukket eller eksplisitt avgjort.

## Sikkerhets- og personvernkontroll av første leveranse

1. Ingen nye ruter, databasekall eller handlinger. Modulen kan ikke lese eller endre en annen brukers data.
2. JSON inneholder bare generiske spørsmål fra kjent skjema og kildemetadata. Ingen elevsvar, kontaktopplysninger, hemmeligheter eller private filstier.
3. Ingen ny lagring, samtykkeendring, offentlig visning eller sletting. Tilgang, samtykke og livsløp for faktiske besvarelser må implementeres og prøves ved tilkobling til serverlaget.
