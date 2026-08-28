# SKJERM-STATUS mot Train-lock-fasiten — målt 26.08.2026

> **UTDATERT som token-telling (28.08.2026).** #631 byttet de fleste PlayerHQ/AgencyOS-filer
> til `TL`. Ny kjøring av `node scripts/maal-trainlock-status.mjs` (28.08, main):
> **188 PORTET · 23 BLANDET · 0 PAPER · 4 CHROME-ONLY · 111 REDIRECT.**
> Det er token-port, **ikke** piksel-1:1 mot Train-lock `.dc.html`. Tallene under (2 PORTET /
> 103 PAPER) beskriver 26.08 og skal ikke brukes som bygg-fasit.
>
> **Hva dette er:** status målt mot koden 26.08. Regenereres med
> `node scripts/maal-trainlock-status.mjs` + `node scripts/stikkprove-trainlock.mjs`.

## Metode

1. **Token-måling:** for hver `page.tsx` under `/admin`, `/portal` og `/forelder` følges
   import-kjeden (dybde 3). Filer som brukes av >50 % av rutene regnes som **felles-chrome**
   (skallet + de delte v2-komponentene) og holdes utenfor — ellers ser alt «blandet» ut fordi
   T1-skallet (Train-lock) importeres overalt. Klassifisering på skjermens EGNE filer:
   - **PORTET** — egne filer bruker kun `TL`/`--tl-*`
   - **BLANDET** — egne filer bruker både `TL` og Paper-`T`
   - **PAPER** — egne filer bruker kun Paper-tokens (`@/lib/v2/tokens`)
   - **CHROME-ONLY** — skjermen har ingen egne token-filer; utseendet styres 100 % av de delte
     v2-komponentene, som fortsatt er Paper. Visuelt = Paper-innhold i Train-lock-skall.
2. **Stikkprøve mot prod:** 15 skjermbilder (390 px + 1280 px, lys + mørk) av det som påstås
   portet, tatt 26.08 mot `akgolf-hq.vercel.app` — ligger i `screenshots/trainlock-stikkprove/`.

## Hovedtall

**240 skjerm-ruter** (326 sider minus 86 redirects/stubber).

| Klasse | Antall | Andel | Betyr i praksis |
|---|---|---|---|
| PORTET | 2 | 0 % | Reelt Train-lock |
| BLANDET | 4 | 1 % | Delvis portet — TL og Paper om hverandre |
| PAPER | 103 | 42 % | Egne Paper-tokens — venter på sin T-/B8-session |
| CHROME-ONLY | 131 | 54 % | Arver Paper-utseende fra delte v2-komponenter |

**Konklusjon i én setning:** skallet (T1) og Cockpit (T2) + TrackMan-detaljen (B7) er reelt
Train-lock i prod — resten av appen (234 skjermer) viser fortsatt Paper-innhold inne i det nye
skallet, som forventet der T3–T13 og B8 ikke er kjørt ennå.

**Verifisert visuelt 26.08 (prod, 390+1280, lys+mørk):** T1-skallet (fem destinasjoner, 232 px
rail, «Under Meg»-rader), T2-cockpit («I dag» + kø-kort, hvite pillknapper, mørk scene) — begge
matcher AX-01/AG-01-fasiten strukturelt. Stall-innholdet bak skallet er fortsatt Paper (stemmer
med målingen). TrackMan-fanen og PlayerHQ «I dag» fotografert som referanse.

## Status per session (fra LAUNCH-PLAN §0.2)

| Session | Ruter | Portet | Blandet | Paper/Chrome | Status |
|---|---|---|---|---|---|
| T2 | 2 | 1 | 0 | 1 | PÅGÅR/DELVIS |
| T2 (§5T-beslutning) | 2 | 0 | 0 | 2 | IKKE STARTET |
| T3 | 4 | 0 | 0 | 4 | IKKE STARTET |
| T4 | 9 | 0 | 0 | 9 | IKKE STARTET |
| T5 | 2 | 0 | 1 | 1 | PÅGÅR/DELVIS |
| T6 | 12 | 0 | 0 | 12 | IKKE STARTET |
| T6/T11 | 2 | 0 | 0 | 2 | IKKE STARTET |
| T7 | 6 | 0 | 0 | 6 | IKKE STARTET |
| T8 | 7 | 0 | 0 | 7 | IKKE STARTET |
| B8 | 114 | 1 | 3 | 110 | PÅGÅR/DELVIS |
| T9 | 5 | 0 | 0 | 5 | IKKE STARTET |
| T10 | 5 | 0 | 0 | 5 | IKKE STARTET |
| T11 | 8 | 0 | 0 | 8 | IKKE STARTET |
| T12 | 6 | 0 | 0 | 6 | IKKE STARTET |
| T13 | 19 | 0 | 0 | 19 | IKKE STARTET |
| Forelder-port (session ubestemt) | 11 | 0 | 0 | 11 | IKKE STARTET |
| §5T / uavklart | 26 | 0 | 0 | 26 | IKKE STARTET |

## Portet (2)

| Rute | TL-filer |
|---|---|
| `/admin/agencyos` | `TrainLockCockpit.tsx` |
| `/portal/analysere/trackman/[id]` | `page.tsx`, `TrackManSessionDetail.tsx`, `ShotSheet.tsx`, `DispersionMap.tsx` |

## Blandet (4)

| Rute | Session | TL i | Paper fortsatt i |
|---|---|---|---|
| `/admin/workbench/[playerId]` | T5 | `wb-tl-scope.ts`, `WorkbenchUke.tsx`, `WeekGrid.tsx`, `wb-visuelt.ts` | 8 filer |
| `/portal/(fullscreen)/tren/wb/[sessionId]` | B8 | `wb-visuelt.ts` | 1 filer |
| `/portal/(fullscreen)/tren/wb` | B8 | `wb-visuelt.ts` | 1 filer |
| `/portal` | B8 | `wb-visuelt.ts` | 3 filer |

Merk `/admin/workbench/[playerId]`: D3-porten (#589) la Train-lock på uke-visningen
(`WorkbenchUke`/`WeekGrid`), men inspector/kilder/drill-editor er fortsatt Paper — det er
T5-jobben. `/portal` og `/portal/(fullscreen)/tren/wb` drar inn én TL-fil via
`wb-visuelt.ts` men er ellers Paper — det er B8-jobben.

## Alle skjermer (vedlegg, gruppert per session)

### T2

| Rute | Klasse |
|---|---|
| `/admin/agencyos` | PORTET |
| `/admin/agencyos/uka` | CHROME-ONLY |

### T2 (§5T-beslutning)

| Rute | Klasse |
|---|---|
| `/admin/brief` | PAPER |
| `/admin/queue` | PAPER |

### T3

| Rute | Klasse |
|---|---|
| `/admin/godkjenninger` | CHROME-ONLY |
| `/admin/innboks` | PAPER |
| `/admin/innboks-epost` | PAPER |
| `/admin/varsler` | PAPER |

### T4

| Rute | Klasse |
|---|---|
| `/admin/spillere` | PAPER |
| `/admin/spillere/[id]` | CHROME-ONLY |
| `/admin/spillere/[id]/analyse` | PAPER |
| `/admin/spillere/[id]/fremgang` | PAPER |
| `/admin/spillere/[id]/plan` | CHROME-ONLY |
| `/admin/spillere/[id]/plan/[planId]` | PAPER |
| `/admin/spillere/[id]/tester` | PAPER |
| `/admin/spillere/[id]/turnering-kobling` | PAPER |
| `/admin/spillere/ny` | CHROME-ONLY |

### T5

| Rute | Klasse |
|---|---|
| `/admin/spillere/[id]/workbench` | PAPER |
| `/admin/workbench/[playerId]` | BLANDET |

### T6

| Rute | Klasse |
|---|---|
| `/admin/drills/[id]/rediger` | CHROME-ONLY |
| `/admin/gjennomfore` | CHROME-ONLY |
| `/admin/gjennomfore/okter/[id]` | PAPER |
| `/admin/okter` | PAPER |
| `/admin/plan-templates` | PAPER |
| `/admin/plan-templates/[id]` | CHROME-ONLY |
| `/admin/plan-templates/[id]/rediger` | CHROME-ONLY |
| `/admin/plan-templates/ny` | CHROME-ONLY |
| `/admin/planlegge` | PAPER |
| `/admin/plans` | CHROME-ONLY |
| `/admin/plans/[planId]` | PAPER |
| `/admin/teknisk-plan` | PAPER |

### T6/T11

| Rute | Klasse |
|---|---|
| `/admin/tester` | CHROME-ONLY |
| `/admin/tester/foreslatte` | PAPER |

### T7

| Rute | Klasse |
|---|---|
| `/admin/bookinger` | CHROME-ONLY |
| `/admin/bookinger/[id]` | PAPER |
| `/admin/bookinger/ny` | CHROME-ONLY |
| `/admin/kalender` | PAPER |
| `/admin/kalender/hendelse/[id]` | PAPER |
| `/admin/kalender/hendelse/ny` | PAPER |

### T8

| Rute | Klasse |
|---|---|
| `/admin/agencyos/ak-stigen` | CHROME-ONLY |
| `/admin/grupper` | PAPER |
| `/admin/grupper/[id]` | CHROME-ONLY |
| `/admin/grupper/[id]/arsplan` | CHROME-ONLY |
| `/admin/grupper/[id]/arsplan/skoledata` | CHROME-ONLY |
| `/admin/grupper/[id]/timeplan` | PAPER |
| `/admin/grupper/[id]/workbench` | CHROME-ONLY |

### B8

| Rute | Klasse |
|---|---|
| `/portal` | BLANDET |
| `/portal/(fullscreen)/live/[sessionId]` | CHROME-ONLY |
| `/portal/(fullscreen)/live/[sessionId]/active` | PAPER |
| `/portal/(fullscreen)/live/[sessionId]/brief` | PAPER |
| `/portal/(fullscreen)/live/[sessionId]/summary` | PAPER |
| `/portal/(fullscreen)/live/[sessionId]/tapper` | PAPER |
| `/portal/(fullscreen)/runde/live` | CHROME-ONLY |
| `/portal/(fullscreen)/runde/logg` | CHROME-ONLY |
| `/portal/(fullscreen)/tren/tester/[testId]/gjennomfor` | PAPER |
| `/portal/(fullscreen)/tren/wb` | BLANDET |
| `/portal/(fullscreen)/tren/wb/[sessionId]` | BLANDET |
| `/portal/(legacy)/mal/sg-hub/equipment` | CHROME-ONLY |
| `/portal/ai/foresla-drill` | PAPER |
| `/portal/ai/foresla-turnering` | CHROME-ONLY |
| `/portal/ai/mal-bygger` | CHROME-ONLY |
| `/portal/analysere` | PAPER |
| `/portal/analysere/historikk` | PAPER |
| `/portal/analysere/hull` | CHROME-ONLY |
| `/portal/analysere/trackman/[id]` | PORTET |
| `/portal/booking` | PAPER |
| `/portal/booking/[bookingId]` | CHROME-ONLY |
| `/portal/booking/anlegg/[anleggId]` | CHROME-ONLY |
| `/portal/booking/bekreftet` | CHROME-ONLY |
| `/portal/booking/coach/[coachId]` | CHROME-ONLY |
| `/portal/booking/ny` | CHROME-ONLY |
| `/portal/booking/ny/bekreft` | PAPER |
| `/portal/coach` | CHROME-ONLY |
| `/portal/coach/ai` | CHROME-ONLY |
| `/portal/coach/melding` | CHROME-ONLY |
| `/portal/coach/melding/ny` | CHROME-ONLY |
| `/portal/coach/ovelser` | PAPER |
| `/portal/coach/plans` | CHROME-ONLY |
| `/portal/coach/sg-hub` | CHROME-ONLY |
| `/portal/coach/sporsmal` | CHROME-ONLY |
| `/portal/coach/sporsmal/[id]` | CHROME-ONLY |
| `/portal/coach/sporsmal/ny` | CHROME-ONLY |
| `/portal/coach/tilbakemelding/[oktId]` | PAPER |
| `/portal/coach/videoer` | CHROME-ONLY |
| `/portal/drills` | PAPER |
| `/portal/drills/[id]` | PAPER |
| `/portal/gameplan/[baneId]` | PAPER |
| `/portal/gameplan/[baneId]/hull/[nr]` | PAPER |
| `/portal/gjennomfore/[id]` | PAPER |
| `/portal/kalender` | PAPER |
| `/portal/kalender/opptatt` | CHROME-ONLY |
| `/portal/mal` | CHROME-ONLY |
| `/portal/mal/bygger` | PAPER |
| `/portal/mal/goal/[id]` | CHROME-ONLY |
| `/portal/mal/leaderboard` | CHROME-ONLY |
| `/portal/mal/runder/[id]` | CHROME-ONLY |
| `/portal/mal/runder/[id]/hull` | PAPER |
| `/portal/mal/runder/[id]/slag` | PAPER |
| `/portal/mal/runder/ny` | PAPER |
| `/portal/mal/sg-hub/coach/[spillerId]` | CHROME-ONLY |
| `/portal/mal/sg-hub/coach/[spillerId]/[club]` | CHROME-ONLY |
| `/portal/mal/sg-hub/coach/[spillerId]/equipment` | CHROME-ONLY |
| `/portal/mal/trackman` | PAPER |
| `/portal/mal/trackman/[id]` | PAPER |
| `/portal/meg` | PAPER |
| `/portal/meg/abonnement` | PAPER |
| `/portal/meg/abonnement/avbestill` | CHROME-ONLY |
| `/portal/meg/abonnement/faktura/[id]` | CHROME-ONLY |
| `/portal/meg/abonnement/kort/ny` | PAPER |
| `/portal/meg/bookinger` | PAPER |
| `/portal/meg/bookinger/reschedule/[bookingId]` | PAPER |
| `/portal/meg/dokumenter` | CHROME-ONLY |
| `/portal/meg/foreldre` | CHROME-ONLY |
| `/portal/meg/help/artikkel/[slug]` | PAPER |
| `/portal/meg/help/kategori/[slug]` | CHROME-ONLY |
| `/portal/meg/help/kontakt` | PAPER |
| `/portal/meg/helse` | CHROME-ONLY |
| `/portal/meg/helse/symptom/ny` | CHROME-ONLY |
| `/portal/meg/innstillinger` | PAPER |
| `/portal/meg/innstillinger/ai-coach` | PAPER |
| `/portal/meg/innstillinger/anlegg` | PAPER |
| `/portal/meg/innstillinger/integrasjoner` | PAPER |
| `/portal/meg/innstillinger/okter` | PAPER |
| `/portal/meg/innstillinger/personvern` | PAPER |
| `/portal/meg/innstillinger/sikkerhet` | PAPER |
| `/portal/meg/innstillinger/sprak` | PAPER |
| `/portal/meg/innstillinger/varsler` | PAPER |
| `/portal/meg/profil` | PAPER |
| `/portal/meg/sikkerhet/2fa` | PAPER |
| `/portal/meg/utstyr` | PAPER |
| `/portal/meg/utstyrsbag` | CHROME-ONLY |
| `/portal/onskeligokt` | CHROME-ONLY |
| `/portal/onskeligokt/bekreftet` | CHROME-ONLY |
| `/portal/planlegge/workbench` | PAPER |
| `/portal/spiller/[spillerId]` | CHROME-ONLY |
| `/portal/statistikk/[metric]` | CHROME-ONLY |
| `/portal/statistikk/runder/[runId]/del` | CHROME-ONLY |
| `/portal/talent/min-plan` | CHROME-ONLY |
| `/portal/talent/mitt-niva` | CHROME-ONLY |
| `/portal/talent/roadmap` | CHROME-ONLY |
| `/portal/talent/sammenligning` | CHROME-ONLY |
| `/portal/tren/feiring/[planId]` | CHROME-ONLY |
| `/portal/tren/fys-plan` | PAPER |
| `/portal/tren/teknisk-plan/[planId]` | PAPER |
| `/portal/tren/tester` | PAPER |
| `/portal/tren/tester/[testId]` | PAPER |
| `/portal/tren/tester/ny` | CHROME-ONLY |
| `/portal/tren/tester/ny/egen` | CHROME-ONLY |
| `/portal/tren/turneringer` | PAPER |
| `/portal/tren/turneringer/[id]` | PAPER |
| `/portal/trening/break-tabell` | CHROME-ONLY |
| `/portal/trening/logg` | CHROME-ONLY |
| `/portal/trening/putte-laboratoriet` | CHROME-ONLY |
| `/portal/utenfor-banen` | PAPER |
| `/portal/utfordringer` | CHROME-ONLY |
| `/portal/utfordringer/[id]` | CHROME-ONLY |
| `/portal/utviklingsplan` | CHROME-ONLY |
| `/portal/varsler` | PAPER |
| `/portal/venner` | PAPER |
| `/portal/venner/[spillerId]` | PAPER |

### T9

| Rute | Klasse |
|---|---|
| `/admin/agencyos/live` | CHROME-ONLY |
| `/admin/agencyos/live/[sessionId]` | CHROME-ONLY |
| `/admin/recording` | PAPER |
| `/admin/trackman` | CHROME-ONLY |
| `/admin/trackman/[sessionId]` | PAPER |

### T10

| Rute | Klasse |
|---|---|
| `/admin/tournaments` | CHROME-ONLY |
| `/admin/tournaments/[id]` | PAPER |
| `/admin/tournaments/dubletter` | CHROME-ONLY |
| `/admin/tournaments/ny` | CHROME-ONLY |
| `/admin/turnering-kart` | PAPER |

### T11

| Rute | Klasse |
|---|---|
| `/admin/analyse` | PAPER |
| `/admin/analysere/compliance` | PAPER |
| `/admin/reports` | CHROME-ONLY |
| `/admin/runder` | PAPER |
| `/admin/talent/discovery` | CHROME-ONLY |
| `/admin/talent/radar` | PAPER |
| `/admin/talent/sammenligning` | PAPER |
| `/admin/talent/wagr-import` | CHROME-ONLY |

### T12

| Rute | Klasse |
|---|---|
| `/admin/agencyos/caddie` | CHROME-ONLY |
| `/admin/agencyos/caddie/aktivitet` | CHROME-ONLY |
| `/admin/agencyos/caddie/dashbord` | CHROME-ONLY |
| `/admin/agenticos` | PORTET (AO-01, 28.08 — se T12-VISUELL-DONE) |
| `/admin/agenticos/ko` | PORTET (AO-03) |
| `/admin/agenticos/godkjenn` | PORTET (AO-08) |
| `/admin/agenticos/skills` | PORTET (AO-09) |
| `/admin/agenticos/runtimes` | PORTET (AO-02/10) |
| `/admin/agenticos/projects` | PORTET (AO-05) |
| `/admin/agents/[agentId]` | PORTET (AO-04) |
| `/admin/handlingssenter` | CHROME-ONLY |

### T13

| Rute | Klasse |
|---|---|
| `/admin/agencyos/okonomi` | PAPER |
| `/admin/audit-log` | CHROME-ONLY |
| `/admin/email-templates` | CHROME-ONLY |
| `/admin/email-templates/[id]/rediger` | CHROME-ONLY |
| `/admin/feillogg` | CHROME-ONLY |
| `/admin/gdpr` | PAPER |
| `/admin/hjelp` | CHROME-ONLY |
| `/admin/integrasjoner` | CHROME-ONLY |
| `/admin/klubb/innstillinger` | CHROME-ONLY |
| `/admin/profile` | CHROME-ONLY |
| `/admin/settings` | CHROME-ONLY |
| `/admin/settings/api` | CHROME-ONLY |
| `/admin/settings/calendar` | CHROME-ONLY |
| `/admin/settings/periode-navn` | CHROME-ONLY |
| `/admin/settings/security` | CHROME-ONLY |
| `/admin/settings/tilgang` | CHROME-ONLY |
| `/admin/team` | CHROME-ONLY |
| `/admin/team/ekstern` | CHROME-ONLY |
| `/admin/team/inviter` | CHROME-ONLY |

### Forelder-port (session ubestemt)

| Rute | Klasse |
|---|---|
| `/forelder` | CHROME-ONLY |
| `/forelder/barn` | CHROME-ONLY |
| `/forelder/barn/[childId]` | CHROME-ONLY |
| `/forelder/bookinger` | CHROME-ONLY |
| `/forelder/coach` | CHROME-ONLY |
| `/forelder/fakturaer` | CHROME-ONLY |
| `/forelder/innstillinger` | CHROME-ONLY |
| `/forelder/okonomi` | CHROME-ONLY |
| `/forelder/samtykke` | CHROME-ONLY |
| `/forelder/ukerapport` | CHROME-ONLY |
| `/forelder/varsler` | CHROME-ONLY |

### §5T / uavklart

| Rute | Klasse |
|---|---|
| `/admin/(legacy)/anlegg` | CHROME-ONLY |
| `/admin/(legacy)/availability` | CHROME-ONLY |
| `/admin/(legacy)/drills` | PAPER |
| `/admin/(legacy)/drills/[id]` | PAPER |
| `/admin/(legacy)/drills/forslag` | PAPER |
| `/admin/(legacy)/drills/ny` | PAPER |
| `/admin/(legacy)/foresporsler` | CHROME-ONLY |
| `/admin/(legacy)/godkjenninger/[id]` | PAPER |
| `/admin/(legacy)/kalender/maned` | CHROME-ONLY |
| `/admin/(legacy)/lag-snitt` | PAPER |
| `/admin/(legacy)/live/[sessionId]/active` | PAPER |
| `/admin/(legacy)/live/[sessionId]/brief` | PAPER |
| `/admin/(legacy)/live/[sessionId]/summary` | PAPER |
| `/admin/(legacy)/services` | CHROME-ONLY |
| `/admin/(legacy)/spillere/[id]/profil` | CHROME-ONLY |
| `/admin/(legacy)/spillere/[id]/rediger` | CHROME-ONLY |
| `/admin/(legacy)/spillere/[id]/tildel-test` | CHROME-ONLY |
| `/admin/(legacy)/stats/moderering` | CHROME-ONLY |
| `/admin/(legacy)/tester/benchmarks` | CHROME-ONLY |
| `/admin/(legacy)/tester/tildel/[spillerId]` | CHROME-ONLY |
| `/admin/(legacy)/workspace/tildelt-meg` | CHROME-ONLY |
| `/admin/marketing` | CHROME-ONLY |
| `/admin/videoer` | CHROME-ONLY |
| `/admin/workspace` | CHROME-ONLY |
| `/admin/workspace/notion` | PAPER |
| `/admin/workspace/prosjekter` | PAPER |

---

*Redirects (86) er utelatt — de arver målet sitt. Marketing/landingssider har egen fasit
(ak-golf-website) og måles ikke her. Fasit-dekning: se `designsystem/train-lock/SCREEN-INDEX.md`
(196 filer) og LAUNCH-PLAN §5T for hvilke ruter som mangler tegnet fasit.*
