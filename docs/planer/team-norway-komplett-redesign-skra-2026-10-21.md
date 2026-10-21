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
10. **Referansespillere: menypunkt som lenker til teamnorwayref** (rettet 21.10, beslutninger.md §REFERANSESPILLERE NORDEN BOR PÅ TEAMNORWAYREF). Leaderboard, graf og samlede tall bor på https://teamnorwayref.vercel.app, bygget i `ak-golf-pipelines`. HQ får bare menypunktet «Referansespillere» som siste punkt under Spillere i `tnHovedmeny` (`src/components/team-norway/tn-shell.tsx`), som lenker til teamnorwayref. Ingen egen rute og ingen WAGR-lesing i HQ. Ferdig når punktet står i menyen i 390 og 1280 px uten sidelengs rulling, og en test låser lenkemålet.

Rekkefølge: 1–2 først (alt annet hviler på dem), så 3, deretter 4–8 i den rekkefølgen, 9 til slutt. Steg 10 (menypunktet) kan gjøres når som helst; det venter ikke på pipelines; steg 4 og 5 er i hovedsak gjort (se kartleggingen 21.10). Steg 4–8 kan gå som egne PR-er per gruppe og ikke i parallell mot samme filer.

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

## 6. Steg 10: Referansespillere bor på teamnorwayref

**Avgjort av Anders 21.10** (beslutninger.md §REFERANSESPILLERE NORDEN BOR PÅ TEAMNORWAYREF): «teamnorwayref eier de offentlige og samlede tallene, og HQ-flaten blir en lenke dit.»

- **teamnorwayref.vercel.app** eier leaderboard «Norske herrer på WAGR», graf over WAGR-plass år for år og alle samlede tall. Siden bygges i `ak-golf-pipelines` (`scripts/referansespillere_html.py`) bak felles passord, etter `docs/plan-teamnorwayref-komplett.md` der.
- **HQ** får bare menypunktet «Referansespillere» under Spillere, som lenker dit. Ingen rute `/team-norway/referansespillere`.
- **Personopplysninger** (testresultater og annet om enkeltspillere) blir i HQ bak innlogging; teamnorwayref lenker til HQ for slikt.
- **Datahullene** fra kartleggingen 21.10 (gammelt snapshot fra 19.07, 31 av 35 herrer, tom `dashboard.wagr_events.rank_after`, bare norske spillere i basen) løses i pipelines og blokkerer ikke HQ-steget lenger.
- **Ikke avgjort:** om Data Golf skal vises på teamnorwayref. Ligger hos Anders.

Ingen skjemaendring er gjort eller foreslått ennå. Alt over er lesing.

## 7. Steg 15: Ny trenerflate etter teamnorwayref (bestilt av Anders 21.10)

Anders 21.10: den nye Team Norway-siden (teamnorwayref) skal erstatte de interne sidene for Team
Norway-trenere, og skal lenkes fra PlayerHQ der Team Norway-spillere registrerer deling med Team Norway.

- **Ny struktur:** wireframes, menypunkter og fordeling på nytt, med teamnorwayref som utgangspunkt.
- **Trenerprofil:** hver trener har sin egen profil.
- **Spillere:** treneren velger en spiller, og trykk på navnet åpner den komplette spillerprofilen:
  komplett IUP, turneringsplanlegger, ranking, progresjon i turneringer, trening, tester, teknisk plan og
  fireukerssjekk.
- **Lenke fra PlayerHQ:** fra delingen med Team Norway (`/portal/meg/innstillinger/personvern/deling` og
  `/portal/meg/deling`), bare for spillere i en Team Norway-gruppe.

**Krever en beslutning før bygging.** teamnorwayref er en statisk side bak ett felles passord. Den kan ikke gi
hver trener egen profil, og kan ikke vise en spillers IUP, tester eller trening bare til trenerne spilleren
har delt med. Anbefaling: den nye trenerflaten bygges i HQ under `/team-norway` med teamnorwayrefs struktur,
innhold og utseende, og teamnorwayref.vercel.app sender videre dit når Anders sier det. Valget overstyrer
«HQ får ingen egen referanseflate» i §6 og i beslutninger.md §REFERANSESPILLERE NORDEN.

Prompten for jobben: [prompt-tn-trenerflate-2026-10-21.md](prompt-tn-trenerflate-2026-10-21.md). Etappene er
funksjonsregister, struktur og wireframes (stopp for Anders' ja), bygging i pakker og PlayerHQ-lenken.
Ferdig når kravene i promptens `<ferdig_nar>` er oppfylt.
