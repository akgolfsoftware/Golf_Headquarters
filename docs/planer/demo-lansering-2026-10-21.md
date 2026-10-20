# Demo og lansering onsdag 21.10.2026: tavle, demoliste, integrasjonsplan og manus

Koordinatorens plan. Laget 20.10 kl. 02 mot main `b29266a4f`. Kildene er designauditen
(`docs/design-system/audit-design-fire-flater-2026-10-20.md`), front end-analysen
(`docs/design-system/analyse-frontend-playerhq-agencyos-2026-10-20.md`), nattplanen 18.10 og
øktene som jobber i natt. Regel: en status oppgraderes bare med bevis. «Bygget» er ikke «målt»,
og «målt» er ikke «sett av Anders».

Natten 20.10: Anders ba om at alle økter kjører uten godkjenningsknapper, og at ingenting legges
inn i main før han har sett over om morgenen. Øktene lager PR uten auto-merge.

## 1. Statustavle

| Flate | Status | Hva er sant nå | Bevis |
|---|---|---|---|
| PlayerHQ `/portal` | **Delvis, nær demoklar** | I dag, Plan, Stats og Meg er ferdigst i hele appen. Workbench har fått nivåene Uke, Gjenta og Målsetninger. Småfeil: Stats-bildet på PC, «0 av —» i Live, motstridende kategori i Meg. | #1442, #1455, #1459, #1461; audit §C og §D (målt 390/1280, ingen sidelengs rulling, ingen konsollfeil) |
| AgencyOS `/admin` | **Delvis** | Skall og meny (variant C) er ferdig. Cockpit laster i 29–59 sekunder. Innboksen har 3 766 saker, 3 692 av dem tomme forslag fra motoren. Stall viser 37 av 62 som «Trenger deg». | Audit A1, A4, B1. Økt økta «Cockpit A1+A4» jobber |
| WANG `/team-wang`, `/wang` | **Mangler for demo** | Funksjonene W1–W4 er i main. Demotreneren får 404 på hele trenerflaten, lokalt og i produksjon. `/wang` har fortsatt avrundet stil fra før 16.10. | W1 #1429, W2 #1423, W3 #1427, W4 #1425/#1431; audit A3, B2. Økt økta «Demotrenerne A2+A3» jobber |
| Team Norway `/team-norway`, `/teamnorway` | **Mangler for demo** | T1–T3 og «Skrå» TN-01 er i main. Demotreneren får «Siden finnes ikke» på alle sider. Resten av TN-skjermene i Skrå gjenstår. | T1 #1428, T2 #1421, T3 #1424, Skrå #1463; audit A2. Samme økt som WANG |
| Pipelines (`ak-golf-pipelines`) | **Delvis** | Nøkkel = GolfBox-RID er på plass i `public_db.py`. Mandagsjobben kjører identity → sg → refresh_views, sist grønn 19.10. HQ-skraperen skriver ikke lenger resultater (`syncGolfBoxLeaderboards` fjernet). Profilkobling til PlayerHQ bygges i natt. | `junior-tours-sync.yml` 19.10 success; `golfbox-public-sync.yml` 19.10 success; `scripts/scrape-golfbox.ts:10`; økt økta «Profilside» |

**Data Golf:** Anders 20.10 bekreftet #1450: bare ADMIN (Anders), på alle flater, aldri utad (beslutninger §DATA GOLF ER ANDERS' PRIVATE VERKTØY). Demokontoene for WANG og TN ser ikke Data Golf.

## 2. Git

Målt 20.10 kl. 01:40. Ingen gren fra 16.10 eller senere har ferdig arbeid som mangler i main:

| Grener | Vurdering |
|---|---|
| `tn-pakke-4/5/9`, `natt-t2`, `natt-t3`, `natt-w2`, `natt-a3-pakke14-meg`, `natt-a5-pakke3`, `booking-steg6-duo`, `marked-kjernesider-b2`, `wang-tn-innlogging`, `datagolf-kilde-norske-katalog`, `tmp/verify-alle-tre`, `tn-maaling-lokal` | Lagt inn via #1411, #1421, #1424, #1423, #1387, #1401, #1422, #1420, #1412, #1443. Latt stå. |
| `wang-pakke-3-6`, `wang-pakke-3-trening` | #1400 lukket; innholdet kom i #1330–#1337 og #1432. Latt stå. |
| `backup/*-1019`, `sikkerhet/*-1018` | Sikkerhetskopier fra flytting til Mac Mini. Latt stå. |
| `skjermbilder-*` | Bildegrener som lenkes med `/raw/`, skal ikke i main. Latt stå. |
| `chore/slett-utgatt*`, `chore/rydd-*` | Gamle slettegrener, foreldet mot main. Latt stå. |
| Grener fra 29.09–13.10 (`ph-ph-*`, `agencyos-ag*-0930`, `codex/pr-10xx-*`, `grok/*`, `pakke-1-felles-kjerne`, `port-wang-tn`, `hq-complete-upgrade`) | Erstattet av ombyggingen i nytt design 13.–19.10. Foreldet, latt stå. |
| PR #1083 (utkast, `codex/ak-sg-runtime`) | 85 filer mot main fra 02.10, foreldet. Bør lukkes med begrunnelse; Anders bekrefter. |

Ingen gren er slettet, ingen er tvangsopplastet. Fire arbeidsmapper uten eget arbeid
(`marked-forside`, `wang-tn-lyst-maal`, `agencyos-rest-nytt-design`, `akgolf-hq-dg`) kan fjernes; det ble
stoppet i natt og venter.

## 3. Demo-kritisk liste for onsdag

| # | Punkt | Eier | Ferdig når |
|---|---|---|---|
| 1 | Demotrenerne kommer inn på WANG og Team Norway (A2+A3) | økta «Demotrenerne» | `demo@wang.no` åpner `/team-wang/coach` og `demo@golfforbundet.no` åpner `/team-norway` på Vercel uten feilside, 390 og 1280 px |
| 2 | Cockpit under 2 sekunder (A1) | økta «Cockpit» | `/admin/agencyos` svarer under 2 s målt tre ganger |
| 3 | Motoren slutter å lage tomme forslag, køen ryddes (A4) | økta «Cockpit» | Ingen nye «Forslag fra motoren» med tom tekst; innboksen viser ekte saker. Rydding av eksisterende rader er sletting i produksjon og krever Anders' ja |
| 4 | «Trenger deg» i Stall kalibreres (B1) | Ny økt etter punkt 2 | Under en tredjedel av stallen er røde med demodata, regelen låst med test |
| 5 | `/wang` i vinrødt og firkantet (B2) | Ny økt etter punkt 1 | `/wang` følger §WANG-TRENERFLATEN FØLGER STILEN PÅ WANG.NO i 390 og 1280 |
| 6 | Ett tokensett (forslag 1+2) | økta «Tokensett» | Ingen visuell endring, verify grønn. Ikke demo-kritisk; legges inn bare hvis grønn |
| 7 | Profilkobling: spillerens turneringsresultater i PlayerHQ | økta «Profilside» | En demospiller med `publicPlayerId` ser egne resultater i Stats › Resultater |
| 8 | Data Golf: bare Anders har ADMIN | Koordinatoren | Lesespørring viser at hver ADMIN-konto er Anders' egen (beslutningen punkt 1) |
| 9 | Demomanuset gått gjennom | Koordinatoren | §5 åpnet i 390 og 1280 på Vercel, uten sidelengs rulling, konsollfeil eller demodata som utgir seg for å være ekte |
| 10 | `npm run verify` grønn på main og Vercel-produksjon grønn | Koordinatoren | Etter at PR-ene over er lagt inn om morgenen |

## 4. Integrasjonsplan D: Data Golf, turneringsresultater og spillerprofiler

| # | Steg | Når | Ferdig når |
|---|---|---|---|
| 1 | Nøkkelen er GolfBox-RID i pipelines (`public_db.py`) | **Gjort** | Ingen dubletter etter mandagskjøring (analysen §4b gir 0 rader) — gjenstår å måle |
| 2 | Mandagskjeden identity → sg → refresh_views | **Gjort** | `junior-tours-sync.yml` grønn 19.10 |
| 3 | HQ-skraperen skriver ikke resultater | **Gjort** | `syncGolfBoxLeaderboards` fjernet fra `scripts/scrape-golfbox.ts` |
| 4 | Felles leser `hentSpillerprofil` og tilgangsregel (selv, coach, organisasjonstrener) | **Før demo** | Grenen `claude/profil-leser` har tester og er i main |
| 5 | Kobling `User.publicPlayerId` ↔ `public_players` for demospilleren | **Før demo** | Demospilleren har kobling, Stats › Resultater viser ekte turneringer med dato og kilde |
| 6 | WANG-trener ser elevens turneringsresultater når eleven har delt | **Før demo** (lesing) | Elevsiden i `/team-wang/coach` viser resultater fra samme leser, «—» uten deling, låst med test |
| 7 | Komplett tilbakemelding for trener: IUP, Fireukerssjekk, tester, økter på én elevside | **Etter lansering** | Én elevside med alle fire delene, bak `navngittTrenerHarTilgang` |
| 8 | Selvbetjent kobling «Finn deg i turneringsresultatene» i oppstarten | **Etter lansering** | Spilleren velger seg selv, coach bekrefter, låst med test |
| 9 | Data Golf forblir Anders' private verktøy: ingen vei utad (markedslenker, eksport) | **Etter lansering** | Punkt 2 i §DATA GOLF ER ANDERS' PRIVATE VERKTØY er låst med test |
| 10 | Vakt: HQ `sync-vaktbikkje` varsler når mandagskjeden mangler eller er rød | **Etter lansering** | Simulert rød kjøring gir varsel |

## 5. Demomanus

Alle adresser på `https://akgolf-hq.vercel.app`. Demokontoene er de samme som i designauditen.
Ingen ekte elevnavn vises; bare demospillere.

1. **Innlogging** — `/auth/login` (Google eller e-post og passord).
2. **PlayerHQ som spiller** (`screentest`): `/portal` (I dag) → `/portal/planlegge` (Plan) →
   `/portal/planlegge/workbench` (Uke, Gjenta, Målsetninger) → `/portal/analysere` (Stats) → `/portal/meg`.
3. **AgencyOS som coach** (`coachtest`): `/admin/agencyos` (Cockpit, først når punkt 2 er grønt) →
   `/admin/innboks` (først når punkt 3 er grønt) → stallen → `/admin/kalender` → coachens Workbench.
4. **WANG som trener** (`demo@wang.no`): `/wang` → `/team-wang/coach` (I dag) → Trening → Elever → én elev.
   Bare når punkt 1 er grønt.
5. **Team Norway som trener** (`demo@golfforbundet.no`): `/teamnorway` → `/team-norway` (TN-01 Skrå) →
   Spillere → Uttak → Månedsplan. Bare når punkt 1 er grønt.

Hver flate vises bare hvis den er gått gjennom i 390 og 1280 px samme morgen.

## 6. Oppdateringer

Tavla over oppdateres i `~/ak-brain/prosjekter/akgolf-hq.md` når øktene melder fra.
