# Team Norway mot PlayerHQ — funksjonsgap 14.09.2026

Kilde: faktisk kode i arbeidskopien codex/team-norway-demo-2026-09-14. Dette er en kildekontroll, ingen ny funksjonsprøve eller kontroll av siste Claude Design-eksport. Tidligere 44 sidevisninger beviser ikke full PlayerHQ-dekning.

Kommersielt grunnlag: [Team Norway-regelen](../platform/BUSINESS-RULES.md#team-norway--kommersielt-mål-anders-2026-09-14). Trenerverktøy skal være tilnærmet gratis; spillerlisensene er den betalte delen. Pris og betaler er ikke fastsatt her.

| Skjermfamilie | Dagens Team Norway | Manglende dekning / anbefaling |
|---|---|---|
| Spillerens arbeidsflate | Spillerliste med plan/testantall; spillerdetalj er posttidslinje | Samlet spilleroversikt med mål, plan, tekniske oppgaver, tester, utvikling og neste oppfølging |
| Workbench og kalender | Månedsplan viser økter og periodisering i tabeller | År, periode, måned, uke, dag og øktdetalj; valgt spiller/gruppe, navigasjon mellom datoer |
| Planredigering | Ingen TN-tilkobling til Workbench-handlingene | Opprett/rediger/flytt/kopier økt, øvelser/maler, periodisering, gjennomgang av endringer og publisering |
| Teknisk plan | Ingen egen TN-rute | Planoversikt, plandetalj, oppgaver, mål, kilder, status og oppfølging; bruk eksisterende PlayerHQ/coach-funksjoner |
| Testoversikt | Protokoller, testdager og deltakerkø finnes | Samlet resultathistorikk per spiller og protokoll; tydelig skille mellom protokoll, planlagt test og utført resultat |
| Testanalyse | Resultat kan åpnes fra testkø | Historikk, utvikling, forsøk, sammenligning og referansegrunnlag i valgt spillers kontekst. PlayerHQ har allerede testdetalj med historikk/trend |
| Gruppeanalyse | Rangliste/uttaksgrunnlag har aggregerte tall | Anbefalt treneroversikt for sammenligning av spillerresultater og fullføring på en testdag; dette er mer enn ren portering av personlig PlayerHQ-analyse |
| Øktgjennomføring | Trenerført testdag er lokalt prøvd | Sammenheng fra spillerens planlagte økt til Live, lagring og oppsummering; ikke nødvendigvis en ny separat TN-spillerapp |
| Evaluering og neste plan | Ingen egen evalueringsrute | Koble måling og analyse til evaluering, endret teknisk oppgave og neste plan. Full automatisk kobling er ikke dokumentert som ferdig PlayerHQ-funksjon |
| Lisens og aktivering | Invitasjon finnes | Anbefalt lisensoversikt, aktivering og betalings-/fornyelsesflate når pris, betaler og lisensregler er avklart; medlemskap må vises separat fra lisensstatus |

## Viktige kodebevis

- `src/components/team-norway/tn-shell.tsx`: Analyse og DataGolf peker til PlayerHQ.
- `src/app/portal/analysere/page.tsx`: data hentes for innlogget `user.id`, ikke en spiller valgt av TN-treneren.
- `src/components/team-norway/tn-registrerte-skjermer.tsx`: månedsplanen er lesetabeller.
- `src/app/team-norway/spiller/[spillerId]/page.tsx`: posttidslinje, ingen komplett spillerarbeidsflate.
- `src/app/portal/planlegge/workbench/page.tsx` og `src/components/portal/v2/WorkbenchV2.tsx`: eksisterende planvisninger og redigeringshandlinger.
- `src/app/portal/tren/teknisk-plan/[planId]/page.tsx`: eksisterende teknisk plandetalj, bundet til egen bruker.
- `src/app/portal/tren/tester/[testId]/page.tsx`: eksisterende resultathistorikk, siste forsøk og trend.

Claw-speilet har allerede referansefiler for Workbench, kalender, årsplan, periodeplan, tester, evaluering og utøveroversikt. Filenes eksistens beviser ikke implementering, komplett handlingsdekning eller en ny visuell godkjenning.

Anbefalt rekkefølge: spillerarbeidsflate → testoversikt/analyse → Workbench/kalender → teknisk plan/evaluering → sammenhengende spillerreise og lisensaktivering. Del funksjonene med PlayerHQ og eksisterende coach-sider; behold Team Norway-profil og korrekt spiller-/gruppetilgang. Ingen app-, tilgangs-, betalings- eller databaseendring er gjort i denne kartleggingen.
