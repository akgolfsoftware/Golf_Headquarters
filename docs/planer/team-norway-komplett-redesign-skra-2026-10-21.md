# Team Norway: komplett redesign i Skrå-drakten (plan)

Status: **utkast til godkjenning 21.10.2026. Ingen kodeendring før Anders har sagt ja.**
Gjelder `/team-norway/*` og `/teamnorway` (innlogging). Samme metode som PlayerHQ og AgencyOS 20.–21.10: bygge i appen, én skjermtype om gangen, ikke tegne alt på nytt.

## 1. Hva kartleggingen viser

**Beslutninger som gjelder** (`.claude/rules/beslutninger.md`):
- §TEAM NORWAY-APPEN FÅR RETNING «SKRÅ» (19.10): bilde i navy toner, kuttet 4° med rød kant, myke kort med radius og navy-skygger, rund avatar. Skråkuttet bare på store flater, aldri kort eller knapper. Bilder bare fra Team Norway Golf-merket (`3416f258`), aldri PlayerHQ-kopier.
- §TEAM NORWAY-APPEN BEHOLDER NAVY SIDEMENY OG BYTTER TIL SCHIBSTED GROTESK (20.10): navy sidemeny på PC, Schibsted Grotesk i tekst, IBM Plex Mono på tall.
- §PLAYERHQ OG AGENCYOS FÅR SKRÅ-DRAKTEN (20.10): lagdelte myke skygger, kort 18 px og statkort 14 px, ett hovedtall per flate, bevegelse som følger «reduser bevegelse». Punkt 6 sier at Team Norway gjør resten av skjermene ferdig i Skrå.
- Står fast: rød `#D70232` er identitet, aldri status eller akse. TN-aksefargene (14.10). «IUP» heter spillerprofilen. Hele `/team-norway/*` er stengt for uinnloggede. Data Golf bare for ADMIN. Trenere fører bare Teknikk- og PEI-tester.

**Skissen** (https://claude.ai/artifact/CFWLRivbevoeKAnVr1x43B, godkjent «Alle godkjent» med type 4 A, 5 A, 7 B): 12 skjermtyper. Den er tegnet for PlayerHQ og AgencyOS i grafitt og IBM Plex. For Team Norway bytter vi bare drakten (navy, rød kant, Schibsted, TN-bilder, TN-logo); oppbyggingen per type er den samme.

**Fasit i repoet:** `docs/design-system/utkast-skra/index.html` (I dag og Cockpit), `docs/design-system/utkast-tn/nye-veier.html` (retning 1 Skrå) og `utkast-tn/README.md`. Utkastene i `utkast-tn/*.html` er tegnet før Skrå og er funksjonsinventar, ikke fasit for utseende.

**Hva som allerede er gjort:** 34 TN-tavler ble godkjent 20.10 og portert i pakker (#1512–#1555). `TnSkraTopp` + `TnSkraKort` (`src/components/team-norway/tn-skra-topp.tsx`) finnes og brukes av 23 filer. Tokens for radius, tre skyggenivå og skråkutt står i `src/styles/team-norway-tokens.css`. Layout laster Schibsted Grotesk.

**Hva som mangler** (funnet ved søk etter `TnSkraTopp` i skjerm- og siderfilene; ikke sett i nettleser i denne økta):

| Gruppe | Skjermer uten `TnSkraTopp` |
|---|---|
| Hjem og inngang | `/teamnorway` innlogging (`tn-innlogging.tsx`, flat navy skinne uten bilde). Rettet i steg 3: `/team-norway` (`tn-oversikt-skjerm`) var allerede i Skrå fra #1463 med egen bildetopp, ikke «uten topp» |
| Spiller (IUP) | `spiller/[id]` (innlegg og tidslinje), `evaluering` (Fireukerssjekk), `profil`, `turneringsplan`, `analyse`, `oversikt` bruker eget uttrykk |
| Detalj | `turneringer/[id]`, `samlinger/[id]`, `protokoller/[id]`, `fellestesting/[deltakerId]`, `tester/[testId]` (har topp i visning, må kontrolleres) |
| Lister og drift | `[groupId]` (gruppeposter), `[groupId]/dokumenter`, `live-watch`, `apparatet`, `inviter`, `tilgang`, `turneringer/ny` |
| Felles | `loading`, `error`, `not-found`; toppen på mobil (`rail-mobil.tsx`); `tn-flate.tsx`, `tn-grunnmur.tsx`, `tn-stall.tsx` har fortsatt egne varianter av kort og knapper |

Skjermer som har topp (rangliste, uttak, turneringer, spillerutvikling, samlinger, testprotokoller, månedsplan, Data Golf, College m.fl.) regnes som portert, men går gjennom kontrollen i steg 9.

## 2. Plan (10 steg)

Hvert steg er en PR med auto-merge når `npm run verify` og CI er grønne. Hver skjerm måles i 390 og 1280 px: ingen sidelengs rulling, ingen konsollfeil, tom/laster/feil.

1. **Felles grunnmur i Skrå.** Én variant av bildetopp (stor med hovedtall, lav for undersider uten bilde eller med lite bilde), ett kort, én knapp, én tom-tilstand, bevegelsestider og «reduser bevegelse». Samle `tn-flate`, `tn-grunnmur`, `tn-stall` og `tn-skjerm` mot dette. Lag `lav`-valg i `TnSkraTopp` (som `SkraTopp` i PlayerHQ). Ferdig når ingen TN-skjerm trenger egne kort- eller knappestiler, og token-sjekk viser at verdiene bare står ett sted.
2. **Skall, logo og navigasjon.** Navy sidemeny (`TnShell`/`TnRail`) og mobiltopp (`rail-mobil`) i samme drakt som de nye PlayerHQ- og AgencyOS-menyene; TN-logoen fra fil, ikke gjenbygget. Ferdig når logoen er sammenlignet med originalfilen (innhold, ikke filstørrelse) på alle skjermer.
3. **Hjem (TN-01) og innlogging.** `/team-norway` får bildetopp med ett hovedtall (saker som venter), kort over kanten (neste samling med nedtelling, gruppas trening, turnering nå). `/teamnorway` får Skrå-bildet og navy/rød. Manglende data vises «—». Ferdig når ingen tall er faste i koden.
4. **Type 4 Liste (A: filterpiller i toppen, hovedkort «Haster»).** Spillere/stall, Gruppeposter, Samlinger, Turneringer, Protokoller, Skoler, College, Fagapparat, Apparatet, Dokumenter, Inviter. Tabell blir kortrader på mobil.
5. **Type 5 Detalj (A: hovedhandling i toppen).** Turnering, samling, protokoll, fellestestingsdeltaker, testdetalj, teknisk plan. Én ting med handlinger, kort under.
6. **IUP-profilen (spiller/[id]) i alle faner.** Oversikt, Fireukerssjekk, Tester, Teknisk plan, Turneringsplan, Analyse, Innlegg. Bilde i toppen, fanene som piller, tall i én stripe. Bruker aksefargene fra 14.10. Ferdig når alle IUP-faner har samme topp og fanerad.
7. **Type 6 Skjema og type 7 Arbeidsflate (B: verktøylinje over flaten).** Ny turnering, ny samling, testdag opprett/føring, tilgang og invitasjon (skjema). Workbench og månedsplan (lav topp, ingen bilde).
8. **Type 9 Kø, type 11 Drift og type 12 Tom/laster/feil.** Uttak/godkjenninger som kø med én sak åpen, Lisens og økonomi, Data Golf (ADMIN), live-watch, `loading.tsx`, `error.tsx`, `not-found.tsx`. Ferdig når alle tre tilstander finnes i samme kortform.
9. **Bilder, kontroll og port 7.** Bytt plassholderbilder til Anders sine referansebilder fra Team Norway Golf (`public/team-norway/bilder/`). Maskinell måling av alle TN-ruter i 390 og 1280 (skjermprøve-skriptene fra T1/T4), Vercel-lenke og skjermbilder til Anders. Rydd bort ubrukte 0·2·4-stiler. Ferdig når et søk etter «Jost», «Lato» og «ingen skygger» i TN-mappene gir 0 treff.
10. **Referansespillere Norden i Team Norway** (lagt til 21.10 etter skissen https://teamnorwayref.vercel.app, bak innlogging). Ny flate «Referansespillere» for trenere i Skrå: leaderboard «Norske herrer på WAGR» (35 spillere, plass nå, endring siden nyttår, snittscore, snittplassering, Power, poeng, turneringer, seire), graf over WAGR-plass år for år, og senere Sammenlign, Søk alle norske, Søk HCP-juniorer og Junior/Amatør. Starter med datakartleggingen i §6. Ferdig når leaderboardet viser ekte tall med kilde og dato, og spillere under 18 uten samtykke ikke vises med navn.

Rekkefølge: 1–2 først (alt annet hviler på dem), så 3, deretter 4–8 i den rekkefølgen, 9 til slutt. Steg 10 kan ikke starte før de uavklarte punktene i §6 er avgjort; steg 4 og 5 er i hovedsak gjort (se kartleggingen 21.10). Steg 4–8 kan gå som egne PR-er per gruppe og ikke i parallell mot samme filer.

## 3. Risiko og avgrensning

- Flere økter jobber i repoet nå (15 arbeidsmapper, én åpen PR #1561). Før hvert steg: sjekk `origin/main` og at ingen annen økt har tatt samme TN-filer.
- Delte filer (`tn-flate`, `tn-grunnmur`, `core.tsx`) brukes av alle TN-skjermer. Endring der krever ny måling av alle brukere (jf. «delte stilark: latente brekkfeil»).
- Ikke i omfanget: tilgangsregler, datamodell, Data Golf-lisens, nye funksjoner. Ingen skjemaendring.
- «Full fart» står fortsatt i delte filer (reps, skjema, tapper-shell) og er ikke TN-spesifikt; tas ikke med her.

## 4. Åpent hos Anders

1. **Overskriftsskrift og store tall:** Schibsted Grotesk gjelder. Skal store tall være IBM Plex Mono (som nå i TN) eller Schibsted? Anbefaling: behold Plex Mono på tall.
2. **Type 4 A og type 5 A for TN:** godkjent for PlayerHQ og AgencyOS. Anbefaling: samme for TN.
3. **Bilder:** får du Team Norway-referansebildene klare før steg 9, eller bruker vi de tre vi har (`spiller-ved-vannet`, `putting-green`, `tee-hand`) til da?
4. **Rekkefølge:** skal Hjem (steg 3) komme før listene, slik at du ser drakten på forsiden først? Anbefaling: ja.
5. **Landslagsnivå per klasse** og A–K-nivåtall finnes ikke; skjermene viser «—» til tallene er vedtatt (uendret).

## 5. Hvor fasiten ligger

- Beslutninger: `.claude/rules/beslutninger.md` (§SKRÅ, §TEAM NORWAY).
- Skissen over skjermtyper: https://claude.ai/artifact/CFWLRivbevoeKAnVr1x43B.
- Tegninger: `docs/design-system/utkast-skra/`, `docs/design-system/utkast-tn/nye-veier.html`.
- Tokens: `src/styles/team-norway-tokens.css` (TN) og `src/styles/ak-tokens.css` (AK, ikke blandet inn i TN).

## 6. Steg 10: hva vi har i basen (lesespørringer mot produksjonsbasen 21.10.2026, kun telling)

Skissen viser «Norske herrer på WAGR pr. 20.10.2026» med 35 spillere, 280 som beste plass, 444 turneringer og 27 seire i 2026.

| Behov i skissen | I basen i dag | Dekning |
|---|---|---|
| Spillere | `dashboard.wagr_players`: 31 norske herrer og 24 norske damer, alle med sporing | 31 av 35 herrer |
| Plass nå, forrige uke, endring | Samme tabell, `wagr_rank`, `wagr_rank_last_week`, `wagr_change` fylt for alle 31 | Gammel: siste snapshot 19.07.2026, skissen er 20.10 |
| Turneringer og seire 2026 | `dashboard.wagr_events`: 428 turneringer og 21 seire for de 31 herrene i 2026, siste uke 202641 | Nesten: skissen har 444 og 27 |
| Score (slag per runde) | `dashboard.wagr_event_scores.round_scores`: fylt for 422 av 428 turneringer i 2026 | God |
| Snittplassering | `wagr_events.finish_position` fylt | God |
| Power | `public.wagr_player_strengths`: 45 spillere i siste modellkjøring (19.10.2026, sesong 2027) | Må sammenlignes med skissens tall |
| Poeng | `wagr_players.wagr_points` og `wagr_counting_events` | Finnes |
| WAGR-plass år for år (2024, 2025, nå) | `wagr_events.rank_after` er tom for alle 2 388 rader | **Mangler**. Plass ved årsslutt kan ikke bygges fra basen |
| Kobling til appens spillere | 105 `public_players` har `wagrId`; 30 av de 31 herrene er koblet | God |
| Junior, Amatør og andre land | Basen har bare norske spillere | **Mangler** |
| Turneringskatalog til Planlegger | `public.wagr_plan_events`: 3 764 turneringer til 31.12.2027 | Finnes (brukt av turneringsplanleggeren) |

**Funn som må avgjøres før bygging**
1. **Snapshotet er 3 måneder gammelt** (19.07). Plassene må hentes på nytt i mandagsjobben i `ak-golf-pipelines`, ellers viser vi gamle tall under overskriften «pr. 20.10.2026».
2. **Fire herrer mangler** (35 mot 31), og to hundre turneringer er ikke med (27 mot 21 seire). Pipelines må utvide listen før tallene stemmer med skissen.
3. **Plass år for år** finnes ikke. Enten fylles `rank_after` fra pipelines (uke 52 hvert år), eller grafen utgår til dataene finnes.
4. **15 spillere med `wagrId` er født 2008 eller senere.** Regelen om barnevern gjelder: de vises ikke med navn uten samtykke. Skissen sier «alle aldre».
5. **Data Golf** vises bare for ADMIN (20.10). Leaderboardet bruker WAGR og er ikke Data Golf, men ingen Data Golf-tall skal inn her.
6. **Adresse og meny:** foreslått `/team-norway/referansespillere`, i gruppen Spillere. Ikke avgjort.
7. **Skissens egne data kommer fra et annet sted enn basen** (siden ligger i eget Vercel-prosjekt). Hvor den henter dem fra, er ikke kartlagt.

**Avgjort av Anders 21.10** (beslutninger.md §REFERANSESPILLERE NORDEN): pipelines oppdaterer plassene ukentlig · hele steg 10 venter til årsslutt-plassene (uke 52, 2024 og 2025) er fylt ut · alle spillere vises med navn, også født 2008 eller senere · adresse `/team-norway/referansespillere` under Spillere. Skissens data kommer fra `ak-golf-pipelines` (`pipelines/turneringsplan/hent.py`, `bygg.py`, `power_historikk.py`). **Steg 10 er derfor blokkert av pipelines** (beslutningens punkt 1).

Ingen skjemaendring er gjort eller foreslått ennå. Alt over er lesing.
