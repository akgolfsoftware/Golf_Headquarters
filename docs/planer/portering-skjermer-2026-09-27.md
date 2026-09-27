# Plan for portering: fra Claude Design til kode — 27.09.2026

**Status:** Fase 0 er gjennomført for skjermene (PR #979). Porteringen gjøres av Opus 5.5 i Claude Code (Anders 27.09.2026).
**Erstatter:** planen fra 25.09 (`plan-portering-claude-design-til-kode-2026-09-25.md`), som bygger på gjetting (se §2).
**Omfang:** PlayerHQ (`/portal`), AgencyOS (`/admin`), WANG (`/team-wang/coach`) og Team Norway (`/team-norway`).
**Grunnlag:** gjennomgang av `origin/main` (`d025124c3`), alle grener og arbeidsmapper, 27.09.2026 kl. 22:30.

## 1. Kort fortalt

- Designet er ferdig tegnet for alle fire områdene. Ingen skjerm er ennå sett og godkjent av Anders (port 7).
- Koden har funksjonene, men nesten alt har fortsatt det gamle utseendet (Train-lock).
- Forrige porteringsforsøk (26.09) byttet ut fem ekte skjermer med demoskjermer med oppdiktede
  navn og tall. To nye demoskjermer kom inn i kveld (#977). Det må rettes først.
- Designpakkene må legges i repoet før start, så porteringen ikke avhenger av en kobling som kan falle ut.
- Regelen som styrer hele planen: **bytt utseendet, behold dataene.** En skjerm som virker i dag,
  skal virke likt etterpå — med ekte data, samme tilgangskontroll og samme handlinger.

## 2. Gjennomgangen — hva som ble funnet

### Main og grener

| Gren | Tilstand | Anbefaling |
|---|---|---|
| `origin/main` | Siste: øvelsesbank koblet til test og plan (#977, kl. 22:17 — kontrollen kjørte fortsatt da dette ble skrevet), Workbench fysisk plan og turnering (#976), runde/SG (#975), Team Norway TN-01–19 (#958) | Utgangspunkt for alt nytt |
| `claude/arsplan-junior-16` (PR #931) | Eneste åpne PR. Fagutkast, ikke godkjent | La stå til faginnholdet er godkjent |
| Lokal `main`, `claude/branches-ready-merge-b54509` | 5 lokale sammenslåinger som allerede ligger i main via #975 | Kan slettes — innholdet er i main |
| `codex/runde-sg-kontrakt`, `codex/workbench-fys-turnering` | Innholdet er i main via #975 og #976 | Kan slettes |
| `Strokesgained`, `codex/komplett-design-gjennomgang`, `claude/wang-turneringer-2026-09-27` | Ingen egne endringer, bare bak main | Kan slettes |
| `codex/test-plan-master-2026-09-26` | Lagt inn i main som #977 mens gjennomgangen pågikk | Kan slettes |
| `origin/chore/rydd-utgatt` | 19 lagringer foran main, 19 filer. Oppryddingsøkta | Eies av oppryddingsøkta — ikke rør |
| `origin/claude/ow3-workbench-session-consolidation-763893` | 515 bak main, fra 17.09 | Utdatert. Kan slettes etter sjekk av de 4 lagringene |
| Parkert arbeid (stash) `codex/treningsmotor` | Ulagret arbeid satt til side 27.09 | Må avklares: fullføres eller kastes |

Ikke kontrollert: ulagrede filer i de andre arbeidsmappene. Kontrollen ble stoppet av
sikkerhetsregelen i denne økta. Sesjonsnotatet fra Codex (27.09 kl. 21:46) sier at rotmappa er ren.

### Funn som må rettes

| # | Funn | Hvor | Alvor |
|---|---|---|---|
| F1 | Stall-lista viser fem oppdiktede spillere i stedet for den ekte stallen. Den ekte lasteren (`loadStallen`) ble koblet fra 26.09 | `/admin/spillere`, `/admin/stall` | Høy |
| F2 | Live-økt viser en oppdiktet økt, ikke spillerens egen | `/portal/live` | Høy |
| F3 | Innloggingen har en «SMS tofaktor»-knapp som bare viser en melding og sender videre. Det finnes ingen SMS-kontroll bak | `/auth/login` | Høy |
| F4 | To WANG-skjermer med oppdiktede navn ligger åpent uten innlogging. Beslutningen 27.09 sier at `/team-wang` utenom fellessiden bare er for sportssjef og trener | `/team-wang/rekruttering`, `/team-wang/toppidrett` | Høy |
| F5 | Skjermkatalogen med demoskjermer ligger åpent uten innlogging | `/skjermer` | Middels |
| F6 | De ni «Precision»-skjermene fra 26.09 har 21–92 hardkodede farger hver. Designets egne fargenavn (tokens) finnes ikke i koden | `src/components/**/**Precision*.tsx` | Middels |
| F7 | `/admin` starter fortsatt mørkt. Beslutningen 26.09 sier lyst. Nattema finnes ikke i koden | `src/lib/v2/tema-default.ts` | Middels |
| F8 | Fire styrende dokumenter peker fortsatt på det gamle designet («App design») | `AGENTS.md`, `START-HER.md`, `docs/platform/AGENT-BRIEF.md`, `docs/FASIT.md` | Middels |
| F9 | Planen fra 25.09 inneholder ting som ikke er besluttet eller er fjernet: Vipps, kategori A–K, magisk lenke med SMS, fraværsmelding i WANG, farger som ikke er i systemet | `docs/planer/plan-portering-…-2026-09-25.md` | Middels |
| F10 | Designets overlevering (`overlevering/codex.md`, `tokens.css`) finnes bare i Claude Design, ikke i repoet | — | Blokkerer start |
| F13 | Meg, fysisk og forelder var koblet til demovisninger med faste reserveverdier (snitt 73,4, «Coach Anders») | `/portal/meg`, `/portal/fysisk`, `/forelder`, `/portal/toppidrett` | Høy |
| F14 | Personvernerklæringen var byttet med en side der «Slett alle mine data» bare viste en bekreftelse uten å slette | `/personvern` | Høy |
| F15 | Offentlig booking lovet Vipps og hadde mistet abonnementene | `/booking` | Middels |
| F11 | To nye sider fra #977 viser faste demotall uten spillerens egne data, med 273 og 185 hardkodede farger | `/portal/teknisk`, `/portal/periodeplan` | Høy |
| F12 | #977 gjenopplivet tre filer som var slettet med vilje (#562, #893) og la utgått fagspråk inn i kunnskapsgrunnlaget AI-agentene leser: L-faser, CS, M0–M5 og PR1–PR5. I tillegg et kategorisystem med egne farger per akse | `src/lib/masterbrain/rag-corpus/morad/`, `src/lib/domain/ak-kategorisystem.ts` | Høy |

F1–F5 kom inn som direkte lagringer i main natt til 26.09 (`29c0e9421`, `0048632b1`, `ed7ae13e8`,
`bf9821294`, `8603082ba`), uten PR og uten kontroll. Main er nå sperret for direkte lagring.

### Hvor langt hvert område er

| Område | Design | Kode i dag | Godkjent av Anders |
|---|---|---|---|
| PlayerHQ | 26 skjermtyper + runde (PH-RD-01–09) + Workbench fysisk/turnering + analyse (PH-A01–08). Kontrollert, 0 avvik | 177 sider. Funksjonene virker. Gammelt utseende, 5 demoskjermer | Nei |
| AgencyOS | 24 skjermtyper + runde (AG-RD-01–02) + Workbench fysisk/turnering + analyse (AG-A01–08). Kontrollert, 0 avvik | 163 sider. Funksjonene virker. Gammelt utseende, 1 demoskjerm (F1) | Nei |
| WANG | 43 menypunkter i prototypen, to roller, seks hovedpunkter. Runde 19 (NGF-tester) er sendt, ikke bekreftet ferdig | 7 sider. Bare fellessiden, trenerforsiden, IUP og turneringer er ekte | Nei |
| Team Norway | TN-01–19 levert | 35 sider, bygget med ekte data i #958. Gruppen har 0 spillere, så det meste viser tom tilstand | Nei |

## 3. Designkildene

| Område | Prosjekt i Claude Design | ID |
|---|---|---|
| PlayerHQ og AgencyOS | AK Golf Precision Athletics | `7d7c2994-cf63-4c5f-9bdc-fdaf67655a70` |
| WANG trenerflate | WANG Golf UI prototype (bygger på WANG Toppidrett Designsystem `3580374e`) | `6cfa623c-b2c7-494f-b1bd-9c254b02f335` |
| Team Norway | Team Norway App (leveranse `bc3e41fc`) | `bf70a934-12f1-4c0a-8153-685c4b03e6af` |

De tre systemene blandes aldri. Skrift, farger og hjørner fra ett område brukes ikke i et annet.
Skjermlista for PlayerHQ og AgencyOS: [skjermliste-precision-athletics.md](../design-system/skjermliste-precision-athletics.md).

## 4. Faste regler for porteringen

1. Les [AGENTS.md](../../AGENTS.md), [beslutninger.md](../../.claude/rules/beslutninger.md) og
   [gotchas.md](../../.claude/rules/gotchas.md) før første endring. Ved konflikt vinner beslutningene.
2. **Bytt utseendet, behold dataene.** Sidefila (`page.tsx`) beholder tilgangskontroll, lastere og
   handlinger. Bare visningskomponenten byttes. Finnes ikke tallet, vises «—». Aldri oppdiktede
   navn eller tall i en rute brukere kan nå.
3. Ingen hardkodede farger, skrifter eller hjørner. Alt går gjennom fargenavnene (tokens) for området.
4. Egen gren per skjermtype: `claude/port-<område>-<skjerm-ID>`, fra fersk `origin/main`.
   Én PR per skjermtype. Aldri lagring rett i main. Aldri `git add -A`.
5. Ingen endring i database, tilgangsregler, `vercel.json` eller betaling uten Anders' ja til akkurat den endringen.
6. Aldri sidelengs rulling. Treffflater minst 44 px.
7. Ett område om gangen per verktøy. To økter jobber aldri i samme skjermtype samtidig.
   Før start: sjekk åpne PR-er og grener for samme skjerm-ID.
8. Ingen elevnavn eller spillernavn i sky-prompts. Bruk syntetiske testdata i den lokale testbasen.

## 5. Oppskrift per skjermtype

| Steg | Hva | Ferdig når |
|---|---|---|
| 1 | Les skjermens tegning og beskrivelse i designpakken | Skjerm-ID, ruter, tilstander og handlinger er listet i PR-en |
| 2 | Les dagens sidefil og komponent. List hver laster, handling og tilgangssjekk | Lista står i PR-en |
| 3 | Bygg ny visning med områdets tokens og felles komponenter | Ingen hex-farger i fila |
| 4 | Koble til de samme lasterne og handlingene | Hver handling fra steg 2 er med, eller avviket er forklart |
| 5 | Tilstandene data, tom, laster og feil | Alle fire kan vises |
| 6 | Mål i 390, 768, 1024 og 1280 px (1440 for AgencyOS), lyst tema og natt der skjermlista sier det | `scrollWidth === clientWidth` i alle bredder. Tallene står i PR-en |
| 7 | `npm run verify` | Grønn |
| 8 | Skjermbilder av appen ved siden av tegningen, mobil og desktop | Ligger i PR-en |
| 9 | Anders ser skjermen (port 7) | Anders har sagt ja. Først da slås PR-en sammen |

## 6. Fasene

### Fase 0 — Rett feilene (skjermene rettet 27.09.2026 i PR #979; 0.6 og 0.8 gjenstår)

| Steg | Arbeid | Ferdig når |
|---|---|---|
| 0.1 | F1: koble `/admin/spillere` og `/admin/stall` tilbake til `loadStallen` | Lista viser den ekte stallen. Test låser at siden ikke rendres uten laster |
| 0.2 | F2: `/portal/live` viser spillerens egen økt eller sender til dagens økt | Ingen oppdiktet økt kan vises |
| 0.3 | F3: fjern SMS-knappen og alt annet i innloggingen som ikke har ekte kontroll bak | Hver knapp gjør det den sier |
| 0.4 | F4 og F5: legg `/team-wang/rekruttering`, `/team-wang/toppidrett` og `/skjermer` bak innlogging for coach og admin | Åpnet uten innlogging gir innloggingssiden |
| 0.5 | F11: `/portal/teknisk` og `/portal/periodeplan` kobles til spillerens egne data eller sendes videre til den ekte planen | Ingen faste demotall kan vises |
| 0.6 | F12: Anders avgjør om L-fase-filene og kategorisystemet skal ut eller skrives om til AK-formel v2 | Ingen utgått kode i det agentene leser |
| 0.7 | F8 og F9: rett de fire dokumentene til Precision Athletics, merk 25.09-planen som erstattet | `npm run prosjekt:sjekk` grønn |
| 0.8 | Rydd grenene merket «kan slettes» i §2 | Bare main, #931, oppryddingsgrenen og aktive arbeidsgrener står igjen |

### Fase 1 — Designpakkene inn i repoet

Krever at Anders har koblet til Claude Design på nytt (`/design-login` i en vanlig `claude`-terminal).

| Steg | Arbeid | Ferdig når |
|---|---|---|
| 1.1 | Hent overleveringen fra `7d7c2994`: `overlevering/codex.md`, `tokens.css`, `oversikt.html`, skjermfilene per kit | Ligger i `designsystem/precision-athletics/` med dato og filhasher |
| 1.2 | Hent WANG-prototypen fra `6cfa623c` (alle batch-filer + skjermoversikten) | Ligger i `designsystem/wang-ui/` |
| 1.3 | Hent Team Norway-leveransen fra `bc3e41fc` | Ligger i `designsystem/team-norway-app/` |
| 1.4 | Én tabell per område: skjerm-ID → tegning → rute → dagens komponent | Hver rute i omfanget har én rad |

### Fase 2 — Fundamentet for PlayerHQ og AgencyOS

| Steg | Arbeid | Ferdig når |
|---|---|---|
| 2.1 | Legg designets `tokens.css` inn som eget tokenlag. Lyst i `:root`, natt i `[data-theme="night"]` | Verdiene er byte-like med designpakken. Vakt i `verify` |
| 2.2 | Tema: `/admin` starter lyst. Natt i Live-økt og slagregistrering | `tema-default.ts` med tester |
| 2.3 | Skall: PlayerHQ fire faner, AgencyOS-meny, hurtigknappen i AgencyOS-skallet | Ett skall per område, brukt av alle sider |
| 2.4 | Grunnkomponenter fra designet: knapp, kort, felt med feilmelding, tabell som blir kortrader, ark, tidslinje, tom/laster/feil | Hver har test og vises i `/skjermer` (bak innlogging) |
| 2.5 | Skriv de elleve «Precision»-skjermene om til tokens og ekte data, eller fjern dem | 0 hex-farger i alle elleve |

### Fase 3 — PlayerHQ

| Bolk | Skjermtyper | Reise |
|---|---|---|
| P1 | PH-01, PH-02, PH-03, PH-04–07 | I dag → åpne økt → gjennomfør → oppsummering |
| P2 | PH-10, PH-11 med fysisk plan og turnering, PH-12, PH-13 | Planlegge uka |
| P3 | PH-08, PH-09, PH-RD-01–09, PH-14, PH-15 | Registrere runde og test |
| P4 | PH-16–20, PH-A01–08 | Analyse |
| P5 | PH-21–26 | Coach, booking, Meg, abonnement |

### Fase 4 — AgencyOS

| Bolk | Skjermtyper | Reise |
|---|---|---|
| A1 | AG-01, AG-02, AG-03, AG-04 | Coachens morgen: hjem, kø, oppfølging, innboks |
| A2 | AG-07, AG-08, AG-09, AG-RD-01–02, AG-A01–08, AG-10 | Stall og spiller |
| A3 | AG-11 med fysisk plan og turnering, AG-12, AG-13, AG-14, AG-15 | Planlegge og gjennomføre |
| A4 | AG-05, AG-06, AG-16, AG-17, AG-18 | Kalender, booking, grupper, turneringer |
| A5 | AG-19–24 | Caddie, økonomi, oppgaver, oppsett, drift |

Sjekket 27.09 mot hullene i beslutninger.md §AG-03b punkt 4: «Løst» i oppfølgingskøen og ny
utfordring er bygget i koden. Caddie-samtalen for coach (AG-19) mangler fortsatt —
`getOrCreateActiveConversation` har ingen kallere — og må bygges sammen med skjermen.
Øvelsesredigering (AG-14) har lagringskode, men det er ikke kontrollert at coach når den fra en skjerm.

### Fase 5 — WANG trenerflate

Fellessiden `/team-wang` røres ikke. Alt nytt ligger under `/team-wang/coach` og krever innlogging.

| Bolk | Arbeid |
|---|---|
| W1 | Skall med seks hovedpunkter: I dag · Trening · Tester · Konkurranse · Meldinger · Elever. Administrasjon i tillegg for sportssjef |
| W2 | Tilgang: bare trener og sportssjef. Elev som åpner en trenerside sendes til PlayerHQ. Test låser det |
| W3 | Skjermer der dataene finnes i dag: elevliste, IUP, turneringer, Trening-oversikt (WANG-42) |
| W4 | Skjermer som trenger nye tabeller (testdag, oppmøte, samlinger, koordinering mellom skoler). Hver tabell krever Anders' ja først |

Elevnavn er opplysninger om mindreårige. Alle skjermer med navn ligger bak innlogging, og testene
bruker oppdiktede elever.

### Fase 6 — Team Norway

Skjermene er bygget. Det som gjenstår er kontroll, ikke nybygg.

| Bolk | Arbeid |
|---|---|
| T1 | Mål alle 35 sider i 390 px og desktop, tom/laster/feil |
| T2 | Sjekk at alle sider bruker det felles skallet (`TnShell`) |
| T3 | Syntetisk testgruppe i lokal testbase, så skjermene kan ses med innhold |
| T4 | Anders ser TN-01–19 |

### Ikke med i denne planen

Forelder, konto, offentlig booking, e-postene, statistikk, GFGK Junior og markedssidene.
De er tegnet (unntatt markedssidene) og tas i en egen plan etter fase 4.

## 7. Startmelding til Opus 5.5

```text
Du jobber i AK Golf HQ. Les disse filene før du gjør noe:
1. AGENTS.md
2. .claude/rules/beslutninger.md
3. .claude/rules/gotchas.md
4. docs/planer/portering-skjermer-2026-09-27.md

Følg §4 (faste regler) og §5 (oppskrift per skjermtype) i planen uten unntak.
Viktigst: bytt utseendet, behold dataene. Aldri oppdiktede navn eller tall i en
rute brukere kan nå. Aldri hardkodede farger. Aldri lagring rett i main.

Skjermene i fase 0 er rettet. Start med fase 1, steg 1.1. Én skjermtype per gren og PR.
Kjør npm run verify før hver PR.
Svar på norsk bokmål, kort og uten faguttrykk.
```

## 8. Avklart 27.09.2026

Anders: «Om du anbefaler noe annet så gjør dine anbefalinger.» Derfor gjelder anbefalingene:

1. Opus 5.5 porterer utseendet. Codex fortsetter med funksjoner og data. De jobber aldri i samme skjermtype samtidig.
2. Fase 0 ble rettet før porteringen startet.
3. Anders ser skjermene én bolk om gangen (P1, P2 …), ikke skjerm for skjerm.
