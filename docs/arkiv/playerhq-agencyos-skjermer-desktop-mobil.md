# PlayerHQ + AgencyOS — komplett skjermliste (desktop + mobil)

> **Dato:** 2026-06-28 · Kilde: `docs/MASTER-SKJERMPLAN.md` (autoritativ).
> **Hva dette er:** Hver skjerm i PlayerHQ (spiller, `/portal`) og AgencyOS (coach, `/admin`),
> med eksplisitt **Mobil**- og **Desktop**-status (+ iPad). PlayerHQ = 153 sider, AgencyOS = 146 sider.

**Statustegn:** ✓ = ferdig · ~ = delvis · – = ikke laget. ★ = kjerneskjerm.

---

## Oppsummering — desktop/mobil-dekning

- **PlayerHQ er mobil-først.** De fem hovedskjermene + Meg-skjermer + Workbench + Runder + Tester har
  full mobil **og** desktop (ofte iPad også). Mange undersider (mål, teknisk plan, SG-Hub-subs, coach-
  seksjon, talent, booking-subs) er **ikke designet** ennå (`–/–`).
- **AgencyOS er desktop-først — mobil mangler for det meste.** Nesten alle ferdige AgencyOS-skjermer er
  `Desktop ✓ / Mobil –`. Egen mobil-utgave (`components-coach-mobile.html`) er **ikke bygget**. Dette er
  den største desktop/mobil-gapet i plattformen: **AgencyOS trenger en egen mobil-designrunde.**
- iPad er stort sett ikke verifisert utenom de fem PlayerHQ-kjerneskjermene.

---

# PlayerHQ (spiller — `/portal`)

## Hjem
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Hjem (Workbench-hjem) ★ | `/portal` | ✓ | ✓ | ✓ |
| Varsler ★ | `/portal/varsler` | ✓ | ✓ | ✓ |

## Planlegge
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Planlegge (Workbench mobil) ★ | `/portal/planlegge` | ✓ | ✓ | ✓ |
| Workbench (planlegging) ★ | `/portal/planlegge/workbench` | ✓ | ✓ | ✓ |
| Årsplan | `/portal/tren/aarsplan` | ✓ | ✓ | – |
| · Rediger periode | `/portal/tren/aarsplan/periode/[id]/rediger` | – | – | – |
| Teknisk plan (liste) | `/portal/tren/teknisk-plan` | – | – | – |
| · Teknisk plan detalj | `/portal/tren/teknisk-plan/[planId]` | – | – | – |
| Fys-plan (liste) | `/portal/tren/fys-plan` | – | – | – |
| · Fys-plan detalj/bygger | `/portal/tren/fys-plan/[planId]` | – | – | – |
| Drills (bibliotek) | `/portal/drills` | ✓ | ✓ | – |
| · Drill-detalj | `/portal/drills/[id]` | ✓ | ✓ | – |
| Mål-hub | `/portal/mal` | – | – | – |
| · Mål-bygger (wizard) | `/portal/mal/bygger` | – | – | – |
| · Mål-detalj | `/portal/mal/goal/[id]` | – | – | – |
| · Milepæler | `/portal/mal/milepaeler` | – | – | – |
| · Leaderboard | `/portal/mal/leaderboard` | – | – | – |
| Turneringer (mine) ★ | `/portal/tren/turneringer` | ✓ | ✓ | ✓ |
| · Turnering-detalj | `/portal/tren/turneringer/[id]` | ✓ | ✓ | – |
| · Ny turnering | `/portal/tren/turneringer/ny` | – | – | – |
| Utfordringer | `/portal/utfordringer` | – | – | – |
| · Ny utfordring (wizard) | `/portal/utfordringer/ny` | – | – | – |
| · Utfordring-detalj | `/portal/utfordringer/[id]` | – | – | – |
| AI: mål-bygger | `/portal/ai/mal-bygger` | – | – | – |
| AI: foreslå drill | `/portal/ai/foresla-drill` | – | – | – |
| AI: foreslå turnering | `/portal/ai/foresla-turnering` | – | – | – |

## Gjennomføre (inkl. live-økt)
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Gjennomføre (I dag/Kalender/Booking) ★ | `/portal/gjennomfore` | ✓ | ✓ | ✓ |
| · Økt-detalj (V2-økt fra coach) | `/portal/gjennomfore/[id]` | ✓ | ✓ | ✓ |
| Kalender | `/portal/kalender` | – | – | – |
| Kalender (alt. adresse) | `/portal/tren/kalender` | – | – | – |
| Ny økt (handlingsvalg) | `/portal/ny-okt` | – | – | – |
| Logg treningsøkt (volum per SG) | `/portal/trening/logg` | ✓ | ✓ | – |
| Putte-laboratoriet (3 verktøy) | `/portal/trening/putte-laboratoriet` | ✓ | ✓ | – |
| Break-tabell (3 varianter) | `/portal/trening/break-tabell` | ✓ | ✓ | – |
| Ønsket økt (be coach) | `/portal/onskeligokt` | – | – | – |
| · Ønsket økt bekreftet | `/portal/onskeligokt/bekreftet` | – | – | – |
| Live-økt: brief | `/portal/(fullscreen)/live/[sessionId]/brief` | ✓ | ✓ | – |
| Live-økt: aktiv | `/portal/(fullscreen)/live/[sessionId]/active` | ✓ | ✓ | – |
| Live-økt: oppsummering | `/portal/(fullscreen)/live/[sessionId]/summary` | ✓ | ✓ | – |
| Live-økt: drill-logger | `/portal/(fullscreen)/live/[sessionId]/logger` | ✓ | ✓ | – |
| Live-økt: score-tapper | `/portal/(fullscreen)/live/[sessionId]/tapper` | ✓ | ✓ | – |
| Tren (fullskjerm) | `/portal/(fullscreen)/tren` | – | – | – |
| Økt-detalj | `/portal/tren/[sessionId]` | – | – | – |
| · Planlagt økt | `/portal/tren/[sessionId]/planlagt` | – | – | – |
| Feiring (etter plan ferdig) | `/portal/tren/feiring/[planId]` | – | – | – |

## Analysere
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Analysere (Les tallene · faner) ★ | `/portal/analysere` | ✓ | ✓ | ✓ |
| · Hull-analyse | `/portal/analysere/hull` | ✓ | ✓ | – |
| Statistikk (oversikt) | `/portal/statistikk` | ✓ | ✓ | – |
| · Metrikk-detalj | `/portal/statistikk/[metric]` | – | – | – |
| · Sammenlign | `/portal/statistikk/sammenlign` | – | – | – |
| · Del runde | `/portal/statistikk/runder/[runId]/del` | – | – | – |
| SG-Hub (Strokes Gained) ★ | `/portal/mal/sg-hub` | ✓ | ✓ | – |
| · Kølle-detalj | `/portal/mal/sg-hub/[club]` | – | – | – |
| · Benchmark | `/portal/mal/sg-hub/benchmark` | – | – | – |
| · Best vs nå | `/portal/mal/sg-hub/best-vs-now` | – | – | – |
| · Utstyr | `/portal/mal/sg-hub/equipment` | – | – | – |
| · Avstander (yardage) | `/portal/mal/sg-hub/yardage` | – | – | – |
| · Forhold (vær/bane) | `/portal/mal/sg-hub/conditions` | – | – | – |
| · Strategi | `/portal/mal/sg-hub/strategy` | – | – | – |
| · Coach ser spiller-SG | `/portal/mal/sg-hub/coach/[spillerId]` | – | – | – |
| · Coach: kølle | `/portal/mal/sg-hub/coach/[spillerId]/[club]` | – | – | – |
| · Coach: utstyr | `/portal/mal/sg-hub/coach/[spillerId]/equipment` | – | – | – |
| Runder (liste) | `/portal/mal/runder` | ✓ | ✓ | – |
| · Runde-detalj ★ | `/portal/mal/runder/[id]` | ✓ | ✓ | ✓ |
| · Slag-for-slag (visning) | `/portal/mal/runder/[id]/shot-by-shot` | – | – | – |
| · Slag-registrering (wizard) | `/portal/mal/runder/[id]/slag` | ✓ | – | – |
| · Logg ny runde ★ | `/portal/mal/runder/ny` | ✓ | ✓ | ✓ |
| TrackMan (liste) | `/portal/mal/trackman` | ✓ | ✓ | – |
| · TrackMan-sesjon | `/portal/mal/trackman/[id]` | ✓ | ✓ | – |
| · TrackMan (alt. adresse) | `/portal/trackman/[sessionId]` | ✓ | ✓ | – |
| Tester (oversikt) ★ | `/portal/tren/tester` | ✓ | ✓ | ~ |
| · Test-detalj ★ | `/portal/tren/tester/[testId]` | ✓ | ✓ | ~ |
| · Test-gjennomføring (scorekort) ★ | `/portal/tren/tester/[testId]/gjennomfor` | ✓ | ✓ | ~ |
| · Test-katalog (NGF) | `/portal/tren/tester/katalog` | – | – | – |
| · Ny test | `/portal/tren/tester/ny` | – | – | – |
| · Ny egen test | `/portal/tren/tester/ny/egen` | – | – | – |
| · Test live (fullskjerm) | `/portal/(fullscreen)/test/[testId]/live` | – | – | – |
| · Test oppsummering | `/portal/(fullscreen)/test/[testId]/summary` | – | – | – |
| Bane-bibliotek | `/portal/mal/baner` | – | – | – |
| · Bane-detalj | `/portal/mal/baner/[id]` | – | – | – |
| Statistikk-side (gml.) | `/portal/mal/statistikk` | – | – | – |

## Coach (spillerens kontakt med coach) — hele seksjonen mangler design
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Coach-hub | `/portal/coach` | – | – | – |
| · Coach-profil | `/portal/coach/[coachId]` | – | – | – |
| Meldinger (innboks) | `/portal/coach/melding` | – | – | – |
| · Ny melding | `/portal/coach/melding/ny` | – | – | – |
| · Meldingstråd | `/portal/coach/melding/[id]` | – | – | – |
| · Vedlegg | `/portal/coach/melding/[id]/vedlegg` | – | – | – |
| Coach-planer | `/portal/coach/plans` | – | – | – |
| · Plan-detalj | `/portal/coach/plans/[planId]` | – | – | – |
| · Ny økt i plan | `/portal/coach/plans/[planId]/ny-okt` | – | – | – |
| · Perioder | `/portal/coach/plans/perioder` | – | – | – |
| Coach-øvelser | `/portal/coach/ovelser` | – | – | – |
| · Ny øvelse | `/portal/coach/ovelser/ny` | – | – | – |
| · Rediger øvelse | `/portal/coach/ovelser/[id]/rediger` | – | – | – |
| Coach-videoer | `/portal/coach/videoer` | – | – | – |
| Coach-notater | `/portal/coach/notes` | – | – | – |
| · Notat-detalj | `/portal/coach/notes/[noteId]` | – | – | – |
| Spørsmål til coach | `/portal/coach/sporsmal/[id]` | – | – | – |
| Coach-AI | `/portal/coach/ai` | – | – | – |

## Meg (profil og innstillinger)
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Meg (profil) ★ | `/portal/meg` | ✓ | ✓ | ✓ |
| Rediger profil ★ | `/portal/meg/profil` | ✓ | ✓ | ✓ |
| Abonnement ★ | `/portal/meg/abonnement` | ✓ | ✓ | ✓ |
| · Oppgrader | `/portal/meg/abonnement/oppgrader` | – | – | – |
| · Oppgrader-flyt | `/portal/meg/abonnement/oppgrader/flyt` | – | – | – |
| · Avbestill | `/portal/meg/abonnement/avbestill` | – | – | – |
| · Nytt kort | `/portal/meg/abonnement/kort/ny` | – | – | – |
| · Faktura-detalj | `/portal/meg/abonnement/faktura/[id]` | – | – | – |
| Mine bookinger | `/portal/meg/bookinger` | – | – | – |
| · Endre tid | `/portal/meg/bookinger/reschedule/[bookingId]` | – | – | – |
| Helse ★ | `/portal/meg/helse` | ✓ | ✓ | ✓ |
| · Nytt symptom | `/portal/meg/helse/symptom/ny` | – | – | – |
| Innstillinger ★ | `/portal/meg/innstillinger` | ✓ | ✓ | ✓ |
| · Varsler | `/portal/meg/innstillinger/varsler` | – | – | – |
| · Personvern | `/portal/meg/innstillinger/personvern` | – | – | – |
| · Sikkerhet | `/portal/meg/innstillinger/sikkerhet` | – | – | – |
| · Språk | `/portal/meg/innstillinger/sprak` | – | – | – |
| · Anlegg | `/portal/meg/innstillinger/anlegg` | – | – | – |
| · Integrasjoner | `/portal/meg/innstillinger/integrasjoner` | – | – | – |
| · Eksport | `/portal/meg/innstillinger/eksport` | – | – | – |
| · Økter | `/portal/meg/innstillinger/okter` | – | – | – |
| Sikkerhet | `/portal/meg/sikkerhet` | – | – | – |
| · To-faktor (2FA) | `/portal/meg/sikkerhet/2fa` | – | – | – |
| Utstyrsbag ★ | `/portal/meg/utstyrsbag` | ✓ | ✓ | ✓ |
| Dokumenter ★ | `/portal/meg/dokumenter` | ✓ | ✓ | ✓ |
| Foreldre (foresatt-info) | `/portal/meg/foreldre` | ✓ | ✓ | – |
| Feedback | `/portal/meg/feedback` | – | – | – |
| Hjelpesenter ★ | `/portal/meg/help` | ✓ | ✓ | ✓ |
| · Hjelp-artikkel | `/portal/meg/help/artikkel/[slug]` | – | – | – |
| · Hjelp-kategori | `/portal/meg/help/kategori/[slug]` | – | – | – |
| · Kontakt | `/portal/meg/help/kontakt` | – | – | – |

## Booking
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Booking-hub | `/portal/booking` | ✓ | ✓ | – |
| · Ny booking (wizard) | `/portal/booking/ny` | ✓ | ✓ | – |
| · Ny booking bekreft | `/portal/booking/ny/bekreft` | – | – | – |
| · Booking-detalj | `/portal/booking/[bookingId]` | – | – | – |
| · Coach-profil (booking) | `/portal/booking/coach/[coachId]` | – | – | – |
| · Anlegg-detalj (booking) | `/portal/booking/anlegg/[anleggId]` | – | – | – |
| · Bekreftet | `/portal/booking/bekreftet` | – | – | – |

## Talent (elite-spor — bevisst utsatt «Elite Fase 2»)
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Talent-hub | `/portal/talent` | – | – | – |
| · Min plan | `/portal/talent/min-plan` | – | – | – |
| · Mitt nivå | `/portal/talent/mitt-niva` | – | – | – |
| · Roadmap | `/portal/talent/roadmap` | – | – | – |
| · Sammenligning | `/portal/talent/sammenligning` | – | – | – |

## Aliaser/hjelpe-ruter (redirects — tatt med for komplethet)
`/portal/stats`→statistikk · `/portal/analyse`→analysere · `/portal/tren/ovelser`→drills ·
`/portal/reach` · `/portal/agent-pipeline` · `/portal/spiller/[spillerId]`.

---

# AgencyOS (coach — `/admin`)

> **NB:** AgencyOS er bygget **desktop-først**. Nesten alle ferdige skjermer er `Desktop ✓ / Mobil –`.
> En egen mobil-utgave er **ikke bygget** og er det største desktop/mobil-gapet.

## Oversikt (coachens hjem)
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Cockpit (hjem) ★ | `/admin/agencyos` | – | ✓ | – |
| · Uka (kanban) | `/admin/agencyos/uka` | ✓ | ✓ | – |
| · Spillere (snarvei) | `/admin/agencyos/spillere` | ✓ | ✓ | – |
| · Økonomi | `/admin/agencyos/okonomi` | – | – | – |
| · Caddie (AI-chat) | `/admin/agencyos/caddie` | ✓ | ✓ | – |
| · Caddie-aktivitet | `/admin/agencyos/caddie/aktivitet` | – | – | – |
| Admin-rot (gml. hjem) | `/admin` | – | – | – |
| Daglig AI-brief | `/admin/brief` | – | – | – |
| Coaching-board | `/admin/board` | – | – | – |
| Oppfølging | `/admin/oppfolging` | – | – | – |
| Oppgave-kø | `/admin/queue` | – | – | – |
| Innboks ★ | `/admin/innboks` | ✓ | ✓ | – |
| Kommunikasjon-hub | `/admin/kommunikasjon` | – | – | – |
| Reach | `/admin/reach` | – | – | – |

## Min uke / Workspace
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Workspace-hub | `/admin/workspace` | – | – | – |
| · Tildelt meg | `/admin/workspace/tildelt-meg` | – | ✓ | – |
| · Oppgaver | `/admin/workspace/oppgaver` | – | ✓ | – |
| · Oppgave-detalj | `/admin/workspace/oppgaver/[id]` | – | – | – |
| · Prosjekter | `/admin/workspace/prosjekter` | – | – | – |
| · Notion-sync | `/admin/workspace/notion` | – | – | – |

## Stall (spillere, grupper, talent)
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Stall-oversikt | `/admin/stall` | – | – | – |
| Spillere (alle) ★ | `/admin/spillere` | – | ✓ | – |
| · Ny spiller | `/admin/spillere/ny` | – | – | – |
| Spiller-detalj ★ | `/admin/spillere/[id]` | ~ | ✓ | – |
| · Profil | `/admin/spillere/[id]/profil` | – | – | – |
| · Workbench (coach-i-spiller) ★ | `/admin/spillere/[id]/workbench` | ✓ | ✓ | ✓ |
| · Plan-detalj | `/admin/spillere/[id]/plan/[planId]` | – | – | – |
| · Fremgang (trening vs SG) | `/admin/spillere/[id]/fremgang` | ✓ | ✓ | – |
| · Tester | `/admin/spillere/[id]/tester` | ✓ | ✓ | – |
| · Tildel test | `/admin/spillere/[id]/tildel-test` | – | – | – |
| · Rediger | `/admin/spillere/[id]/rediger` | – | – | – |
| Grupper | `/admin/grupper` | – | ✓ | – |
| · Gruppe-detalj | `/admin/grupper/[id]` | – | – | – |
| Talent-hub | `/admin/talent` | – | – | – |
| · Talent-detalj | `/admin/talent/[playerId]` | – | – | – |
| · Discovery | `/admin/talent/discovery` | – | – | – |
| · Radar | `/admin/talent/radar` | – | ✓ | – |
| · Radar per spiller | `/admin/talent/radar/[playerId]` | – | – | – |
| · Kohort | `/admin/talent/kohort` | – | – | – |
| · Region | `/admin/talent/region` | – | – | – |
| · Ressurser | `/admin/talent/ressurser` | – | – | – |
| · Sammenligning | `/admin/talent/sammenligning` | ~ | ✓ | – |
| · WAGR-benchmark | `/admin/talent/wagr-benchmark` | – | – | – |
| · WAGR-import | `/admin/talent/wagr-import` | – | ✓ | – |

## Planlegge (lage planer FOR spillerne)
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Plan-sentral (hub) | `/admin/planlegge` | – | – | – |
| Planer (alle) | `/admin/plans` | – | ✓ | – |
| · Ny plan (Plan-bygger) | `/admin/plans/new` | – | ✓ | – |
| · Plan-detalj | `/admin/plans/[planId]` | – | – | – |
| Plan-maler | `/admin/plan-templates` | – | ✓ | – |
| · Plan-mal detalj | `/admin/plan-templates/[id]` | – | – | – |
| · Ny plan-mal | `/admin/plan-templates/ny` | – | – | – |
| · Rediger plan-mal | `/admin/plan-templates/[id]/rediger` | – | – | – |
| Drills (bibliotek) | `/admin/drills` | ~ | ✓ | – |
| · Drill-detalj | `/admin/drills/[id]` | – | – | – |
| · Rediger drill | `/admin/drills/[id]/rediger` | – | – | – |
| Teknisk plan | `/admin/teknisk-plan` | – | – | – |
| · Per spiller | `/admin/teknisk-plan/[spillerId]` | – | – | – |
| Turneringer ★ | `/admin/tournaments` | ✓ | ✓ | – |
| · Turnering-detalj | `/admin/tournaments/[id]` | ✓ | ✓ | – |
| · Ny turnering | `/admin/tournaments/ny` | – | – | – |
| · Dubletter (rydd) | `/admin/tournaments/dubletter` | – | – | – |
| Økter | `/admin/okter` | – | – | – |
| Videoer | `/admin/videoer` | – | – | – |
| Opptak | `/admin/recording` | – | – | – |

## Gjennomføre (daglig drift)
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Daglig drift (hub) | `/admin/gjennomfore` | – | – | – |
| · Økt-detalj | `/admin/gjennomfore/okter/[id]` | – | – | – |
| Kalender | `/admin/kalender` | – | ✓ | – |
| · Måned | `/admin/kalender/maned` | ✓ | ✓ | – |
| Bookinger ★ | `/admin/bookinger` | – | ✓ | – |
| · Ny booking | `/admin/bookinger/ny` | – | – | – |
| Anlegg | `/admin/anlegg` | – | ✓ | – |
| · Anlegg-detalj | `/admin/anlegg/[id]` | – | – | – |
| Tilgjengelighet | `/admin/availability` | – | ✓ | – |
| Kapasitet | `/admin/kapasitet` | – | – | – |
| Tjenester/priser | `/admin/services` | – | ✓ | – |
| Fasiliteter (alt.) | `/admin/facilities` | – | – | – |
| Lokasjoner | `/admin/locations` | – | – | – |
| TrackMan (på tvers) | `/admin/trackman` | – | – | – |
| Live-økt: brief (coach) | `/admin/live/[sessionId]/brief` | – | ✓ | – |
| Live-økt: aktiv (coach) | `/admin/live/[sessionId]/active` | – | ✓ | – |
| Live-økt: oppsummering (coach) | `/admin/live/[sessionId]/summary` | – | ✓ | – |
| Coach-workbench (prototype) | `/admin/coach-workbench` | – | – | – |

## Innsikt (analyse på tvers)
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Innsikt-hub | `/admin/analysere` | – | – | – |
| · Compliance | `/admin/analysere/compliance` | ✓ | ✓ | – |
| Stall-analyse | `/admin/analyse` | ~ | ✓ | – |
| Analytics | `/admin/analytics` | – | – | – |
| Lag-snitt | `/admin/lag-snitt` | ~ | ✓ | – |
| · Fasiter (autosync) | `/admin/tester/benchmarks` | ✓ | ✓ | – |
| Tester (på tvers) | `/admin/tester` | ✓ | ✓ | – |
| · Test-detalj | `/admin/tester/[id]` | ✓ | ✓ | – |
| · Foreslåtte tester | `/admin/tester/foreslatte` | – | – | – |
| · Tildel test | `/admin/tester/tildel/[spillerId]` | ✓ | ✓ | – |
| Økt-forespørsler | `/admin/foresporsler` | – | ✓ | – |
| Godkjenninger | `/admin/godkjenninger` | – | ✓ | – |
| · Godkjenning-detalj | `/admin/godkjenninger/[id]` | – | – | – |
| Rapporter | `/admin/reports` | – | ✓ | – |
| Runder (på tvers) | `/admin/runder` | – | – | – |
| Skader/sykdom (tilstander) | `/admin/tilstander` | – | – | – |
| Økonomi (MRR/betalinger) | `/admin/okonomi` | – | ✓ | – |
| Stats-oversikt | `/admin/stats/overview` | – | – | – |
| Stats-moderering | `/admin/stats/moderering` | – | – | – |

## Admin (organisasjon og innstillinger)
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Organisasjon-hub | `/admin/organisasjon` | – | – | – |
| Klubb-innstillinger | `/admin/klubb/innstillinger` | – | – | – |
| Integrasjoner | `/admin/integrasjoner` | – | – | – |
| Innstillinger | `/admin/settings` | – | ✓ | – |
| · API | `/admin/settings/api` | – | – | – |
| · Kalender | `/admin/settings/calendar` | – | – | – |
| · Sikkerhet | `/admin/settings/security` | – | – | – |
| · Tilgang | `/admin/settings/tilgang` | – | – | – |
| Team | `/admin/team` | – | – | – |
| · Inviter | `/admin/team/inviter` | – | – | – |
| Audit-log | `/admin/audit-log` | – | – | – |
| AI-agenter | `/admin/agents` | – | – | – |
| E-postmaler | `/admin/email-templates` | – | – | – |
| Profil | `/admin/profile` | – | – | – |
| Hjelp | `/admin/hjelp` | – | – | – |
| Design-godkjenning | `/admin/godkjenn-portal` | – | – | – |

---

## Hovedkonklusjoner for desktop + mobil

1. **PlayerHQ kjerne er komplett på begge:** Hjem, Planlegge/Workbench, Gjennomføre, Analysere, Meg
   (+ undersider) har mobil + desktop (ofte iPad). **Gjenstår:** mål-, teknisk-plan-, SG-Hub-subs-,
   coach-seksjon-, talent- og booking-undersider — de fleste helt udesignet.
2. **AgencyOS mobil er den store mangelen:** nesten alt er kun desktop. Trenger en **egen mobil-
   designrunde** (Cockpit, Stall, Planlegge, Innsikt). Workbench-i-spiller er unntaket (full mobil+desktop).
3. **iPad** er kun verifisert på PlayerHQ-kjerneskjermene; resten gjenstår.
4. **Dublett-adresser i AgencyOS** (`/admin/calendar` vs `/admin/kalender`, `/admin/finance` vs
   `/admin/okonomi` m.fl.) bør ryddes til én adresse hver.

> Full status med alle 6 kvalitetshaker (Design · Mob/Desk/iPad · Adresse · Flyt · Data · Funker):
> `docs/MASTER-SKJERMPLAN.md`.
