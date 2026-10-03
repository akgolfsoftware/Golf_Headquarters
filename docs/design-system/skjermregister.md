# Skjermregister — D01

Kodeversjonen registeret ble generert mot står i `kodeversjon` i [JSON](skjermregister.json). Feltet endres bare ved `--write` og er ikke et bevis på at en senere commit fortsatt har samme ruter.

Dette er koblingen fra hver sidefil til en skjermtype, et mønster eller en undersøkt forklaring. Det er ikke bevis på at skjermen er portert, at dataene er ekte, eller at Anders har sett appen.

Kilder: [skjermlisten](skjermliste-precision-athletics.md), [designautoriteten](design-autoritet.md), [WANG-byggeunderlaget](../../designsystem/wang/SKJERMREGISTER.md), [Team Norway-handover](../../designsystem/team-norway/handover/SKJERMREGISTER.md), [porteringsplanen](../planer/portering-alle-skjermer-2026-10-02.md).

Rader: [JSON](skjermregister.json) og [CSV](skjermregister.csv). Regenerer med `node scripts/bygg-skjermregister.mjs --write`. `npm run prosjekt:sjekk` feiler hvis filene driver fra koden.

## Inventar

Sidefiler med rute: **527**. Unike rutemønstre i skanningen: 527. Komponentfiler: 837. Ramme- og tilstandsfiler: 249.

Porteringsplanen talte 520 da den ble skrevet. Denne skanningen er tatt på kodeversjonen over og kan være høyere. Interne eksempler inngår. Ingen rute er slettet.

| Område | Sidefiler |
|---|---:|
| agencyos | 164 |
| delt-innsyn | 11 |
| forelder | 16 |
| inngang-og-konto | 19 |
| interne-eksempler | 6 |
| lag-og-skole | 51 |
| marked-og-offentlig | 70 |
| offentlig-booking | 4 |
| personlig-arbeidsflate | 3 |
| playerhq | 181 |
| systemtilstand | 2 |

## Kobling

| Kobling | Rader |
|---|---:|
| tegnet-skjermtype | 281 |
| videresending | 162 |
| teknisk-forklaring | 32 |
| byggeunderlag | 23 |
| felles-monster | 22 |
| intern-flate | 7 |

281 rader treffer en av de 74 Precision-typene og er derfor merket valgt for bygging som design. 13 rader har ingen eksakt type. 124 rader har et registrert avvik. 96 rader har en Precision-visning i koden. 0 er kontrollert i appen.

## Uten eksakt type

Tabellen er Precision-ruter uten treff i 74-listen, pluss WANG- og Team Norway-ruter uten rad i det lokale byggeunderlaget. Hintet er ikke en tildeling.

| Rute | ID | Nærmeste |
|---|---|---|
| `/admin/bookinger` | UTEN-TEGNET-TYPE | AG-06 Booking (coach) |
| `/admin/innboks` | UTEN-TEGNET-TYPE | — |
| `/admin/spillere/[id]/plan/[planId]/for-og-na` | UTEN-TEGNET-TYPE | AG-10 Teknisk plan |
| `/auth/trenerdeling` | UTEN-TEGNET-TYPE | — |
| `/portal/analysere/skill-map` | UTEN-TEGNET-TYPE | PH-16 Analyse-hub |
| `/portal/mal/evaluering` | UTEN-TEGNET-TYPE | PH-19 Mål og talent |
| `/portal/mal/sg-hub/coach/[spillerId]/[club]` | UTEN-TEGNET-TYPE | PH-19 Mål og talent |
| `/portal/mal/sg-hub/coach/[spillerId]/equipment` | UTEN-TEGNET-TYPE | PH-19 Mål og talent |
| `/portal/mal/sg-hub/coach/[spillerId]` | UTEN-TEGNET-TYPE | PH-19 Mål og talent |
| `/portal/meg/deling/innsyn` | UTEN-TEGNET-TYPE | PH-24 Meg |
| `/portal/meg/deling` | UTEN-TEGNET-TYPE | PH-24 Meg |
| `/portal/samlinger` | UTEN-TEGNET-TYPE | — |
| `/portal/tren/teknisk-plan` | UTEN-TEGNET-TYPE | PH-19 Mål og talent |
| `/team-norway/analyse` | TN-UTEN-RAD | — |
| `/team-norway/fagapparat` | TN-UTEN-RAD | — |
| `/team-norway/fellestesting/[deltakerId]` | TN-UTEN-RAD | — |
| `/team-norway/lisens-okonomi` | TN-UTEN-RAD | — |
| `/team-norway/live-watch` | TN-UTEN-RAD | — |
| `/team-norway/samlinger` | TN-UTEN-RAD | — |
| `/team-norway/spiller/[spillerId]/analyse` | TN-UTEN-RAD | — |
| `/team-norway/spiller/[spillerId]/evaluering` | TN-UTEN-RAD | — |
| `/team-norway/spiller/[spillerId]/oversikt` | TN-UTEN-RAD | — |
| `/team-norway/spiller/[spillerId]/teknisk-plan/[planId]` | TN-UTEN-RAD | — |
| `/team-norway/spiller/[spillerId]/teknisk-plan` | TN-UTEN-RAD | — |
| `/team-norway/spiller/[spillerId]/tester/[testId]` | TN-UTEN-RAD | — |
| `/team-norway/spiller/[spillerId]/tester` | TN-UTEN-RAD | — |
| `/team-norway/turneringer/[id]` | TN-UTEN-RAD | — |
| `/team-norway/wang-resultater` | TN-UTEN-RAD | — |
| `/team-norway/workbench` | TN-UTEN-RAD | — |
| `/team-wang/coach/tester` | WANG-UTEN-RAD | — |
| `/team-wang/coach/turneringer/[elevId]` | WANG-UTEN-RAD | — |

## Kommentar mot liste

| Rute | Valgt ID | Avvik |
|---|---|---|
| `/admin/bookinger` | UTEN-TEGNET-TYPE | Kodekommentaren sier AG-06, men skjermlisten har ingen treff. Kommentaren er opphav, ikke godkjenning. |
| `/admin/innboks` | UTEN-TEGNET-TYPE | Kodekommentaren sier AG-04, men skjermlisten har ingen treff. Kommentaren er opphav, ikke godkjenning. |
| `/admin/profile` | AG-23 | Kodekommentaren sier AG-18. Skjermlisten sier AG-23. Kommentaren er opphav, ikke en ny godkjenning. |
| `/admin/spillere/[id]/plan/[planId]/for-og-na` | UTEN-TEGNET-TYPE | Kodekommentaren sier AG-10, men skjermlisten har ingen treff. Kommentaren er opphav, ikke godkjenning. |
| `/auth/forgot-password` | AU-03 | Kodekommentaren sier AU-01. Skjermlisten sier AU-03. Kommentaren er opphav, ikke en ny godkjenning. |
| `/auth/reset-password` | AU-03 | Kodekommentaren sier AU-01. Skjermlisten sier AU-03. Kommentaren er opphav, ikke en ny godkjenning. |
| `/forelder/bookinger/ny` | FO-03 | Kodekommentaren sier FO-01. Skjermlisten sier FO-03. Kommentaren er opphav, ikke en ny godkjenning. |
| `/forelder/coach` | FO-06 | Kodekommentaren sier FO-04. Skjermlisten sier FO-06. Kommentaren er opphav, ikke en ny godkjenning. |
| `/forelder/fakturaer` | FO-04 | Kodekommentaren sier FO-05. Skjermlisten sier FO-04. Kommentaren er opphav, ikke en ny godkjenning. |
| `/forelder/ukerapport` | FO-01 | Kodekommentaren sier FO-09. Skjermlisten sier FO-01. Kommentaren er opphav, ikke en ny godkjenning. |
| `/forelder/varsler` | FO-01 | Kodekommentaren sier FO-10. Skjermlisten sier FO-01. Kommentaren er opphav, ikke en ny godkjenning. |
| `/portal/analysere/turneringer` | PH-18 | Kodekommentaren sier PH-21. Skjermlisten sier PH-18. Kommentaren er opphav, ikke en ny godkjenning. |
| `/portal/mal/runder` | PH-18 | Kodekommentaren sier PH-11. Skjermlisten sier PH-18. Kommentaren er opphav, ikke en ny godkjenning. |
| `/portal/meg/innstillinger/personvern` | PH-25 | Kodekommentaren sier PH-18. Skjermlisten sier PH-25. Kommentaren er opphav, ikke en ny godkjenning. |
| `/team-norway/[groupId]/dokumenter` | TN-11 | Kodekommentaren sier TN-14, som i handover er «Samlingspunkt» på /team-norway/samlinger/[id]. Handover-ruten beholder TN-11. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/[groupId]` | TN-09 | Kodekommentaren sier TN-13, som i handover er «Turneringsoversikt» på /team-norway/turneringer. Handover-ruten beholder TN-09. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/college` | TN-15 | Kodekommentaren sier TN-06, som i handover er «Uttaksliste» på /team-norway/uttak. Handover-ruten beholder TN-15. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/manedsplan` | TN-16 | Kodekommentaren sier TN-11, som i handover er «Dokumentdeling» på /team-norway/[groupId]/dokumenter. Handover-ruten beholder TN-16. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway` | TN-02 | Kodekommentaren sier TN-01. Handover-ruten beholder TN-02. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/protokoller/[id]` | TN-05 | Kodekommentaren sier TN-15, som i handover er «Collegegruppen» på /team-norway/college. Handover-ruten beholder TN-05. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/protokoller` | TN-04 | Kodekommentaren sier TN-15, som i handover er «Collegegruppen» på /team-norway/college. Handover-ruten beholder TN-04. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/rangliste` | TN-07 | Kodekommentaren sier TN-16, som i handover er «Månedsplan» på /team-norway/manedsplan. Handover-ruten beholder TN-07. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/referansenivaer` | TN-21 | Kodekommentaren sier TN-18, som i handover er «Trenere og tilgang» på /team-norway/tilgang. Handover-ruten beholder TN-21. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/samlinger/[id]` | TN-14 | Kodekommentaren sier TN-04, som i handover er «Protokollbibliotek» på /team-norway/protokoller. Handover-ruten beholder TN-14. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/skoler` | TN-08 | Kodekommentaren sier TN-17, som i handover er «Legg til turnering manuelt» på /team-norway/turneringer/ny. Handover-ruten beholder TN-08. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/spillere` | TN-00 | Kodekommentaren sier TN-12, som i handover er «Samtykke» på /portal/samtykke. Handover-ruten beholder TN-00. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/tilgang` | TN-18 | Kodekommentaren sier TN-19, som i handover er «Inviter spiller» på /team-norway/inviter. Handover-ruten beholder TN-18. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/turneringer` | TN-13 | Kodekommentaren sier TN-07, som i handover er «Rangliste» på /team-norway/rangliste. Handover-ruten beholder TN-13. Kommentaren er opphav, ikke godkjenning. |
| `/team-norway/uttak` | TN-06 | Kodekommentaren sier TN-05, som i handover er «Protokolldetalj» på /team-norway/protokoller/[id]. Handover-ruten beholder TN-06. Kommentaren er opphav, ikke godkjenning. |

## Byggeunderlag uten sidefil

Disse lokale radene har ingen page.tsx. De kan være faner, layout eller fortsatt uteglemt.

| Register | ID | Rute |
|---|---|---|
| WANG | B3 | /team-wang/elev/[id]/tester |
| WANG | B6 | /team-wang/statistikk |
| WANG | B7 | /team-wang/turneringer |
| WANG | C1 | /team-wang/elever |
| WANG | C4 | /team-wang/turnering/[id] |
| WANG | C8 | alle ruter under /team-wang |
| WANG | D11 | /team-wang/tilgang/trenere |
| WANG | B1 | /team-wang/testdag/[id] |
| WANG | B2 | /team-wang/protokoll |
| WANG | B4 | /team-wang/coach/ukessammendrag |
| WANG | B5 | /team-wang/dokumenter |
| WANG | B8 | /team-wang/elev/[id] |
| WANG | B9 | /team-wang/samlinger |
| WANG | C2 | /team-wang/samling/[id] |
| WANG | D2 | /team-wang/plasser |
| WANG | D3 | /team-wang/rekruttering/koordinering |
| WANG | D4 | /team-wang/skole/timeplan |
| WANG | D5 | /team-wang/skole/proveplan |
| WANG | D6 | /team-wang/foreldremote |
| WANG | D7 | /team-wang/gruppe/poster |
| WANG | D8 | /team-wang/post |
| WANG | D9 | /team-wang/plan/periode |
| WANG | D10 | /team-wang/plan/maned |
| WANG | D12 | /team-wang/tilgang/inviter |
| WANG | D1 | /team-wang/rekruttering |
| Team Norway | TN-01 | /team-norway/* (layout) |
| Team Norway | TN-20 | /team-norway/apparatet |
| Team Norway | TN-12 | /portal/samtykke (spiller/foresatt) |

## Overlegg

Kartleggingen finner ikke dialoger. Radene under er krav, ikke funn.

| ID | Forklaring |
|---|---|
| OV-DIALOG | Bekreftelse og skjema som ligger over en side. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-ARK | Bunnark og sideark, inkludert øktdetalj der den ikke er egen rute. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-MENY | Navigasjon, overflow og kontekstmeny. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-TOAST | Kort bekreftelse etter lagring. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-KONFLIKT | Samtidig redigering og utdatert versjon. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-OFFLINE | Handling uten nett, i tillegg til siden /offline. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-TILGANG | Innlogget bruker uten rett, og utløpt eller avvist deling. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-OPPLASTING | Fil, video og lyd før og etter sending. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-BETALING | Stripe/Vipps-steg som ikke er en page.tsx. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-BEKREFT | Siste steg før en destruktiv eller bindende handling. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-404 | src/app/not-found.tsx, ikke en page.tsx. SY-01 tegner tilstanden. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |
| OV-500 | src/app/global-error.tsx og src/app/error.tsx. SY-01 tegner tilstanden. Ikke funnet automatisk. Må kobles til inngangen som åpner det under rutevis portering. |

## Bevisgrense

- En treff på PH-, AG-, FO-, AU-, BK-, ST-, GJ- eller SY- er en designkobling.
- WANG- og Team Norway-ID-er fra repoet er byggeunderlag. 59 WANG-skjermer og TN-22–TN-27 ligger i Claude Design.
- En grønn test, en åpen Precision-PR eller en gammel kodekommentar er ikke mergebevis og ikke visuell appkontroll.
- Åpne Precision-PR-er skal vurderes én for én. Denne bolken merger ingen av dem.
