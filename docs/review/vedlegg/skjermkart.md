# Skjermkart: PlayerHQ og AgencyOS

Grunnlag: `main` 9f39c7d44 (06.10.2026). Generert maskinelt fra alle `page.tsx` under `src/app/portal` og `src/app/admin` (349 filer), deretter stikkprøvekontrollert for hånd.

**Slik leses tabellen**
- URL: adressen brukeren ser. Rutegrupper i parentes (f.eks. `(legacy)`, `(fullscreen)`) er fjernet fra adressen.
- Type: *ekte* = siden viser innhold. *redirect* = sender bare videre (målet står under Hovedkomponenter). *ekte (betinget redirect)* = viser innhold, men kan sende videre ved feil rolle/tilgang/parameter.
- Hovedkomponenter: de viktigste React-komponentene siden bruker i sin egen fil (maks 4). Dypere komponenter er ikke listet.
- Skjerm-ID: fra `docs/design-system/skjermregister.csv` (laget på commit 127c49e7, eldre enn dagens main; «VIDERESENDING» = registeret regner den som videresending, «UTEN-TEGNET-TYPE» = ingen tegnet skjermtype). Bruk skjermlista `docs/design-handoff/regler/skjermliste.md` for hva ID-en betyr. Noen ID-er peker på skjermer som er merket «Utgår 28.09» men som fortsatt har ekte sider (se funn ST-07).
- Skall: rammen rundt innholdet (meny, topplinje). *V2Shell* = gammelt skall i `src/components/v2/shell.tsx`. *PlayerHQSkall / AgencyOSSkall / ForelderSkall* = nytt Precision-skall i `src/components/precision/`. *V2Shell via layout* = skallet kommer fra `(legacy)/layout.tsx`, ikke fra siden selv. *ingen* = ingen skall funnet i sidens komponenttre.


## AgencyOS

### Annet (booking, oppsett, drift, logger) (11 ekte, 17 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/admin/agencyos/spillere` | redirect | → /admin/spillere | VIDERESENDING | - | `admin/agencyos/spillere` |
| `/admin/agencyos/uka` | redirect | → /admin/kalender | VIDERESENDING | - | `admin/agencyos/uka` |
| `/admin/agenter` | redirect | → /admin/agenticos | VIDERESENDING | - | `admin/(legacy)/agenter` |
| `/admin/anlegg` | redirect | → /admin/oppsett?fane=klubb | VIDERESENDING | - | `admin/(legacy)/anlegg` |
| `/admin/audit-log` | ekte | AgencyOSSkall, AG24Drift | AG-24 | AgencyOSSkall | `admin/audit-log` |
| `/admin/bookinger` | ekte | AG06Booking | UTEN-TEGNET-TYPE | AgencyOSSkall | `admin/bookinger` |
| `/admin/bookinger/[id]` | ekte | V2Shell, AdminBookingDetaljV2 | AG-06 | V2Shell | `admin/bookinger/[id]` |
| `/admin/bookinger/ny` | ekte | NyBookingWizard, V2Shell | AG-06 | V2Shell | `admin/bookinger/ny` |
| `/admin/caddie` | redirect | → /admin/agenticos | VIDERESENDING | - | `admin/(legacy)/caddie` |
| `/admin/drift` | ekte | AgencyOSSkall, AG24Drift | AG-24 | AgencyOSSkall | `admin/drift` |
| `/admin/feillogg` | ekte | AgencyOSSkall, AG24Drift | AG-24 | AgencyOSSkall | `admin/feillogg` |
| `/admin/finance` | redirect | → /admin/agencyos/okonomi | VIDERESENDING | - | `admin/finance` |
| `/admin/gdpr` | ekte | AgencyOSSkall, AG24Drift | AG-24 | AgencyOSSkall | `admin/gdpr` |
| `/admin/hjelp` | ekte | AgencyOSSkall, AG24Drift | AG-24 | AgencyOSSkall | `admin/hjelp` |
| `/admin/kapasitet` | redirect | → /admin/bookinger | VIDERESENDING | - | `admin/(legacy)/kapasitet` |
| `/admin/lag-snitt` | redirect | → (dynamisk) | VIDERESENDING | - | `admin/(legacy)/lag-snitt` |
| `/admin/okonomi` | redirect | → /admin/agencyos/okonomi | VIDERESENDING | - | `admin/(legacy)/okonomi` |
| `/admin/oppsett` | ekte | AgencyOSSkall, AG23Oppsett | AG-23 | AgencyOSSkall | `admin/oppsett` |
| `/admin/profile` | ekte | AgencyOSSkall, AG23Oppsett | AG-23 | AgencyOSSkall | `admin/profile` |
| `/admin/reports` | redirect | → /admin/agencyos/okonomi | VIDERESENDING | - | `admin/reports` |
| `/admin/services` | ekte | AdminServicesTrainLock | AG-06 | V2Shell via layout (AdminSkallVelger) | `admin/(legacy)/services` |
| `/admin/settings` | redirect | → /admin/oppsett?fane=tilgang | VIDERESENDING | - | `admin/settings` |
| `/admin/settings/api` | redirect | → /admin/oppsett?fane=api | VIDERESENDING | - | `admin/settings/api` |
| `/admin/settings/calendar` | redirect | → /admin/oppsett?${qs.toString( | VIDERESENDING | - | `admin/settings/calendar` |
| `/admin/settings/periode-navn` | redirect | → /admin/oppsett?fane=perioder | VIDERESENDING | - | `admin/settings/periode-navn` |
| `/admin/settings/security` | redirect | → /admin/oppsett?fane=sikkerhet | VIDERESENDING | - | `admin/settings/security` |
| `/admin/settings/tilgang` | redirect | → (dynamisk) | VIDERESENDING | - | `admin/settings/tilgang` |
| `/admin/stats/moderering` | redirect | → /admin/ko?fane=moderering | VIDERESENDING | - | `admin/(legacy)/stats/moderering` |

### Stall, grupper, spillere, tester og analyse (26 ekte, 26 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/admin/agencyos/ak-stigen` | ekte | V2Shell, TlTilbake, AkStigenV2 | AG-16 | V2Shell | `admin/agencyos/ak-stigen` |
| `/admin/analyse` | ekte | V2Shell, AnalyseHode, InnsiktHubV2, InnsiktStallV2 | AG-09 | V2Shell | `admin/analyse` |
| `/admin/analyse/stall` | redirect | → (dynamisk) | VIDERESENDING | - | `admin/analyse/stall` |
| `/admin/analysere` | redirect | → /admin/analyse | VIDERESENDING | - | `admin/(legacy)/analysere` |
| `/admin/analysere/compliance` | redirect | → (dynamisk) | VIDERESENDING | - | `admin/analysere/compliance` |
| `/admin/grupper` | ekte | AgencyOSSkall, AG16Grupper, GfgkBootstrapButton, NyGruppeButton | AG-16 | AgencyOSSkall | `admin/grupper` |
| `/admin/grupper/[id]` | ekte | V2Shell, GruppeDetaljV2, RullUtMalPanel | AG-16 | V2Shell | `admin/grupper/[id]` |
| `/admin/grupper/[id]/arsplan` | ekte | V2Shell, TlTilbake, GruppeFaner, GruppeKalenderWrapper | AG-16 | V2Shell | `admin/grupper/[id]/arsplan` |
| `/admin/grupper/[id]/arsplan/skoledata` | ekte | V2Shell, TlTilbake, GruppeFaner, SkoledataForm | AG-16 | V2Shell | `admin/grupper/[id]/arsplan/skoledata` |
| `/admin/grupper/[id]/timeplan` | ekte | V2Shell, GruppeTimeplanV2, TlTilbake | AG-16 | V2Shell | `admin/grupper/[id]/timeplan` |
| `/admin/grupper/[id]/workbench` | ekte | AgencyOSSkall, AG11Gruppe, GruppeAarsplanKlient | AG-11 | AgencyOSSkall | `admin/grupper/[id]/workbench` |
| `/admin/recording` | ekte | AgencyOSSkall, AG18TrackManVideo | AG-18 | AgencyOSSkall | `admin/recording` |
| `/admin/runder` | ekte | AgencyOSSkall, AGRD01Runder | AG-09 | AgencyOSSkall | `admin/runder` |
| `/admin/spillere` | ekte | AgencyOSSkall, AG07Stall | AG-07 | AgencyOSSkall | `admin/spillere` |
| `/admin/spillere/[id]` | ekte | AgencyOSSkall, AG08Spiller360 | AG-08 | AgencyOSSkall | `admin/spillere/[id]` |
| `/admin/spillere/[id]/analyse` | redirect | → /admin/spillere/${id}?fane=stats | VIDERESENDING | - | `admin/spillere/[id]/analyse` |
| `/admin/spillere/[id]/fremgang` | redirect | → /admin/spillere/${id} | VIDERESENDING | - | `admin/spillere/[id]/fremgang` |
| `/admin/spillere/[id]/plan` | redirect | → /admin/spillere/${id}?fane=tp | VIDERESENDING | - | `admin/spillere/[id]/plan` |
| `/admin/spillere/[id]/plan/[planId]` | ekte | AG10TekniskPlan | AG-10 | AgencyOSSkall | `admin/spillere/[id]/plan/[planId]` |
| `/admin/spillere/[id]/plan/[planId]/for-og-na` | ekte | AgencyOSSkall, AGTP02ForOgNaa | UTEN-TEGNET-TYPE | AgencyOSSkall | `admin/spillere/[id]/plan/[planId]/for-og-na` |
| `/admin/spillere/[id]/profil` | redirect | → /admin/spillere/${id} | VIDERESENDING | - | `admin/(legacy)/spillere/[id]/profil` |
| `/admin/spillere/[id]/rediger` | ekte | AgencyOSSkall, AG08Rediger | AG-08 | AgencyOSSkall | `admin/(legacy)/spillere/[id]/rediger` |
| `/admin/spillere/[id]/tester` | redirect | → /admin/spillere/${id}?fane=test | VIDERESENDING | - | `admin/spillere/[id]/tester` |
| `/admin/spillere/[id]/tildel-test` | redirect | → /admin/tester/tildel/${id} | VIDERESENDING | - | `admin/(legacy)/spillere/[id]/tildel-test` |
| `/admin/spillere/[id]/turnering-kobling` | ekte | AgencyOSSkall, KnappLenke, SideHode, TurneringKoblingKlient | AG-08 | AgencyOSSkall | `admin/spillere/[id]/turnering-kobling` |
| `/admin/spillere/[id]/workbench` | redirect | → /admin/workbench/${id} | VIDERESENDING | - | `admin/spillere/[id]/workbench` |
| `/admin/spillere/ny` | ekte | V2Shell, TrainLockSpillerNy | AG-07 | V2Shell | `admin/spillere/ny` |
| `/admin/stall` | redirect | → /admin/spillere | VIDERESENDING | - | `admin/(legacy)/stall` |
| `/admin/stall/dag` | redirect | → /admin/kalender?fane=stall${suffix} | VIDERESENDING | - | `admin/stall/dag` |
| `/admin/talent` | redirect | → /innsyn/talent | VIDERESENDING | - | `admin/talent` |
| `/admin/talent/discovery` | redirect | → /innsyn/talent/discovery | VIDERESENDING | - | `admin/talent/discovery` |
| `/admin/talent/kohort` | redirect | → /innsyn/talent/kohort | VIDERESENDING | - | `admin/talent/kohort` |
| `/admin/talent/radar` | redirect | → /innsyn/talent/radar | VIDERESENDING | - | `admin/talent/radar` |
| `/admin/talent/region` | redirect | → /innsyn/talent/region | VIDERESENDING | - | `admin/talent/region` |
| `/admin/talent/ressurser` | redirect | → /innsyn/talent/ressurser | VIDERESENDING | - | `admin/talent/ressurser` |
| `/admin/talent/sammenligning` | redirect | → /innsyn/talent/sammenligning | VIDERESENDING | - | `admin/talent/sammenligning` |
| `/admin/talent/wagr-benchmark` | redirect | → /innsyn/talent/wagr-benchmark | VIDERESENDING | - | `admin/talent/wagr-benchmark` |
| `/admin/talent/wagr-import` | redirect | → /innsyn/talent/wagr-import | VIDERESENDING | - | `admin/talent/wagr-import` |
| `/admin/tester` | ekte | AgencyOSSkall, AG15Tester | AG-15 | AgencyOSSkall | `admin/tester` |
| `/admin/tester/benchmarks` | ekte | AdminBenchmarksV2 | AG-15 | V2Shell via layout (AdminSkallVelger) | `admin/(legacy)/tester/benchmarks` |
| `/admin/tester/foreslatte` | redirect | → /admin/ko?fane=tester | VIDERESENDING | - | `admin/tester/foreslatte` |
| `/admin/tester/tildel` | redirect | → /admin/tester | VIDERESENDING | - | `admin/(legacy)/tester/tildel` |
| `/admin/tester/tildel/[spillerId]` | ekte | AdminTildelTestV2 | AG-15 | V2Shell via layout (AdminSkallVelger) | `admin/(legacy)/tester/tildel/[spillerId]` |
| `/admin/tournaments` | redirect | → /admin/turnering | VIDERESENDING | - | `admin/tournaments` |
| `/admin/tournaments/[id]` | ekte | V2Shell, TlKort, TlRad, TlRadGruppe | AG-17 | V2Shell | `admin/tournaments/[id]` |
| `/admin/tournaments/dubletter` | redirect | → /admin/turnering?fane=dubletter | VIDERESENDING | - | `admin/tournaments/dubletter` |
| `/admin/tournaments/ny` | ekte | V2Shell, TilbakeLenke, TurneringWizardV2 | AG-17 | V2Shell | `admin/tournaments/ny` |
| `/admin/trackman` | ekte | AgencyOSSkall, AG18TrackManVideo | AG-18 | AgencyOSSkall | `admin/trackman` |
| `/admin/trackman/[sessionId]` | ekte | V2Shell, Icon, TrackManSessionDetail | AG-18 | V2Shell | `admin/trackman/[sessionId]` |
| `/admin/turnering` | ekte | AgencyOSSkall, AG17Turneringer | AG-17 | AgencyOSSkall | `admin/turnering` |
| `/admin/turnering-kart` | redirect | → /admin/turnering?fane=kart | VIDERESENDING | - | `admin/turnering-kart` |
| `/admin/videoer` | ekte | AgencyOSSkall, AG18TrackManVideo | AG-18 | AgencyOSSkall | `admin/videoer` |

### Workbench, plan, teknisk plan og kalender (13 ekte, 25 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/admin/agencyos/live` | ekte | AgencyOSSkall, AG13LiveTavle | AG-13 | AgencyOSSkall | `admin/agencyos/live` |
| `/admin/agencyos/live/[sessionId]` | ekte | AgencyOSSkall, AG13LiveOkt | AG-13 | AgencyOSSkall | `admin/agencyos/live/[sessionId]` |
| `/admin/availability` | ekte | AdminAvailabilityV2, Caps, KalenderHubNav | AG-05 | V2Shell via layout (AdminSkallVelger) | `admin/(legacy)/availability` |
| `/admin/calendar` | redirect | → /admin/kalender | VIDERESENDING | - | `admin/calendar` |
| `/admin/calendar/maned` | redirect | → /admin/kalender?visning=maned | VIDERESENDING | - | `admin/calendar/maned` |
| `/admin/coach-workbench` | redirect | → /admin/planlegge | VIDERESENDING | - | `admin/(legacy)/coach-workbench` |
| `/admin/drills` | redirect | → /admin/plan?fane=ovelser | VIDERESENDING | - | `admin/(legacy)/drills` |
| `/admin/drills/[id]` | redirect | → /admin/plan?fane=ovelser | VIDERESENDING | - | `admin/(legacy)/drills/[id]` |
| `/admin/drills/[id]/rediger` | redirect | → /admin/plan?fane=ovelser | VIDERESENDING | - | `admin/drills/[id]/rediger` |
| `/admin/drills/forslag` | redirect | → /admin/godkjenninger | VIDERESENDING | - | `admin/(legacy)/drills/forslag` |
| `/admin/drills/ny` | redirect | → /admin/plan?fane=ovelser | VIDERESENDING | - | `admin/(legacy)/drills/ny` |
| `/admin/gjennomfore` | redirect | → /admin/kalender | VIDERESENDING | - | `admin/gjennomfore` |
| `/admin/gjennomfore/okter/[id]` | ekte | AgencyOSSkall, AG12Oktark | AG-12 | AgencyOSSkall | `admin/gjennomfore/okter/[id]` |
| `/admin/kalender` | ekte | AgencyOSSkall, Side, SideHode, FanerLenker | AG-05 | AgencyOSSkall | `admin/kalender` |
| `/admin/kalender/hendelse/[id]` | ekte | V2Shell, TilbakeLenke, Tittel, Caps | AG-05 | V2Shell | `admin/kalender/hendelse/[id]` |
| `/admin/kalender/hendelse/ny` | ekte | V2Shell, TilbakeLenke, Tittel, HendelseForm | AG-05 | V2Shell | `admin/kalender/hendelse/ny` |
| `/admin/kalender/lag` | redirect | → (dynamisk) | VIDERESENDING | - | `admin/kalender/lag` |
| `/admin/kalender/maned` | redirect | → (dynamisk) | VIDERESENDING | - | `admin/(legacy)/kalender/maned` |
| `/admin/kalender/uke` | redirect | → (dynamisk) | VIDERESENDING | - | `admin/(legacy)/kalender/uke` |
| `/admin/okter` | redirect | → /admin/plan | VIDERESENDING | - | `admin/okter` |
| `/admin/plan` | ekte | AgencyOSSkall, AG14PlanHub | AG-14 | AgencyOSSkall | `admin/plan` |
| `/admin/plan-templates` | redirect | → /admin/plan | VIDERESENDING | - | `admin/plan-templates` |
| `/admin/plan-templates/[id]` | ekte | AgencyOSSkall, AG14MalDetalj | AG-14 | AgencyOSSkall | `admin/plan-templates/[id]` |
| `/admin/plan-templates/[id]/effectiveness` | redirect | → /admin/plan-templates | VIDERESENDING | - | `admin/(legacy)/plan-templates/[id]/effectiveness` |
| `/admin/plan-templates/[id]/rediger` | ekte | AgencyOSSkall, AG14MalRediger | AG-14 | AgencyOSSkall | `admin/plan-templates/[id]/rediger` |
| `/admin/plan-templates/ny` | ekte | AgencyOSSkall, AG14MalNy | AG-14 | AgencyOSSkall | `admin/plan-templates/ny` |
| `/admin/plan/maler` | redirect | → /admin/plan?fane=ukemaler | VIDERESENDING | - | `admin/plan/maler` |
| `/admin/plan/teknisk` | ekte | AG10Oversikt | AG-10 | AgencyOSSkall | `admin/plan/teknisk` |
| `/admin/planlegge` | redirect | → /admin/plan | VIDERESENDING | - | `admin/planlegge` |
| `/admin/plans` | redirect | → /admin/planlegge | VIDERESENDING | - | `admin/plans` |
| `/admin/plans/[planId]` | redirect | → (dynamisk) | VIDERESENDING | - | `admin/plans/[planId]` |
| `/admin/plans/new` | redirect | → /admin/planlegge | VIDERESENDING | - | `admin/(legacy)/plans/new` |
| `/admin/plans/templates` | redirect | → /admin/plan-templates | VIDERESENDING | - | `admin/plans/templates` |
| `/admin/plans/templates/[id]/effectiveness` | redirect | → /admin/plan-templates | VIDERESENDING | - | `admin/plans/templates/[id]/effectiveness` |
| `/admin/plans/templates/[id]/rediger` | redirect | → /admin/plan-templates | VIDERESENDING | - | `admin/plans/templates/[id]/rediger` |
| `/admin/plans/templates/ny` | redirect | → /admin/plan-templates | VIDERESENDING | - | `admin/plans/templates/ny` |
| `/admin/teknisk-plan` | redirect | → /admin/plan/teknisk | VIDERESENDING | - | `admin/teknisk-plan` |
| `/admin/workbench/[playerId]` | ekte | AgencyOSSkall, FeilTilstand, AG11Workbench, AG11Fysisk | AG-11 | AgencyOSSkall | `admin/workbench/[playerId]` |

### Innboks, godkjenning og Jarvis (6 ekte, 22 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/admin/agencyos/caddie` | redirect | → /admin/agenticos | VIDERESENDING | - | `admin/agencyos/caddie` |
| `/admin/agencyos/caddie/aktivitet` | redirect | → /admin/agenticos | VIDERESENDING | - | `admin/agencyos/caddie/aktivitet` |
| `/admin/agencyos/caddie/dashbord` | redirect | → /admin/godkjenninger | VIDERESENDING | - | `admin/agencyos/caddie/dashbord` |
| `/admin/agent-team` | redirect | → /admin/agenticos | VIDERESENDING | - | `admin/agent-team` |
| `/admin/agenticos` | redirect | → /admin/jarvis | VIDERESENDING | - | `admin/agenticos` |
| `/admin/agenticos/godkjenn` | redirect | → /admin/ko?fane=agentgodkjenn | VIDERESENDING | - | `admin/agenticos/godkjenn` |
| `/admin/agenticos/ko` | redirect | → /admin/ko?fane=agentko | VIDERESENDING | - | `admin/agenticos/ko` |
| `/admin/agenticos/projects` | redirect | → /admin/jarvis?fane=prosjekter | VIDERESENDING | - | `admin/agenticos/projects` |
| `/admin/agenticos/runtimes` | redirect | → /admin/jarvis?fane=runtimes | VIDERESENDING | - | `admin/agenticos/runtimes` |
| `/admin/agenticos/skills` | redirect | → /admin/jarvis?fane=skills | VIDERESENDING | - | `admin/agenticos/skills` |
| `/admin/agents` | redirect | → /admin/agenticos | VIDERESENDING | - | `admin/agents` |
| `/admin/agents/[agentId]` | ekte | AgenticosRamme, AdminAgenticosRunDetalj | AG-19 | V2Shell | `admin/agents/[agentId]` |
| `/admin/approvals` | redirect | → /admin/godkjenninger | VIDERESENDING | - | `admin/approvals` |
| `/admin/approvals/[id]` | redirect | → /admin/godkjenninger/${id} | VIDERESENDING | - | `admin/approvals/[id]` |
| `/admin/email-templates` | redirect | → /admin/kommunikasjon?fane=maler | VIDERESENDING | - | `admin/email-templates` |
| `/admin/email-templates/[id]/rediger` | ekte | AgencyOSSkall, AG04MalRediger | AG-04 | AgencyOSSkall | `admin/email-templates/[id]/rediger` |
| `/admin/foresporsler` | redirect | → /admin/innboks | VIDERESENDING | - | `admin/(legacy)/foresporsler` |
| `/admin/godkjenninger` | redirect | → (dynamisk) | VIDERESENDING | - | `admin/godkjenninger` |
| `/admin/godkjenninger/[id]` | redirect | → /admin/godkjenninger | VIDERESENDING | - | `admin/(legacy)/godkjenninger/[id]` |
| `/admin/innboks` | ekte | AgencyOSSkall, AG04Innboks | UTEN-TEGNET-TYPE | AgencyOSSkall | `admin/innboks` |
| `/admin/innboks-epost` | redirect | → /admin/kommunikasjon?fane=utkast | VIDERESENDING | - | `admin/innboks-epost` |
| `/admin/jarvis` | ekte | AgencyOSSkall, AG19CaddieHub | AG-19 | AgencyOSSkall | `admin/jarvis` |
| `/admin/ko` | ekte | AgencyOSSkall, AG02Ko | AG-02 | AgencyOSSkall | `admin/ko` |
| `/admin/kommunikasjon` | ekte (med betinget redirect) | V2Shell, KommunikasjonHode, AdminEmailV2 | AG-04 | V2Shell | `admin/kommunikasjon` |
| `/admin/messages` | redirect | → /admin/innboks | VIDERESENDING | - | `admin/messages` |
| `/admin/oppfolging` | redirect | → /admin/queue | VIDERESENDING | - | `admin/oppfolging` |
| `/admin/queue` | redirect | → (dynamisk) | VIDERESENDING | - | `admin/queue` |
| `/admin/varsler` | redirect | → /admin/kommunikasjon?filter=varsler | VIDERESENDING | - | `admin/varsler` |

### Cockpit og oppgaver (5 ekte, 8 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/admin` | redirect | → /admin/agencyos | VIDERESENDING | - | `admin` |
| `/admin/agencyos` | ekte | AgencyOSSkall, AG01Cockpit | AG-01 | AgencyOSSkall | `admin/agencyos` |
| `/admin/agencyos/okonomi` | ekte (med betinget redirect) | AgencyOSSkall, AG20Okonomi | AG-20 | AgencyOSSkall | `admin/agencyos/okonomi` |
| `/admin/brief` | redirect | → /admin/agencyos | VIDERESENDING | - | `admin/brief` |
| `/admin/handlingssenter` | redirect | → /admin/oppgaver?fane=tildelt | VIDERESENDING | - | `admin/handlingssenter` |
| `/admin/innsikt` | ekte | AgencyOSSkall, AG22InnsiktTalent | AG-22 | AgencyOSSkall | `admin/innsikt` |
| `/admin/oppgaver` | ekte | AgencyOSSkall, AG21Oppgaver | AG-21 | AgencyOSSkall | `admin/oppgaver` |
| `/admin/uka` | redirect | → /admin/kalender | VIDERESENDING | - | `admin/uka` |
| `/admin/workspace` | redirect | → /admin/oppgaver | VIDERESENDING | - | `admin/workspace` |
| `/admin/workspace/notion` | ekte | V2Shell, TlTilbake, AdminWorkspaceNotionTrainLock | AG-21 | V2Shell | `admin/workspace/notion` |
| `/admin/workspace/oppgaver` | redirect | → /admin/oppgaver?fane=tildelt | VIDERESENDING | - | `admin/workspace/oppgaver` |
| `/admin/workspace/prosjekter` | redirect | → /admin/oppgaver | VIDERESENDING | - | `admin/workspace/prosjekter` |
| `/admin/workspace/tildelt-meg` | redirect | → /admin/godkjenninger | VIDERESENDING | - | `admin/(legacy)/workspace/tildelt-meg` |

### WANG, Team Norway og klubb/organisasjon (3 ekte, 4 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/admin/integrasjoner` | redirect | → /admin/oppsett?fane=integrasjoner | VIDERESENDING | - | `admin/integrasjoner` |
| `/admin/klubb/innstillinger` | redirect | → /admin/oppsett?fane=klubb | VIDERESENDING | - | `admin/klubb/innstillinger` |
| `/admin/marketing` | ekte | V2Shell, AdminMarketingTrainLock | AG-23 | V2Shell | `admin/marketing` |
| `/admin/organisasjon` | redirect | → /admin/oppsett | VIDERESENDING | - | `admin/organisasjon` |
| `/admin/team` | redirect | → /admin/oppsett?fane=tilgang | VIDERESENDING | - | `admin/team` |
| `/admin/team/ekstern` | ekte | V2Shell, AdminEksternLeserTrainLock, TlTilbake | AG-23 | V2Shell | `admin/team/ekstern` |
| `/admin/team/inviter` | ekte | V2Shell, AdminInviterCoachTrainLock, TlTilbake | AG-23 | V2Shell | `admin/team/inviter` |

## PlayerHQ

### Gjennomføring og øvelsesbank (17 ekte, 5 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/portal/ai/foresla-drill` | ekte | V2Shell, TilbakeLenke, ForeslaDrillV2 | PH-13 | V2Shell | `portal/ai/foresla-drill` |
| `/portal/coach/ovelser` | ekte | PlayerHQSkall, TilbakeLenke, CoachOvelserV2 | PH-13 | PlayerHQSkall | `portal/coach/ovelser` |
| `/portal/coach/ovelser/[id]/rediger` | redirect | → /portal/coach/ovelser | VIDERESENDING | - | `portal/(legacy)/coach/ovelser/[id]/rediger` |
| `/portal/coach/ovelser/ny` | redirect | → /portal/coach/ovelser | VIDERESENDING | - | `portal/(legacy)/coach/ovelser/ny` |
| `/portal/drills` | ekte (med betinget redirect) | PlayerHQSkall, PH13DrillBank | PH-13 | PlayerHQSkall | `portal/drills` |
| `/portal/drills/[id]` | ekte | PlayerHQSkall, Ikon, TomTilstand, PH13DrillDetalj | PH-13 | PlayerHQSkall | `portal/drills/[id]` |
| `/portal/gjennomfore` | ekte (med betinget redirect) | PlayerHQSkall, PH02Gjor | PH-02 | PlayerHQSkall | `portal/gjennomfore` |
| `/portal/gjennomfore/[id]` | ekte (med betinget redirect) | PlayerHQSkall, PH03Oktark | PH-03 | PlayerHQSkall | `portal/gjennomfore/[id]` |
| `/portal/live` | redirect | → /portal/gjennomfore | VIDERESENDING | - | `portal/live` |
| `/portal/live/[sessionId]` | redirect | → /portal/meg/abonnement | VIDERESENDING | - | `portal/(fullscreen)/live/[sessionId]` |
| `/portal/live/[sessionId]/active` | ekte (med betinget redirect) | PH05LiveAktiv | PH-05 | ingen (fullscreen-layout) | `portal/(fullscreen)/live/[sessionId]/active` |
| `/portal/live/[sessionId]/brief` | ekte (med betinget redirect) | LiveBrief, PlanSessionBrief | PH-04 | ingen (fullscreen-layout) | `portal/(fullscreen)/live/[sessionId]/brief` |
| `/portal/live/[sessionId]/logger` | redirect | → /portal/live/${sessionId}/active | VIDERESENDING | - | `portal/(fullscreen)/live/[sessionId]/logger` |
| `/portal/live/[sessionId]/summary` | ekte (med betinget redirect) | PH07Oktoppsummering | PH-07 | ingen (fullscreen-layout) | `portal/(fullscreen)/live/[sessionId]/summary` |
| `/portal/live/[sessionId]/tapper` | ekte (med betinget redirect) | PH06Slagteller | PH-06 | ingen (fullscreen-layout) | `portal/(fullscreen)/live/[sessionId]/tapper` |
| `/portal/tren/teknisk-plan` | ekte (med betinget redirect) | PHTP01TekniskPlan | UTEN-TEGNET-TYPE | PlayerHQSkall | `portal/tren/teknisk-plan` |
| `/portal/tren/teknisk-plan/[planId]` | ekte | PHTP01TekniskPlan | PH-19 | PlayerHQSkall | `portal/tren/teknisk-plan/[planId]` |
| `/portal/tren/wb` | ekte | PlayerHQSkall, AkseMerke, FeilTilstand, Ikon | PH-02 | PlayerHQSkall | `portal/(fullscreen)/tren/wb` |
| `/portal/tren/wb/[sessionId]` | ekte | PlayerHQSkall, FeilTilstand, OktArk | PH-03 | PlayerHQSkall | `portal/(fullscreen)/tren/wb/[sessionId]` |
| `/portal/trening/break-tabell` | ekte | PlayerHQSkall, BreakTabellV2 | PH-26 | PlayerHQSkall | `portal/trening/break-tabell` |
| `/portal/trening/logg` | ekte | PlayerHQSkall, TreningLoggV2 | PH-26 | PlayerHQSkall | `portal/trening/logg` |
| `/portal/trening/putte-laboratoriet` | ekte | PlayerHQSkall, PutteLabV2 | PH-26 | PlayerHQSkall | `portal/trening/putte-laboratoriet` |

### Runde og SG (inkl. Stats) (26 ekte, 12 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/portal/analyse` | redirect | → /portal/analysere | VIDERESENDING | - | `portal/analyse` |
| `/portal/analysere` | ekte (med betinget redirect) | PlayerHQSkall, PH16Stats | PH-16 | PlayerHQSkall | `portal/analysere` |
| `/portal/analysere/datagolf` | ekte (med betinget redirect) | V2Shell, DataGolfV2, TilbakeLenke | PH-18 | V2Shell | `portal/analysere/datagolf` |
| `/portal/analysere/datagolf/stasjon` | ekte (med betinget redirect) | PlayerHQSkall, PH17TrackMan | PH-17 | PlayerHQSkall | `portal/analysere/datagolf/stasjon` |
| `/portal/analysere/historikk` | ekte (med betinget redirect) | PlayerHQSkall, HistorikkV2 | PH-16 | PlayerHQSkall | `portal/analysere/historikk` |
| `/portal/analysere/hull` | ekte | PlayerHQSkall, TilbakeLenke, AnalysereHullV2 | PH-18 | PlayerHQSkall | `portal/analysere/hull` |
| `/portal/analysere/skill-map` | ekte (med betinget redirect) | PlayerHQSkall, PH16bSkillMap | PH-16 | PlayerHQSkall | `portal/analysere/skill-map` |
| `/portal/analysere/trackman` | ekte (med betinget redirect) | PlayerHQSkall, PH17TrackMan | PH-17 | PlayerHQSkall | `portal/analysere/trackman` |
| `/portal/analysere/trackman/[id]` | ekte | PlayerHQSkall, Icon, TrackManSessionDetail | PH-17 | PlayerHQSkall | `portal/analysere/trackman/[id]` |
| `/portal/analysere/turneringer` | ekte (med betinget redirect) | PlayerHQSkall, MinKurveTrainLock, TurneringshistorikkTrainLock | PH-18 | PlayerHQSkall | `portal/analysere/turneringer` |
| `/portal/baneguide` | redirect | → /portal/gameplan | VIDERESENDING | - | `portal/baneguide` |
| `/portal/baneguide/[baneId]` | redirect | → /portal/gameplan/${baneId} | VIDERESENDING | - | `portal/baneguide/[baneId]` |
| `/portal/baneguide/[baneId]/hull/[nr]` | redirect | → /portal/gameplan/${baneId}/hull/${nr}${type ? `?type=${type}` : ""} | VIDERESENDING | - | `portal/baneguide/[baneId]/hull/[nr]` |
| `/portal/datagolf` | redirect | → /portal/analysere/datagolf | VIDERESENDING | - | `portal/datagolf` |
| `/portal/gameplan` | ekte (med betinget redirect) | PlayerHQSkall, PH20Gameplan | PH-20 | PlayerHQSkall | `portal/gameplan` |
| `/portal/gameplan/[baneId]` | ekte | CourseMap, V2Shell, Kort, Rad | PH-20 | V2Shell | `portal/gameplan/[baneId]` |
| `/portal/gameplan/[baneId]/hull/[nr]` | ekte | CourseMap, GameplanPlanlegger, PlayerHQSkall, Caps | PH-20 | PlayerHQSkall | `portal/gameplan/[baneId]/hull/[nr]` |
| `/portal/mal/runder` | ekte (med betinget redirect) | PlayerHQSkall, PH18Runder | PH-18 | PlayerHQSkall | `portal/mal/runder` |
| `/portal/mal/runder/[id]` | ekte | PHRD08RundeFerdig | PH-18 | PlayerHQSkall | `portal/mal/runder/[id]` |
| `/portal/mal/runder/[id]/fullfor` | redirect | → /portal/mal/runder/${id} | VIDERESENDING | - | `portal/(legacy)/mal/runder/[id]/fullfor` |
| `/portal/mal/runder/[id]/hull` | ekte | PlayerHQSkall, Ikon, Sidehode, InlineVarsel | PH-09 | PlayerHQSkall | `portal/mal/runder/[id]/hull` |
| `/portal/mal/runder/[id]/shot-by-shot` | redirect | → /portal/mal/runder/${id} | VIDERESENDING | - | `portal/(legacy)/mal/runder/[id]/shot-by-shot` |
| `/portal/mal/runder/[id]/slag` | ekte | V2Shell, Caps, Tittel, MikroMeta | PH-08 | V2Shell | `portal/mal/runder/[id]/slag` |
| `/portal/mal/runder/ny` | ekte | PlayerHQSkall, Caps, Tittel, MikroMeta | PH-09 | PlayerHQSkall | `portal/mal/runder/ny` |
| `/portal/mal/sg-hub` | redirect | → /portal/coach/sg-hub | VIDERESENDING | - | `portal/(legacy)/mal/sg-hub` |
| `/portal/mal/sg-hub/[club]` | redirect | → /portal/coach/sg-hub | VIDERESENDING | - | `portal/(legacy)/mal/sg-hub/[club]` |
| `/portal/mal/sg-hub/coach/[spillerId]` | ekte | V2Shell, TilbakeLenke, CoachSgHubSpillerV2 | UTEN-TEGNET-TYPE | V2Shell | `portal/mal/sg-hub/coach/[spillerId]` |
| `/portal/mal/sg-hub/coach/[spillerId]/[club]` | ekte | V2Shell, TilbakeLenke, Kort, TomTilstand | UTEN-TEGNET-TYPE | V2Shell | `portal/mal/sg-hub/coach/[spillerId]/[club]` |
| `/portal/mal/sg-hub/coach/[spillerId]/equipment` | ekte | V2Shell | UTEN-TEGNET-TYPE | V2Shell | `portal/mal/sg-hub/coach/[spillerId]/equipment` |
| `/portal/mal/sg-hub/equipment` | ekte | UtstyrHelseV2 | PH-17 | V2Shell via layout | `portal/(legacy)/mal/sg-hub/equipment` |
| `/portal/mal/trackman` | redirect | → /portal/analysere/trackman | VIDERESENDING | - | `portal/mal/trackman` |
| `/portal/mal/trackman/[id]` | redirect | → /portal/analysere/trackman/${id} | VIDERESENDING | - | `portal/mal/trackman/[id]` |
| `/portal/mal/trackman/gapping` | ekte (med betinget redirect) | PlayerHQSkall, PH17TrackMan | PH-17 | PlayerHQSkall | `portal/mal/trackman/gapping` |
| `/portal/runde/live` | ekte | PH08RundeLive | PH-08 | ingen (fullscreen-layout) | `portal/(fullscreen)/runde/live` |
| `/portal/runde/logg` | ekte | PH09RegistrerRunde | PH-09 | ingen (fullscreen-layout) | `portal/(fullscreen)/runde/logg` |
| `/portal/statistikk` | redirect | → /portal/analysere | VIDERESENDING | - | `portal/(legacy)/statistikk` |
| `/portal/statistikk/[metric]` | ekte | V2Shell, TilbakeLenke, StatistikkMetrikkV2 | PH-18 | V2Shell | `portal/statistikk/[metric]` |
| `/portal/statistikk/runder/[runId]/del` | ekte | V2Shell, DelRundeV2 | PH-18 | V2Shell | `portal/statistikk/runder/[runId]/del` |

### Meg, booking, abonnement (44 ekte, 11 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/portal/booking` | ekte (med betinget redirect) | PlayerHQSkall, PH23Booking | PH-23 | PlayerHQSkall | `portal/booking` |
| `/portal/booking/[bookingId]` | ekte | PlayerHQSkall, TilbakeLenke, BookingDetaljV2 | PH-23 | PlayerHQSkall | `portal/booking/[bookingId]` |
| `/portal/booking/anlegg/[anleggId]` | ekte | PlayerHQSkall, TilbakeLenke, BookingAnleggV2 | PH-23 | PlayerHQSkall | `portal/booking/anlegg/[anleggId]` |
| `/portal/booking/bekreftet` | ekte | PlayerHQSkall, BookingBekreftetV2 | PH-23 | PlayerHQSkall | `portal/booking/bekreftet` |
| `/portal/booking/coach/[coachId]` | ekte | PlayerHQSkall, TilbakeLenke, BookingCoachV2 | PH-23 | PlayerHQSkall | `portal/booking/coach/[coachId]` |
| `/portal/booking/ny` | ekte | PlayerHQSkall, TilbakeLenke, Kort, TomTilstand | PH-23 | PlayerHQSkall | `portal/booking/ny` |
| `/portal/booking/ny/bekreft` | ekte (med betinget redirect) | PlayerHQSkall, TilbakeLenke, BookingNyBekreftV2 | PH-23 | PlayerHQSkall | `portal/booking/ny/bekreft` |
| `/portal/meg` | ekte (med betinget redirect) | PlayerHQSkall, PH24Meg | PH-24 | PlayerHQSkall | `portal/meg` |
| `/portal/meg/abonnement` | ekte (med betinget redirect) | PlayerHQSkall, PH25Abonnement | PH-25 | PlayerHQSkall | `portal/meg/abonnement` |
| `/portal/meg/abonnement/avbestill` | ekte | V2Shell, TilbakeLenke, MegAvbestillV2 | PH-25 | V2Shell | `portal/meg/abonnement/avbestill` |
| `/portal/meg/abonnement/faktura/[id]` | ekte | PrintButton, V2Shell, TilbakeLenke, TomTilstand | PH-25 | V2Shell | `portal/meg/abonnement/faktura/[id]` |
| `/portal/meg/abonnement/fortsett` | ekte (med betinget redirect) | MegFortsettV2 | PH-25 | ingen funnet | `portal/meg/abonnement/fortsett` |
| `/portal/meg/abonnement/kort/ny` | ekte (med betinget redirect) | PlayerHQSkall, Caps, Tittel, Kort | PH-25 | PlayerHQSkall | `portal/meg/abonnement/kort/ny` |
| `/portal/meg/abonnement/oppgrader` | redirect | → /portal/meg/abonnement/oppgrader/flyt | VIDERESENDING | - | `portal/meg/abonnement/oppgrader` |
| `/portal/meg/abonnement/oppgrader/flyt` | ekte (med betinget redirect) | PlayerHQSkall, OppgraderFlytWizard | PH-25 | PlayerHQSkall | `portal/meg/abonnement/oppgrader/flyt` |
| `/portal/meg/bookinger` | ekte | PlayerHQSkall, PH23Booking | PH-23 | PlayerHQSkall | `portal/meg/bookinger` |
| `/portal/meg/bookinger/reschedule/[bookingId]` | ekte (med betinget redirect) | PlayerHQSkall, Caps, Tittel, Kort | PH-23 | PlayerHQSkall | `portal/meg/bookinger/reschedule/[bookingId]` |
| `/portal/meg/deling` | ekte | NavngittDeling | PH-27 | ingen funnet | `portal/meg/deling` |
| `/portal/meg/deling/innsyn` | ekte | TrenerIupSvar | UTEN-TEGNET-TYPE | PlayerHQSkall | `portal/meg/deling/innsyn` |
| `/portal/meg/dokumenter` | ekte | PlayerHQSkall, MegDokumenterV2 | PH-24 | PlayerHQSkall | `portal/meg/dokumenter` |
| `/portal/meg/feedback` | ekte (med betinget redirect) | V2Shell, MegFeedbackV2, TilbakeLenke | PH-25 | V2Shell | `portal/meg/feedback` |
| `/portal/meg/foreldre` | ekte (med betinget redirect) | PlayerHQSkall, MegForeldreV2 | PH-24 | PlayerHQSkall | `portal/meg/foreldre` |
| `/portal/meg/help` | ekte (med betinget redirect) | V2Shell, MegHelpV2, TilbakeLenke | PH-25 | V2Shell | `portal/meg/help` |
| `/portal/meg/help/artikkel/[slug]` | ekte | V2Shell, TilbakeLenke, TomTilstand, Kort | PH-25 | V2Shell | `portal/meg/help/artikkel/[slug]` |
| `/portal/meg/help/kategori/[slug]` | ekte | PlayerHQSkall, TilbakeLenke, MegHelpKategoriV2 | PH-25 | PlayerHQSkall | `portal/meg/help/kategori/[slug]` |
| `/portal/meg/help/kontakt` | ekte | Caps, Tittel, Kort, TilbakeLenke | PH-25 | V2Shell | `portal/meg/help/kontakt` |
| `/portal/meg/helse` | ekte | PlayerHQSkall, TilbakeLenke, Kort, Icon | PH-24 | PlayerHQSkall | `portal/meg/helse` |
| `/portal/meg/helse/symptom/ny` | ekte | PlayerHQSkall, TilbakeLenke, MegSymptomNyV2 | PH-24 | PlayerHQSkall | `portal/meg/helse/symptom/ny` |
| `/portal/meg/innstillinger` | ekte (med betinget redirect) | PlayerHQSkall, PH25Abonnement | PH-25 | PlayerHQSkall | `portal/meg/innstillinger` |
| `/portal/meg/innstillinger/ai-coach` | ekte | PlayerHQSkall, StatusPille | PH-25 | PlayerHQSkall | `portal/meg/innstillinger/ai-coach` |
| `/portal/meg/innstillinger/anlegg` | ekte | PlayerHQSkall, InnstillingerAnleggV2 | PH-25 | PlayerHQSkall | `portal/meg/innstillinger/anlegg` |
| `/portal/meg/innstillinger/eksport` | redirect | → /portal/meg/innstillinger/personvern | VIDERESENDING | - | `portal/meg/innstillinger/eksport` |
| `/portal/meg/innstillinger/integrasjoner` | ekte | PlayerHQSkall, InnstillingerIntegrasjonerV2 | PH-25 | PlayerHQSkall | `portal/meg/innstillinger/integrasjoner` |
| `/portal/meg/innstillinger/personvern` | ekte | PlayerHQSkall, Kort, StatusPill, Icon | PH-25 | PlayerHQSkall | `portal/meg/innstillinger/personvern` |
| `/portal/meg/innstillinger/personvern/deling` | ekte | PlayerHQSkall, InnstillingerHode, TnSamtykkeSide | PH-25 | PlayerHQSkall | `portal/meg/innstillinger/personvern/deling` |
| `/portal/meg/innstillinger/sikkerhet` | ekte | V2Shell, InnstillingerSikkerhetV2 | PH-25 | V2Shell | `portal/meg/innstillinger/sikkerhet` |
| `/portal/meg/innstillinger/sprak` | ekte | V2Shell, InnstillingerSprakV2 | PH-25 | V2Shell | `portal/meg/innstillinger/sprak` |
| `/portal/meg/innstillinger/varsler` | ekte | V2Shell, InnstillingerVarslerV2 | PH-25 | V2Shell | `portal/meg/innstillinger/varsler` |
| `/portal/meg/profil` | ekte (med betinget redirect) | PlayerHQSkall, PH24Profil | PH-24 | PlayerHQSkall | `portal/meg/profil` |
| `/portal/meg/resultater` | ekte (med betinget redirect) | PlayerHQSkall, Tittel, KobleProfil, AngreKnapp | PH-24 | PlayerHQSkall | `portal/meg/resultater` |
| `/portal/meg/sikkerhet` | redirect | → /portal/meg/innstillinger/sikkerhet | VIDERESENDING | - | `portal/meg/sikkerhet` |
| `/portal/meg/sikkerhet/2fa` | ekte | PlayerHQSkall, Caps, Tittel, TilbakeLenke | PH-25 | PlayerHQSkall | `portal/meg/sikkerhet/2fa` |
| `/portal/meg/utstyr` | ekte (med betinget redirect) | PlayerHQSkall, PH24Utstyr | PH-24 | PlayerHQSkall | `portal/meg/utstyr` |
| `/portal/meg/utstyrsbag` | redirect | → /portal/meg/utstyr#rediger-utstyr | VIDERESENDING | - | `portal/meg/utstyrsbag` |
| `/portal/oppgrader` | redirect | → /portal/meg/abonnement?fra=laast | VIDERESENDING | - | `portal/oppgrader` |
| `/portal/spiller/[spillerId]` | ekte | V2Shell, TilbakeLenke, SpillerDetaljV2 | PH-24 | V2Shell | `portal/spiller/[spillerId]` |
| `/portal/tren` | redirect | → /portal/planlegge/workbench | VIDERESENDING | - | `portal/(fullscreen)/tren` |
| `/portal/tren/[sessionId]` | redirect | → /portal/live/${sessionId} | VIDERESENDING | - | `portal/(legacy)/tren/[sessionId]` |
| `/portal/tren/[sessionId]/planlagt` | redirect | → /portal/gjennomfore/${sessionId} | VIDERESENDING | - | `portal/tren/[sessionId]/planlagt` |
| `/portal/tren/aarsplan` | redirect | → /portal/planlegge/workbench?zoom=ar | VIDERESENDING | - | `portal/(legacy)/tren/aarsplan` |
| `/portal/tren/feiring/[planId]` | ekte (med betinget redirect) | PlayerHQSkall, FeiringV2 | PH-07 | PlayerHQSkall | `portal/tren/feiring/[planId]` |
| `/portal/tren/ovelser` | redirect | → /portal/drills | VIDERESENDING | - | `portal/tren/ovelser` |
| `/portal/tren/ovelser/[id]` | redirect | → /portal/drills/${id} | VIDERESENDING | - | `portal/tren/ovelser/[id]` |
| `/portal/venner` | ekte | PlayerHQSkall, VennerClient | PH-24 | PlayerHQSkall | `portal/venner` |
| `/portal/venner/[spillerId]` | ekte | Caps, Tittel, Kort, TilbakeLenke | PH-24 | V2Shell | `portal/venner/[spillerId]` |

### Mål og tester (13 ekte, 2 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/portal/mal` | ekte | PlayerHQSkall, PH19Malsetninger | PH-19 | PlayerHQSkall | `portal/mal` |
| `/portal/mal/goal/[id]` | ekte | PlayerHQSkall, Ikon, TomTilstand, PH19Enkeltmal | PH-19 | PlayerHQSkall | `portal/mal/goal/[id]` |
| `/portal/mal/leaderboard` | ekte | PlayerHQSkall, PH19Leaderboard | PH-19 | PlayerHQSkall | `portal/mal/leaderboard` |
| `/portal/talent` | redirect | → /portal/talent/mitt-niva | VIDERESENDING | - | `portal/talent` |
| `/portal/talent/min-plan` | ekte | PlayerHQSkall, PH19Talent | PH-19 | PlayerHQSkall | `portal/talent/min-plan` |
| `/portal/talent/mitt-niva` | ekte | PlayerHQSkall, PH19Talent | PH-19 | PlayerHQSkall | `portal/talent/mitt-niva` |
| `/portal/talent/roadmap` | ekte | PlayerHQSkall, PH19Talent | PH-19 | PlayerHQSkall | `portal/talent/roadmap` |
| `/portal/talent/sammenligning` | ekte | PlayerHQSkall, PH19Talent | PH-19 | PlayerHQSkall | `portal/talent/sammenligning` |
| `/portal/tren/tester` | ekte (med betinget redirect) | PlayerHQSkall, Ikon, TomTilstand | PH-14 | PlayerHQSkall | `portal/tren/tester` |
| `/portal/tren/tester/[testId]` | ekte (med betinget redirect) | ResultatKontekst, PlayerHQSkall, StatusPille, TomTilstand | PH-14 | PlayerHQSkall | `portal/tren/tester/[testId]` |
| `/portal/tren/tester/[testId]/gjennomfor` | ekte (med betinget redirect) | GateLiveArtefakt, PeiLiveArtefakt, PH15TestGjennomfor | PH-15 | ingen (fullscreen-layout) | `portal/(fullscreen)/tren/tester/[testId]/gjennomfor` |
| `/portal/tren/tester/katalog` | redirect | → /portal/tren/tester | VIDERESENDING | - | `portal/(legacy)/tren/tester/katalog` |
| `/portal/tren/tester/ny` | ekte | PlayerHQSkall, TilbakeLenke, Caps, Tittel | PH-14 | PlayerHQSkall | `portal/tren/tester/ny` |
| `/portal/tren/tester/ny/egen` | ekte | PlayerHQSkall, TilbakeLenke, Caps, Tittel | PH-14 | PlayerHQSkall | `portal/tren/tester/ny/egen` |
| `/portal/utviklingsplan` | ekte (med betinget redirect) | PlayerHQSkall, PH19Utviklingsplan | PH-19 | PlayerHQSkall | `portal/utviklingsplan` |

### Annet (booking, oppsett, drift, logger) (1 ekte, 7 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/portal/agent-pipeline` | redirect | → /portal | VIDERESENDING | - | `portal/(legacy)/agent-pipeline` |
| `/portal/mal/bygger` | redirect | → /portal/planlegge/bygger | VIDERESENDING | - | `portal/mal/bygger` |
| `/portal/mal/evaluering` | ekte | PHIupEvaluering | UTEN-TEGNET-TYPE | PlayerHQSkall | `portal/mal/evaluering` |
| `/portal/ny-okt` | redirect | → /portal/planlegge/workbench | VIDERESENDING | - | `portal/(legacy)/ny-okt` |
| `/portal/stats` | redirect | → /portal/analysere | VIDERESENDING | - | `portal/stats` |
| `/portal/trackman` | redirect | → /portal/analysere/trackman | VIDERESENDING | - | `portal/trackman` |
| `/portal/trackman/[sessionId]` | redirect | → /portal/analysere/trackman/${sessionId} | VIDERESENDING | - | `portal/trackman/[sessionId]` |
| `/portal/utenfor-banen` | redirect | → /portal/meg | VIDERESENDING | - | `portal/utenfor-banen` |

### Innboks og meldinger (inkl. Caddie) (16 ekte, 7 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/portal/ai/foresla-turnering` | ekte | V2Shell, TilbakeLenke, ForeslaTurneringV2 | PH-22 | V2Shell | `portal/ai/foresla-turnering` |
| `/portal/ai/mal-bygger` | ekte | PlayerHQSkall, TilbakeLenke, AiMalByggerV2 | PH-12 | PlayerHQSkall | `portal/ai/mal-bygger` |
| `/portal/caddie` | redirect | → /portal/coach/ai | VIDERESENDING | - | `portal/caddie` |
| `/portal/coach` | ekte (med betinget redirect) | PlayerHQSkall, PH21Innboks | PH-21 | PlayerHQSkall | `portal/coach` |
| `/portal/coach/[coachId]` | redirect | → /portal/coach | VIDERESENDING | - | `portal/(legacy)/coach/[coachId]` |
| `/portal/coach/ai` | ekte | PlayerHQSkall, PH22CaddieChat | PH-22 | PlayerHQSkall | `portal/coach/ai` |
| `/portal/coach/melding` | ekte (med betinget redirect) | PlayerHQSkall, CoachMeldingerV2, TilbakeLenke | PH-21 | PlayerHQSkall | `portal/coach/melding` |
| `/portal/coach/melding/[id]` | redirect | → /portal/coach/melding | VIDERESENDING | - | `portal/(legacy)/coach/melding/[id]` |
| `/portal/coach/melding/[id]/vedlegg` | redirect | → /portal/coach/melding | VIDERESENDING | - | `portal/(legacy)/coach/melding/[id]/vedlegg` |
| `/portal/coach/melding/ny` | ekte (med betinget redirect) | PlayerHQSkall, TilbakeLenke, CoachMeldingNyV2 | PH-21 | PlayerHQSkall | `portal/coach/melding/ny` |
| `/portal/coach/notes` | redirect | → /portal/coach | VIDERESENDING | - | `portal/(legacy)/coach/notes` |
| `/portal/coach/plans` | ekte (med betinget redirect) | PlayerHQSkall, PH21Innboks | PH-21 | PlayerHQSkall | `portal/coach/plans` |
| `/portal/coach/plans/[planId]` | redirect | → /portal/coach/plans | VIDERESENDING | - | `portal/(legacy)/coach/plans/[planId]` |
| `/portal/coach/plans/[planId]/ny-okt` | redirect | → /portal/planlegge/workbench | VIDERESENDING | - | `portal/(legacy)/coach/plans/[planId]/ny-okt` |
| `/portal/coach/sg-hub` | ekte | PlayerHQSkall, TilbakeLenke, CoachSgHubV2 | PH-21 | PlayerHQSkall | `portal/coach/sg-hub` |
| `/portal/coach/sporsmal` | ekte (med betinget redirect) | PlayerHQSkall, TilbakeLenke, PH21Innboks, CoachQAV2 | PH-21 | PlayerHQSkall | `portal/coach/sporsmal` |
| `/portal/coach/sporsmal/[id]` | ekte | PlayerHQSkall, TilbakeLenke, CoachSporsmalTraadV2 | PH-21 | PlayerHQSkall | `portal/coach/sporsmal/[id]` |
| `/portal/coach/sporsmal/ny` | ekte | PlayerHQSkall, TilbakeLenke, CoachSporsmalNyV2 | PH-21 | PlayerHQSkall | `portal/coach/sporsmal/ny` |
| `/portal/coach/tilbakemelding` | ekte (med betinget redirect) | PlayerHQSkall, PH21Innboks | PH-21 | PlayerHQSkall | `portal/coach/tilbakemelding` |
| `/portal/coach/tilbakemelding/[oktId]` | ekte (med betinget redirect) | PlayerHQSkall, CoachTilbakemeldingV2 | PH-21 | PlayerHQSkall | `portal/coach/tilbakemelding/[oktId]` |
| `/portal/coach/videoer` | ekte (med betinget redirect) | PlayerHQSkall, PH21Innboks | PH-21 | PlayerHQSkall | `portal/coach/videoer` |
| `/portal/onskeligokt` | ekte (med betinget redirect) | PlayerHQSkall, PH21Innboks | PH-21 | PlayerHQSkall | `portal/onskeligokt` |
| `/portal/onskeligokt/bekreftet` | ekte (med betinget redirect) | PlayerHQSkall, SideHode, Side, Kort | PH-21 | PlayerHQSkall | `portal/onskeligokt/bekreftet` |

### Workbench og plan (inkl. kalender) (13 ekte, 3 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/portal/fysisk` | ekte (med betinget redirect) | PlayerHQSkall, FysiskV2 | PH-26 | PlayerHQSkall | `portal/fysisk` |
| `/portal/kalender` | ekte | PlayerHQSkall, KalenderV2 | PH-10 | PlayerHQSkall | `portal/kalender` |
| `/portal/kalender/opptatt` | ekte | PlayerHQSkall, OpptattTidV2 | PH-10 | PlayerHQSkall | `portal/kalender/opptatt` |
| `/portal/periodeplan` | redirect | → /portal/planlegge | VIDERESENDING | - | `portal/periodeplan` |
| `/portal/planlegge` | ekte (med betinget redirect) | PlayerHQSkall, PH10Plan | PH-10 | PlayerHQSkall | `portal/planlegge` |
| `/portal/planlegge/bygger` | ekte (med betinget redirect) | PH12VelgPlan | PH-12 | PlayerHQSkall | `portal/planlegge/bygger` |
| `/portal/planlegge/workbench` | ekte (med betinget redirect) | PlayerHQSkall, FeilTilstand, PH11Workbench, AG11Fysisk | PH-11 | PlayerHQSkall | `portal/planlegge/workbench` |
| `/portal/samlinger` | ekte (med betinget redirect) | V2Shell, SamlingsinvitasjonListe | UTEN-TEGNET-TYPE | V2Shell | `portal/samlinger` |
| `/portal/tren/fys-plan` | ekte | PlayerHQSkall, Ikon, TomTilstand, NyPlanKnapp | PH-26 | PlayerHQSkall | `portal/tren/fys-plan` |
| `/portal/tren/fys-plan/[planId]` | redirect | → /portal/fysisk | VIDERESENDING | - | `portal/(legacy)/tren/fys-plan/[planId]` |
| `/portal/tren/kalender` | redirect | → /portal/kalender | VIDERESENDING | - | `portal/tren/kalender` |
| `/portal/tren/turneringer` | ekte (med betinget redirect) | V2Shell, TilbakeLenke, TurneringPlanleggerV2 | PH-26 | V2Shell | `portal/tren/turneringer` |
| `/portal/tren/turneringer/[id]` | ekte | TurneringshistorikkTrainLock, V2Shell, TilbakeLenke, TurneringDetaljV2 | PH-26 | V2Shell | `portal/tren/turneringer/[id]` |
| `/portal/utfordringer` | ekte | PlayerHQSkall, PH24dListe | PH-26 | PlayerHQSkall | `portal/utfordringer` |
| `/portal/utfordringer/[id]` | ekte | PlayerHQSkall, PH24dDetalj | PH-26 | PlayerHQSkall | `portal/utfordringer/[id]` |
| `/portal/utfordringer/ny` | ekte | PlayerHQSkall, PH24dNy | PH-26 | PlayerHQSkall | `portal/(legacy)/utfordringer/ny` |

### WANG og Team Norway (2 ekte, 1 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/portal/iup/fireukerssjekk` | ekte (med betinget redirect) | PHIUP01Fireukerssjekk | PH-IUP-01 | PlayerHQSkall | `portal/iup/fireukerssjekk` |
| `/portal/toppidrett` | redirect | → /portal/analysere | VIDERESENDING | - | `portal/toppidrett` |
| `/portal/tren/tester/team-norway` | ekte | PlayerHQSkall, TnLocalDrafts, TnScorecard, ResultatKontekst | PH-14 | PlayerHQSkall | `portal/tren/tester/team-norway` |

### I dag (3 ekte, 0 redirect)

| URL | Type | Hovedkomponenter / redirect-mål | Skjerm-ID | Skall | Fil (under src/app) |
|---|---|---|---|---|---|
| `/portal` | ekte (med betinget redirect) | PlayerHQSkall, PH01IDag, KnappLenke, PushOptInBanner | PH-01 | PlayerHQSkall | `portal` |
| `/portal/ukesdigest` | ekte (med betinget redirect) | V2Shell, UkesdigestV2 | PH-26 | V2Shell | `portal/ukesdigest` |
| `/portal/varsler` | ekte | PlayerHQSkall, VarslerV2 | PH-25 | PlayerHQSkall | `portal/varsler` |
