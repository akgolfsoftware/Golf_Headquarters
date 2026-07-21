# Plattform-design — komplett inventar

> Generert 2026-07-21 · Forslag til komplett design · IKKE kodeport

**Slik leser du dette:** Hver skjerm tilhører én av 8 familier. Familien bestemmer layout. Innholdet under er unikt, rammen er gjenbruk.

- Levende ruter i kode: **361**
- Legacy (ikke ny design-fokus): **84**

## Produkter
- **PlayerHQ:** 131 skjermer
- **AgencyOS:** 100 skjermer
- **Marketing/System:** 78 skjermer
- **Intern:** 22 skjermer
- **Auth:** 16 skjermer
- **Forelder:** 11 skjermer
- **System:** 3 skjermer

## Familier
- **Hub:** 105 skjermer
- **Liste:** 36 skjermer
- **Detalj:** 148 skjermer
- **Wizard:** 25 skjermer
- **Live:** 9 skjermer
- **Analyse:** 19 skjermer
- **Kalender:** 19 skjermer

## Full liste

| Produkt | Familie | Skjerm | Adresse | 5-sekunders jobb | Primær CTA | Tema | Bredder |
|---|---|---|---|---|---|---|---|
| AgencyOS | Analyse | AgencyOS · Analyse | `/admin/analyse` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | mørk default | 1680·1280·390 triage |
| AgencyOS | Analyse | Analysere · Compliance | `/admin/analysere/compliance` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | mørk default | 1680·1280·390 triage |
| AgencyOS | Analyse | AgencyOS · Rapporter | `/admin/reports` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | mørk default | 1680·1280·390 triage |
| AgencyOS | Analyse | Spillere · Analyse | `/admin/spillere/[id]/analyse` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | mørk default | 1680·1280·390 triage |
| AgencyOS | Analyse | AgencyOS · TrackMan | `/admin/trackman` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS cockpit · Caddie | `/admin/agencyos/caddie` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Caddie · Aktivitet | `/admin/agencyos/caddie/aktivitet` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Caddie · Dashbord | `/admin/agencyos/caddie/dashbord` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS cockpit · Live | `/admin/agencyos/live` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS cockpit · Økonomi | `/admin/agencyos/okonomi` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS · Agenter | `/admin/agents/[agentId]` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS · Godkjenninger | `/admin/approvals/[id]` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS · Bookinger | `/admin/bookinger/[id]` | Booke eller endre tid | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Driller · Rediger | `/admin/drills/[id]/rediger` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | E-postmaler · Rediger | `/admin/email-templates/[id]/rediger` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Gjennomføre · Økter | `/admin/gjennomfore/okter/[id]` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS · Grupper | `/admin/grupper/[id]` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Grupper · Arsplan | `/admin/grupper/[id]/arsplan` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Skoledata | `/admin/grupper/[id]/arsplan/skoledata` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Grupper · Timeplan | `/admin/grupper/[id]/timeplan` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Innstillinger | `/admin/klubb/innstillinger` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS · Planmaler | `/admin/plan-templates/[id]` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Planmaler · Rediger | `/admin/plan-templates/[id]/rediger` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS · Planer | `/admin/plans/[planId]` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Planer · Templates | `/admin/plans/templates` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Effectiveness | `/admin/plans/templates/[id]/effectiveness` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Rediger | `/admin/plans/templates/[id]/rediger` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Innstillinger · Api | `/admin/settings/api` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Innstillinger · Periode Fordeling | `/admin/settings/periode-fordeling` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Innstillinger · Security | `/admin/settings/security` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Innstillinger · Tilgang | `/admin/settings/tilgang` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS · Spillere | `/admin/spillere/[id]` | 360° på én spiller | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Spillere · Fremgang | `/admin/spillere/[id]/fremgang` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Spillere · Plan | `/admin/spillere/[id]/plan` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Spillere · Plan | `/admin/spillere/[id]/plan/[planId]` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Talent · Discovery | `/admin/talent/discovery` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Talent · Radar | `/admin/talent/radar` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Tester · Foreslatte | `/admin/tester/foreslatte` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | AgencyOS · Turneringer | `/admin/tournaments/[id]` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Turneringer · Dubletter | `/admin/tournaments/dubletter` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Workspace · Notion | `/admin/workspace/notion` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Workspace · Oppgaver | `/admin/workspace/oppgaver` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Detalj | Workspace · Prosjekter | `/admin/workspace/prosjekter` | Forstå én enhet og ta neste steg | Primær handling | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS | `/admin` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS cockpit | `/admin/agencyos` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Agent Team | `/admin/agent-team` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Audit Log | `/admin/audit-log` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Økonomi | `/admin/finance` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Gjennomføre | `/admin/gjennomfore` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Handlingssenter | `/admin/handlingssenter` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Hjelp | `/admin/hjelp` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Innboks Epost | `/admin/innboks-epost` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Integrasjoner | `/admin/integrasjoner` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Markedsføring | `/admin/marketing` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Oppfolging | `/admin/oppfolging` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Organisasjon | `/admin/organisasjon` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Profile | `/admin/profile` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Innstillinger | `/admin/settings` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Talent | `/admin/talent` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Teknisk plan | `/admin/teknisk-plan` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Hub | AgencyOS · Workspace | `/admin/workspace` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | AgencyOS cockpit · Uka | `/admin/agencyos/uka` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | AgencyOS · Calendar | `/admin/calendar` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | Maned | `/admin/calendar/maned` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | Grupper · Workbench | `/admin/grupper/[id]/workbench` | Planlegge og flytte økter i tid | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | AgencyOS · Kalender | `/admin/kalender` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | Kalender · Hendelse | `/admin/kalender/hendelse/[id]` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | Ny | `/admin/kalender/hendelse/ny` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | AgencyOS · Planlegge | `/admin/planlegge` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | Innstillinger · Calendar | `/admin/settings/calendar` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | Spillere · Workbench | `/admin/spillere/[id]/workbench` | Planlegge for denne spilleren | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Kalender | AgencyOS · Uka | `/admin/uka` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS cockpit · Spillere | `/admin/agencyos/spillere` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Agenter | `/admin/agents` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Godkjenninger | `/admin/approvals` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Bookinger | `/admin/bookinger` | Booke eller endre tid | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · E-postmaler | `/admin/email-templates` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Godkjenninger | `/admin/godkjenninger` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Grupper | `/admin/grupper` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Innboks | `/admin/innboks` | Tøm kø av beslutninger | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Messages | `/admin/messages` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Økter | `/admin/okter` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Planmaler | `/admin/plan-templates` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Planer | `/admin/plans` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Kø | `/admin/queue` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Runder | `/admin/runder` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Spillere | `/admin/spillere` | Se stall-tilstand og plukk spiller | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | Spillere · Tester | `/admin/spillere/[id]/tester` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Team | `/admin/team` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Tester | `/admin/tester` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Turneringer | `/admin/tournaments` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Varsler | `/admin/varsler` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Liste | AgencyOS · Videoer | `/admin/videoer` | Skann, filtrer og åpne én ting | Åpne rad / Ny | mørk default | 1680·1280·390 triage |
| AgencyOS | Live | AgencyOS · Brief | `/admin/brief` | Logge underveis uten distraksjon | Pause / Neste / Avslutt | mørk default | 1680·1280·390 triage |
| AgencyOS | Wizard | Bookinger · Ny | `/admin/bookinger/ny` | Booke eller endre tid | Neste / Fullfør | mørk default | 1680·1280·390 triage |
| AgencyOS | Wizard | Planmaler · Ny | `/admin/plan-templates/ny` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | mørk default | 1680·1280·390 triage |
| AgencyOS | Wizard | Ny | `/admin/plans/templates/ny` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | mørk default | 1680·1280·390 triage |
| AgencyOS | Wizard | Spillere · Ny | `/admin/spillere/ny` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | mørk default | 1680·1280·390 triage |
| AgencyOS | Wizard | Team · Inviter | `/admin/team/inviter` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | mørk default | 1680·1280·390 triage |
| AgencyOS | Wizard | Turneringer · Ny | `/admin/tournaments/ny` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | mørk default | 1680·1280·390 triage |
| Auth | Detalj | Guardian Consent | `/auth/guardian-consent/[token]` | Forstå én enhet og ta neste steg | Primær handling | lys | 1280·390 |
| Auth | Hub | Bankid | `/auth/bankid` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Hub | Check Email | `/auth/check-email` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Hub | Checkout Resume | `/auth/checkout-resume` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Hub | Etter Innlogging | `/auth/etter-innlogging` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Hub | Forgot Password | `/auth/forgot-password` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Hub | Logg Inn | `/auth/logg-inn` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Hub | Logget Ut | `/auth/logget-ut` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Hub | Login | `/auth/login` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Hub | Reset Password | `/auth/reset-password` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Hub | Samtykke Venter | `/auth/samtykke-venter` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Hub | Signup | `/auth/signup` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 1280·390 |
| Auth | Wizard | Onboarding | `/auth/onboarding` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 1280·390 |
| Auth | Wizard | Forelder hjem | `/auth/onboarding/forelder` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 1280·390 |
| Auth | Wizard | Onboarding · Coach | `/onboard/coach` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 1280·390 |
| Auth | Wizard | Onboarding · Klubb | `/onboard/klubb` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 1280·390 |
| Forelder | Detalj | Forelder hjem · Barn | `/forelder/barn/[childId]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| Forelder | Hub | Forelder hjem | `/forelder` | Se barnets uke uten støy | Primær CTA (én) | lys | 390·834·1280 |
| Forelder | Hub | Forelder hjem · Barn | `/forelder/barn` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| Forelder | Hub | Forelder hjem · Coach | `/forelder/coach` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| Forelder | Hub | Forelder hjem · Fakturaer | `/forelder/fakturaer` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| Forelder | Hub | Forelder hjem · Innstillinger | `/forelder/innstillinger` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| Forelder | Hub | Forelder hjem · Økonomi | `/forelder/okonomi` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| Forelder | Hub | Forelder hjem · Samtykke | `/forelder/samtykke` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| Forelder | Hub | Forelder hjem · Ukerapport | `/forelder/ukerapport` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| Forelder | Liste | Forelder hjem · Bookinger | `/forelder/bookinger` | Booke eller endre tid | Åpne rad / Ny | lys | 390·834·1280 |
| Forelder | Liste | Forelder hjem · Varsler | `/forelder/varsler` | Skann, filtrer og åpne én ting | Åpne rad / Ny | lys | 390·834·1280 |
| Intern | Detalj | Gruppe | `/gfgk-junior/gruppe/[gruppe]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Intern | Detalj | Veileder | `/gfgk-junior/veileder/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Intern | Detalj | Daglig Brief | `/intern/komponenter/daglig-brief` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Intern | Detalj | Forelder hjem | `/intern/komponenter/forelder` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Intern | Detalj | Hull Analyse | `/intern/komponenter/hull-analyse` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Intern | Detalj | Spiller Panel | `/intern/komponenter/spiller-panel` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Intern | Detalj | Team Bookinger | `/intern/komponenter/team-bookinger` | Booke eller endre tid | Primær handling | begge | 1280·390 |
| Intern | Hub | Gfgk Junior | `/gfgk-junior` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Treningsplaner | `/gfgk-junior/treningsplaner` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Veileder | `/gfgk-junior/veileder` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Komponenter | `/intern/komponenter` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Kommando | `/kommando` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Agenter | `/kommando/agenter` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Oppgaver | `/kommando/oppgaver` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Prosjekter | `/kommando/prosjekter` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Team Gfgk | `/team-gfgk` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Team Wang | `/team-wang` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Coach | `/team-wang/coach` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Hub | Logg Inn | `/team-wang/logg-inn` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Intern | Kalender | Kalender | `/gfgk-junior/kalender` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | begge | 1280·390 |
| Intern | Kalender | Kalender | `/kommando/kalender` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | begge | 1280·390 |
| Intern | Liste | Team | `/kommando/team` | Skann, filtrer og åpne én ting | Åpne rad / Ny | begge | 1280·390 |
| Marketing/System | Analyse | Trackman Import | `/demos/trackman-import/[steg]` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | begge | 1280·390 |
| Marketing/System | Analyse | Turneringer · Statistikk | `/stats/turneringer/[slug]/statistikk` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | begge | 1280·390 |
| Marketing/System | Detalj | Anlegg | `/anlegg/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Blogg | `/blogg/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Booking | `/booking/[slug]` | Booke eller endre tid | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Booking · Bekreft | `/booking/[slug]/bekreft` | Booke eller endre tid | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Booking · Kvittering | `/booking/kvittering/[bookingId]` | Booke eller endre tid | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Coacher | `/coacher/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Newplan | `/demos/newplan/[steg]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Plan Bygger | `/demos/plan-bygger/[steg]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | 2026 | `/stats/2026` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Aargang | `/stats/aargang/[aar]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Baner | `/stats/baner/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Blogg | `/stats/blogg/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Klubber | `/stats/klubber/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Drive Distance | `/stats/pga/drive-distance` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Fairway Pct | `/stats/pga/fairway-pct` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Gir Pct | `/stats/pga/gir-pct` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Putt Explorer | `/stats/pga/putt-explorer` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Putts Per Round | `/stats/pga/putts-per-round` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Scoring Avg | `/stats/pga/scoring-avg` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Sg Total | `/stats/pga/sg-total` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Spillere | `/stats/pga/spillere/[dg_id]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Regions | `/stats/regions/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Resultat | `/stats/sg-sammenlign/resultat/[id]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Start | `/stats/sg-sammenlign/start` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Spillere | `/stats/spillere/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Tour | `/stats/tour/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Turneringer | `/stats/turneringer/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Avstand | `/stats/verktoy/avstand` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Score Til Hcp | `/stats/verktoy/score-til-hcp` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Sg Estimator | `/stats/verktoy/sg-estimator` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Tour Ekvivalent | `/stats/verktoy/tour-ekvivalent` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Whs Kalkulator | `/stats/verktoy/whs-kalkulator` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Wrapped | `/stats/wrapped/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Detalj | Turneringer | `/turneringer/[slug]` | Forstå én enhet og ta neste steg | Primær handling | begge | 1280·390 |
| Marketing/System | Hub | Start | `/` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Anlegg | `/anlegg` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Blogg | `/blogg` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Booking | `/booking` | Booke eller endre tid | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Cases | `/cases` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Coacher | `/coacher` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Coaching | `/coaching` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Cookies | `/cookies` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Plan Bygger | `/demos/plan-bygger` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Design System | `/design-system` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Faq | `/faq` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Jobb | `/jobb` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Junior | `/junior` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Kontakt | `/kontakt` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Om Oss | `/om-oss` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Personvern | `/personvern` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Playerhq | `/playerhq` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Priser | `/priser` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Stats | `/stats` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Aargang | `/stats/aargang` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Baner | `/stats/baner` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Blogg | `/stats/blogg` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Klubber | `/stats/klubber` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Leaderboards | `/stats/leaderboards` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Min Progresjon | `/stats/min-progresjon` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Norske | `/stats/norske` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Pga | `/stats/pga` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Quiz | `/stats/quiz` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Regions | `/stats/regions` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Sammenlign Spillere | `/stats/sammenlign-spillere` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Sg Sammenlign | `/stats/sg-sammenlign` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Sok | `/stats/sok` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Turneringer | `/stats/turneringer` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Verktoy | `/stats/verktoy` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Suksess | `/suksess` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Treningsfilosofi | `/treningsfilosofi` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Turneringer | `/turneringer` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Hub | Vilkar | `/vilkar` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| Marketing/System | Kalender | Uka | `/stats/uka` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | begge | 1280·390 |
| Marketing/System | Liste | Spillere | `/stats/pga/spillere` | Skann, filtrer og åpne én ting | Åpne rad / Ny | begge | 1280·390 |
| Marketing/System | Liste | Spillere | `/stats/spillere` | Skann, filtrer og åpne én ting | Åpne rad / Ny | begge | 1280·390 |
| Marketing/System | Wizard | Ny Okt | `/demos/ny-okt/[steg]` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | begge | 1280·390 |
| PlayerHQ | Analyse | PlayerHQ Hjem · Analyse | `/portal/analyse` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | PlayerHQ Hjem · Analysere | `/portal/analysere` | Forstå min golf (SG → fokus → plan) | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | Analysere · Hull | `/portal/analysere/hull` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | Coach · SG-hub | `/portal/coach/sg-hub` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | PlayerHQ Hjem · Datagolf | `/portal/datagolf` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | SG-hub · Coach | `/portal/mal/sg-hub/coach/[spillerId]` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | SG-hub · Coach | `/portal/mal/sg-hub/coach/[spillerId]/[club]` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | Coach · Utstyr | `/portal/mal/sg-hub/coach/[spillerId]/equipment` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | Mål · TrackMan | `/portal/mal/trackman` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | Mål · TrackMan | `/portal/mal/trackman/[id]` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | PlayerHQ Hjem · Statistikk | `/portal/statistikk/[metric]` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Analyse | Runder · Del | `/portal/statistikk/runder/[runId]/del` | Se tilstand på 5 sek, årsak på 30 sek | Planlegg dette | lys | 390·834·1280 |
| PlayerHQ | Detalj | Foresla Drill | `/portal/ai/foresla-drill` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Foresla Turnering | `/portal/ai/foresla-turnering` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Mal Bygger | `/portal/ai/mal-bygger` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | PlayerHQ Hjem · Baneguide | `/portal/baneguide/[baneId]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Baneguide · Hull | `/portal/baneguide/[baneId]/hull/[nr]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | PlayerHQ Hjem · Booking | `/portal/booking/[bookingId]` | Booke eller endre tid | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Booking · Anlegg | `/portal/booking/anlegg/[anleggId]` | Booke eller endre tid | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Booking · Bekreftet | `/portal/booking/bekreftet` | Booke eller endre tid | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Booking · Coach | `/portal/booking/coach/[coachId]` | Booke eller endre tid | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Coach · Ai | `/portal/coach/ai` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Coach · Meldinger | `/portal/coach/melding` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Coach · Ovelser | `/portal/coach/ovelser` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Coach · Sporsmal | `/portal/coach/sporsmal` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Coach · Sporsmal | `/portal/coach/sporsmal/[id]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | PlayerHQ Hjem · Driller | `/portal/drills/[id]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | PlayerHQ Hjem · Gameplan | `/portal/gameplan/[baneId]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Gameplan · Hull | `/portal/gameplan/[baneId]/hull/[nr]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | PlayerHQ Hjem · Gjennomføre | `/portal/gjennomfore/[id]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Mål · Goal | `/portal/mal/goal/[id]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Mål · Leaderboard | `/portal/mal/leaderboard` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Mål · Runder | `/portal/mal/runder/[id]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Runder · Hull | `/portal/mal/runder/[id]/hull` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Runder · Slag | `/portal/mal/runder/[id]/slag` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Meg · Abonnement | `/portal/meg/abonnement` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Abonnement · Faktura | `/portal/meg/abonnement/faktura/[id]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Abonnement · Oppgrader | `/portal/meg/abonnement/oppgrader` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Meg · Dokumenter | `/portal/meg/dokumenter` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Meg · Feedback | `/portal/meg/feedback` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Meg · Foreldre | `/portal/meg/foreldre` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Meg · Help | `/portal/meg/help` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Artikkel | `/portal/meg/help/artikkel/[slug]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Kategori | `/portal/meg/help/kategori/[slug]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Kontakt | `/portal/meg/help/kontakt` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Meg · Helse | `/portal/meg/helse` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Meg · Innstillinger | `/portal/meg/innstillinger` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Innstillinger · Ai Coach | `/portal/meg/innstillinger/ai-coach` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Innstillinger · Anlegg | `/portal/meg/innstillinger/anlegg` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Innstillinger · Eksport | `/portal/meg/innstillinger/eksport` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Innstillinger · Integrasjoner | `/portal/meg/innstillinger/integrasjoner` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Innstillinger · Personvern | `/portal/meg/innstillinger/personvern` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Innstillinger · Sikkerhet | `/portal/meg/innstillinger/sikkerhet` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Innstillinger · Sprak | `/portal/meg/innstillinger/sprak` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Meg · Profil | `/portal/meg/profil` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Meg · Sikkerhet | `/portal/meg/sikkerhet` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Sikkerhet · 2Fa | `/portal/meg/sikkerhet/2fa` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Meg · Utstyrsbag | `/portal/meg/utstyrsbag` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Ønsket økt · Bekreftet | `/portal/onskeligokt/bekreftet` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | PlayerHQ Hjem · Spiller | `/portal/spiller/[spillerId]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Talent · Min Plan | `/portal/talent/min-plan` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Talent · Mitt Niva | `/portal/talent/mitt-niva` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Talent · Roadmap | `/portal/talent/roadmap` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Talent · Sammenligning | `/portal/talent/sammenligning` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Planlagt | `/portal/tren/[sessionId]/planlagt` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Feiring | `/portal/tren/feiring/[planId]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Fys-plan | `/portal/tren/fys-plan` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Ovelser | `/portal/tren/ovelser` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Ovelser | `/portal/tren/ovelser/[id]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Teknisk plan | `/portal/tren/teknisk-plan/[planId]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Tester | `/portal/tren/tester/[testId]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Tester · Gjennomfor | `/portal/tren/tester/[testId]/gjennomfor` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Turneringer | `/portal/tren/turneringer` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Turneringer | `/portal/tren/turneringer/[id]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Break-tabell | `/portal/trening/break-tabell` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Logg | `/portal/trening/logg` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | Putte-lab | `/portal/trening/putte-laboratoriet` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | PlayerHQ Hjem · Utfordringer | `/portal/utfordringer/[id]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Detalj | PlayerHQ Hjem · Venner | `/portal/venner/[spillerId]` | Forstå én enhet og ta neste steg | Primær handling | lys | 390·834·1280 |
| PlayerHQ | Hub | Meg | `/meg` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem | `/portal` | Hva skal jeg gjøre i dag? (én hero + CTA) | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Baneguide | `/portal/baneguide` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Booking | `/portal/booking` | Booke eller endre tid | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Coach | `/portal/coach` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Fysisk | `/portal/fysisk` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Gameplan | `/portal/gameplan` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Gjennomføre | `/portal/gjennomfore` | Start eller fortsett dagens økt | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Mål | `/portal/mal` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Meg | `/portal/meg` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Ønsket økt | `/portal/onskeligokt` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Stats | `/portal/stats` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Talent | `/portal/talent` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Tren | `/portal/tren` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Utviklingsplan | `/portal/utviklingsplan` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Hub | PlayerHQ Hjem · Venner | `/portal/venner` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | lys | 390·834·1280 |
| PlayerHQ | Kalender | PlayerHQ Hjem · Kalender | `/portal/kalender` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | lys | 390·834·1280 |
| PlayerHQ | Kalender | PlayerHQ Hjem · Planlegge | `/portal/planlegge` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | lys | 390·834·1280 |
| PlayerHQ | Kalender | Planlegge · Bygger | `/portal/planlegge/bygger` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | lys | 390·834·1280 |
| PlayerHQ | Kalender | Planlegge · Workbench | `/portal/planlegge/workbench` | Planlegge uke/økt i Workbench | Ny økt / Flytt / Publiser | lys | 390·834·1280 |
| PlayerHQ | Kalender | Kalender | `/portal/tren/kalender` | Se tid og handle der du ser det | Ny økt / Flytt / Publiser | lys | 390·834·1280 |
| PlayerHQ | Liste | Coach · Planer | `/portal/coach/plans` | Skann, filtrer og åpne én ting | Åpne rad / Ny | lys | 390·834·1280 |
| PlayerHQ | Liste | Coach · Videoer | `/portal/coach/videoer` | Skann, filtrer og åpne én ting | Åpne rad / Ny | lys | 390·834·1280 |
| PlayerHQ | Liste | PlayerHQ Hjem · Driller | `/portal/drills` | Skann, filtrer og åpne én ting | Åpne rad / Ny | lys | 390·834·1280 |
| PlayerHQ | Liste | Mål · Runder | `/portal/mal/runder` | Skann, filtrer og åpne én ting | Åpne rad / Ny | lys | 390·834·1280 |
| PlayerHQ | Liste | Meg · Bookinger | `/portal/meg/bookinger` | Booke eller endre tid | Åpne rad / Ny | lys | 390·834·1280 |
| PlayerHQ | Liste | Innstillinger · Økter | `/portal/meg/innstillinger/okter` | Skann, filtrer og åpne én ting | Åpne rad / Ny | lys | 390·834·1280 |
| PlayerHQ | Liste | Innstillinger · Varsler | `/portal/meg/innstillinger/varsler` | Skann, filtrer og åpne én ting | Åpne rad / Ny | lys | 390·834·1280 |
| PlayerHQ | Liste | Tester | `/portal/tren/tester` | Skann, filtrer og åpne én ting | Åpne rad / Ny | lys | 390·834·1280 |
| PlayerHQ | Liste | PlayerHQ Hjem · Utfordringer | `/portal/utfordringer` | Skann, filtrer og åpne én ting | Åpne rad / Ny | lys | 390·834·1280 |
| PlayerHQ | Liste | PlayerHQ Hjem · Varsler | `/portal/varsler` | Skann, filtrer og åpne én ting | Åpne rad / Ny | lys | 390·834·1280 |
| PlayerHQ | Live | PlayerHQ Hjem · Live | `/portal/live/[sessionId]` | Logge underveis uten distraksjon | Pause / Neste / Avslutt | lys | 390·834·1280 |
| PlayerHQ | Live | Live aktiv | `/portal/live/[sessionId]/active` | Logge drill nå | Pause / Neste / Avslutt | lys | 390·834·1280 |
| PlayerHQ | Live | Live · Brief | `/portal/live/[sessionId]/brief` | Logge underveis uten distraksjon | Pause / Neste / Avslutt | lys | 390·834·1280 |
| PlayerHQ | Live | Live · Logger | `/portal/live/[sessionId]/logger` | Logge underveis uten distraksjon | Pause / Neste / Avslutt | lys | 390·834·1280 |
| PlayerHQ | Live | Live · Oppsummering | `/portal/live/[sessionId]/summary` | Logge underveis uten distraksjon | Pause / Neste / Avslutt | lys | 390·834·1280 |
| PlayerHQ | Live | Live · Tapper | `/portal/live/[sessionId]/tapper` | Logge underveis uten distraksjon | Pause / Neste / Avslutt | lys | 390·834·1280 |
| PlayerHQ | Live | Live | `/portal/runde/live` | Logge underveis uten distraksjon | Pause / Neste / Avslutt | lys | 390·834·1280 |
| PlayerHQ | Live | Logg | `/portal/runde/logg` | Logge underveis uten distraksjon | Pause / Neste / Avslutt | lys | 390·834·1280 |
| PlayerHQ | Wizard | Booking · Ny | `/portal/booking/ny` | Booke eller endre tid | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Ny · Bekreft | `/portal/booking/ny/bekreft` | Booke eller endre tid | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Meldinger · Ny | `/portal/coach/melding/ny` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Ny | `/portal/coach/sporsmal/ny` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Mål · Bygger | `/portal/mal/bygger` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Runder · Ny | `/portal/mal/runder/ny` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Abonnement · Avbestill | `/portal/meg/abonnement/avbestill` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Ny | `/portal/meg/abonnement/kort/ny` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Flyt | `/portal/meg/abonnement/oppgrader/flyt` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Bookinger · Reschedule | `/portal/meg/bookinger/reschedule/[bookingId]` | Booke eller endre tid | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Ny | `/portal/meg/helse/symptom/ny` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Tester · Ny | `/portal/tren/tester/ny` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 390·834·1280 |
| PlayerHQ | Wizard | Ny · Egen | `/portal/tren/tester/ny/egen` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | lys | 390·834·1280 |
| System | Hub | Dev Banekart | `/dev-banekart` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| System | Hub | Offline | `/offline` | Se hva som er viktig nå og trykk på neste handling | Primær CTA (én) | begge | 1280·390 |
| System | Wizard | Forelder hjem | `/inviter/forelder/[token]` | Fullføre en flerstegs handling uten å gå vill | Neste / Fullfør | begge | 1280·390 |

## Legacy (bevisst uten ny hi-fi)
- `/admin/agenter`
- `/admin/ai`
- `/admin/analysere`
- `/admin/anlegg`
- `/admin/availability`
- `/admin/board`
- `/admin/caddie`
- `/admin/coach-workbench`
- `/admin/drills`
- `/admin/drills/[id]`
- `/admin/drills/forslag`
- `/admin/drills/ny`
- `/admin/foresporsler`
- `/admin/godkjenninger/[id]`
- `/admin/kalender/maned`
- `/admin/kalender/uke`
- `/admin/kapasitet`
- `/admin/kommunikasjon`
- `/admin/lag-snitt`
- `/admin/live/[sessionId]/active`
- `/admin/live/[sessionId]/brief`
- `/admin/live/[sessionId]/summary`
- `/admin/mer`
- `/admin/okonomi`
- `/admin/plan-templates/[id]/effectiveness`
- `/admin/plans/new`
- `/admin/prosjekter`
- `/admin/reach`
- `/admin/recording`
- `/admin/risiko`
- `/admin/services`
- `/admin/spillere/[id]/profil`
- `/admin/spillere/[id]/rediger`
- `/admin/spillere/[id]/tildel-test`
- `/admin/stall`
- `/admin/stats/moderering`
- `/admin/stats/overview`
- `/admin/talent/kohort`
- `/admin/talent/region`
- `/admin/talent/ressurser`
- `/admin/talent/sammenligning`
- `/admin/talent/wagr-benchmark`
- `/admin/talent/wagr-import`
- `/admin/teknisk-plan/[spillerId]`
- `/admin/tester/benchmarks`
- `/admin/tester/tildel`
- `/admin/tester/tildel/[spillerId]`
- `/admin/tilstander`
- `/admin/workspace/tildelt-meg`
- `/portal/agent-pipeline`
- `/portal/coach/[coachId]`
- `/portal/coach/melding/[id]`
- `/portal/coach/melding/[id]/vedlegg`
- `/portal/coach/notes`
- `/portal/coach/notes/[noteId]`
- `/portal/coach/ovelser/[id]/rediger`
- `/portal/coach/ovelser/ny`
- `/portal/coach/plans/[planId]`
- `/portal/coach/plans/[planId]/ny-okt`
- `/portal/coach/plans/perioder`
- `/portal/mal/milepaeler`
- `/portal/mal/runder/[id]/fullfor`
- `/portal/mal/runder/[id]/shot-by-shot`
- `/portal/mal/sg-hub`
- `/portal/mal/sg-hub/[club]`
- `/portal/mal/sg-hub/benchmark`
- `/portal/mal/sg-hub/best-vs-now`
- `/portal/mal/sg-hub/conditions`
- `/portal/mal/sg-hub/equipment`
- `/portal/mal/sg-hub/strategy`
- `/portal/mal/sg-hub/yardage`
- `/portal/mal/statistikk`
- `/portal/ny-okt`
- `/portal/reach`
- `/portal/statistikk`
- `/portal/trackman/[sessionId]`
- `/portal/tren/[sessionId]`
- `/portal/tren/aarsplan`
- `/portal/tren/aarsplan/periode/[id]/rediger`
- `/portal/tren/aarsplan/periode/ny`
- … +4 til