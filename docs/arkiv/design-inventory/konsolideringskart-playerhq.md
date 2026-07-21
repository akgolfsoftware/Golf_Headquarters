# Konsolideringskart — PlayerHQ (spiller)

> **READ-ONLY. Dato 2026-06-30.** Ingen kildekode rørt — dette er et kart fra **dagens skjermer**
> (`portal.json`, 153 page.tsx-ruter) til **mål-IA-en** (`ia-fasit.md`: 5 faner + 4 sidespor).
>
> **Hva dette svarer på:** for hver eneste dagens rute — hvilken fane/sidespor den havner i, og HVA den
> blir (hovedflate / fane / visnings-bytte / modal-wizard / fullskjerm / slått sammen / redirect-drop).
>
> **Mål-IA (PlayerHQ, lyst tema):** 5 faner i bunnbar — **Hjem · Planlegge · Gjennomføre · Analysere · Meg**.
> 4 sidespor — **Coach · Booking · Talent (utsatt) · Varsler (global bjelle)**.
>
> **«Blir til»-koder:**
> - **FANE-PRIMÆR** = selve fane-hovedflaten
> - **UNDERFANE** = fane inne i fanen (f.eks. SG/Runder under Analysere)
> - **VISNINGS-BYTTE / SEKSJON** = en seksjon eller visning på en delt flate
> - **MODAL/WIZARD** = modal eller wizard
> - **FULLSKJERM** = egen fullskjerm-flyt (f.eks. live-økt)
> - **SLÅTT SAMMEN → {rute}** = funksjon flyttes inn i en annen flate
> - **REDIRECT/DROP** = dublett/alias-redirect eller «IKKE i MASTER» som droppes

---

## Hjem

Mål: «Hva skal JEG gjøre i dag» + motivasjon (streak/milepæler/feiring/utfordringer/leaderboard løftes hit).

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/portal` | Spiller-hjem (dagens økt, SG-mini, coach-notat, nytt) | **FANE-PRIMÆR** | Selve Hjem-flaten. Allerede fokusert. |
| `/portal/mal/milepaeler` | Milepæler | **VISNINGS-BYTTE / SEKSJON** | Motivasjon løftes til Hjem (regel 3). Milepæler blir kort/seksjon på Hjem. |
| `/portal/mal/leaderboard` | Leaderboard | **VISNINGS-BYTTE / SEKSJON** | Motivasjon-laget bor på Hjem. |
| `/portal/utfordringer` | Utfordringer-liste | **VISNINGS-BYTTE / SEKSJON** | Motivasjon på Hjem; liste blir seksjon/kort. |
| `/portal/utfordringer/ny` | Ny utfordring (wizard) | **MODAL/WIZARD** | Opprett-flyt som modal fra Hjem-utfordringer. |
| `/portal/utfordringer/[id]` | Utfordring-detalj | **MODAL/WIZARD** | Detalj som modal/overlay over Hjem-seksjon. |
| `/portal/tren/feiring/[planId]` | Feiring (etter plan ferdig) | **MODAL/WIZARD** | Feiring er et øyeblikk, ikke en side — modal/overlay på Hjem. |

## Planlegge

Mål: All planlegging i Workbench (regel 2), zoom årsplan→dag. Ett trykkpunkt fra Planlegge.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/portal/planlegge` | Inngang til Workbench (mobil) | **FANE-PRIMÆR** | Fane-rot; ett trykkpunkt videre til Workbench. |
| `/portal/planlegge/workbench` | Workbench lanserings-hub (hub-faner, zoom, Gantt/Uke/Økt, palette) | **FANE-PRIMÆR** | Selve Workbench — kjernen i Planlegge. |
| `/portal/tren/aarsplan` | Årsplan-oversikt (periodisering) | **UNDERFANE** | Zoom-nivå «Årsplan/År» i Workbench. |
| `/portal/tren/aarsplan/periode/[id]/rediger` | Rediger periode i årsplan | **MODAL/WIZARD** | Periode-redigering som modal i Workbench-Gantt. |
| `/portal/tren/teknisk-plan` | Teknisk plan-liste | **UNDERFANE** | Hub-fane «Teknisk plan» i Workbench. |
| `/portal/tren/teknisk-plan/[planId]` | Teknisk plan-detalj | **VISNINGS-BYTTE / SEKSJON** | Detalj-visning inne i Teknisk plan-fanen. |
| `/portal/tren/fys-plan` | Fys-plan-liste | **UNDERFANE** | Fys-del av Workbench-planen. |
| `/portal/tren/fys-plan/[planId]` | Fys-plan detalj/bygger | **MODAL/WIZARD** | Plan-bygger som wizard inne i fys-fanen. |
| `/portal/mal` | Mål-hub | **UNDERFANE** | Mål bor i Workbench (Sesongmål-fane); redigeres her. |
| `/portal/mal/bygger` | Mål-bygger (wizard, stub) | **MODAL/WIZARD** | Mål-opprettelse som wizard. |
| `/portal/mal/goal/[id]` | Mål-detalj | **VISNINGS-BYTTE / SEKSJON** | Detalj inne i Sesongmål-fanen. |
| `/portal/ai/mal-bygger` | AI: mål-bygger | **MODAL/WIZARD** | AI-assistert mål-wizard fra Workbench. |
| `/portal/ai/foresla-drill` | AI: foreslå drill | **MODAL/WIZARD** | AI-forslag som modal i Workbench/drill-palette. |
| `/portal/ai/foresla-turnering` | AI: foreslå turnering | **MODAL/WIZARD** | AI-forslag-modal (knytter til turneringsplan i årsplan). |
| `/portal/drills` | Drill-bibliotek (filterchips + grid) | **UNDERFANE** | Stall-felles bibliotek = palette/fane i Workbench. |
| `/portal/drills/[id]` | Drill-detalj | **MODAL/WIZARD** | Drill-detalj som modal/overlay fra grid. |
| `/portal/coach/plans` | Coach-planer (plan-liste) | **SLÅTT SAMMEN → /portal/planlegge/workbench** | Plan åpnes fra Workbench/Spiller — ikke egen coach-flate i spiller-app. |
| `/portal/coach/plans/[planId]` | Plan-detalj | **SLÅTT SAMMEN → /portal/planlegge/workbench** | Plan-detalj = Workbench-plan-visning. |
| `/portal/coach/plans/[planId]/ny-okt` | Ny økt i plan | **MODAL/WIZARD** | Legg-til-økt-modal i Workbench (coach-affordance). |
| `/portal/coach/plans/perioder` | Perioder | **SLÅTT SAMMEN → /portal/tren/aarsplan** | Periodisering bor i Workbench-årsplan-zoom (dublett av aarsplan). |
| `/portal/tren/[sessionId]/planlagt` | Planlagt økt | **VISNINGS-BYTTE / SEKSJON** | Planlagt-økt-visning = Økt-fane/kort i Workbench. |

## Gjennomføre

Mål: Dagens økt, kalender, booking-fane, live-økt (fullskjerm), logg + verktøy.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/portal/gjennomfore` | I dag / Kalender / Booking (faner) | **FANE-PRIMÆR** | Selve Gjennomføre-flaten med faner. |
| `/portal/gjennomfore/[id]` | Økt-detalj (V2-økt fra coach) | **VISNINGS-BYTTE / SEKSJON** | Økt-detalj inne i Gjennomføre / pre-live. |
| `/portal/kalender` | Kalender | **UNDERFANE** | Kalender-fane i Gjennomføre. |
| `/portal/tren/kalender` | Kalender (alt. adresse) | **REDIRECT/DROP** | Dublett av `/portal/kalender` — redirect dit. |
| `/portal/ny-okt` | Ny økt (handlingsvalg) | **MODAL/WIZARD** | Opprett-økt-modal fra Gjennomføre. |
| `/portal/onskeligokt` | Ønsket økt (be coach) | **MODAL/WIZARD** | Be-om-økt som modal/skjema. |
| `/portal/onskeligokt/bekreftet` | Ønsket økt bekreftet | **MODAL/WIZARD** | Bekreftelses-steg i samme modal. |
| `/portal/trening/logg` | Logg treningsøkt (volum per SG) | **MODAL/WIZARD** | Logg-flyt som wizard fra Gjennomføre (også nås via `?logg=1`). |
| `/portal/trening/putte-laboratoriet` | Putte-laboratoriet (3 verktøy) | **VISNINGS-BYTTE / SEKSJON** | Verktøy inne i Gjennomføre/økt, ikke egen side. |
| `/portal/trening/break-tabell` | Break-tabell (3 varianter) | **VISNINGS-BYTTE / SEKSJON** | Verktøy inne i Gjennomføre/økt. |
| `/portal/tren/[sessionId]` | Økt-detalj (legacy tren-økt) | **VISNINGS-BYTTE / SEKSJON** | Økt-detalj = Gjennomføre-økt-visning. |
| `/portal/(fullscreen)/tren` | Tren fullskjerm (redirect-stub → workbench) | **REDIRECT/DROP** | Redirect-stub. |
| `/portal/(fullscreen)/live/[sessionId]` | Live-økt rot (router → brief/active) | **FULLSKJERM** | Live-økt-flyt (fullskjerm, ingen shell). |
| `/portal/(fullscreen)/live/[sessionId]/brief` | Live-økt: brief | **FULLSKJERM** | Steg 1 i live-flyten. |
| `/portal/(fullscreen)/live/[sessionId]/active` | Live-økt: aktiv (timer/steg/logg) | **FULLSKJERM** | Kjernen i live-flyten. |
| `/portal/(fullscreen)/live/[sessionId]/logger` | Live-økt: drill-logger | **FULLSKJERM** | Logger-steg i live-flyten. |
| `/portal/(fullscreen)/live/[sessionId]/tapper` | Live-økt: score-tapper | **FULLSKJERM** | Tapper-steg i live-flyten. |
| `/portal/(fullscreen)/live/[sessionId]/summary` | Live-økt: oppsummering | **FULLSKJERM** | Avslutnings-steg i live-flyten. |

## Analysere

Mål: Én flate med faner (regel 1) — SG · Runder · TrackMan · Tester · Statistikk. Ingen spredte adresser.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/portal/analysere` | Analysere: SG/Runder/TrackMan/Tester (faner) | **FANE-PRIMÆR** | Selve Analysere-flaten (har allerede klient-faner). |
| `/portal/analysere/hull` | Hull-analyse | **VISNINGS-BYTTE / SEKSJON** | Hull-visning inne i Runder/Statistikk-fanen. |
| `/portal/mal/sg-hub` | SG-Hub hovedflate | **UNDERFANE** | SG-fanen i Analysere. |
| `/portal/mal/sg-hub/[club]` | Kølle-detalj | **VISNINGS-BYTTE / SEKSJON** | Drill-down inne i SG-fanen. |
| `/portal/mal/sg-hub/benchmark` | Benchmark | **VISNINGS-BYTTE / SEKSJON** | Panel inne i SG-fanen. |
| `/portal/mal/sg-hub/best-vs-now` | Best vs nå | **VISNINGS-BYTTE / SEKSJON** | Panel inne i SG-fanen. |
| `/portal/mal/sg-hub/equipment` | Utstyr | **VISNINGS-BYTTE / SEKSJON** | Panel inne i SG-fanen. |
| `/portal/mal/sg-hub/yardage` | Avstander (yardage) | **VISNINGS-BYTTE / SEKSJON** | Panel inne i SG-fanen. |
| `/portal/mal/sg-hub/conditions` | Forhold (vær/bane) | **VISNINGS-BYTTE / SEKSJON** | Panel inne i SG-fanen. |
| `/portal/mal/sg-hub/strategy` | Strategi | **VISNINGS-BYTTE / SEKSJON** | Panel inne i SG-fanen. |
| `/portal/mal/sg-hub/coach/[spillerId]` | Coach ser spiller-SG | **SLÅTT SAMMEN → AgencyOS** | Coach-visning hører hjemme i AgencyOS Spiller 360/Innsikt, ikke spiller-app. |
| `/portal/mal/sg-hub/coach/[spillerId]/[club]` | Coach: kølle | **SLÅTT SAMMEN → AgencyOS** | Coach-visning → AgencyOS. |
| `/portal/mal/sg-hub/coach/[spillerId]/equipment` | Coach: utstyr | **SLÅTT SAMMEN → AgencyOS** | Coach-visning → AgencyOS. |
| `/portal/mal/runder` | Runder-liste | **UNDERFANE** | Runder-fanen i Analysere. |
| `/portal/mal/runder/[id]` | Runde-detalj | **VISNINGS-BYTTE / SEKSJON** | Detalj inne i Runder-fanen. |
| `/portal/mal/runder/[id]/shot-by-shot` | Slag-for-slag visning | **VISNINGS-BYTTE / SEKSJON** | Drill-down i runde-detalj. |
| `/portal/mal/runder/[id]/slag` | Slag-registrering (wizard + UpGame) | **MODAL/WIZARD** | Registrerings-wizard fra runde-detalj. |
| `/portal/mal/runder/ny` | Logg ny runde | **MODAL/WIZARD** | Opprett-runde-wizard fra Runder-fanen. |
| `/portal/statistikk` | Statistikk-oversikt | **UNDERFANE** | Statistikk-fanen i Analysere. |
| `/portal/statistikk/[metric]` | Metrikk-detalj (935 linjer) | **VISNINGS-BYTTE / SEKSJON** | Metrikk-drill-down inne i Statistikk-fanen. |
| `/portal/statistikk/sammenlign` | Sammenlign (MASTER-rute, ingen fil) | **VISNINGS-BYTTE / SEKSJON** | Sammenlign-visning i Statistikk-fanen. (Ghost: fil mangler.) |
| `/portal/statistikk/runder/[runId]/del` | Del runde | **MODAL/WIZARD** | Del-modal fra runde-visning. |
| `/portal/mal/statistikk` | Statistikk-side (gml.) | **REDIRECT/DROP** | Dublett av `/portal/statistikk` — redirect dit. |
| `/portal/mal/trackman` | TrackMan-liste | **UNDERFANE** | TrackMan-fanen i Analysere. |
| `/portal/mal/trackman/[id]` | TrackMan-sesjon | **VISNINGS-BYTTE / SEKSJON** | Sesjon-detalj inne i TrackMan-fanen. |
| `/portal/trackman/[sessionId]` | TrackMan (alt. adresse) | **REDIRECT/DROP** | Dublett av `mal/trackman/[id]` — redirect dit. |
| `/portal/tren/tester` | Tester-oversikt | **UNDERFANE** | Tester-fanen i Analysere. |
| `/portal/tren/tester/[testId]` | Test-detalj | **VISNINGS-BYTTE / SEKSJON** | Detalj inne i Tester-fanen. |
| `/portal/(fullscreen-test)/tren/tester/[testId]/gjennomfor` | Test-gjennomføring (scorekort) | **FULLSKJERM** | Gjennomførings-flyt (fullskjerm), parallell til live-økt. |
| `/portal/tren/tester/katalog` | Test-katalog (NGF) | **VISNINGS-BYTTE / SEKSJON** | Katalog-velger inne i Tester-fanen. |
| `/portal/tren/tester/ny` | Ny test | **MODAL/WIZARD** | Opprett-test-wizard fra Tester-fanen. |
| `/portal/tren/tester/ny/egen` | Ny egen test | **MODAL/WIZARD** | Egen-test-wizard (gren av ny test). |
| `/portal/mal/baner` | Bane-bibliotek (MASTER-rute, ingen fil) | **VISNINGS-BYTTE / SEKSJON** | Bane-ref i Analysere/runde-kontekst. (Ghost: fil mangler — se baneguide.) |
| `/portal/mal/baner/[id]` | Bane-detalj (MASTER-rute, ingen fil) | **VISNINGS-BYTTE / SEKSJON** | Bane-detalj. (Ghost: fil mangler.) |

## Meg

Mål: Én Meg-flate med seksjoner + få modaler (profil, abonnement-flyt, helse, innstillinger, GDPR).

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/portal/meg` | Meg-hub (profil + meny) | **FANE-PRIMÆR** | Selve Meg-flaten. |
| `/portal/meg/profil` | Profil (visning) | **VISNINGS-BYTTE / SEKSJON** | Profil-seksjon på Meg. |
| `/portal/meg/profil/rediger` | Rediger profil (skjema) | **MODAL/WIZARD** | Rediger-modal fra profil-seksjon. |
| `/portal/meg/abonnement` | Abonnement (gratis/300kr, fakturaer) | **VISNINGS-BYTTE / SEKSJON** | Abonnement-seksjon på Meg. |
| `/portal/meg/abonnement/oppgrader` | Oppgrader (redirect-stub → /flyt) | **REDIRECT/DROP** | Redirect-stub. |
| `/portal/meg/abonnement/oppgrader/flyt` | Oppgrader-flyt | **MODAL/WIZARD** | Oppgrader-wizard fra abonnement-seksjon. |
| `/portal/meg/abonnement/avbestill` | Avbestill | **MODAL/WIZARD** | Avbestill-flyt som modal. |
| `/portal/meg/abonnement/kort/ny` | Nytt kort | **MODAL/WIZARD** | Kort-modal fra abonnement-seksjon. |
| `/portal/meg/abonnement/faktura/[id]` | Faktura-detalj | **MODAL/WIZARD** | Faktura-visning som modal/overlay. |
| `/portal/meg/helse` | Helse (symptomer/belastning) | **VISNINGS-BYTTE / SEKSJON** | Helse-seksjon på Meg. |
| `/portal/meg/helse/symptom/ny` | Nytt symptom | **MODAL/WIZARD** | Logg-symptom-modal fra helse-seksjon. |
| `/portal/meg/innstillinger` | Innstillinger-hub | **VISNINGS-BYTTE / SEKSJON** | Innstillinger-seksjon på Meg. |
| `/portal/meg/innstillinger/varsler` | Varsel-innstillinger | **VISNINGS-BYTTE / SEKSJON** | Innstillings-rad. |
| `/portal/meg/innstillinger/personvern` | Personvern | **VISNINGS-BYTTE / SEKSJON** | Innstillings-rad (GDPR-handlinger som modaler). |
| `/portal/meg/innstillinger/sikkerhet` | Sikkerhet (innstillinger) | **VISNINGS-BYTTE / SEKSJON** | Innstillings-rad. |
| `/portal/meg/innstillinger/sprak` | Språk | **VISNINGS-BYTTE / SEKSJON** | Innstillings-rad. |
| `/portal/meg/innstillinger/anlegg` | Anlegg | **VISNINGS-BYTTE / SEKSJON** | Innstillings-rad. |
| `/portal/meg/innstillinger/integrasjoner` | Integrasjoner (523 linjer) | **VISNINGS-BYTTE / SEKSJON** | Innstillings-rad (kan beholde egen tung underflate). |
| `/portal/meg/innstillinger/eksport` | Eksport (redirect-stub → /personvern) | **REDIRECT/DROP** | Redirect-stub. |
| `/portal/meg/innstillinger/okter` | Økter (innstilling) | **VISNINGS-BYTTE / SEKSJON** | Innstillings-rad. |
| `/portal/meg/innstillinger/ai-coach` | AI-coach-innstilling (IKKE i MASTER) | **VISNINGS-BYTTE / SEKSJON** | Adopteres som innstillings-rad (AI-coach finnes i Coach-sidespor). |
| `/portal/meg/sikkerhet` | Sikkerhet | **VISNINGS-BYTTE / SEKSJON** | Sikkerhet-seksjon på Meg. |
| `/portal/meg/sikkerhet/2fa` | To-faktor (2FA) | **MODAL/WIZARD** | 2FA-oppsett som wizard. |
| `/portal/meg/utstyrsbag` | Utstyrsbag | **VISNINGS-BYTTE / SEKSJON** | Utstyrsbag-seksjon på Meg. |
| `/portal/meg/dokumenter` | Dokumenter | **VISNINGS-BYTTE / SEKSJON** | Dokumenter-seksjon på Meg. |
| `/portal/meg/foreldre` | Foreldre (foresatt-info) | **VISNINGS-BYTTE / SEKSJON** | Foreldre/samtykke-seksjon på Meg. |
| `/portal/meg/feedback` | Feedback | **MODAL/WIZARD** | Feedback-modal fra Meg/Hjelp. |
| `/portal/meg/help` | Hjelpesenter | **VISNINGS-BYTTE / SEKSJON** | Hjelp-seksjon på Meg. |
| `/portal/meg/help/artikkel/[slug]` | Hjelp-artikkel | **VISNINGS-BYTTE / SEKSJON** | Artikkel-visning i Hjelp. |
| `/portal/meg/help/kategori/[slug]` | Hjelp-kategori | **VISNINGS-BYTTE / SEKSJON** | Kategori-visning i Hjelp. |
| `/portal/meg/help/kontakt` | Kontakt | **MODAL/WIZARD** | Kontakt-modal fra Hjelp. |

## Coach (sidespor)

Mål: Meldinger + spørsmål slått sammen til én coach-dialog + Coach-AI.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/portal/coach` | Coach-hub | **FANE-PRIMÆR** | Coach-sidesporets inngang. |
| `/portal/coach/[coachId]` | Coach-profil | **VISNINGS-BYTTE / SEKSJON** | Coach-profil-visning i sidesporet. |
| `/portal/coach/melding` | Meldinger (innboks) | **VISNINGS-BYTTE / SEKSJON** | Innboks-visning i samlet coach-dialog. |
| `/portal/coach/melding/ny` | Ny melding | **MODAL/WIZARD** | Ny-melding-modal. |
| `/portal/coach/melding/[id]` | Meldingstråd | **VISNINGS-BYTTE / SEKSJON** | Tråd-visning i coach-dialog. |
| `/portal/coach/melding/[id]/vedlegg` | Vedlegg | **MODAL/WIZARD** | Vedlegg-modal i tråden. |
| `/portal/coach/sporsmal` | Spørsmål-liste (IKKE i MASTER) | **SLÅTT SAMMEN → /portal/coach/melding** | Spørsmål + meldinger = én innboks (regel: slått sammen). |
| `/portal/coach/sporsmal/[id]` | Spørsmål til coach (tråd) | **SLÅTT SAMMEN → /portal/coach/melding** | Tråd inn i samlet dialog. |
| `/portal/coach/sporsmal/ny` | Nytt spørsmål (IKKE i MASTER) | **SLÅTT SAMMEN → /portal/coach/melding/ny** | Samme jobb som ny melding. |
| `/portal/coach/ai` | Coach-AI | **VISNINGS-BYTTE / SEKSJON** | AI-coach-fane i Coach-sidesporet. |
| `/portal/coach/sg-hub` | Coach SG-hub (IKKE i MASTER) | **SLÅTT SAMMEN → AgencyOS** | Coach-verktøy, ikke spiller-funksjon — hører i AgencyOS. |
| `/portal/coach/notes` | Coach-notater | **VISNINGS-BYTTE / SEKSJON** | Notater fra coach vist i coach-dialog/Hjem-notat. |
| `/portal/coach/notes/[noteId]` | Notat-detalj | **VISNINGS-BYTTE / SEKSJON** | Notat-visning i coach-dialog. |
| `/portal/coach/ovelser` | Coach-øvelser | **SLÅTT SAMMEN → AgencyOS** | Coach-verktøy (opprett/rediger øvelser) — hører i AgencyOS Workbench. |
| `/portal/coach/ovelser/ny` | Ny øvelse | **SLÅTT SAMMEN → AgencyOS** | Coach-verktøy → AgencyOS. |
| `/portal/coach/ovelser/[id]/rediger` | Rediger øvelse | **SLÅTT SAMMEN → AgencyOS** | Coach-verktøy → AgencyOS. |
| `/portal/coach/videoer` | Coach-videoer | **VISNINGS-BYTTE / SEKSJON** | Videoer fra coach vist i coach-dialog. |

## Booking (sidespor)

Mål: Book coach/anlegg + mine bookinger.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/portal/booking` | Booking-hub | **FANE-PRIMÆR** | Booking-sidesporets inngang. |
| `/portal/booking/ny` | Ny booking (wizard, 576 linjer) | **MODAL/WIZARD** | Book-flyt som wizard. |
| `/portal/booking/ny/bekreft` | Ny booking bekreft | **MODAL/WIZARD** | Bekreft-steg i book-wizarden. |
| `/portal/booking/[bookingId]` | Booking-detalj | **VISNINGS-BYTTE / SEKSJON** | Detalj-visning i Booking. |
| `/portal/booking/coach/[coachId]` | Coach-profil (booking) | **VISNINGS-BYTTE / SEKSJON** | Velg-coach-visning i book-flyten. |
| `/portal/booking/anlegg/[anleggId]` | Anlegg-detalj (booking) | **VISNINGS-BYTTE / SEKSJON** | Velg-anlegg-visning i book-flyten. |
| `/portal/booking/bekreftet` | Bekreftet | **MODAL/WIZARD** | Kvitterings-steg. |
| `/portal/meg/bookinger` | Mine bookinger | **VISNINGS-BYTTE / SEKSJON** | «Mine bookinger»-fane i Booking-sidesporet. |
| `/portal/meg/bookinger/reschedule/[bookingId]` | Endre tid (booking) | **MODAL/WIZARD** | Endre-tid-modal fra mine bookinger. |

## Talent (sidespor, utsatt — Elite Fase 2)

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/portal/talent` | Talent-hub | **FANE-PRIMÆR** | Sidesporets inngang (utsatt). |
| `/portal/talent/min-plan` | Min plan (talent) | **VISNINGS-BYTTE / SEKSJON** | Seksjon i Talent-hub. |
| `/portal/talent/mitt-niva` | Mitt nivå (talent) | **VISNINGS-BYTTE / SEKSJON** | Seksjon i Talent-hub. |
| `/portal/talent/roadmap` | Roadmap (talent) | **VISNINGS-BYTTE / SEKSJON** | Seksjon i Talent-hub. |
| `/portal/talent/sammenligning` | Sammenligning (talent) | **VISNINGS-BYTTE / SEKSJON** | Seksjon i Talent-hub. |

## Varsler (global bjelle)

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/portal/varsler` | Varslingsliste + marker-som-lest | **FANE-PRIMÆR** | Global bjelle — egen flate nås fra topbar overalt. |

## Drop / aliaser / intern (ikke en fane-flate)

Rene redirect-stubs, aliaser og interne dev-/AI-verktøy som ikke er spiller-funksjoner.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/portal/stats` | Stats (alias → /portal/statistikk) | **REDIRECT/DROP** | 5-liners redirect-alias. |
| `/portal/analyse` | Analyse (alias → /portal/analysere) | **REDIRECT/DROP** | 5-liners redirect-alias. |
| `/portal/tren/ovelser` | Øvelser (alias → /portal/drills) | **REDIRECT/DROP** | 5-liners redirect-alias. |
| `/portal/tren/ovelser/[id]` | Øvelse-detalj (alias → redirect) | **REDIRECT/DROP** | 10-liners redirect-alias. |
| `/portal/baneguide` | Baneguide-liste (IKKE i MASTER) | **REDIRECT/DROP** | Adopteres-eller-droppes: ikke i MASTER. Default drop; adopter ev. inn i Analysere/bane-ref ved beslutning. |
| `/portal/baneguide/[baneId]` | Baneguide-detalj (IKKE i MASTER) | **REDIRECT/DROP** | Som over — ikke i MASTER. |
| `/portal/baneguide/[baneId]/hull/[nr]` | Baneguide hull-detalj (IKKE i MASTER) | **REDIRECT/DROP** | Som over — ikke i MASTER. |
| `/portal/reach` | Reach (oppsøk-verktøy) | **REDIRECT/DROP** | Internt/perifert verktøy — ikke i 5-fane-IA. Avklar adopsjon. |
| `/portal/agent-pipeline` | Agent-pipeline (AI internt) | **REDIRECT/DROP** | Internt AI-verktøy — ut av hoved-IA (jf. AgencyOS `/admin/dev`-prinsipp). |
| `/portal/spiller/[spillerId]` | Se annen spiller (COACH/ADMIN) | **SLÅTT SAMMEN → AgencyOS** | Coach/admin-funksjon — hører i AgencyOS Spiller 360, ikke spiller-app. |

---

## Oppsummering

| Fane / sidespor | Antall ruter |
|---|---|
| Hjem | 7 |
| Planlegge | 20 |
| Gjennomføre | 17 |
| Analysere | 33 |
| Meg | 31 |
| Coach (sidespor) | 17 |
| Booking (sidespor) | 9 |
| Talent (sidespor, utsatt) | 5 |
| Varsler (global) | 1 |
| Drop / alias / intern | 10 |
| **Sum** | **150** |

**~150 ruter → 5 faner + 4 sidespor** (+ fullskjerm-flyter for live-økt og test-gjennomføring,
+ en drop-/intern-bøtte). Tallet er 150 fordi `portal.json` lister to «ghost»-MASTER-ruter uten fil
(`/portal/statistikk/sammenlign`, `/portal/mal/baner`, `/portal/mal/baner/[id]` — 3 ghosts) som er
tatt med i Analysere-tabellen for fullstendighet; de reelle filene er 153 page.tsx, hvorav noen er
rene redirect-stubs.

### Fordeling «Blir til»
- **FANE-PRIMÆR:** 9 (én per fane + sidespor-inngang)
- **UNDERFANE:** 11 (Analysere ×5 hovedfaner: SG/Runder/TrackMan/Tester/Statistikk; Planlegge ×6 hub-faner)
- **VISNINGS-BYTTE / SEKSJON:** ~58
- **MODAL/WIZARD:** ~33
- **FULLSKJERM:** 7 (live-økt ×6 + test-gjennomføring ×1)
- **SLÅTT SAMMEN:** 13 (coach-plans→Workbench, sporsmal→melding, coach-verktøy/SG/spiller→AgencyOS)
- **REDIRECT/DROP:** ~16 (aliaser, redirect-stubs, baneguide/reach/agent-pipeline)

## Ingen funksjon mistet

- **All planlegging** (plan/periodisering/teknisk/fys/mål/drills) samles i **Workbench** under Planlegge — ingen plan-funksjon forsvinner, den blir hub-faner/zoom/modaler.
- **All analyse** (SG-Hub ×10 undersider, runder ×2 adresser, TrackMan ×2 adresser, tester, statistikk ×2 adresser) samles til **én Analysere-flate** med 5 faner — alle paneler beholdt som visnings-bytter/drill-downs.
- **Motivasjon** (streak/milepæler/feiring/utfordringer/leaderboard) er ikke slettet — løftet til **Hjem** som seksjoner/modaler.
- **Coach-dialog:** meldinger + spørsmål slått sammen til én innboks; Coach-AI beholdt. Ingen samtale-funksjon tapt.
- **Live-økt** (5 steg) og **test-gjennomføring** beholdes som dedikerte **fullskjerm-flyter**.
- **Dubletter ryddet:** `analyse↔analysere`, `stats↔statistikk`, `tren/ovelser↔drills`, `tren/kalender↔kalender`, `trackman/[id]↔mal/trackman/[id]`, `mal/statistikk↔statistikk` — alle blir redirect til den kanoniske ruten, funksjonen finnes fortsatt.
- **Coach-verktøy som lekket inn i spiller-appen** (`coach/ovelser*`, `coach/sg-hub`, `mal/sg-hub/coach/*`, `spiller/[spillerId]`) flyttes til **AgencyOS** der de hører hjemme — ikke tapt, flyttet til riktig app.
- **«IKKE i MASTER»-ruter** (baneguide ×3, reach, agent-pipeline, ai-coach-innstilling): ai-coach adopteres som innstilling; baneguide/reach/agent-pipeline markert **adopteres-eller-droppes** (default drop til Anders bestemmer).
