# Brukere: funksjonskontroll 01.10.2026

Anders bestilte utføring av Codex-planen, med brukere først. Denne første delen kontrollerer konto, innlogging, rolle, spilleromfang og samtykkesperre. De navngitte pilotene er ikke opprettet eller endret i en hostet tjeneste. Avklaring om eksisterende eller nye kontoer gjenstår. Ingen ekte navn eller persondata brukes i riggen eller denne rapporten.

Arbeidet ligger på `codex/funksjon-brukere-2026-10-01`, basert på `4b5535245`. Claude Design fortsetter som designautoritet. Dette arbeidet endrer teknisk innlogging og kontrollgrunnlag; det gir ingen ny visuell godkjenning.

## Funn og rettinger

- Den monterte `LoginPrecisionView` sendte både passord og e-postkode direkte til PlayerHQ. Begge sender nå til appens eksisterende rollevalg `/auth/etter-innlogging`.
- Innloggingslenke og Google-retur manglet den eksisterende ruten som veksler innloggingskode til en sesjon. Begge peker nå til `/api/auth/oauth-callback`.
- Callback-rutens absolutte returadresse kunne bytte fra `127.0.0.1` til intern `localhost` og dermed miste innloggingscookies. Returen bruker nå en validert relativ adresse på samme origin. Ugyldig kode gir en generell feilkode, uten leverandørens feiltekst i adressen.
- Returvalideringen avviser også bakoverstrek, som nettlesere kan tolke som en annen vert. Enhetstester kontrollerer relativ adresse og avvisning av fremmed adresse.
- SMS-knappen viste «godkjent» uten å verifisere noen kode. Den viser nå at SMS-innlogging ikke er tilgjengelig. Tilkobling av faktisk SMS og totrinnsbekreftelse er fortsatt en rest.

## Funksjonsregister for første del

| Funksjon/overgang | Faktisk kode | Kontroll og gjenstående |
|---|---|---|
| Passord → rollevalg → startside | `LoginPrecisionView`, `auth/etter-innlogging` | Spiller, to trenere og foresatt prøvd med lokal Auth og database |
| Feil passord → ingen adgang | `LoginPrecisionView`, Supabase Auth | Ingen adminadgang etter avvist innlogging |
| E-postlenke → kodeveksling → trener | `api/auth/oauth-callback` | Lokal Mailpit, PKCE og faktisk trenerlanding; ekte e-postlevering gjenstår |
| Engangskode → spiller | `LoginPrecisionView`, lokal Auth | Ekte lokal kode prøvd; produksjonsmalens levering av kode gjenstår |
| Spiller → adminside og adminsøk | `admin/layout`, `api/admin/search` | Både side og API avviser spiller; utlogget bruker avvises |
| Trener → bare egne spillere | `api/admin/search`, `coachScopedPlayerWhere` | Begge coachomfang prøvd mot virkelig lokal lagring; endringshandlinger gjenstår |
| Full spiller → egen publisert økt | `portal/live/[sessionId]/brief` | Egen økt leses; gjennomføring og lagring av resultater gjenstår |
| Annen spiller → fremmed økt | Samme Live-brief og `canAccessPlayer` | Fremmed økt vises ikke |
| Talent → Workbench | `requirePortalUser`, `feature-flags` | Låst planlegging sender til oppgraderingssiden |
| Ventende barn → portal/Workbench | `requirePortalUser`, `auth/samtykke-venter` | Venterom kan ikke omgås med direkte sideadresse; foresatts godkjenning gjenstår |
| Foresatt → foreldreside | `auth/etter-innlogging`, `/forelder` | Rollen lander riktig; ingen barn koblet til kontoen i denne prøven |
| SMS og Google | `LoginPrecisionView` | SMS avviser falsk bekreftelse; ekte SMS og Google-innlogging er ikke prøvd |

## Bevis og omfang

17 mål-/identitets- og portkontroller består uten utelatte prøver. Før første retting feilet begge trenerlandinger. Etter retting bestod de 20 tilgangs-/passordprøvene. De fire utvidede kode-/lenkeprøvene bestod etter callback-rettingen. Samlet ny kontroll og prosjektets kvalitetskontroll registreres etter avsluttet kjøring.

Prøvene finnes i `tests/local-users/users.spec.ts`, med desktop 1440 px og mobil 390 px. Kjøring krever den [isolerte lokale riggen](../utvikling/lokal-brukertest.md). Ingen kontroll i denne rapporten beviser produksjon, GitHub CI, visuell samsvar med valgt Claude-versjon eller hele appens funksjon.

## Neste koblede del

Følg samme syntetiske eiere fra trenerens oppretting/endring av økt til publisering, spillerens uke/I dag, Live, oppsummering og analyse. Prøv også avvist coachendring, utkast, gjentatt innsending og oppdatering etter ny innlasting. Navngitte piloter håndteres separat når kontoenes status og nødvendige opplysninger er avklart. PRE-01–08 er fortsatt en pågående plan; denne kontrollen ferdigstiller ikke hele funksjonsregisteret eller testmiljøet for Storage, booking og eksterne tjenester.
