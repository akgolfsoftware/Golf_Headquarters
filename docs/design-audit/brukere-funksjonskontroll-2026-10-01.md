# Brukere: funksjonskontroll 01.10.2026

Anders bestilte utføring av Codex-planen, med brukere først. Denne første delen kontrollerer konto, innlogging, rolle, spilleromfang og samtykkesperre i en isolert lokal rigg med syntetiske data. Ingen ekte navn eller persondata brukes i riggen eller denne rapporten.

**Separat kontooppfølging 01.10.2026:** Anders bestilte deretter nye kontoer for fire piloter. Alle fire kontoene er opprettet i prosjektets eksisterende hostede tjeneste med kontaktopplysninger fra privat kilde eller Anders' direkte beskjed. Innloggingsidentitet, koblet spillerprofil, spillerrolle og gratis tilgang er kontrollert ved ny avlesning for hver konto. For to kontoer er samtykkekravet bestemt av oppgitt år og eksplisitt aldersavklaring: én krever foreldresamtykke, én krever ikke. Eksakt fødselsdato er ukjent for begge og lagres som null; ingen dato er funnet på. Eksisterende samtykkehjelpere er også kontrollert med syntetiske profiler uten fødselsdato. Kontoene avventer e-postaktivering, og én også foreldresamtykke. Ingen invitasjon, betaling eller betalt abonnement er opprettet. Den sist opprettede kontoen er identifisert via Anders' oppgitte e-postadresse og en unik privat kontaktpost med samsvarende navnedeler. Fødselsdato fra den private kilden bekrefter at foreldresamtykke ikke kreves; dato og samtykkeflagg er kontrollert ved ny avlesning. Dette er ikke en innloggingsprøve utført av pilotene eller bevis på hele produksjonsreisen. Privat kilde og opprettingsjournaler ligger utenfor Git, og opprettingsverktøyet ligger separat fra den lokale testriggen. Databaseskjema og tilgangsregler er ikke endret.

Arbeidet ligger på `codex/funksjon-brukere-2026-10-01`, basert på `4b5535245`. Claude Design fortsetter som designautoritet. Dette arbeidet endrer teknisk innlogging og kontrollgrunnlag; det gir ingen ny visuell godkjenning.

## Funn og rettinger

- Den monterte `LoginView` (fra `LoginPrecisionView`) sendte både passord og e-postkode direkte til PlayerHQ. Begge sender nå til appens eksisterende rollevalg `/auth/etter-innlogging`.
- Innloggingslenke og Google-retur manglet den eksisterende ruten som veksler innloggingskode til en sesjon. Begge peker nå til `/api/auth/oauth-callback`.
- Callback-rutens absolutte returadresse kunne bytte fra `127.0.0.1` til intern `localhost` og dermed miste innloggingscookies. Returen bruker nå en validert relativ adresse på samme origin. Ugyldig kode gir en generell feilkode, uten leverandørens feiltekst i adressen.
- Returvalideringen avviser også bakoverstrek, som nettlesere kan tolke som en annen vert. Enhetstester kontrollerer relativ adresse og avvisning av fremmed adresse.
- SMS-knappen viste «godkjent» uten å verifisere noen kode. Den viser nå at SMS-innlogging ikke er tilgjengelig. Tilkobling av faktisk SMS og totrinnsbekreftelse er fortsatt en rest.

## Funksjonsregister for første del

| Funksjon/overgang | Faktisk kode | Kontroll og gjenstående |
|---|---|---|
| Passord → rollevalg → startside | `LoginView` (fra `LoginPrecisionView`), `auth/etter-innlogging` | Spiller, to trenere og foresatt prøvd med lokal Auth og database |
| Feil passord → ingen adgang | `LoginView` (fra `LoginPrecisionView`), Supabase Auth | Ingen adminadgang etter avvist innlogging |
| E-postlenke → kodeveksling → trener | `api/auth/oauth-callback` | Lokal Mailpit, PKCE og faktisk trenerlanding; ekte e-postlevering gjenstår |
| Engangskode → spiller | `LoginView` (fra `LoginPrecisionView`), lokal Auth | Ekte lokal kode prøvd; produksjonsmalens levering av kode gjenstår |
| Spiller → adminside og adminsøk | `admin/layout`, `api/admin/search` | Både side og API avviser spiller; utlogget bruker avvises |
| Trener → bare egne spillere | `api/admin/search`, `coachScopedPlayerWhere` | Begge coachomfang prøvd mot virkelig lokal lagring; endringshandlinger gjenstår |
| Full spiller → egen publisert økt | `portal/live/[sessionId]/brief` | Egen økt leses; gjennomføring og lagring av resultater gjenstår |
| Annen spiller → fremmed økt | Samme Live-brief og `canAccessPlayer` | Fremmed økt vises ikke |
| Talent → Workbench | `requirePortalUser`, `feature-flags` | Låst planlegging sender til oppgraderingssiden |
| Ventende barn → portal/Workbench | `requirePortalUser`, `auth/samtykke-venter` | Venterom kan ikke omgås med direkte sideadresse; foresatts godkjenning gjenstår |
| Foresatt → foreldreside | `auth/etter-innlogging`, `/forelder` | Rollen lander riktig; ingen barn koblet til kontoen i denne prøven |
| SMS og Google | `LoginView` (fra `LoginPrecisionView`) | SMS viser utilgjengelig tjeneste uten datainnsamling; ekte SMS og Google-innlogging er ikke prøvd |

## Første kontroll før samordning med hovedgrenen

| Kontroll på Node.js 24.14.0 | Resultat |
|---|---|
| Lokal brukerreise, desktop og mobil | 24 bestått, 0 feil, 0 utelatt |
| Mål, databaseidentitet, portbinding og fjerning av hemmeligheter fra output | 20 bestått, 0 feil, 0 utelatt |
| `npm test`: enheter | 3 713 bestått, 0 feil, 0 utelatt |
| `npm test`: komponenter | 14 bestått, 0 feil, 0 utelatt |
| `npm run build`: Next.js og Serwist | Bestått |
| Prisma-validering/generering, TypeScript og ESLint | Bestått før fasitkontrollen; ny lintkontroll av senere verktøyendringer bestått |
| Dokumentstruktur, lenker og `git diff --check` | Bestått |
| Samlet `npm run verify` | Stopper på seks eksisterende fasit-/riggfeil |

Før første retting feilet begge trenerlandinger. Utvidet e-postprøve viste manglende kode i lokal standardmal og at den absolutte callback-returen mistet sesjonen ved vertsbytte. Lokal kodeverifisering og faktisk lenke fra Mailpit er nå prøvd som angitt over. En samlet kjøring ble avbrutt da dev-serveren stoppet for bygging; den teller ikke som bestått. Den etterfølgende komplette kjøringen ga 24/24.

De seks feilene i samlet kontroll gjelder `admin/agencyos/page.tsx`, `admin/gjennomfore/okter/[id]/page.tsx`, `LiveTavleTrainLock.tsx`, `PlanHubV2.tsx`, `AdminGodkjenningerTrainLock.tsx` og `teknisk-plan-visning.tsx`: gamle Fasit-siteringer uten Rigg/Avvik ved sammenligning mot `origin/main`. Disse filene har ingen lokal diff fra denne jobbens HEAD. Denne arbeidskopien og `origin/main` har ulik historikk; ingen av dem er slått sammen, overskrevet eller erstattet for å få grønn kontroll. Dette må avklares sammen med gjeldende designoverlevering. Kontrollene er ikke svekket.

Ved denne første kontrollen var koden bare bevart lokalt, og GitHub CI var ikke kjørt. [Verify og commit](../../.claude/skills/verify-og-commit/SKILL.md) sier «aldri commit med rød gate».

## Samordning for bestilt GitHub-publisering 01.10.2026

Anders bestilte publisering av arbeidet til hovedgrenen. Arbeidskopien er derfor samordnet med `origin/main` på `110b4ec8f`. De seks gamle referansefeilene forsvant med denne samordningen; ingen kontroll er svekket. Den fungerende innloggingen fra denne jobbens utgangspunkt er skilt ut i `LoginView` og montert på `/auth/login`. Demokatalogens `LoginPrecisionView` forhåndsviser denne komponenten. Kontrollen som forbyr demovisninger på offentlige ruter er beholdt. SMS samler ikke inn telefonnummer eller kode når leverandør mangler. Dette er fortsatt ingen visuell godkjenning.

Next sine rutetyper er generert på nytt. Verifikasjonen bruker samme minnegrense som CI. Den isolerte testdatabasen er oppdatert med additive skjemaendringer fra hovedgrenen, uten å endre hostet database, og har nå 216 tabeller. Lokal RLS uten tillatende policyer er beholdt. En ubrukt privat kategorinavnliste er fjernet for å holde lintkontrollen fri for advarsler.

En samlet `npm run verify` etter samordningen bestod med 3 815 enhetstester, 14 komponenttester og Next.js/Serwist-bygg. Den siste kontrollen etter montering av innloggingssiden føres i PR-ens testresultat sammen med 24 innloggede brukerprøver og 20 miljø-/outputprøver. Lokal kontroll og GitHub CI er separate kjøringer. GitHub-resultat og publisert kodeversjon finnes på tilhørende PR; teksten her hevder ikke produksjonskontroll.

[Kildeinventaret](funksjonsinventar-2026-10-01.json) registrerer 517 sidefiler, 70 API-ruter og 162 servermoduler med 524 runtime-eksporter. Alle står uttrykkelig som ikke undersøkt som hel funksjon. Dette dekker inngangen til PRE-01, ikke full funksjonskartlegging. Eksporter er ikke nødvendigvis én brukerfunksjon hver. Den kontrollerte brukerdelen er spesifisert i tabellen over.

Sikkerhets-/personvernspørsmålene er kontrollert for denne diffen: spiller og trener kan ikke lese de prøvde fremmede dataene; miljønøkler og syntetiske passord er ignorerte, og kjøreverktøyet skjuler kjente hemmeligheter og innloggingskoder i output; det syntetiske barnet blir stanset av samtykkesperren. Ingen ny kategori persondata eller nye tilgangsregler er innført. Endringsrettigheter og øvrige samtykkereiser er fortsatt åpne kontrollpunkter.

Prøvene finnes i `tests/local-users/users.spec.ts`, med desktop 1440 px og mobil 390 px. Kjøring krever den [isolerte lokale riggen](../utvikling/lokal-brukertest.md). Ingen kontroll i denne rapporten beviser produksjon, GitHub CI, visuell samsvar med valgt Claude-versjon eller hele appens funksjon.

## Neste koblede del

Følg samme syntetiske eiere fra trenerens oppretting/endring av økt til publisering, spillerens uke/I dag, Live, oppsummering og analyse. Prøv også avvist coachendring, utkast, gjentatt innsending og oppdatering etter ny innlasting. Alle fire pilotkontoene er opprettet; e-postaktivering gjenstår, og én avventer også foreldresamtykke. PRE-01–08 er fortsatt en pågående plan; denne kontrollen ferdigstiller ikke hele funksjonsregisteret eller testmiljøet for Storage, booking og eksterne tjenester.
