# Maskinmåling av skjermer

Dato: 2026-10-05. Måling mot lokal dev-server (worktree maskinsjekk, origin/main 1afdd40e0), lyst tema, bredde 390 og 1440.

## Metode og markører
- Precision Athletics: elementet `.pa-root[data-design="precision-athletics"]` finnes (skallene PlayerHQSkall/AgencyOSSkall/ForelderSkall og markedslayout setter det).
- WANG: `.wang-app` / `.wang-tp` på layouten i src/app/team-wang/layout.tsx. Team Norway: ruten er under /team-norway og CSS-variabelen `--tn-navy-900` er definert (team-norway-tokens.css). Alt annet regnes som «gammelt».
- Treffmål: synlige a/button/input/select/textarea/[role=button|tab|checkbox|switch] med minste side under 44 px (390 og 1440 brukes 44 px opptil 1024 px bredde og 32 px over, som i tests/visual/precision/maal.mjs). Inline lenker i løpende tekst er ikke talt.
- Sidelengs rulling: scrollWidth > clientWidth. Noder utenfor: synlige elementer med høyre kant utenfor viewport som ikke er klippet av en overflow-beholder.
- GRØNN = laster, ingen konsollfeil, ingen sidelengs rulling, riktig designsystem, ingen avvik. GUL = 1-5 små treffmål, 1-3 noder utenfor eller demotekst. RØD = feil/feilside/404/sidelengs/konsollfeil/tom/gammelt design/mange avvik. IKKE TESTET = mangler ID eller innlogging.
- Innlogging: coach (OK), spiller og forelder feilet (passordet i SCREENTEST_PASSWORD avvises for screentest@ og screentest-parent@). Spillerruter er derfor målt som coach (coach kan åpne /portal med egne data); ID-ruter som tilhører spillerkontoen er IKKE TESTET. /forelder sender coach til /admin: IKKE TESTET.
- Konsollfeil kan komme fra manglende database-tabeller og dev-modus (f.eks. public.test_day_events), ikke bare fra siden.

## Totalt

| Område | GRØNN | GUL | RØD | IKKE TESTET | Sum |
|---|---|---|---|---|---|
| offentlig-booking | 0 | 0 | 2 | 2 | 4 |
| agencyos | 100 | 22 | 41 | 3 | 166 |
| inngang-og-konto | 1 | 13 | 2 | 3 | 19 |
| forelder | 0 | 0 | 0 | 16 | 16 |
| lag-og-skole | 16 | 12 | 15 | 9 | 52 |
| delt-innsyn | 6 | 0 | 4 | 1 | 11 |
| systemtilstand | 0 | 2 | 0 | 0 | 2 |
| personlig-arbeidsflate | 2 | 0 | 1 | 0 | 3 |
| playerhq | 76 | 49 | 50 | 8 | 183 |
| marked-og-offentlig | 0 | 0 | 61 | 8 | 69 |
| **Sum** | 201 | 98 | 176 | 50 | 525 |

## offentlig-booking

| screenId | rute | status | funn |
|---|---|---|---|
| BK-02 | /booking/[slug] | IKKE TESTET | mangler id: slug |
| BK-02 | /booking/[slug]/bekreft | IKKE TESTET | mangler id: slug |
| BK-01 | /booking | RØD | design: precision; 390: 20 små treffmål (f.eks. AK Golf, til forside 30x26, Eller book en samtal 208x26); 1440: 19 små treffmål (f.eks. Eller book en samtal 208x26, Coaching 232x23) |
| BK-03 | /booking/kvittering/[bookingId] | RØD | design: precision; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 21 små treffmål (f.eks. AK Golf, til forside 30x26, AK Golf. 61x22); 1440: 20 små treffmål (f.eks. AK Golf. 61x22, Til booking 83x22) |

## agencyos

| screenId | rute | status | funn |
|---|---|---|---|
| VIDERESENDING | /admin/anlegg → /admin/oppsett?fane=klubb | GRØNN | design: precision |
| VIDERESENDING | /admin/analysere → /admin/analyse | RØD | design: gammelt; gammelt design (gammelt); 390: 4 små treffmål (<44px) |
| VIDERESENDING | /admin/agenter → /admin/jarvis | GRØNN | design: precision |
| AG-05 | /admin/availability | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (2) In HTML,  cannot be a descendant of <>. This will cause a hydration er; 390: 6 små treffmål (f.eks. Synk 90x42, Måned 69x32); 1440: feilside/krasj; 1440: konsollfeil (2) In HTML,  cannot be a descendant of <>. This will cause a hydration er; gammelt design (gammelt) |
| VIDERESENDING | /admin/caddie → /admin/jarvis | GRØNN | design: precision |
| VIDERESENDING | /admin/coach-workbench → /admin/plan | GRØNN | design: precision |
| VIDERESENDING | /admin/drills/[id] → /admin/plan?fane=ovelser | GRØNN | design: precision |
| VIDERESENDING | /admin/drills/forslag → /admin/innboks?filter=godkjenn | GRØNN | design: precision |
| VIDERESENDING | /admin/foresporsler → /admin/innboks | GRØNN | design: precision |
| VIDERESENDING | /admin/drills/ny → /admin/plan?fane=ovelser | GRØNN | design: precision |
| VIDERESENDING | /admin/drills → /admin/plan?fane=ovelser | GRØNN | design: precision |
| VIDERESENDING | /admin/godkjenninger/[id] | IKKE TESTET | mangler id: id:/admin/godkjenninger/[id] |
| VIDERESENDING | /admin/kapasitet → /admin/bookinger | GRØNN | design: precision |
| VIDERESENDING | /admin/kalender/maned → /admin/kalender?visning=maned | GRØNN | design: precision |
| VIDERESENDING | /admin/kalender/uke → /admin/kalender | GUL | design: precision; demotekst: demo |
| VIDERESENDING | /admin/lag-snitt → /admin/analyse?fane=stall&visning=trend | RØD | design: gammelt; 390: tom side; gammelt design (gammelt) |
| VIDERESENDING | /admin/plans/new → /admin/plan | GRØNN | design: precision |
| VIDERESENDING | /admin/okonomi → /admin/agencyos/okonomi | GRØNN | design: precision |
| VIDERESENDING | /admin/plan-templates/[id]/effectiveness → /admin/plan | GRØNN | design: precision |
| AG-06 | /admin/services | RØD | design: gammelt; 390: 21 små treffmål (f.eks. Endre 36x20, Endre 36x20); 1440: 21 små treffmål (f.eks. Endre 36x20, Endre 36x20); gammelt design (gammelt) |
| VIDERESENDING | /admin/spillere/[id]/profil → /admin/spillere/c7e2811d-86e1-49fe-9100-d33d5056eac2 | GRØNN | design: precision |
| AG-08 | /admin/spillere/[id]/rediger | GUL | design: precision; demotekst: demo |
| VIDERESENDING | /admin/stall → /admin/spillere | GRØNN | design: precision |
| VIDERESENDING | /admin/spillere/[id]/tildel-test → /admin/tester/tildel/c7e2811d-86e1-49fe-9100-d33d5056eac2 | RØD | design: gammelt; 390: 9 små treffmål (f.eks. Lukk 28x28, INPUT 264x20); 1440: 8 små treffmål (f.eks. Lukk 28x28, INPUT 426x20); gammelt design (gammelt) |
| AG-15 | /admin/tester/benchmarks | RØD | design: gammelt; 390: feilside/krasj; 390: sidelengs rulling (622>390); 390: konsollfeil (2) In HTML,  cannot be a descendant of <>. This will cause a hydration er; 1440: feilside/krasj; 1440: konsollfeil (2) In HTML,  cannot be a descendant of <>. This will cause a hydration er; gammelt design (gammelt); 390: 3 node(r) utenfor; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| AG-15 | /admin/tester/tildel/[spillerId] | RØD | design: gammelt; 390: 9 små treffmål (f.eks. Lukk 28x28, INPUT 264x20); 1440: 8 små treffmål (f.eks. Lukk 28x28, INPUT 426x20); gammelt design (gammelt) |
| VIDERESENDING | /admin/tester/tildel → /admin/tester | RØD | design: precision/gammelt; 1440: tom side; gammelt design (precision/gammelt); demotekst: demo |
| VIDERESENDING | /admin/workspace/tildelt-meg → /admin/innboks?filter=godkjenn | GRØNN | design: precision |
| AG-16 | /admin/agencyos/ak-stigen | RØD | design: gammelt; gammelt design (gammelt); 390: 3 små treffmål (<44px); demotekst: demo; 1440: 3 små treffmål (<32px) |
| VIDERESENDING | /admin/agencyos/caddie/dashbord → /admin/innboks?filter=godkjenn | GRØNN | design: precision |
| VIDERESENDING | /admin/agencyos/caddie/aktivitet → /admin/jarvis | GRØNN | design: precision |
| VIDERESENDING | /admin/stats/moderering → /admin/ko?fane=moderering | GRØNN | design: precision |
| VIDERESENDING | /admin/agencyos/caddie → /admin/jarvis | GRØNN | design: precision |
| AG-13 | /admin/agencyos/live | GRØNN | design: precision |
| AG-13 | /admin/agencyos/live/[sessionId] | GRØNN | design: precision |
| AG-20 | /admin/agencyos/okonomi | GRØNN | design: precision |
| VIDERESENDING | /admin/agent-team → /admin/jarvis | GRØNN | design: precision |
| VIDERESENDING | /admin/agencyos/uka → /admin/kalender | GRØNN | design: precision |
| VIDERESENDING | /admin/agencyos/spillere → /admin/spillere | GRØNN | design: precision |
| VIDERESENDING | /admin/agenticos → /admin/jarvis | GRØNN | design: precision |
| AG-01 | /admin/agencyos | RØD | 390: timeout/exception: page.goto: Timeout 45000ms exceeded.; 1440: timeout/exception: page.goto: Timeout 45000ms exceeded.; gammelt design () |
| VIDERESENDING | /admin/agenticos/projects → /admin/jarvis?fane=prosjekter | GRØNN | design: precision |
| VIDERESENDING | /admin/agenticos/runtimes → /admin/jarvis?fane=runtimes | GRØNN | design: precision |
| VIDERESENDING | /admin/agenticos/skills → /admin/jarvis?fane=skills | GRØNN | design: precision |
| AG-19 | /admin/agents/[agentId] | RØD | design: gammelt; 390: 8 små treffmål (f.eks. Cockpit 70x32, Kø 40x32); gammelt design (gammelt) |
| VIDERESENDING | /admin/agenticos/godkjenn → /admin/ko?fane=agentgodkjenn | GRØNN | design: precision |
| VIDERESENDING | /admin/agents → /admin/jarvis | GRØNN | design: precision |
| VIDERESENDING | /admin/agenticos/ko → /admin/ko?fane=agentko | GRØNN | design: precision |
| VIDERESENDING | /admin/approvals/[id] | IKKE TESTET | mangler id: id:/admin/approvals/[id] |
| AG-09 | /admin/analyse | RØD | design: gammelt; gammelt design (gammelt); 390: 4 små treffmål (<44px) |
| VIDERESENDING | /admin/analysere/compliance → /admin/analyse?fane=etterlevelse | RØD | design: gammelt; 390: tom side; 1440: tom side; gammelt design (gammelt) |
| VIDERESENDING | /admin/approvals → /admin/innboks?filter=godkjenn | GRØNN | design: precision |
| VIDERESENDING | /admin/analyse/stall → /admin/analyse?fane=stall&visning=trend | RØD | design: gammelt; gammelt design (gammelt); 390: 4 små treffmål (<44px) |
| AG-24 | /admin/audit-log | GRØNN | design: precision |
| UTEN-TEGNET-TYPE | /admin/bookinger | GRØNN | design: precision |
| AG-06 | /admin/bookinger/[id] | RØD | design: gammelt; gammelt design (gammelt); 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| AG-06 | /admin/bookinger/ny | RØD | design: gammelt; gammelt design (gammelt); 390: 2 små treffmål (<44px); demotekst: demo; 1440: 2 små treffmål (<32px) |
| VIDERESENDING | /admin/calendar/maned → /admin/kalender?visning=maned | GRØNN | design: precision |
| VIDERESENDING | /admin/calendar → /admin/kalender | GUL | design: precision; demotekst: demo |
| AG-24 | /admin/drift | GRØNN | design: precision |
| VIDERESENDING | /admin/drills/[id]/rediger → /admin/plan?fane=ovelser | GRØNN | design: precision |
| AG-04 | /admin/email-templates/[id]/rediger | GRØNN | design: precision |
| VIDERESENDING | /admin/email-templates → /admin/kommunikasjon?fane=maler | RØD | design: gammelt; 390: 11 små treffmål (f.eks. Innboks55 105x40, Utkast0 87x40); gammelt design (gammelt); 1440: 1 små treffmål (<32px) |
| AG-24 | /admin/feillogg | GRØNN | design: precision |
| VIDERESENDING | /admin/brief → /admin/agencyos | GRØNN | design: precision |
| VIDERESENDING | /admin/finance → /admin/agencyos/okonomi | GRØNN | design: precision |
| AG-24 | /admin/gdpr | GRØNN | design: precision |
| AG-12 | /admin/gjennomfore/okter/[id] | GRØNN | design: precision |
| VIDERESENDING | /admin/godkjenninger → /admin/innboks?filter=godkjenn | GRØNN | design: precision |
| VIDERESENDING | /admin/gjennomfore → /admin/kalender | GUL | design: precision; demotekst: demo |
| AG-16 | /admin/grupper/[id]/arsplan/skoledata | RØD | design: gammelt; 390: 6 små treffmål (f.eks. Medlemmer 93x30, Workbench 90x30); gammelt design (gammelt); 1440: 5 små treffmål (<32px) |
| AG-16 | /admin/grupper/[id]/arsplan | RØD | design: gammelt; 390: 23 små treffmål (f.eks. Medlemmer 93x30, Workbench 90x30); 1440: 21 små treffmål (f.eks. Medlemmer 93x30, Workbench 90x30); gammelt design (gammelt) |
| AG-16 | /admin/grupper/[id]/timeplan | RØD | design: gammelt; 390: 13 små treffmål (f.eks. Medlemmer 93x30, Workbench 90x30); gammelt design (gammelt); 1440: 5 små treffmål (<32px) |
| AG-11 | /admin/grupper/[id]/workbench | GRØNN | design: precision |
| AG-16 | /admin/grupper | RØD | design: precision; 1440: feilside/krasj; 1440: konsollfeil (1) Each child in a list should have a unique "key" prop. See https://reac; demotekst: demo |
| AG-16 | /admin/grupper/[id] | RØD | design: gammelt; 390: 9 små treffmål (f.eks. Medlemmer 93x30, Workbench 90x30); 1440: 7 små treffmål (f.eks. Medlemmer 93x30, Workbench 90x30); gammelt design (gammelt) |
| VIDERESENDING | /admin/handlingssenter → /admin/oppgaver?fane=tildelt | GUL | design: precision; demotekst: demo |
| AG-24 | /admin/hjelp | GUL | design: precision; demotekst: demo |
| VIDERESENDING | /admin/innboks-epost → /admin/innboks?filter=epost | GRØNN | design: precision |
| AG-22 | /admin/innsikt | GRØNN | design: precision |
| AG-19 | /admin/jarvis | GRØNN | design: precision |
| VIDERESENDING | /admin/integrasjoner → /admin/oppsett?fane=integrasjoner | GRØNN | design: precision |
| AG-05 | /admin/kalender/hendelse/[id] | IKKE TESTET | mangler id: id:/admin/kalender/hendelse/[id] |
| VIDERESENDING | /admin/kalender/lag → /admin/kalender | GUL | design: precision; demotekst: demo |
| AG-05 | /admin/kalender/hendelse/ny | RØD | design: gammelt; 390: 6 små treffmål (f.eks. Kalender 109x20, INPUT 358x42); gammelt design (gammelt); 1440: 1 små treffmål (<32px) |
| AG-05 | /admin/kalender | GUL | design: precision; demotekst: demo |
| UTEN-TEGNET-TYPE | /admin/innboks | GUL | design: precision; demotekst: demo |
| AG-23 | /admin/marketing | RØD | design: gammelt; gammelt design (gammelt) |
| VIDERESENDING | /admin/klubb/innstillinger → /admin/oppsett?fane=klubb | GRØNN | design: precision |
| VIDERESENDING | /admin/okter → /admin/plan | GRØNN | design: precision |
| AG-02 | /admin/ko | RØD | 390: timeout/exception: page.goto: Timeout 45000ms exceeded.; 1440: timeout/exception: page.goto: Timeout 45000ms exceeded.; gammelt design () |
| AG-04 | /admin/kommunikasjon | RØD | 390: timeout/exception: page.goto: Timeout 45000ms exceeded.; 1440: timeout/exception: page.goto: Timeout 45000ms exceeded.; gammelt design () |
| AG-21 | /admin/oppgaver | GRØNN | design: precision |
| AG-23 | /admin/oppsett | GUL | design: precision; demotekst: demo |
| VIDERESENDING | /admin/messages | RØD | 390: timeout/exception: page.goto: Timeout 45000ms exceeded.; 1440: timeout/exception: page.goto: Timeout 45000ms exceeded.; gammelt design () |
| VIDERESENDING | /admin/oppfolging | RØD | 390: timeout/exception: page.goto: Timeout 45000ms exceeded.; 1440: timeout/exception: page.goto: Timeout 45000ms exceeded.; gammelt design () |
| VIDERESENDING | /admin/organisasjon → /admin/oppsett | GUL | design: precision; demotekst: demo |
| AG-14 | /admin/plan-templates/ny | GRØNN | design: precision |
| AG-14 | /admin/plan-templates/[id]/rediger | GRØNN | design: precision |
| AG-14 | /admin/plan-templates/[id] | GRØNN | design: precision |
| VIDERESENDING | /admin/plan-templates → /admin/plan | GRØNN | design: precision |
| VIDERESENDING | /admin/plan/maler → /admin/plan?fane=ukemaler | GRØNN | design: precision |
| AG-14 | /admin/plan | GRØNN | design: precision |
| VIDERESENDING | /admin/planlegge → /admin/plan | GRØNN | design: precision |
| AG-10 | /admin/plan/teknisk | GUL | design: precision; demotekst: demo |
| VIDERESENDING | /admin | RØD | 390: timeout/exception: page.goto: Timeout 45000ms exceeded.; 1440: timeout/exception: page.goto: Timeout 45000ms exceeded.; gammelt design () |
| VIDERESENDING | /admin/plans → /admin/plan | GRØNN | design: precision |
| VIDERESENDING | /admin/plans/[planId] → /admin/workbench/c7e2811d-86e1-49fe-9100-d33d5056eac2 | GRØNN | design: precision |
| VIDERESENDING | /admin/plans/templates/[id]/effectiveness → /admin/plan | GRØNN | design: precision |
| VIDERESENDING | /admin/plans/templates/ny → /admin/plan | GRØNN | design: precision |
| VIDERESENDING | /admin/plans/templates → /admin/plan | GRØNN | design: precision |
| VIDERESENDING | /admin/plans/templates/[id]/rediger → /admin/plan | GRØNN | design: precision |
| AG-23 | /admin/profile | GRØNN | design: precision |
| AG-18 | /admin/recording | GRØNN | design: precision |
| VIDERESENDING | /admin/reports → /admin/agencyos/okonomi | GRØNN | design: precision |
| AG-09 | /admin/runder | GRØNN | design: precision |
| VIDERESENDING | /admin/settings/api → /admin/oppsett?fane=api | GRØNN | design: precision |
| VIDERESENDING | /admin/settings/calendar → /admin/oppsett?fane=kalender | GRØNN | design: precision |
| VIDERESENDING | /admin/settings → /admin/oppsett | GUL | design: precision; demotekst: demo |
| VIDERESENDING | /admin/queue → /admin/innboks?filter=oppfolging | GUL | design: precision; demotekst: demo |
| VIDERESENDING | /admin/settings/security → /admin/oppsett?fane=sikkerhet | GRØNN | design: precision |
| VIDERESENDING | /admin/settings/periode-navn → /admin/oppsett?fane=perioder | GRØNN | design: precision |
| VIDERESENDING | /admin/settings/tilgang → /admin/oppsett?fane=tilgang | GUL | design: precision; demotekst: demo |
| VIDERESENDING | /admin/spillere/[id]/fremgang → /admin/spillere/c7e2811d-86e1-49fe-9100-d33d5056eac2 | GRØNN | design: precision |
| VIDERESENDING | /admin/spillere/[id]/analyse → /admin/spillere/c7e2811d-86e1-49fe-9100-d33d5056eac2?fane=stats | GRØNN | design: precision |
| UTEN-TEGNET-TYPE | /admin/spillere/[id]/plan/[planId]/for-og-na | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| AG-08 | /admin/spillere/[id] | GRØNN | design: precision |
| VIDERESENDING | /admin/spillere/[id]/plan → /admin/spillere/c7e2811d-86e1-49fe-9100-d33d5056eac2?fane=tp | GRØNN | design: precision |
| VIDERESENDING | /admin/spillere/[id]/tester → /admin/spillere/c7e2811d-86e1-49fe-9100-d33d5056eac2?fane=test | GRØNN | design: precision |
| AG-10 | /admin/spillere/[id]/plan/[planId] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| AG-08 | /admin/spillere/[id]/turnering-kobling | GRØNN | design: precision |
| AG-07 | /admin/spillere/ny | RØD | design: gammelt; gammelt design (gammelt); 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| VIDERESENDING | /admin/spillere/[id]/workbench → /admin/workbench/c7e2811d-86e1-49fe-9100-d33d5056eac2 | RØD | design: precision; 390: feilside/krasj; 390: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| VIDERESENDING | /admin/stall/dag → /admin/kalender?fane=stall | GRØNN | design: precision |
| VIDERESENDING | /admin/talent/kohort → /innsyn/talent/radar | GRØNN | design: precision |
| VIDERESENDING | /admin/talent/discovery → /innsyn/talent/discovery | RØD | design: gammelt; 390: 8 små treffmål (f.eks. Talent-radar 128x20, HCP 0–5 76x32); gammelt design (gammelt); demotekst: demo; 1440: 1 små treffmål (<32px) |
| VIDERESENDING | /admin/talent → /innsyn/talent/radar | GRØNN | design: precision |
| AG-07 | /admin/spillere | GRØNN | design: precision |
| VIDERESENDING | /admin/talent/radar → /innsyn/talent/radar | GRØNN | design: precision |
| VIDERESENDING | /admin/talent/region → /innsyn/talent/radar | GRØNN | design: precision |
| VIDERESENDING | /admin/talent/ressurser → /innsyn/talent/radar | GRØNN | design: precision |
| VIDERESENDING | /admin/talent/sammenligning → /innsyn/talent/sammenligning | RØD | design: gammelt; 390: 58 små treffmål (f.eks. Tilbake 100x36, Endre utvalg 123x32); 1440: 56 små treffmål (f.eks. Ada Berg (Demo) 267x19, Adrian Falk 267x19); gammelt design (gammelt); demotekst: demo |
| VIDERESENDING | /admin/talent/wagr-benchmark → /innsyn/talent/radar | GRØNN | design: precision |
| AG-23 | /admin/team/ekstern | RØD | design: gammelt; gammelt design (gammelt); demotekst: demo |
| VIDERESENDING | /admin/talent/wagr-import → /innsyn/talent/wagr-import | RØD | design: gammelt; gammelt design (gammelt) |
| AG-23 | /admin/team/inviter | RØD | design: gammelt; gammelt design (gammelt) |
| VIDERESENDING | /admin/team → /admin/oppsett?fane=tilgang | GUL | design: precision; demotekst: demo |
| VIDERESENDING | /admin/teknisk-plan → /admin/plan/teknisk | GUL | design: precision; demotekst: demo |
| AG-15 | /admin/tester | GUL | design: precision; demotekst: demo |
| AG-17 | /admin/tournaments/[id] | RØD | design: gammelt; gammelt design (gammelt); 390: 2 små treffmål (<44px) |
| AG-17 | /admin/tournaments/ny | RØD | design: gammelt; gammelt design (gammelt); 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| VIDERESENDING | /admin/tester/foreslatte → /admin/ko?fane=tester | GRØNN | design: precision |
| VIDERESENDING | /admin/tournaments/dubletter → /admin/turnering?fane=dubletter | GRØNN | design: precision |
| VIDERESENDING | /admin/tournaments → /admin/turnering | GRØNN | design: precision |
| AG-18 | /admin/trackman/[sessionId] | RØD | design: gammelt; gammelt design (gammelt); 390: 3 små treffmål (<44px); 1440: 3 små treffmål (<32px) |
| AG-18 | /admin/trackman | GRØNN | design: precision |
| VIDERESENDING | /admin/turnering-kart → /admin/turnering?fane=kart | GRØNN | design: precision |
| AG-17 | /admin/turnering | GRØNN | design: precision |
| VIDERESENDING | /admin/varsler → /admin/innboks?filter=varsler | GRØNN | design: precision |
| VIDERESENDING | /admin/uka → /admin/kalender | GUL | design: precision; demotekst: demo |
| AG-18 | /admin/videoer | GRØNN | design: precision |
| AG-11 | /admin/workbench/[playerId] | RØD | design: precision; 390: feilside/krasj; 390: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| AG-21 | /admin/workspace/notion | RØD | design: gammelt; gammelt design (gammelt); 390: 3 små treffmål (<44px); demotekst: demo; 1440: 3 små treffmål (<32px) |
| VIDERESENDING | /admin/workspace/oppgaver → /admin/oppgaver?fane=tildelt | GUL | design: precision; demotekst: demo |
| VIDERESENDING | /admin/workspace → /admin/oppgaver | GRØNN | design: precision |
| VIDERESENDING | /admin/workspace/prosjekter → /admin/oppgaver | GRØNN | design: precision |

## inngang-og-konto

| screenId | rute | status | funn |
|---|---|---|---|
| AU-02 | /auth/check-email | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| AU-01 | /auth/bankid | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| AU-02 | /auth/checkout-resume → /auth/login | GUL | design: precision; 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| VIDERESENDING | /auth/etter-innlogging → /auth/login | GUL | design: precision; 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| AU-05 | /auth/guardian-consent/[token] | IKKE TESTET | mangler id: token |
| AU-03 | /auth/forgot-password | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| AU-05 | /auth/lyd-samtykke/[token] | IKKE TESTET | mangler id: token |
| AU-01 | /auth/logget-ut | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| AU-01 | /auth/login | GUL | design: precision; 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| VIDERESENDING | /auth/logg-inn → /auth/login | GUL | design: precision; 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| AU-04 | /auth/onboarding/forelder → /auth/login | GUL | design: precision; 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| AU-03 | /auth/reset-password | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| AU-05 | /auth/samtykke-venter → /auth/login | GUL | design: precision; 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| AU-04 | /auth/onboarding → /auth/login | GUL | design: precision; 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| AU-02 | /auth/signup | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| UTEN-TEGNET-TYPE | /auth/trenerdeling | GRØNN | design: precision |
| AU-05 | /inviter/forelder/[token] | IKKE TESTET | mangler id: token |
| VIDERESENDING | /onboard/coach → /auth/onboarding | RØD | design: gammelt; gammelt design (gammelt) |
| VIDERESENDING | /onboard/klubb → /auth/onboarding | RØD | design: gammelt; gammelt design (gammelt) |

## forelder

| screenId | rute | status | funn |
|---|---|---|---|
| FO-02 | /forelder/barn/[childId] | IKKE TESTET | innlogging feilet (parent) |
| FO-02 | /forelder/barn | IKKE TESTET | innlogging feilet (parent) |
| FO-03 | /forelder/bookinger/bekreftet | IKKE TESTET | innlogging feilet (parent) |
| FO-03 | /forelder/bookinger/ny/[barnId]/bekreft | IKKE TESTET | innlogging feilet (parent) |
| FO-03 | /forelder/bookinger/ny/[barnId] | IKKE TESTET | innlogging feilet (parent) |
| FO-03 | /forelder/bookinger/ny | IKKE TESTET | innlogging feilet (parent) |
| FO-03 | /forelder/bookinger | IKKE TESTET | innlogging feilet (parent) |
| FO-06 | /forelder/coach | IKKE TESTET | innlogging feilet (parent) |
| FO-04 | /forelder/fakturaer | IKKE TESTET | innlogging feilet (parent) |
| FO-06 | /forelder/innstillinger | IKKE TESTET | innlogging feilet (parent) |
| FO-04 | /forelder/okonomi | IKKE TESTET | innlogging feilet (parent) |
| FO-01 | /forelder | IKKE TESTET | innlogging feilet (parent) |
| FO-05 | /forelder/samtykke/deling/[childId] | IKKE TESTET | innlogging feilet (parent) |
| FO-05 | /forelder/samtykke | IKKE TESTET | innlogging feilet (parent) |
| FO-01 | /forelder/ukerapport | IKKE TESTET | innlogging feilet (parent) |
| FO-01 | /forelder/varsler | IKKE TESTET | innlogging feilet (parent) |

## lag-og-skole

| screenId | rute | status | funn |
|---|---|---|---|
| GJ-01 | /gfgk-junior/gruppe/[gruppe] | IKKE TESTET | mangler id: gruppe |
| GJ-01 | /gfgk-junior/kalender | RØD | design: gammelt; 390: 24 små treffmål (f.eks. GFGKJunior & Elite 187x42, År 48x30); 1440: 18 små treffmål (f.eks. År 48x30, Måned 72x30); gammelt design (gammelt) |
| GJ-02 | /gfgk-junior/veileder/[slug] | IKKE TESTET | mangler id: slug |
| GJ-01 | /gfgk-junior | RØD | design: gammelt; 390: 25 små treffmål (f.eks. GFGKJunior & Elite 187x42, Se treningsplanen 302x20); 1440: 15 små treffmål (f.eks. Se treningsplanen 223x20, Se treningsplanen 223x20); gammelt design (gammelt) |
| GJ-01 | /gfgk-junior/treningsplaner | RØD | design: gammelt; 390: 17 små treffmål (f.eks. GFGKJunior & Elite 187x42, Åpne gruppesiden 130x20); 1440: 8 små treffmål (f.eks. Åpne gruppesiden 130x20, Hjem 313x22); gammelt design (gammelt) |
| GJ-02 | /gfgk-junior/veileder | RØD | design: gammelt; 390: 9 små treffmål (f.eks. GFGKJunior & Elite 187x42, Facebook 83x36); 1440: 7 små treffmål (f.eks. Hjem 313x22, Gruppene 313x22); gammelt design (gammelt) |
| TN-11 | /team-norway/[groupId]/dokumenter | IKKE TESTET | mangler id: groupId |
| AVSLATT | /team-gfgk | RØD | design: precision; 390: 404; 390: konsollfeil (1) Failed to load resource: the server responded with a status of 404 (No; 1440: 404; 1440: konsollfeil (1) Failed to load resource: the server responded with a status of 404 (No; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-09 | /team-norway/[groupId] | IKKE TESTET | mangler id: groupId |
| VIDERESENDING | /team-norway/apparatet → /team-norway/fagapparat | RØD | design: tn; 1440: konsollfeil (1) Failed to execute 'measure' on 'Performance': '​Page' cannot have a ne |
| TN-UTEN-RAD | /team-norway/analyse | RØD | design: tn; 390: feilside/krasj; 390: konsollfeil (2) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (2) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| TN-15 | /team-norway/college | GRØNN | design: tn |
| TN-UTEN-RAD | /team-norway/fellestesting/[deltakerId] | IKKE TESTET | mangler id: deltakerId |
| TN-UTEN-RAD | /team-norway/fagapparat | GRØNN | design: tn |
| TN-03 | /team-norway/fellestesting | RØD | design: tn; 390: feilside/krasj; 390: konsollfeil (2) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (2) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| TN-UTEN-RAD | /team-norway/live-watch | GRØNN | design: tn |
| TN-19 | /team-norway/inviter | GRØNN | design: tn |
| TN-UTEN-RAD | /team-norway/lisens-okonomi | GRØNN | design: tn |
| TN-05 | /team-norway/protokoller/[id] | IKKE TESTET | mangler id: id:/team-norway/protokoller/[id] |
| TN-16 | /team-norway/manedsplan | GRØNN | design: tn |
| TN-04 | /team-norway/protokoller | GRØNN | design: tn |
| TN-02 | /team-norway | RØD | design: tn; 390: feilside/krasj; 390: konsollfeil (2) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (2) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| TN-07 | /team-norway/rangliste | GRØNN | design: tn |
| TN-21 | /team-norway/referansenivaer | GRØNN | design: tn |
| TN-14 | /team-norway/samlinger/[id] | IKKE TESTET | mangler id: id:/team-norway/samlinger/[id] |
| TN-08 | /team-norway/skoler | GRØNN | design: tn |
| TN-UTEN-RAD | /team-norway/samlinger | GRØNN | design: tn |
| TN-10 | /team-norway/spiller/[spillerId] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-UTEN-RAD | /team-norway/spiller/[spillerId]/oversikt | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-UTEN-RAD | /team-norway/spiller/[spillerId]/analyse | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-UTEN-RAD | /team-norway/spiller/[spillerId]/evaluering | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-UTEN-RAD | /team-norway/spiller/[spillerId]/teknisk-plan | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-UTEN-RAD | /team-norway/spiller/[spillerId]/tester/[testId] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-UTEN-RAD | /team-norway/spiller/[spillerId]/tester | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-UTEN-RAD | /team-norway/spiller/[spillerId]/teknisk-plan/[planId] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-00 | /team-norway/spillere | GRØNN | design: tn |
| TN-18 | /team-norway/tilgang | GRØNN | design: tn |
| TN-UTEN-RAD | /team-norway/turneringer/[id] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-17 | /team-norway/turneringer/ny | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| TN-13 | /team-norway/turneringer | GRØNN | design: tn |
| TN-UTEN-RAD | /team-norway/wang-resultater | RØD | design: tn; 390: feilside/krasj; 390: konsollfeil (2) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (2) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| TN-UTEN-RAD | /team-norway/workbench | RØD | design: tn; 390: 11 små treffmål (f.eks. Gruppe · Team Norway 202x36, Periode 79x36) |
| TN-06 | /team-norway/uttak | GRØNN | design: tn |
| WANG-UTEN-RAD | /team-wang/coach/tester | GUL | design: wang; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| C5 | /team-wang/coach/iup/[elevId] | IKKE TESTET | mangler id: elevId |
| C6 | /team-wang/coach | RØD | design: wang; 390: sidelengs rulling (520>390); 390: 2 node(r) utenfor; 390: 5 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| WANG-UTEN-RAD | /team-wang/coach/turneringer/[elevId] | IKKE TESTET | mangler id: elevId |
| C7 | /team-wang/logg-inn | GRØNN | design: wang |
| A2 | /team-wang | RØD | design: wang; 390: 9 små treffmål (f.eks. Trening 81x40, Skole 65x40) |
| WANG-UTEN-RAD | /team-wang/skjermer | GUL | design: wang; 1440: 2 små treffmål (<32px) |
| VIDERESENDING | /team-wang/rekruttering → /team-wang/coach | RØD | design: wang; 390: sidelengs rulling (520>390); 390: 2 node(r) utenfor; 390: 5 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| VIDERESENDING | /team-wang/toppidrett → /team-wang/coach | RØD | design: wang; 390: sidelengs rulling (520>390); 390: 2 node(r) utenfor; 390: 5 små treffmål (<44px); 1440: 2 små treffmål (<32px) |

## delt-innsyn

| screenId | rute | status | funn |
|---|---|---|---|
| AU-06 | /innsyn/[spillerId] | IKKE TESTET | design: precision; ID tilhører spillerkonto (spillerinnlogging feilet); 404 som coach |
| AG-22 | /innsyn/talent/discovery | RØD | design: gammelt; 390: 8 små treffmål (f.eks. Talent-radar 128x20, HCP 0–5 76x32); gammelt design (gammelt); demotekst: demo; 1440: 1 små treffmål (<32px) |
| AU-06 | /innsyn | RØD | design: gammelt; gammelt design (gammelt) |
| VIDERESENDING | /innsyn/talent/kohort → /innsyn/talent/radar | GRØNN | design: precision |
| VIDERESENDING | /innsyn/talent → /innsyn/talent/radar | GRØNN | design: precision |
| AG-22 | /innsyn/talent/radar | GRØNN | design: precision |
| VIDERESENDING | /innsyn/talent/ressurser → /innsyn/talent/radar | GRØNN | design: precision |
| VIDERESENDING | /innsyn/talent/region → /innsyn/talent/radar | GRØNN | design: precision |
| AG-22 | /innsyn/talent/sammenligning | RØD | design: gammelt; 390: 58 små treffmål (f.eks. Tilbake 100x36, Endre utvalg 123x32); 1440: 56 små treffmål (f.eks. Ada Berg (Demo) 267x19, Adrian Falk 267x19); gammelt design (gammelt); demotekst: demo |
| VIDERESENDING | /innsyn/talent/wagr-benchmark → /innsyn/talent/radar | GRØNN | design: precision |
| AG-22 | /innsyn/talent/wagr-import | RØD | design: gammelt; gammelt design (gammelt) |

## systemtilstand

| screenId | rute | status | funn |
|---|---|---|---|
| SY-01 | /offline | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| SY-01 | /vedlikehold | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |

## personlig-arbeidsflate

| screenId | rute | status | funn |
|---|---|---|---|
| AG-01 | /meg | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light; gammelt design (gammelt); 390: 5 små treffmål (<44px); 1440: 4 små treffmål (<32px) |
| VIDERESENDING | /meg/morgenbrief → /admin/agencyos | GRØNN | design: precision |
| VIDERESENDING | /meg/dispatch → /admin/agencyos | GRØNN | design: precision |

## playerhq

| screenId | rute | status | funn |
|---|---|---|---|
| PH-05 | /portal/live/[sessionId]/active → /portal/planlegge | GUL | design: precision; 390: 2 små treffmål (<44px) |
| PH-04 | /portal/live/[sessionId]/brief → /portal/planlegge | GUL | design: precision; 390: 2 små treffmål (<44px) |
| VIDERESENDING | /portal/live/[sessionId]/logger → /portal/live/05639be9-7076-46bc-a2b3-029a294c9437/active | RØD | design: precision; 390: tom side; 1440: tom side |
| VIDERESENDING | /portal/live/[sessionId] → /portal/planlegge/workbench | GRØNN | design: precision |
| PH-07 | /portal/live/[sessionId]/summary | GRØNN | design: precision |
| PH-06 | /portal/live/[sessionId]/tapper | GRØNN | design: precision |
| PH-08 | /portal/runde/live | RØD | design: gammelt; 390: 18 små treffmål (f.eks. Hull 1 36x52, Hull 2 36x52); gammelt design (gammelt) |
| PH-09 | /portal/runde/logg | RØD | design: gammelt; 390: 22 små treffmål (f.eks. I dag 59x38, I går 56x38); gammelt design (gammelt) |
| VIDERESENDING | /portal/tren → /portal/planlegge/workbench?tab=uke | RØD | design: precision; 390: feilside/krasj; 390: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| PH-15 | /portal/tren/tester/[testId]/gjennomfor | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-02 | /portal/tren/wb | GRØNN | design: precision |
| PH-03 | /portal/tren/wb/[sessionId] | GRØNN | design: precision |
| VIDERESENDING | /portal/agent-pipeline → /portal | GRØNN | design: precision |
| VIDERESENDING | /portal/coach/[coachId] → /portal/coach | RØD | design: gammelt; 390: tom side; 1440: tom side; gammelt design (gammelt) |
| VIDERESENDING | /portal/coach/melding/[id] | IKKE TESTET | mangler id: id:/portal/coach/melding/[id] |
| VIDERESENDING | /portal/coach/notes → /portal/coach | GRØNN | design: precision |
| VIDERESENDING | /portal/coach/melding/[id]/vedlegg | IKKE TESTET | mangler id: id:/portal/coach/melding/[id]/vedlegg |
| VIDERESENDING | /portal/coach/ovelser/[id]/rediger → /portal/coach/ovelser | RØD | design: gammelt; 390: tom side; 1440: tom side; gammelt design (gammelt) |
| VIDERESENDING | /portal/coach/ovelser/ny → /portal/coach/ovelser | RØD | design: gammelt/precision; 390: tom side; 1440: tom side; gammelt design (gammelt/precision) |
| VIDERESENDING | /portal/coach/plans/[planId]/ny-okt → /portal/planlegge/workbench | RØD | design: precision; 390: feilside/krasj; 390: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| VIDERESENDING | /portal/coach/plans/[planId] → /portal/coach/plans | RØD | design: precision/gammelt; 1440: tom side; gammelt design (precision/gammelt) |
| VIDERESENDING | /portal/mal/runder/[id]/fullfor → /portal/mal/runder/cmset9y6v00018ubp222phh9w | GRØNN | design: precision |
| VIDERESENDING | /portal/mal/runder/[id]/shot-by-shot → /portal/mal/runder/cmset9y6v00018ubp222phh9w | GRØNN | design: precision |
| PH-17 | /portal/mal/sg-hub/equipment | RØD | design: gammelt; gammelt design (gammelt); 390: 3 små treffmål (<44px); 1440: 3 små treffmål (<32px) |
| VIDERESENDING | /portal/mal/sg-hub/[club] → /portal/coach/sg-hub | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| VIDERESENDING | /portal/mal/sg-hub → /portal/coach/sg-hub | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| VIDERESENDING | /portal/ny-okt → /portal/planlegge/workbench | RØD | design: precision; 390: feilside/krasj; 390: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| VIDERESENDING | /portal/statistikk → /portal/analysere | GRØNN | design: precision |
| VIDERESENDING | /portal/tren/aarsplan → /portal/planlegge/workbench?tab=gantt | RØD | design: precision; 390: feilside/krasj; 390: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| VIDERESENDING | /portal/tren/[sessionId] → /portal/live/cmseta04a001s8ubptme2zmi8/brief | GRØNN | design: precision |
| VIDERESENDING | /portal/tren/fys-plan/[planId] | IKKE TESTET | mangler id: fysiskPlan |
| VIDERESENDING | /portal/tren/tester/katalog → /portal/tren/tester | GRØNN | design: precision |
| PH-26 | /portal/utfordringer/ny | GUL | design: precision; 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| PH-13 | /portal/ai/foresla-drill | RØD | design: gammelt; 390: 8 små treffmål (f.eks. Øvelsesbank 130x20, Åpne drill 318x20); 1440: 8 små treffmål (f.eks. Øvelsesbank 130x20, Åpne drill 680x20); gammelt design (gammelt) |
| PH-22 | /portal/ai/foresla-turnering | RØD | design: gammelt; gammelt design (gammelt); 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| VIDERESENDING | /portal/analyse → /portal/analysere | GRØNN | design: precision |
| PH-12 | /portal/ai/mal-bygger | GRØNN | design: precision |
| PH-17 | /portal/analysere/datagolf/stasjon | GUL | design: precision; 390: 4 små treffmål (<44px) |
| PH-18 | /portal/analysere/datagolf | RØD | design: gammelt; gammelt design (gammelt); 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| PH-16 | /portal/analysere/historikk | GUL | design: precision; 390: 5 små treffmål (<44px) |
| PH-18 | /portal/analysere/hull | GUL | design: precision; 390: 3 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-16 | /portal/analysere | GRØNN | design: precision |
| PH-16 | /portal/analysere/skill-map | RØD | design: precision; 390: 10 små treffmål (f.eks. Innspill 200+ m, SG  158x42, Innspill 150–200 m,  193x42) |
| PH-17 | /portal/analysere/trackman | RØD | design: precision; 390: 8 små treffmål (f.eks. Økter 77x38, Gapping 90x38); 1440: 4 små treffmål (<32px) |
| PH-17 | /portal/analysere/trackman/[id] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-18 | /portal/analysere/turneringer | GRØNN | design: precision |
| VIDERESENDING | /portal/baneguide → /portal/gameplan | RØD | design: precision/gammelt; gammelt design (precision/gammelt); 390: 1 små treffmål (<44px) |
| VIDERESENDING | /portal/baneguide/[baneId]/hull/[nr] → /portal/gameplan/crs_bossum/hull/1 | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| VIDERESENDING | /portal/baneguide/[baneId] → /portal/gameplan/crs_bossum | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-23 | /portal/booking/[bookingId] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-23 | /portal/booking/bekreftet | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-23 | /portal/booking/anlegg/[anleggId] | GRØNN | design: precision |
| PH-23 | /portal/booking/coach/[coachId] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-23 | /portal/booking/ny/bekreft | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| VIDERESENDING | /portal/caddie → /portal/coach/ai | GUL | design: precision; 390: 4 små treffmål (<44px) |
| PH-22 | /portal/coach/ai | GUL | design: precision; 390: 4 små treffmål (<44px) |
| PH-23 | /portal/booking | GUL | design: precision; 390: 3 små treffmål (<44px); 1440: 3 små treffmål (<32px) |
| PH-23 | /portal/booking/ny | GRØNN | design: precision |
| PH-21 | /portal/coach/melding | GRØNN | design: precision |
| PH-21 | /portal/coach/melding/ny | GRØNN | design: precision |
| PH-13 | /portal/coach/ovelser | RØD | design: precision; 390: 6 små treffmål (f.eks. Alle 48x40, FYS 47x40) |
| PH-21 | /portal/coach | GRØNN | design: precision |
| PH-21 | /portal/coach/sg-hub | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-21 | /portal/coach/plans | GRØNN | design: precision |
| PH-21 | /portal/coach/sporsmal/[id] | IKKE TESTET | mangler id: question |
| PH-21 | /portal/coach/sporsmal/ny | GUL | design: precision; 390: 4 små treffmål (<44px) |
| PH-21 | /portal/coach/sporsmal | GRØNN | design: precision |
| PH-21 | /portal/coach/tilbakemelding/[oktId] | GUL | design: precision; 390: 2 små treffmål (<44px) |
| PH-21 | /portal/coach/tilbakemelding | GRØNN | design: precision |
| VIDERESENDING | /portal/datagolf → /portal/analysere/datagolf | RØD | design: gammelt; gammelt design (gammelt); 1440: 2 små treffmål (<32px) |
| PH-21 | /portal/coach/videoer | GRØNN | design: precision |
| PH-13 | /portal/drills/[id] | GRØNN | design: precision |
| PH-13 | /portal/drills | RØD | design: precision; 390: 11 små treffmål (f.eks. Alle 46x28, Fra coach 77x28); 1440: 12 små treffmål (f.eks. Alle 46x28, Fra coach 77x28) |
| PH-20 | /portal/gameplan/[baneId]/hull/[nr] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-26 | /portal/fysisk | GRØNN | design: precision |
| PH-20 | /portal/gameplan | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-20 | /portal/gameplan/[baneId] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-02 | /portal/gjennomfore | GRØNN | design: precision |
| PH-03 | /portal/gjennomfore/[id] | GRØNN | design: precision |
| PH-IUP-01 | /portal/iup/fireukerssjekk → /portal | GRØNN | design: precision |
| PH-10 | /portal/kalender/opptatt | GRØNN | design: precision |
| VIDERESENDING | /portal/live → /portal/gjennomfore | GRØNN | design: precision |
| PH-10 | /portal/kalender | GUL | design: precision; 390: 4 små treffmål (<44px) |
| VIDERESENDING | /portal/mal/bygger → /portal/planlegge/bygger | GRØNN | design: precision |
| UTEN-TEGNET-TYPE | /portal/mal/evaluering | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-19 | /portal/mal/goal/[id] | IKKE TESTET | mangler id: goal |
| PH-19 | /portal/mal/leaderboard | RØD | design: precision; 390: 6 små treffmål (f.eks. Klubb 69x34, Venner 76x34); 1440: 4 små treffmål (<32px) |
| PH-19 | /portal/mal | GRØNN | design: precision |
| PH-09 | /portal/mal/runder/[id]/hull | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-18 | /portal/mal/runder/[id] | GRØNN | design: precision |
| PH-09 | /portal/mal/runder/ny | GRØNN | design: precision |
| PH-08 | /portal/mal/runder/[id]/slag | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-18 | /portal/mal/runder | GRØNN | design: precision |
| UTEN-TEGNET-TYPE | /portal/mal/sg-hub/coach/[spillerId]/[club] | RØD | design: gammelt; gammelt design (gammelt); 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| VIDERESENDING | /portal/mal/trackman/[id] → /portal/analysere/trackman/cmset9yl0000f8ubpb6m7caas | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| UTEN-TEGNET-TYPE | /portal/mal/sg-hub/coach/[spillerId] | RØD | design: gammelt; gammelt design (gammelt); 390: 3 små treffmål (<44px); 1440: 3 små treffmål (<32px) |
| UTEN-TEGNET-TYPE | /portal/mal/sg-hub/coach/[spillerId]/equipment | RØD | design: gammelt; gammelt design (gammelt); 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-17 | /portal/mal/trackman/gapping | GUL | design: precision; 390: 4 små treffmål (<44px) |
| VIDERESENDING | /portal/mal/trackman → /portal/analysere/trackman | RØD | design: precision; 390: 8 små treffmål (f.eks. Økter 77x38, Gapping 90x38); 1440: 4 små treffmål (<32px) |
| PH-25 | /portal/meg/abonnement/avbestill | RØD | design: gammelt; gammelt design (gammelt); 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-25 | /portal/meg/abonnement/faktura/[id] | IKKE TESTET | design: gammelt; ID tilhører spillerkonto (spillerinnlogging feilet); 404 som coach |
| PH-25 | /portal/meg/abonnement/fortsett → /portal/meg/abonnement | GUL | design: precision; 390: 5 små treffmål (<44px); 1440: 5 små treffmål (<32px) |
| PH-25 | /portal/meg/abonnement/kort/ny → /portal/meg/abonnement | RØD | design: precision; 390: tom side; 1440: 5 små treffmål (<32px) |
| PH-25 | /portal/meg/abonnement/oppgrader/flyt → /portal/meg/abonnement | RØD | design: gammelt/precision; 390: tom side; gammelt design (gammelt/precision); 1440: 5 små treffmål (<32px) |
| PH-25 | /portal/meg/abonnement | GUL | design: precision; 390: 5 små treffmål (<44px); 1440: 5 små treffmål (<32px) |
| VIDERESENDING | /portal/meg/abonnement/oppgrader → /portal/meg/abonnement | GUL | design: precision; 390: 5 små treffmål (<44px); 1440: 5 små treffmål (<32px) |
| PH-23 | /portal/meg/bookinger | GUL | design: precision; 390: 3 små treffmål (<44px); 1440: 3 små treffmål (<32px) |
| UTEN-TEGNET-TYPE | /portal/meg/deling/innsyn | GRØNN | design: precision |
| PH-27 | /portal/meg/deling | GRØNN | design: precision |
| PH-23 | /portal/meg/bookinger/reschedule/[bookingId] | RØD | design: precision; 390: sidelengs rulling (736>390); 390: 64 noder utenfor |
| PH-24 | /portal/meg/dokumenter | GRØNN | design: precision |
| PH-24 | /portal/meg/foreldre | GRØNN | design: precision |
| PH-25 | /portal/meg/feedback | RØD | design: gammelt; gammelt design (gammelt); 390: 5 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-25 | /portal/meg/help/artikkel/[slug] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-25 | /portal/meg/help/kontakt | RØD | design: gammelt; gammelt design (gammelt) |
| PH-25 | /portal/meg/help/kategori/[slug] | IKKE TESTET | mangler id: slug |
| PH-25 | /portal/meg/help | RØD | design: gammelt; gammelt design (gammelt); 390: 3 små treffmål (<44px); 1440: 3 små treffmål (<32px) |
| PH-24 | /portal/meg/helse | GUL | design: precision; 390: 1 små treffmål (<44px) |
| PH-25 | /portal/meg/innstillinger/ai-coach | GUL | design: precision; 390: 3 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| PH-24 | /portal/meg/helse/symptom/ny | RØD | design: precision; 390: 8 små treffmål (f.eks. Steg 1 30x30, Steg 2 30x30); 1440: 8 små treffmål (f.eks. Steg 1 30x30, Steg 2 30x30) |
| PH-25 | /portal/meg/innstillinger/anlegg | GUL | design: precision; 390: 5 små treffmål (<44px); 1440: 5 små treffmål (<32px) |
| VIDERESENDING | /portal/meg/innstillinger/eksport → /portal/meg/innstillinger/personvern | GRØNN | design: precision |
| PH-25 | /portal/meg/innstillinger | GUL | design: precision; 390: 5 små treffmål (<44px); 1440: 5 små treffmål (<32px) |
| PH-25 | /portal/meg/innstillinger/integrasjoner | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-25 | /portal/meg/innstillinger/personvern/deling | GRØNN | design: precision |
| PH-25 | /portal/meg/innstillinger/personvern | GRØNN | design: precision |
| PH-25 | /portal/meg/innstillinger/sikkerhet | RØD | design: gammelt; gammelt design (gammelt); 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-25 | /portal/meg/innstillinger/sprak | RØD | design: gammelt; gammelt design (gammelt) |
| PH-24 | /portal/meg | GRØNN | design: precision |
| PH-25 | /portal/meg/innstillinger/varsler | RØD | design: gammelt; gammelt design (gammelt); 390: 2 små treffmål (<44px); 1440: 2 små treffmål (<32px) |
| PH-24 | /portal/meg/resultater | GRØNN | design: precision |
| PH-24 | /portal/meg/profil | GRØNN | design: precision |
| VIDERESENDING | /portal/meg/sikkerhet → /portal/meg/innstillinger/sikkerhet | RØD | design: gammelt; gammelt design (gammelt); 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-25 | /portal/meg/sikkerhet/2fa | GRØNN | design: precision |
| PH-24 | /portal/meg/utstyr | GRØNN | design: precision |
| VIDERESENDING | /portal/meg/utstyrsbag → /portal/meg/utstyr | GRØNN | design: precision |
| PH-21 | /portal/onskeligokt/bekreftet | GRØNN | design: precision |
| PH-21 | /portal/onskeligokt | GRØNN | design: precision |
| VIDERESENDING | /portal/oppgrader → /portal/meg/abonnement?fra=laast | GUL | design: precision; 390: 5 små treffmål (<44px); 1440: 5 små treffmål (<32px) |
| PH-01 | /portal | GRØNN | design: precision |
| VIDERESENDING | /portal/periodeplan → /portal/planlegge | GUL | design: precision; 390: 2 små treffmål (<44px) |
| PH-12 | /portal/planlegge/bygger | GRØNN | design: precision |
| PH-10 | /portal/planlegge | GUL | design: precision; 390: 2 små treffmål (<44px) |
| PH-11 | /portal/planlegge/workbench | RØD | design: precision; 390: feilside/krasj; 390: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| UTEN-TEGNET-TYPE | /portal/samlinger → /portal | GRØNN | design: precision |
| PH-24 | /portal/spiller/[spillerId] | RØD | design: gammelt; 390: 8 små treffmål (f.eks. Tilbake til stallen 156x20, Hjelp: HCP (handicap 11x11); gammelt design (gammelt); 1440: 3 små treffmål (<32px) |
| VIDERESENDING | /portal/stats → /portal/analysere | GRØNN | design: precision |
| PH-18 | /portal/statistikk/[metric] | RØD | design: gammelt; gammelt design (gammelt); 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-18 | /portal/statistikk/runder/[runId]/del | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-19 | /portal/talent/min-plan | GRØNN | design: precision |
| PH-19 | /portal/talent/mitt-niva | GRØNN | design: precision |
| PH-19 | /portal/talent/roadmap | GRØNN | design: precision |
| VIDERESENDING | /portal/talent → /portal/talent/mitt-niva | GRØNN | design: precision |
| PH-19 | /portal/talent/sammenligning | GRØNN | design: precision |
| VIDERESENDING | /portal/trackman/[sessionId] → /portal/analysere?tab=trackman | GRØNN | design: precision |
| VIDERESENDING | /portal/toppidrett → /portal/analysere | GRØNN | design: precision |
| VIDERESENDING | /portal/trackman → /portal/analysere?tab=trackman | GRØNN | design: precision |
| VIDERESENDING | /portal/tren/[sessionId]/planlagt → /portal/gjennomfore/cmseta04a001s8ubptme2zmi8 | GRØNN | design: precision |
| PH-26 | /portal/tren/fys-plan | GRØNN | design: precision |
| VIDERESENDING | /portal/tren/kalender → /portal/gjennomfore?tab=kalender | GRØNN | design: precision |
| PH-07 | /portal/tren/feiring/[planId] | GRØNN | design: precision |
| VIDERESENDING | /portal/tren/ovelser/[id] → /portal/drills/ex_chip_landing | GRØNN | design: precision |
| VIDERESENDING | /portal/tren/ovelser → /portal/drills | RØD | design: precision; 390: 11 små treffmål (f.eks. Alle 46x28, Fra coach 77x28); 1440: 12 små treffmål (f.eks. Alle 46x28, Fra coach 77x28) |
| UTEN-TEGNET-TYPE | /portal/tren/teknisk-plan | GRØNN | design: precision |
| PH-19 | /portal/tren/teknisk-plan/[planId] | GRØNN | design: precision |
| PH-14 | /portal/tren/tester/[testId] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-14 | /portal/tren/tester/ny/egen | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-14 | /portal/tren/tester/ny | GRØNN | design: precision |
| PH-14 | /portal/tren/tester | GRØNN | design: precision |
| PH-14 | /portal/tren/tester/team-norway | RØD | design: precision; 390: feilside/krasj; 390: konsollfeil (3) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (3) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| PH-26 | /portal/tren/turneringer/[id] → /portal/planlegge/workbench?tab=seson | RØD | design: precision; 390: feilside/krasj; 390: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light; 1440: feilside/krasj; 1440: konsollfeil (1) [database] Databaseforespørsel mislyktes. color: #000000;color: light |
| PH-26 | /portal/trening/break-tabell | RØD | design: precision; 390: 32 små treffmål (f.eks. Hjelp: Break 11x11, 1 m 46x32); 1440: 3 små treffmål (<32px) |
| PH-26 | /portal/tren/turneringer | RØD | design: gammelt; 390: 99 små treffmål (f.eks. Tren 82x20, 06oktDevonvale Bolan 256x38); 1440: 50 små treffmål (f.eks. Tren 82x20, Legg turneringen i p 56x28); gammelt design (gammelt) |
| PH-26 | /portal/trening/logg | RØD | design: precision; 390: 6 små treffmål (f.eks. INPUT 316x6, 1 42x44); 1440: 1 små treffmål (<32px) |
| PH-26 | /portal/trening/putte-laboratoriet | RØD | design: precision; 390: 22 små treffmål (f.eks. 1 m 46x32, 1,5 m 60x32); 1440: 4 små treffmål (<32px) |
| PH-26 | /portal/utfordringer/[id] | IKKE TESTET | mangler id: drillChallenge |
| VIDERESENDING | /portal/utenfor-banen → /portal/meg | RØD | design: precision; 1440: tom side |
| PH-26 | /portal/ukesdigest | RØD | design: gammelt; gammelt design (gammelt); 390: 2 små treffmål (<44px) |
| PH-26 | /portal/utfordringer | GRØNN | design: precision |
| PH-19 | /portal/utviklingsplan | GRØNN | design: precision |
| PH-25 | /portal/varsler | GRØNN | design: precision |
| PH-24 | /portal/venner/[spillerId] | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| PH-24 | /portal/venner | GUL | design: precision; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |

## marked-og-offentlig

| screenId | rute | status | funn |
|---|---|---|---|
| MK-TILBUD | /anlegg | RØD | design: precision; 390: 20 små treffmål (f.eks. AK Golf, til forside 30x26, Book simulatortid → 128x20); 1440: 19 små treffmål (f.eks. Book simulatortid → 128x20, Coaching 232x23) |
| MK-TILBUD | /anlegg/[slug] | RØD | design: precision; 390: 21 små treffmål (f.eks. AK Golf, til forside 30x26, Hjem 33x14); 1440: 20 små treffmål (f.eks. Hjem 33x14, Anlegg 49x14) |
| MK-INNHOLD | /blogg | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-TILBUD | /coacher | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-INNHOLD | /cases | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-TILBUD | /coaching | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-TILBUD | /coacher/[slug] | RØD | design: precision; 390: 21 små treffmål (f.eks. AK Golf, til forside 30x26, Hjem 33x14); 1440: 20 små treffmål (f.eks. Hjem 33x14, Coacher 57x14) |
| MK-INNHOLD | /blogg/[slug] | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-TILBUD | /jobb | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-TILBUD | /junior | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-JURIDISK | /cookies | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-TILBUD | /faq | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-FORSIDE | / | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-TILBUD | /om-oss | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-TILBUD | /kontakt | RØD | design: precision; 390: 21 små treffmål (f.eks. AK Golf, til forside 30x26, +47 482 16 540 122x22); 1440: 20 små treffmål (f.eks. +47 482 16 540 122x22, post@akgolf.no 122x22) |
| MK-JURIDISK | /personvern | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-TILBUD | /mulligan | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| ST-02 | /stats/aargang/[aar] → /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| MK-TILBUD | /priser | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-PRODUKT | /playerhq | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| ST-02 | /stats/aargang → /auth/login?next=%2Fstats%2Faargang | IKKE TESTET | design: precision; sendt til innlogging (rolle mangler) |
| ST-01 | /stats/2026 | RØD | design: gammelt; 390: sidelengs rulling (425>390); 390: 13 noder utenfor; 390: 13 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 15 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-02 | /stats/blogg | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-02 | /stats/baner | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 18 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-03 | /stats/klubber/[slug] | IKKE TESTET | mangler id: slug |
| ST-02 | /stats/klubber → /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-01 | /stats/leaderboards → /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/min-progresjon → /auth/login?next=/stats/min-progresjon | IKKE TESTET | design: precision; sendt til innlogging (rolle mangler) |
| ST-01 | /stats/norske | RØD | design: gammelt; 390: 39 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 16 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-03 | /stats/blogg/[slug] | RØD | design: precision; 390: feilside/krasj; 390: HTTP 500; 390: konsollfeil (2) Failed to load resource: the server responded with a status of 500 (In; 1440: feilside/krasj; 1440: HTTP 500; 1440: konsollfeil (2) Failed to load resource: the server responded with a status of 500 (In; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| ST-03 | /stats/baner/[slug] | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 13 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 15 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-01 | /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/pga/gir-pct → /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/pga/drive-distance → /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/pga/fairway-pct → /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/pga/putt-explorer → /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/pga/putts-per-round → /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/pga/scoring-avg → /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-02 | /stats/pga/spillere | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) Encountered two children with the same key, ``. Keys should be unique; 390: 19 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: feilside/krasj; 1440: konsollfeil (1) Encountered two children with the same key, ``. Keys should be unique; 1440: 21 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-06 | /stats/quiz | RØD | design: gammelt; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/pga | RØD | design: gammelt; 390: 13 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 15 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/pga/sg-total | RØD | design: gammelt; 390: 14 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 16 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-03 | /stats/pga/spillere/[dg_id] | RØD | design: gammelt; 390: sidelengs rulling (689>390); 390: 7 noder utenfor; 390: 14 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 16 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-03 | /stats/regions/[slug] | IKKE TESTET | mangler id: slug |
| ST-02 | /stats/regions → /stats | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/sg-sammenlign/resultat/[id] | IKKE TESTET | mangler id: brukerSammenligning |
| ST-05 | /stats/sammenlign-spillere | RØD | design: gammelt; 390: sidelengs rulling (590>390); 390: 47 noder utenfor; 390: 14 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/sg-sammenlign | RØD | design: gammelt; 390: sidelengs rulling (650>390); 390: 43 noder utenfor; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-05 | /stats/sg-sammenlign/start → /auth/login?next=/stats/sg-sammenlign/start | IKKE TESTET | design: precision; sendt til innlogging (rolle mangler) |
| ST-02 | /stats/spillere | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 48 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-03 | /stats/tour/[slug] | IKKE TESTET | mangler id: slug |
| ST-01 | /stats/sok | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 23 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 23 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-03 | /stats/spillere/[slug] | RØD | design: gammelt; 390: 22 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 24 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-04 | /stats/turneringer/[slug]/statistikk | RØD | design: gammelt; 390: 13 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 15 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-04 | /stats/turneringer/[slug] | RØD | design: precision; 390: feilside/krasj; 390: HTTP 500; 390: konsollfeil (2) Failed to load resource: the server responded with a status of 500 (In; 1440: feilside/krasj; 1440: HTTP 500; 1440: konsollfeil (2) Failed to load resource: the server responded with a status of 500 (In; 390: 1 små treffmål (<44px); 1440: 1 små treffmål (<32px) |
| ST-02 | /stats/turneringer | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 26 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 15 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-06 | /stats/verktoy/avstand | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 13 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 15 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-06 | /stats/verktoy/score-til-hcp | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 14 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 16 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-06 | /stats/verktoy | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 12 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 14 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-01 | /stats/uka | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 13 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 15 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-06 | /stats/wrapped/[slug] | IKKE TESTET | mangler id: slug |
| ST-06 | /stats/verktoy/sg-estimator | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 14 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 16 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-06 | /stats/verktoy/tour-ekvivalent | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 16 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 18 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| ST-06 | /stats/verktoy/whs-kalkulator | RØD | design: gammelt; 390: feilside/krasj; 390: konsollfeil (1) a style property during rerender () when a conflicting property is se; 390: 25 små treffmål (f.eks. A 24x21, Åpne meny 40x40); 1440: 18 små treffmål (f.eks. A 24x21, Hjem 34x25); gammelt design (gammelt) |
| MK-BEKREFT | /suksess | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| ST-02 | /turneringer | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-TILBUD | /treningsfilosofi | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| MK-JURIDISK | /vilkar | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
| ST-04 | /turneringer/[slug] | RØD | design: precision; 390: 19 små treffmål (f.eks. AK Golf, til forside 30x26, Coaching 358x23); 1440: 18 små treffmål (f.eks. Coaching 232x23, Junior Academy 232x23) |
