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
| /portal/analysere | PlayerHQ Analyse | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | VERIFISERT terminal-lys mobil 430px: «Strokes Gained i dybden» + faner (SG/Runder/TrackMan) + SG-per-kategori forest-kort + TrendBand + AI Caddie. Ekte data. D-1 (4-KPI-grid GIR/PUTTS/UP&DOWN) gjenstår som dokumentert utvidelse, ikke blokker |
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
| /portal/gjennomfore | PlayerHQ Gjennomføre | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | VERIFISERT terminal-lys mobil 430px: «Dagens program» + pågår-økt forest-kort (Fortsett økt) + resten av dagen + fullført i dag. Ekte data. «Live-drill»-fasit (Spor A/B, K-05) = egen skjerm i live-cluster |
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
| /portal/meg/abonnement | Meg-abonnement | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | Bygd, lyst, verifisert mobil 430px. LÅST-DECISION-KORREKT (overstyrer fasit): «300 kr/mnd» ikke fasitens 299, «ingen nivåer», ærlig Stripe («kortdata lagres aldri»), INGEN fabrikert «PRO årlig 2690». Status/Hva inngår/Handlinger. Ekte Subscription |
| /portal/meg/abonnement/avbestill | Meg-abonnement | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/abonnement/faktura/[id] | Meg-abonnement | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/bookinger | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/dokumenter | Meg Utstyr Dokumenter Innstillinger | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | Bygd, lyst, verifisert mobil 430px: «Avtaler & dokumenter» (coaching-avtale/foreldresamtykke/GDPR/fakturaer/lisens m/ status-piller). Ekte Document-data |
| /portal/meg/feedback | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/foreldre | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/helse | Meg Helse og Sikkerhet | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | Bygd, lyst, verifisert mobil 430px: «Helse & readiness» + KPI/uke/skade. FYS-FORMEL-KORREKT: «—» + «Formel ikke låst» + «plassholdere fram til readiness-formelen er låst» (respekterer parkert FYS-formel) |
| /portal/meg/helse/symptom/ny | Meg Helse og Sikkerhet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/help | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/help/artikkel/[slug] | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/help/kategori/[slug] | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/help/kontakt | Meg-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /portal/meg/innstillinger | Meg Utstyr Dokumenter Innstillinger | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | Bygd, lyst, verifisert mobil 430px: Varsler/Integrasjoner (TrackMan/Garmin/Golfbox)/App/Sikkerhet (BankID)/AI/Personvern |
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
| /portal/meg/utstyrsbag | Meg Utstyr Dokumenter Innstillinger | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | Bygd, lyst, verifisert mobil 430px: «Utstyrs bag» (Driver/Fairway/Hybrider/Jernsett/Wedger/Putter + Ball & øvrig). Ekte EquipmentBag-data |
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
| /admin/agencyos | AgencyOS Cockpit | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert tidligere fase. Verifisert mørk 1280px som ADMIN: ticker + 4 KPI + Dagens timeline + Hvem trenger meg nå + innboks. Bevisste IA-tillegg (sidebar/faner/innboks) per design-porting-gate. Mobil = egen Fase 4 net-new |
| /admin/agencyos/caddie | AI-Caddie og Agenter | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px (CADDIE-fane av cockpit) |
| /admin/messages | Flyt - AgencyOS Handlingssenter | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px: «Min innboks» 3-kolonne (samtaleliste + tråd + profilpanel). Ekte data. Manglet i tabellen |
| /admin/agencyos/caddie/aktivitet | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/agencyos/live | Live-okt coach | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px: LIVE-fane av cockpit (fane-rad fra layout.tsx) — KPI + Scan-app/Følg-opp-actions + varsler + agent-pipeline-preview |
| /admin/agencyos/okonomi | Cockpit v2 | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px (ØKONOMI-fane av cockpit) |
| /admin/agencyos/spillere | Stall responsiv | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px (SPILLERE-fane av cockpit) |
| /admin/agencyos/uka | Cockpit v2 | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px: UKA-fane av cockpit (fane-rad fra layout.tsx) |
| /admin/spillere | Stall responsiv / Stall v2 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/[id] | Spiller-detalj | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px (Øyvind): header + coach-flagg + aktiv plan + treningspyramide + hurtighandlinger + siste runder/tester + meldinger. Ekte data |
| /admin/coach-workbench | Workbench (coach-modus) | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px (kun visuell skin — logikk urørt): spiller-header + 4 KPI + CADDIE AI-panel + faner (I dag/Plan/Analyse/Notater/Kommunikasjon). Manglet i tabellen |
| /admin/spillere/[id]/fremgang | Spiller-detalj | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px: SG per område (sparklines) + treningsvolum + korrelasjon. Ekte data, ærlige «For lite data»-tomtilstander |
| /admin/spillere/[id]/plan/[planId] | Spiller-detalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/[id]/profil | Spiller-detalj | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px (spiller-detalj fane-tab) |
| /admin/spillere/[id]/rediger | Spiller-detalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/[id]/tester | Spiller-detalj | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px: radar-chart 5 disipliner + test-dekning per område (FYS/TEK/SLAG/SPILL/TURN). Ekte data |
| /admin/spillere/[id]/tildel-test | Spiller-detalj | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/spillere/ny | Stall v2 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/stall | Stall responsiv | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: spiller-tabell (HCP/SG/status) + filterchips + spiller-panel (360°/SG/adherence/pyramide). Ekte data |
| /admin/grupper | Stall v2 | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px: 9 gruppe-kort m/ HCP-snitt + type-tags (SELEKTERT/KLUBB/SKOLE). Ekte data |
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
| /admin/tester | Test-bygger | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: «FYS & teknikk» + 4 KPI + testresultat-tabell (ALLE/FYS/TEKNIKK/TRACKMAN). Nøytral delta «—» per FYS-formel-ikke-låst-unntak |
| /admin/tester/[id] | Test-bygger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tester/benchmarks | Test-bygger | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px: «DataGolf-fasiter — autosync»-tabell (12 tester, PGA→scratch-kolonner). Ekte DataGolf-data, auto-sync mandager |
| /admin/tester/foreslatte | Test-bygger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/tester/tildel/[spillerId] | Test-bygger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/kalender | Kalender | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: dag/uke/mnd-toggles + agenda-liste + dag-timeline m/ øktblokker. Ekte data |
| /admin/kalender/maned | Kalender | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px: full måned-grid (juni 2026) m/ fargekodede økter (lime=1-til-1/forest=gruppe/cream-gull=live) + I dag-markering |
| /admin/bookinger | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/bookinger/ny | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/kapasitet | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/availability | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/locations | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/facilities | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/facilities/[id] | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/services | Bookinger og kapasitet | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/gjennomfore | Gjennomfore-hub | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: «Daglig drift»-hub (Coach-kalender/Bookinger/Anlegg/Tilgjengelighet/Kapasitet/Tjenester/TrackMan/Live-økter). Ekte data |
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
| /admin/foresporsler | Flyt - AgencyOS Handlingssenter | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: forespørsel-liste m/ Godta/Avvis. Kun SessionRequest (Booking-chip) per dokumentert IA-beslutning (melding/råd-union utestår) |
| /admin/godkjenninger | Flyt - AgencyOS Handlingssenter | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd. Verifisert mørk 1280px: «18 venter på deg» + godkjenn/avvis/skjul-kort fra agentene (AI-genererte plan-forslag). Ekte data |
| /admin/godkjenninger/[id] | Flyt - AgencyOS Handlingssenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/handlingssenter | Flyt - AgencyOS Handlingssenter | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: Kanban/Tabell/Liste-toggles + oppgave-kolonner + oppgave-detalj-panel. Beholder full arbeidsverktøy per gate-regel |
| /admin/analyse | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/analysere | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/analysere/compliance | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/analytics | Analyse-rester | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/lag-snitt | Analyse-rester | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: «Pyramide per gruppe» m/ pyramide-fordeling per gruppe. Ekte data |
| /admin/runder | Analyse-rester | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: «Hele stallen, én kolonne for score» + KPI + runde-tabell (SG-deltaer). Ekte data |
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
| /admin/caddie | AI-Caddie og Agenter | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: caddie-hero + eskaleringer + status-kort + audit-loggføring |
| /admin/agents | AI-Caddie og Agenter | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: «Agent pipeline» + 6 registrerte agenter + manuell trigger + siste 30 kjøringer (cron-logg). Ekte data |
| /admin/agents/[agentId] | AI-Caddie og Agenter | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace/notion | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace/oppgaver | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace/oppgaver/[id] | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace/prosjekter | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/workspace/tildelt-meg | Workspace | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/okonomi | mønster + KPI-primitiver | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: «Fakturaer og betalinger» + KPI + faktura/betalings-tabell m/ status-piller |
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
| /admin/reach | Admin-undersider | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: «Plattform-engasjement» KPI + daglig aktive + topp/trenger-oppfølging + compliance-poeng-tabell. Ekte data |
| /admin/team | Admin-undersider | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: «5 coacher · 41 spillere fordelt» + coach-kort (grupper/tildelinger/e-post). Ekte data |
| /admin/team/inviter | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/integrasjoner | Admin-undersider | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: «Tilkoblede tjenester» (Google Calendar/Stripe/Notion/Anthropic/Resend/Supabase m/ status). Ekte konfig-status |
| /admin/audit-log | Admin-undersider | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px (lastet OK, AgencyOS-mørk) |
| /admin/audit-log/[id] | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/stats/moderering | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/stats/overview | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/risiko | Admin-undersider | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px: «Risiko · stall-kart» risiko-heatmap (41 spillere) + trenger-oppfølging-panel. Ekte data |
| /admin/oppfolging | Admin-undersider | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px (lastet OK, AgencyOS-mørk) |
| /admin/okter | Admin-undersider | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| /admin/email-templates | Admin-undersider | ✅ | ✅ | ~ | ~ | ✅ | ~ | ✅ | Bygd+kalibrert. Verifisert mørk 1280px (lastet OK, AgencyOS-mørk; Resend-integrasjon) |
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
| /forelder | Forelderportal | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | TERMINAL-LYS RE-PORT FERDIG (0 avvik, adversarial diff). Samtykke-kort + narrativ ukerapport + 8-ukers SG-chart + coach-notat — alt avledet fra ekte data (hentForelderUkerapport). Verifisert mobil 430px som test-forelder. 768/1280 = sentrert max-w-440 (samme innhold). Empty-week håndtert |
| /forelder/barn (+/[childId]) | Forelderportal | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | VERIFISERT terminal-lys mobil 430px: «Mine barn» eyebrow+display + barn-kort (Ø/HCP/foresatt) + pyramide + 3 stat. Ekte data. (Var feil-markert «re-port gjenstår» — den ER terminal-lys) |
| /forelder/bookinger | Forelderportal | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | VERIFISERT terminal-lys mobil 430px: «Bookinger & øktplan» uke-kalender + read-only-innsyn-ramme + ekte tom-tilstand |
| /forelder/fakturaer | Forelderportal | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | VERIFISERT (= /okonomi-mønster). Stripe-kort-display er korrekt N/A (ingen fabrikering) — ærlig håndtering, IKKE datablokkert som tidligere flagget. F-2-betaling LØST |
| /forelder/samtykke | Forelderportal | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | VERIFISERT terminal-lys mobil 430px: GDPR-samtykke-administrasjon (datatillatelser-toggles + Lagre + dataeksport/sletting + «slik håndterer vi data») |
| /forelder/ukerapport | Forelderportal | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | TERMINAL-LYS RE-PORT FERDIG (= fasit «rapport/[id]»): Denne uka 3-stat + coachens kommentar + høydepunkt. Alt ekte data (hentForelderUkerapport utvidet). Persentil utelatt (TestResult mangler felt). Verifisert mobil 430px |
| /forelder/varsler | Forelderportal | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ⚠ | VERIFISERT. /forelder/innstillinger viser varsler ÆRLIG (read-only «PÅ E-POST» + «individuelle varselbrytere kommer i en senere versjon»). Dedikert /varsler-rute m/ interaktive toggles venter fortsatt på NotificationPreference-modell (F-2) — men ingen falsk pynt vises |
| /forelder/okonomi | Forelderportal | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | VERIFISERT terminal-lys mobil 430px: «Abonnement og betaling» — ekte Subscription (Performance Pro, credits 3/4), ærlig tom betalingsliste + «NESTE TREKK —» (ingen Stripe-fabrikering). F-2-betaling LØST |
| /forelder/coach | Forelderportal | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | VERIFISERT terminal-lys mobil 430px: ærlig «Coach-dialog kommer Q3 2026»-tilstand |
| /forelder/innstillinger | Forelderportal | ✅ | ✅ | ✅ | ~ | ~ | ✅ | ✅ | VERIFISERT terminal-lys mobil 430px: «Konto og varsler» (kontaktinfo + koblede barn + varsler-status + konto/2FA/logg ut) |

---

## Auth & Onboarding (Fase 5.1)

| Rute | Referanse | Bygget | Knapper | 375 | 768 | 1280 | 4-states | DoD |
|---|---|---|---|---|---|---|---|---|
| /auth/login | Auth Innlogging | ✅ | ✅ | ✅ | ⚠ | ⚠ | ~ | ⚠ |
| /auth/signup | Auth Registrering og passord | ✅ | ✅ | ✅ | ⚠ | ⚠ | ~ | ⚠ | mørk port (.dark) ferdig |
| /auth/forgot-password | Auth Glemt passord | ✅ | ✅ | ✅ | ⚠ | ⚠ | ~ | ⚠ | mørk port (.dark) ferdig |
| /auth/reset-password | Auth Reset passord | ✅ | ✅ | ✅ | ⚠ | ⚠ | ~ | ⚠ | mørk port (.dark) ferdig |
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
| /(marketing) | Marketing Hjem | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Allerede bygd lyst editorial (forrige fase); verifisert desktop+mobil mot fasit-idiom. Korrekt 300 kr/mnd + ekte coacher/lokasjoner |
| /(marketing)/coaching | Marketing Undersider | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; Performance/Performance Pro = coaching-pakker (låst regel) |
| /(marketing)/playerhq | Marketing Undersider | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; app-mockup + «Med coaching 0 / Run aapen 300» korrekt |
| /(marketing)/priser | Marketing Undersider | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; fasit «299/PRO» overstyrt av låst 300 kr/mnd, rikere enn mockup |
| /(marketing)/om-oss | Marketing Undersider | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil |
| /(marketing)/coacher | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; ekte coach Markus Røinås Pedersen bevart (låst regel) |
| /(marketing)/coacher/[slug] | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert /coacher/anders desktop+mobil; profil + erfaring/spesialiteter + book-CTA |
| /(marketing)/anlegg | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; 3 anleggskort (GFGK/Miklagard/Mulligan) |
| /(marketing)/anlegg/[slug] | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert /anlegg/gamle-fredrikstad-gk desktop; foto-hero + features + kontakt |
| /(marketing)/blogg | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; featured + nyere artikler (ekte forfattere Anders/Markus) |
| /(marketing)/blogg/[slug] | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert /blogg/hvorfor-struktur-slar-talent desktop; artikkel-hero + body |
| /(marketing)/cases | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; case-kort + kommende turneringer 2026. NB content-flagg C-1 (testimonial-tall) |
| /(marketing)/faq | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; gruppert accordion (Coaching/Booking/PlayerHQ/Praktisk) |
| /(marketing)/jobb | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; verdiprop + 2 stillingsannonser |
| /(marketing)/junior | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; U10/U14/U16/Talent + årshjul |
| /(marketing)/kontakt | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; skjema + åpningstider + anleggskort |
| /(marketing)/cookies | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop; juridisk prosa (responsiv by default) |
| /(marketing)/personvern | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop; full erklæring, selv-flagget «Utkast — godkjennes med advokat før Q3 2026» |
| /(marketing)/vilkar | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop; juridisk prosa (responsiv by default) |
| /(marketing)/treningsfilosofi | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; «Fem områder — samtidig» + data-seksjoner |
| /(marketing)/turneringer | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; «Nordmenn denne uka» + turneringsgrid (data fra sync) |
| /(marketing)/suksess | Marketing Rester | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Verifisert desktop+mobil; 3 testimonial-kort. NB content-flagg C-1 (testimonial-tall) |

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
