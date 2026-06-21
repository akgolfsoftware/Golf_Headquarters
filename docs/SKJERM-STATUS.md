# SKJERM-STATUS.md

> Komplett-gate fra BYGGEORDRE. Én rad per produktrute.
> Oppdateres fortløpende per fase. Sist generert: Phase 0 (2026-06-20).
>
> **Status-koder:** ✅ Ferdig · 🔨 Under arbeid · ⚠ Avvik/blokkert · ❌ Ikke startet · — Redirect/legacy

## Forklaring kolonner

| Kolonne | Beskrivelse |
|---|---|
| Rute | URL-path i appen |
| Referanse | Design-fil fra handover-pakken |
| Bygget | Skjermen finnes og har ekte innhold |
| Knapper | Alle knapper koblet, mål finnes |
| 375 | Mobil OK |
| 768 | Tablet OK |
| 1280 | Desktop OK |
| 4-states | Innhold · tom · laster · feil |
| DoD | Alle DoD-sjekker grønne |

---

## PlayerHQ `/portal` (Fase 3)

| Rute | Referanse | Bygget | Knapper | 375 | 768 | 1280 | 4-states | DoD |
|---|---|---|---|---|---|---|---|---|
| /portal | PlayerHQ Dashboard | ✅ | ✅ | ✅ | ⚠ | ⚠ | ~ | ⚠ |
| /portal/analysere | PlayerHQ Analyse | 🔨 | ✅ | ~ | ⚠ | ⚠ | ~ | ⚠ |
| /portal/analysere/hull | Analyse Hull Sammenlign Putting | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/statistikk | Statistikk-SG | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | ⚠ | BLOKKERT på A–K-nivåsystem (BYGGELOGG-FLAGG B-1) — diagnose-først krever parkert nivå/neste-nivå-motor |
| /portal/statistikk/[metric] | Statistikk-SG (metric-variant) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/statistikk/sammenlign | Statistikk-SG | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/statistikk/runder/[runId]/del | Statistikk-SG | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/trackman/[sessionId] | TrackMan-okt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal | SG-import / On-course logging | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/sg-hub | SG-import | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/sg-hub/benchmark | SG-import | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/sg-hub/best-vs-now | SG-import | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/sg-hub/[club] | SG-import | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/sg-hub/coach/[spillerId] | SG-import | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/sg-hub/conditions | SG-import | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/sg-hub/equipment | SG-import | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/sg-hub/strategy | SG-import | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/sg-hub/yardage | SG-import | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/baner | On-course logging | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/baner/[id] | On-course logging | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/goal/[id] | Plan-Workbench | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/leaderboard | Plan-Workbench | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/milepaeler | Plan-Workbench | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/runder | On-course logging | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/runder/[id] | On-course logging | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/runder/[id]/shot-by-shot | On-course logging | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/runder/[id]/slag | On-course logging | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/runder/ny | On-course logging | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/statistikk | Statistikk-SG | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/trackman | TrackMan-okt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/trackman/[id] | TrackMan-okt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/mal/bygger | Plan-Workbench | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/planlegge | Plan-Workbench | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/planlegge/workbench | Plan-Workbench | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/aarsplan | Plan-Workbench | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/aarsplan/periode/[id]/rediger | Plan-Workbench | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/kalender | Plan-Workbench | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/kalender | Plan-Workbench (K-07: avklar) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/fys-plan | Teknisk plan | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/fys-plan/[planId] | Teknisk plan | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/teknisk-plan | Teknisk plan | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/teknisk-plan/[planId] | Teknisk plan | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/gjennomfore | PlayerHQ Gjennomføre | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/gjennomfore/[id] | PlayerHQ Gjennomføre | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/[sessionId]/planlagt | Start-okt L-faser | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/(fullscreen-test)/tren/tester/[testId]/gjennomfor | Start-okt L-faser | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/ny-okt | PlayerHQ Gjennomføre | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/onskeligokt | PlayerHQ Gjennomføre | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/onskeligokt/bekreftet | PlayerHQ Gjennomføre | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/[coachId] | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/melding | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/melding/[id] | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/melding/[id]/vedlegg | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/melding/ny | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/notes | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/notes/[noteId] | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/ovelser | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/ovelser/[id]/rediger | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/ovelser/ny | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/plans | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/plans/[planId] | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/plans/[planId]/ny-okt | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/plans/perioder | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/sg-hub | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/sporsmal/[id] | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/videoer | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/coach/ai | Flyt - Coach-dialog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/talent | Mot proffene | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/talent/min-plan | Mot proffene | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/talent/mitt-niva | Mot proffene | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/talent/roadmap | Mot proffene | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/talent/sammenligning | Mot proffene | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/utfordringer | Flyt - Talent og utfordringer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/utfordringer/[id] | Flyt - Talent og utfordringer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/utfordringer/ny | Flyt - Talent og utfordringer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/reach | Mot proffene | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/spiller/[spillerId] | Mot proffene | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/turneringer | Turneringsdetalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/turneringer/[id] | Turneringsdetalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/turneringer/ny | Turneringsdetalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/tester | mønster + skjermkart | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/tester/[testId] | mønster + skjermkart | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/tester/katalog | mønster + skjermkart | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/tester/ny | mønster + skjermkart | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/tren/tester/ny/egen | mønster + skjermkart | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/drills | mønster + skjermkart | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/drills/[id] | mønster + skjermkart | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg | Meg long-tail komplett | ✅ | ✅ | ✅ | ⚠ | ⚠ | ~ | ⚠ |
| /portal/meg/profil | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/profil/rediger | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/abonnement | Meg-abonnement | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/abonnement/avbestill | Meg-abonnement | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/abonnement/faktura/[id] | Meg-abonnement | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/bookinger | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/dokumenter | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/feedback | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/foreldre | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/helse | Meg Helse og Sikkerhet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/helse/symptom/ny | Meg Helse og Sikkerhet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/help | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/help/artikkel/[slug] | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/help/kategori/[slug] | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/help/kontakt | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/innstillinger | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/innstillinger/ai-coach | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/innstillinger/anlegg | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/innstillinger/integrasjoner | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/innstillinger/okter | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/innstillinger/personvern | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/innstillinger/sikkerhet | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/innstillinger/sprak | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/innstillinger/varsler | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/sikkerhet | Meg Helse og Sikkerhet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/sikkerhet/2fa | Meg Helse og Sikkerhet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/utstyrsbag | Meg Utstyr Dokumenter Innstillinger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/varsler | mønster | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/booking | Flyt - Booking | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/booking/[bookingId] | Flyt - Booking | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/booking/anlegg/[anleggId] | Flyt - Booking | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/booking/bekreftet | Flyt - Booking | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/booking/coach/[coachId] | Flyt - Booking | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/ai/foresla-drill | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/ai/foresla-turnering | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/ai/mal-bygger | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/agent-pipeline | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## AgencyOS `/admin` (Fase 4)

| Rute | Referanse | Bygget | Knapper | 375 | 768 | 1280 | 4-states | DoD |
|---|---|---|---|---|---|---|---|---|
| /admin/agencyos | AgencyOS Cockpit | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/agencyos/caddie | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/agencyos/caddie/aktivitet | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/agencyos/live | Live-okt coach | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/agencyos/okonomi | Cockpit v2 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/agencyos/spillere | Stall responsiv | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/agencyos/uka | Cockpit v2 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere | Stall responsiv / Stall v2 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/[id] | Spiller-detalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/[id]/fremgang | Spiller-detalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/[id]/plan/[planId] | Spiller-detalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/[id]/profil | Spiller-detalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/[id]/rediger | Spiller-detalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/[id]/tester | Spiller-detalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/[id]/tildel-test | Spiller-detalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/ny | Stall v2 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/stall | Stall responsiv | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/grupper | Stall v2 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/grupper/[id] | Stall v2 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/planlegge | Plans og Maler | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/plans | Plans og Maler | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/plans/[planId] | Plans og Maler | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/plans/new | Plans og Maler | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/plan-templates | Plans og Maler | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/plan-templates/ny | Plans og Maler | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/plan-templates/[id] | Plans og Maler | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/plan-templates/[id]/rediger | Plans og Maler | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/plan-templates/[id]/effectiveness | Plans og Maler | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/teknisk-plan | Coach-skill | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/teknisk-plan/[spillerId] | Coach-skill | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/drills | mønster | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/drills/[id] | mønster | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/drills/[id]/rediger | mønster | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/drills/ny | mønster | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tester | Test-bygger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tester/[id] | Test-bygger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tester/benchmarks | Test-bygger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tester/foreslatte | Test-bygger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tester/tildel/[spillerId] | Test-bygger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/kalender | Kalender | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/kalender/maned | Kalender | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/bookinger | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/bookinger/ny | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/kapasitet | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/availability | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/locations | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/facilities | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/facilities/[id] | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/services | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/gjennomfore | Gjennomfore-hub | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/gjennomfore/okter/[id] | Gjennomfore-hub | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/live/[sessionId]/active | Live-okt coach | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/live/[sessionId]/brief | Live-okt coach | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/live/[sessionId]/summary | Live-okt coach | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/recording | Opptak og video | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/trackman | TrackMan-okt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/videoer | Opptak og video | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/innboks | Flyt - AgencyOS Handlingssenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/kommunikasjon | Flyt - AgencyOS Handlingssenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/queue | Flyt - AgencyOS Handlingssenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/foresporsler | Flyt - AgencyOS Handlingssenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/godkjenninger | Flyt - AgencyOS Handlingssenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/godkjenninger/[id] | Flyt - AgencyOS Handlingssenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/handlingssenter | Flyt - AgencyOS Handlingssenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/analyse | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/analysere | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/analysere/compliance | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/analytics | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/lag-snitt | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/runder | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tilstander | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/reports | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent/[playerId] | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent/discovery | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent/kohort | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent/radar | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent/radar/[playerId] | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent/region | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent/ressurser | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent/sammenligning | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent/wagr-benchmark | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/talent/wagr-import | DataGolf-verktoy | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/caddie | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/agents | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/agents/[agentId] | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace/notion | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace/oppgaver | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace/oppgaver/[id] | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace/prosjekter | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace/tildelt-meg | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/okonomi | mønster + KPI-primitiver | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/organisasjon | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/settings | Innstillinger-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/settings/api | Innstillinger-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/settings/calendar | Innstillinger-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/settings/security | Innstillinger-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/settings/tilgang | Innstillinger-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/profile | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/mer | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/hjelp | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/brief | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/reach | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/team | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/team/inviter | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/integrasjoner | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/audit-log | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/audit-log/[id] | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/stats/moderering | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/stats/overview | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/risiko | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/oppfolging | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/okter | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/email-templates | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/email-templates/[id]/rediger | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/anlegg | K-09: avklar vs /admin/locations | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/anlegg/[id] | K-09: avklar vs /admin/facilities | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tournaments | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tournaments/[id] | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tournaments/dubletter | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tournaments/ny | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Forelderportal `/forelder` (Fase 5.3)

| Rute | Referanse | Bygget | Knapper | 375 | 768 | 1280 | 4-states | DoD |
|---|---|---|---|---|---|---|---|---|
| /forelder | Forelderportal | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /forelder/barn/[childId] | Forelderportal | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /forelder/bookinger | Forelderportal | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /forelder/fakturaer | Forelderportal | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /forelder/samtykke | Forelderportal | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /forelder/ukerapport | Forelderportal | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Auth & Onboarding (Fase 5.1)

| Rute | Referanse | Bygget | Knapper | 375 | 768 | 1280 | 4-states | DoD |
|---|---|---|---|---|---|---|---|---|
| /auth/login | Auth Innlogging | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /auth/forgot-password | Auth Registrering og passord | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /auth/reset-password | Auth Registrering og passord | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /onboard/spiller | PlayerHQ Onboarding | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Booking (Fase 5.2)

| Rute | Referanse | Bygget | Knapper | 375 | 768 | 1280 | 4-states | DoD |
|---|---|---|---|---|---|---|---|---|
| /(marketing)/booking | Flyt - Booking | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/booking/[slug]/bekreft | Flyt - Booking | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/booking/kvittering/[bookingId] | Flyt - Booking | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Marketing `/(marketing)` (Fase 5.4)

| Rute | Referanse | Bygget | Knapper | 375 | 768 | 1280 | 4-states | DoD |
|---|---|---|---|---|---|---|---|---|
| /(marketing) | Marketing Hjem | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/coaching | Marketing Undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/playerhq | Marketing Undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/priser | Marketing Undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/om-oss | Marketing Undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/coacher | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/coacher/[slug] | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/anlegg | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/anlegg/[slug] | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/blogg | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/blogg/[slug] | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/cases | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/faq | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/jobb | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/junior | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/kontakt | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/cookies | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/personvern | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/vilkar | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/treningsfilosofi | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/turneringer | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/suksess | Marketing Rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Stats-plattform `/(marketing)/stats` (Fase 6)

| Rute | Referanse | Bygget | Knapper | 375 | 768 | 1280 | 4-states | DoD |
|---|---|---|---|---|---|---|---|---|
| /(marketing)/stats | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/2026 | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/aargang | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/aargang/[aar] | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/baner | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/baner/[slug] | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/blogg | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/blogg/[slug] | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/klubber | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/klubber/[slug] | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/leaderboards | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/norske | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/pga | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/pga/drive-distance | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/pga/fairway-pct | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/pga/gir-pct | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/pga/putt-explorer | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/pga/putts-per-round | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/pga/scoring-avg | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/pga/sg-total | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/pga/spillere | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/pga/spillere/[dg_id] | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/quiz | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/regions | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/regions/[slug] | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/sammenlign-spillere | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/sg-sammenlign | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/sok | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/spillere | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/spillere/[slug] | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/tour/[slug] | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/turneringer | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/turneringer/[slug] | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/turneringer/[slug]/statistikk | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/uka | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/verktoy | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/verktoy/avstand | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/verktoy/score-til-hcp | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/verktoy/sg-estimator | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/verktoy/tour-ekvivalent | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/verktoy/whs-kalkulator | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /(marketing)/stats/wrapped/[slug] | Stats-plattform | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Redirect-ruter (legacy — ikke build-mål)

Disse eksisterer kun som permanente redirects og trenger ikke implementeres:

- `/admin` → `/admin/agencyos`
- `/admin/approvals` → `/admin/godkjenninger`
- `/admin/approvals/[id]` → `/admin/godkjenninger/[id]`
- `/admin/calendar` + `/admin/calendar/maned` → `/admin/kalender`
- `/admin/board` → `/admin/spillere?view=tavle`
- `/admin/finance` → (uklar)
- `/admin/messages` → (uklar)
- `/admin/plans/templates/*` → `/admin/plan-templates/*` (K-02: avklar)
- `/portal/analyse` → `/portal/analysere`
- `/portal/stats` → `/portal/statistikk`
- `/portal/(fullscreen)/live/*` → (abonnements-gate)
- `/portal/planlegge/workbench` → `/portal/planlegge` (alias)

---

*Oppdater denne filen fortløpende. Null rader med ❌ ved komplett-gate.*
