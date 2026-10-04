# Main, arbeidskopier og lanseringsgrunnlag — 01.10.2026

Kontrollert ca. 16.10–16.25 norsk tid, med etterfølgende kvalitetskontroll. Git og GitHub er lest direkte; status fra andre økter er deres rapporterte fremdrift, ikke en uavhengig gjentakelse av testene. [Lanseringsplanen](../planer/lanseringsplan-2026-10-01.md) gir prioritet og ferdigkriterier.

## Utført opprydding

| Handling | Bevis / resultat |
|---|---|
| Hentet GitHub og fjernet døde lokale fjernreferanser | `git fetch origin --prune`; endrer ikke oppgaver eller aktivt arbeid |
| Oppdatert lokal main | `110b4ec8f` → `89b757464` med fast-forward, altså uten å lage en ny sammenslåing eller overskrive lokale endringer |
| Kontrollert og slått sammen PR #1005 | Eksakt head `1d72f026575bf46dd562f99225af2612ff6600ba`; grønn [full CI](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36577539274), grønt Vercel-bygg; 3-filsdiff lest og konfliktfri sammenslåing kontrollert med `git merge-tree`. Sammenslått som `3d8818238f32a59265e004f5085c960680d6fd5b` kl. 16.16.53. Lokal main oppdatert til samme versjon. Grenen finnes ikke lenger på origin ved etterkontroll |
| Fjernet to overflødige lokale grener | `codex/design-konsolidering-2026-09-30` og `codex/lokal-brukertest-2026-10-01`, begge `c8e97c66b`; innhold og commit er i main. Ekstra arkivreferanser under `refs/archive/cleanup-2026-10-01/` |
| Bevart lokale endringer | SHA-256 før/etter fast-forward bekrefter identiske bytes i `.claude/commands/pr.md` og `.claude/settings.json` |
| Bevart oppgaver og privat arbeid | Ingen chat, arbeidskopi, stash eller privat testoppsett slettet av denne økten. Ingen meldinger sendt til andre økter |

PR #1005 er en teknisk importretting, ikke en ny skjermvariant. Sikkerhets-/personvernkontroll: samme faste fem navigasjonsvalg, ingen ny database-/nettverkslesing, ingen ny personinformasjon og ingen endret rolle-/samtykkeport. Den eksisterende åpne WANG-sidens informasjonsomfang er uendret. Neste-dokumentasjonen om server-/klientgrensen er lest fra installert pakke. Ingen manuell deploy, endring av miljøvariabler eller databasehandling er utført i denne oppryddingen. Vanlige GitHub-/Vercel-jobber kan starte som følge av sammenslåingen.

## Arbeidskopiene ved første kartlegging

Rot: `/Users/anderskristiansen/Developer/akgolf-hq`. Forkortelsen `.claude/worktrees/` nedenfor er relativ til roten.

| Arbeidskopi | Kodegrunnlag / status | Beslutning |
|---|---|---|
| Hovedkopien | main var 9 commits bak; 2 lokale innstillings-/kommandofiler endret | Oppdatert, lokale endringer bevart |
| `.claude/worktrees/precision-athletics-konsolidering` | `110b4ec8f`, mange endrede/usporede design- og kontrollfiler, private prototyper | Aktiv designøkt; behold. Må samordnes med main før egen levering |
| `.claude/worktrees/codex-codebase-publish` | Redis-gren, base `b1145be8b`; ny test, kode og revisjonsrapport under arbeid | Aktiv Redis-økt; behold. Utkast #1065 ble opprettet under kartleggingen |
| `.claude/worktrees/codex-etterlevelse` | Base `89b757464`; ny aktiv oppgave | Behold, selv om arbeidskopien var ren ved første avlesning |
| `~/.codex/worktrees/teknisk-fys-resultat/akgolf-hq` | Base `89b757464`; ny aktiv teknisk/FYS-oppgave | Behold/overlat livsløpet til eierøkten. Oppgaven finnes direkte selv om arbeidskopilisten endrer seg |
| `~/Developer/akgolf-hq-gruppe-publisering` | Base `89b757464`; ny aktiv gruppeoppgave | Behold |
| `.claude/worktrees/codex-lokal-brukertest` | `41a2fa554`; Git viser to unike commits etter squash i #1064, men `git diff origin/main codex/design-data-journeys-2026-10-01` var helt tom før #1005 | Koden er allerede integrert. Privat lokal Auth/DB-rigg, ignorerte miljøfiler og usporede kontrollfiler gjør kopien nyttig og ikke klar for sletting |

Det er viktig å skille «ingen unik commit» fra «ingenting å bevare»: nye aktive oppgaver kan være rene, og ferdig sammenslåtte grener kan fortsatt eie testmiljøer. Stash-listen hadde 25 oppføringer, inkludert en fersk Redis-sikkerhetskopi. Innholdet er ikke erklært overflødig og er ikke slettet.

Fjerngrenen `reserve/lokal-main-runde-kontrakt-2026-09-27` er allerede med i main, men er en uttrykkelig reserve og beholdes. `chore/slett-utgatt` har 18 filslettinger og er ikke ferdig integrert; sammen med #993 må den vurderes mot dagens lenker og aktive kilder, ikke slettes eller flettes automatisk.

Denne planleveransen er skrevet i en egen, isolert arbeidskopi `.claude/worktrees/codex-lanseringsplan` på `codex/lanseringsplan-2026-10-01`, slik at ingen aktive kode- eller designfiler endres.

Ved ny avlesning hadde teknisk/FYS-økten opprettet `/Users/anderskristiansen/Developer/akgolf-hq-teknisk-fys-resultat` etter at en annen prosess fjernet den første kopien. Denne økten har ikke utført fjerningen. Arbeidet fortsetter ifølge eierøkten; ingen påstand om tap eller fullført gjenoppretting er gjort her.

## Samlet vurdering av de 48 opprinnelige PR-ene

Før opprydding: 41 konfliktfrie (`CLEAN`), 3 blokkerte (`BLOCKED`), 3 med konflikt (`DIRTY`) og 1 med sviktende kontroll (`UNSTABLE`). 9 var utkast. Statusene beskriver GitHub, ikke visuell godkjenning eller full funksjon.

Etter #1005: 47 av de opprinnelige forslagene står igjen. 33 er konfliktfrie og ikke utkast, men trenger gjennomgang mot valgt design og funksjonskrav; #1010 har i tillegg skjemaavhengighet. 9 er utkast. De øvrige 5 har røde kontroller eller konflikt. #1065 er et nytt, aktivt Redis-utkast og inngår ikke i den opprinnelige tabellen.

Tabellen bygger på diffens filoversikt, PR-beskrivelsen, head-kontroller og sammenligning av berørte filer mot nyere main. En full kodelesing er gjort for #1005; resten er sortert for videre gjennomgang, ikke kvalitetsgodkjent. Ingen eksisterende PR er lukket som «utgått» uten at innholdet er ivaretatt.

| PR | Leveranse | GitHub ved kartlegging | Vurdering / neste steg |
|---|---|---|---|
| [#1060](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1060) | Pakke 1: fireukerssjekk, forslag og samtale (WANG og Team Norway) | UNSTABLE | Rød verify; bygger på #1004; skjema og spillerens svarflyt må kontrolleres |
| [#1059](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1059) | PH-24: Meg i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1058](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1058) | PH-24d: Utfordringer (liste, detalj, ny) i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1057](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1057) | PH-25: Abonnement og innstillinger i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1056](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1056) | PH-RD-03: Live runde (slag og putt) i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1055](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1055) | PH-05: Live-økt aktiv i Precision Athletics (natt) | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1054](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1054) | PH-15: Test gjennomfør i Precision Athletics (natt) | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1053](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1053) | PH-07: Etter økt (golf og fysisk) i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1052](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1052) | AgencyOS AG-07-NY: Ny spiller (skjema) i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1051](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1051) | PH-23: Booking (spiller) i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1050](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1050) | PH-21: Innboks i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1049](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1049) | PH-22: Caddie-chat og Foreslå turnering i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1048](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1048) | PH-17: TrackMan (økter, gapping, utstyr) i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1047](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1047) | PH-18: Runder og statistikk i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1046](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1046) | PH-20: Gameplan og banekart i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1045](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1045) | AgencyOS AG-05-TILG: Gammel tilgjengelighetsside i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1044](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1044) | PH-RD-08: Runde ferdig i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1043](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1043) | PH-14: Tester-oversikten i Precision Athletics (natt) | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1042](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1042) | PH-12: Velg treningsplan i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1041](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1041) | [PARKERT] AgencyOS AG-11-MND: Workbench måned i Precision Athletics (månedsskjema ikke bygget) | CLEAN / utkast | Utkast/parkert: bevar arbeidet; fullfør dokumenterte rester og skjermkontroll |
| [#1040](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1040) | PH-RD-01: Registrer runde, velg nivå i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1039](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1039) | AgencyOS AG-04-REST: E-postmal-redigering og Kø/Kommunikasjon-restfaner i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1038](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1038) | PH-06 Slagteller: portert til Precision Athletics (natt) | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1037](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1037) | PH-03: Øktark i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1036](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1036) | PH-04: Live-økt før start i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1035](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1035) | [PARKERT] AgencyOS AG-19: Jarvis (kø, prosjekter, skills, runtimes), kjøringsdetalj og Caddie-samtale for coach i Precision Athletics | CLEAN / utkast | Utkast/parkert: bevar arbeidet; fullfør dokumenterte rester og skjermkontroll |
| [#1034](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1034) | EP-02 Endret time i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1033](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1033) | EP-03: Påminnelse dagen før i Precision Athletics | BLOCKED | Rød verify; rett og kontroller mot ny main før visuell/helhetlig vurdering |
| [#1032](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1032) | AU-05: samtykke via lenke i Precision Athletics | BLOCKED | Rød verify; rett og kontroller mot ny main før visuell/helhetlig vurdering |
| [#1031](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1031) | AgencyOS AG-11-AR: Workbench årsplan og periode (spiller og gruppe), opprett-veileder, periodeskjema i Precision Athletics | CLEAN | Sammenhold med aktiv ny Workbench-eksport; bevar funksjon og test samlet med kjernegrenene |
| [#1030](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1030) | [PARKERT] AgencyOS AG-24: Drift (kun admin): logger, feillogg, GDPR, hjelp i Precision Athletics | CLEAN / utkast | Utkast/parkert: bevar arbeidet; fullfør dokumenterte rester og skjermkontroll |
| [#1029](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1029) | AU-02 Registrer: signup, sjekk e-post og betaling i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1028](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1028) | AU-04: oppstart for spiller i Precision Athletics (sju steg) | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1027](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1027) | AgencyOS AG-16b: Gruppas årsplan, skoledata og AK-stigen (4 trinn, Knøtt ved siden av) i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1026](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1026) | AgencyOS AG-23: Oppsett: profil, team og roller, inviter coach, ekstern trener, markedsføring i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1025](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1025) | BK-02: Velg tid og betal i Precision Athletics | CLEAN / utkast | Utkast/parkert: bevar arbeidet; fullfør dokumenterte rester og skjermkontroll |
| [#1024](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1024) | AgencyOS AG-A03: Gruppeanalyse (Stall › Grupper › Stats): stall og etterlevelse i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1023](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1023) | AgencyOS AG-15: Tester: normer/benchmarks og tildel test til spiller i Precision Athletics | CLEAN / utkast | Utkast/parkert: bevar arbeidet; fullfør dokumenterte rester og skjermkontroll |
| [#1022](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1022) | BK-03: kvittering for offentlig booking i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1021](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1021) | EP-01: bookingbekreftelse i Precision Athletics-malen | CLEAN / utkast | Utkast/parkert: bevar arbeidet; fullfør dokumenterte rester og skjermkontroll |
| [#1020](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1020) | EP-04: avbestillings-e-posten i Precision Athletics | CLEAN | Grønn CI og konfliktfri; kandidat etter valgt skjermreferanse, funksjonskontroll og Anders’ visuelle vurdering |
| [#1019](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1019) | BK-01: offentlig booking i Precision Athletics | CLEAN / utkast | Utkast/parkert: bevar arbeidet; fullfør dokumenterte rester og skjermkontroll |
| [#1018](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1018) | [PARKERT] AgencyOS AG-16a: Gruppedetalj (medlemmer) og faste tider i Precision Athletics | BLOCKED / utkast | Rød verify; rett og kontroller mot ny main før visuell/helhetlig vurdering |
| [#1010](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1010) | AgencyOS: Kalender og booking — de parkerte punktene i Precision Athletics | CLEAN | Skjema-/betalings-/flytteavhengighet; måldatabase og konkret autorisasjon må avklares før integrering |
| [#1005](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1005) | WANG-fellessiden: rett feilside (500) på /team-wang | CLEAN | Sammenslått i denne økten; teknisk feil, uendret design/tilgang |
| [#1004](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1004) | WANG og Team Norway: skjermene portert til kode | DIRTY | Konflikt i beslutninger; faktisk skjermgodkjenning mangler ifølge PR. Behold og samordne før #1060 |
| [#993](https://github.com/akgolfsoftware/Golf_Headquarters/pull/993) | chore: slett utgått docs/planer, design-audit, scripts/arkiv | DIRTY | Konflikt og ingen verify i avlest status. Store slettinger treffer fortsatt brukte planer; gjennomgå mot aktuelle kilder |
| [#931](https://github.com/akgolfsoftware/Golf_Headquarters/pull/931) | docs: standard årsplan Junior 16 år (fagutkast, under avklaring) | DIRTY / utkast | Fagutkast under avklaring, konflikt i beslutninger/registre; ikke fasit |

Ingen av de ordinære skjermgrenene hadde overlapp mellom sine berørte filer og nyere main ved målingen; dette forklarer konfliktfri Git-status. Det beviser ikke at de passer sammen med hverandre eller med de aktive nye kjernegrenene. Kjør samlet kontroll etter hver reiseleveranse. Særlig #1031/#1041 må vurderes mot Workbench som nå videreutvikles i Claude Design.

## Viktige restfunn fra kildene

- **Produksjonstest:** [kjøring 36873500557](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36873500557): 222 bestått, 6 feil, 72 utelatt. Tre forventninger feiler i begge nettlesere: glemt-passord-lenke, ekte lenker på login og e-post/passord-felt. Avlesningen avgjør ikke om app eller test er feil. Ikke knytt dette til #1005, som ble sammenslått senere.
- **Konkret avvik mellom test og kilde:** `LoginView.tsx` starter med e-postlenke (`metode = epost`). Passordfelt og «Glemt passord?» vises først etter «Logg inn med passord». De tre feilede testene forventer dem umiddelbart etter navigasjon. Neste retting er å prøve den faktiske overgangen og beholde kontrollene av passord/gjenoppretting. Dette forklarer en sannsynlig årsak til de seks feilene; ny nettleserkjøring og faktisk gjenoppretting er fortsatt nødvendig før grønn status.
- **Publisering:** [36869358488](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36869358488) feiler ved `Pull Vercel environment`. Forrige økt rapporterte manglende Vercel-secrets og vellykket separat CLI-publisering. Produksjonsversjon og valgt publiseringsvei må kontrolleres eksplisitt før lansering.
- **Automatisk testdekning:** `.github/workflows/ci.yml` kjører full verify, men ikke innloggede reiser. Produksjonstesten tester en URL og er ikke bevis for at en bestemt PRs skjermflyt virker. Full credit-booking/avbestilling er uttrykkelig utelatt i `tests/e2e/credit-booking.spec.ts`.
- **Kjerne:** #1064 har dokumentert lokal Workbench → Live → analyse. Aktive etterlevelses-, FYS- og gruppeoppgaver skal fullføre tilstøtende hull. Ikke gjenta den eldre påstanden om at hele denne kjeden mangler.
- **Personvern og betaling:** revisjon A06 (eksportomfang) og A07 (varig hendelsesbehandling ved avbrudd/gjenforsøk) står åpne. Ikke gjenta utdaterte generelle gaplister fra eldre skills uten kodekontroll.
- **Avhengigheter:** revisjon A10 registrerte én kritisk og seks høye pakkevarsler, men dokumenterte også at den kritiske bruksveien ikke var funnet i appen. Dette er et kontrollpunkt, ikke sju påviste appangrep. Ingen pakkeoppgradering gjort i denne oppryddingen.
- **Verktøy:** Vercel CLI 60.1.3 er meldt utdatert i sesjonskonteksten. Anbefalt oppgradering før videre Vercel-arbeid: `npm i -g vercel@latest` (62.1.0 ved dette kontrollpunktet). Ingen global installasjon endret her.

## Kontroll av denne leveransen

[GitHub CI etter #1005](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36875104252) er bestått på `3d8818238`. PR-ens historiske grønne kontroll er dermed supplert med fersk full kontroll av den sammenslåtte hovedgrenen.

Dokumentasjon og Git-opprydding endrer ingen database eller produksjonsinnstilling. Egen avhengighetsinstallasjon følger uendret låsefil og har ingen kopierte produksjonsmiljøfiler. Full lokal kvalitetskontroll kjøres med CI-ens syntetiske verdier, uten ekte utsendinger eller innloggede produksjonsprøver. Samlet `npm run verify` er bestått med Node 24.14.0: statiske kontroller, 3 876 enhets-/modultester + 14 komponenttester (3 890 totalt, 0 feil, 0 utelatt), Next.js-produksjonsbygg og Serwist. `npm run prosjekt:sjekk`, diffkontroll og en separat kontroll av de nye dokumentenes relative lenker er også bestått. Kontrollert kodegrunnlag er `3d8818238`; planleveransen endrer bare tre Markdown-filer. Innloggede reiser og produksjon er ikke testet lokalt i denne økten.

Ny produksjonstest etter #1005, [36875104233](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36875104233), endte også med 222 bestått, 6 feil og 72 utelatt. Det åpne innloggingspunktet består. De fem aktive øktene ble lest på nytt ca. 16.36; oppdatert fremdrift står i lanseringsplanens økttabell.
