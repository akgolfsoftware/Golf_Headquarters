# Historiske designhenvisninger i kildekoden

Målt 10.09.2026. Dette registeret lister kommentarer og referanser som nevner avviklede designkilder eller slettede DONE-dokumenter. Treffer beviser ikke at aktive Paper-tokens brukes; `check-ingen-paper.mjs` kontrollerer det separat. Ingen av disse henvisningene skal brukes som byggeordre. Gjeldende design velges i `designsystem/README.md`.

Dette er bevart arbeid til faktisk skjermport og avvikskontroll. En automatisk erstatning av ordet Paper med Train-lock ville gitt falske fasitsiteringer.

| Fil | Linjer med historisk henvisning |
|---|---|
| `src/app/(marketing)/(mlegacy)/stats/stats.css` | 12, 13, 15, 16 |
| `src/app/(marketing)/booking/ledige-tider.ts` | 4 |
| `src/app/(marketing)/booking/page.tsx` | 2, 3 |
| `src/app/admin/(fullscreen)/agencyos/live/[sessionId]/page.tsx` | 2 |
| `src/app/admin/(fullscreen)/agencyos/live/page.tsx` | 6 |
| `src/app/admin/(legacy)/layout.tsx` | 5, 6 |
| `src/app/admin/agencyos/ak-stigen/page.tsx` | 3 |
| `src/app/admin/agencyos/loading.tsx` | 3 |
| `src/app/admin/agents/[agentId]/page.tsx` | 7 |
| `src/app/admin/kalender/data.ts` | 93 |
| `src/app/admin/not-found.tsx` | 2 |
| `src/app/admin/plan/maler/page.tsx` | 17 |
| `src/app/admin/profile/page.tsx` | 4 |
| `src/app/admin/spillere/[id]/page.tsx` | 33 |
| `src/app/admin/spillere/ny/page.tsx` | 11 |
| `src/app/admin/spillere/page.tsx` | 35 |
| `src/app/admin/tournaments/[id]/page.tsx` | 14 |
| `src/app/admin/tournaments/dubletter/merge-liste.tsx` | 4 |
| `src/app/admin/trackman/[sessionId]/page.tsx` | 10 |
| `src/app/admin/workspace/notion/page.tsx` | 5 |
| `src/app/error.tsx` | 8 |
| `src/app/forelder/not-found.tsx` | 2 |
| `src/app/forelder/page.tsx` | 5 |
| `src/app/global-error.tsx` | 6 |
| `src/app/globals.css` | 28, 29, 30, 52, 66, 67, 68, 87, 98, 114, 115, 200, 201, 209, 236, 266, 278, 460, 464, 520, 522, 665, 669, 678, 802, 803, 804, 807, 808, 809, 824, 825, 830, 839, 847, 849, 860, 875, 891, 905 |
| `src/app/layout.tsx` | 16 |
| `src/app/manifest.ts` | 13 |
| `src/app/not-found.tsx` | 2 |
| `src/app/offline/page.tsx` | 10 |
| `src/app/portal/(fullscreen)/live/[sessionId]/actions.ts` | 495 |
| `src/app/portal/(fullscreen)/live/[sessionId]/tapper/page.tsx` | 17 |
| `src/app/portal/(fullscreen)/live/[sessionId]/tapper/tapper-shell.tsx` | 4, 5 |
| `src/app/portal/(fullscreen)/runde/live/page.tsx` | 3 |
| `src/app/portal/(fullscreen)/runde/logg/page.tsx` | 3 |
| `src/app/portal/(fullscreen)/tren/tester/[testId]/gjennomfor/page.tsx` | 9, 177 |
| `src/app/portal/(fullscreen)/tren/tester/[testId]/gjennomfor/pei-live-artefakt.tsx` | 16 |
| `src/app/portal/(fullscreen)/tren/tester/[testId]/gjennomfor/scorekort-klient.tsx` | 5, 6 |
| `src/app/portal/(legacy)/layout.tsx` | 5 |
| `src/app/portal/analysere/historikk/page.tsx` | 2, 3 |
| `src/app/portal/analysere/trackman/[id]/page.tsx` | 3 |
| `src/app/portal/booking/page.tsx` | 4 |
| `src/app/portal/coach/tilbakemelding/[oktId]/actions.ts` | 3 |
| `src/app/portal/coach/tilbakemelding/[oktId]/page.tsx` | 2, 3 |
| `src/app/portal/drills/[id]/page.tsx` | 59 |
| `src/app/portal/drills/drills-liste.tsx` | 4, 5 |
| `src/app/portal/drills/error.tsx` | 3 |
| `src/app/portal/drills/page.tsx` | 2, 3 |
| `src/app/portal/gameplan/[baneId]/loading.tsx` | 1 |
| `src/app/portal/gameplan/[baneId]/page.tsx` | 6 |
| `src/app/portal/gjennomfore/[id]/page.tsx` | 2, 3 |
| `src/app/portal/mal/trackman/[id]/page.tsx` | 5 |
| `src/app/portal/mal/trackman/[id]/stability-seksjon.tsx` | 4, 5 |
| `src/app/portal/mal/trackman/gapping/page.tsx` | 3 |
| `src/app/portal/meg/abonnement/faktura/[id]/faktura-document.tsx` | 17 |
| `src/app/portal/meg/abonnement/fortsett/page.tsx` | 5 |
| `src/app/portal/meg/page.tsx` | 9 |
| `src/app/portal/meg/profil/actions.ts` | 5 |
| `src/app/portal/meg/profil/page.tsx` | 3 |
| `src/app/portal/meg/utstyr/page.tsx` | 3 |
| `src/app/portal/not-found.tsx` | 2 |
| `src/app/portal/page.tsx` | 3 |
| `src/app/portal/trackman/[sessionId]/page.tsx` | 8 |
| `src/app/portal/tren/[sessionId]/planlagt/page.tsx` | 2 |
| `src/app/portal/tren/feiring/[planId]/page.tsx` | 2, 3 |
| `src/app/portal/tren/fys-plan/error.tsx` | 3 |
| `src/app/portal/tren/fys-plan/fys-plan-kort.tsx` | 3 |
| `src/app/portal/tren/fys-plan/loading.tsx` | 1 |
| `src/app/portal/tren/fys-plan/ny-plan-knapp.tsx` | 3 |
| `src/app/portal/tren/fys-plan/page.tsx` | 2, 3 |
| `src/app/portal/tren/teknisk-plan/[planId]/page.tsx` | 229 |
| `src/app/portal/tren/teknisk-plan/error.tsx` | 3 |
| `src/app/portal/tren/tester/error.tsx` | 3 |
| `src/app/portal/tren/tester/loading.tsx` | 1 |
| `src/app/portal/tren/turneringer/[id]/page.tsx` | 2, 3 |
| `src/app/portal/tren/turneringer/error.tsx` | 3 |
| `src/app/portal/tren/turneringer/loading.tsx` | 1 |
| `src/app/portal/tren/turneringer/page.tsx` | 2, 3 |
| `src/app/portal/ukesdigest/page.tsx` | 3 |
| `src/app/portal/utenfor-banen/page.tsx` | 2, 3 |
| `src/app/portal/varsler/page.tsx` | 2, 3 |
| `src/app/team-gfgk/deck.css` | 15, 17, 53, 56 |
| `src/app/vedlikehold/page.tsx` | 7 |
| `src/components/admin/v2/AdminAgentDetaljV2.tsx` | 6, 7, 8 |
| `src/components/admin/v2/AdminBookingerV2.tsx` | 4, 5 |
| `src/components/admin/v2/AdminDrillsV2.tsx` | 39 |
| `src/components/admin/v2/AdminGodkjenningerV2.tsx` | 6, 91 |
| `src/components/admin/v2/AdminRecordingTrainLock.tsx` | 10 |
| `src/components/admin/v2/AdminTrackmanTrainLock.tsx` | 8, 11, 12 |
| `src/components/admin/v2/AgencyKalenderV2.tsx` | 660, 718, 777, 781, 1023 |
| `src/components/admin/v2/InnsiktHubV2.tsx` | 7, 19 |
| `src/components/admin/v2/KalenderDetalj.tsx` | 6 |
| `src/components/admin/v2/LiveOktCoachV2.tsx` | 5 |
| `src/components/admin/v2/SpillerDashboardV2.tsx` | 376 |
| `src/components/admin/v2/SpillerProfilPanel.tsx` | 4 |
| `src/components/admin/v2/StallV2.tsx` | 78, 86, 281, 423 |
| `src/components/admin/v2/TrainLockStall.tsx` | 12, 18, 19 |
| `src/components/admin/v2/godkjenninger/AdminGodkjenningerTrainLock.tsx` | 8, 15 |
| `src/components/admin/v2/godkjenninger/tl-inspektor.tsx` | 6 |
| `src/components/admin/v2/innboks/InnboksSaker.tsx` | 6 |
| `src/components/admin/v2/innboks/InnboksSakerTrainLock.tsx` | 7 |
| `src/components/admin/v2/konsoll/KonsollChat.tsx` | 6, 292 |
| `src/components/admin/v2/konsoll/KonsollDeler.tsx` | 6 |
| `src/components/admin/v2/oppsett/AdminEksternLeserTrainLock.tsx` | 6 |
| `src/components/admin/v2/oppsett/AdminGdprTrainLock.tsx` | 6, 12 |
| `src/components/admin/v2/oppsett/AdminIntegrasjonerTrainLock.tsx` | 6 |
| `src/components/admin/v2/oppsett/AdminInviterCoachTrainLock.tsx` | 6 |
| `src/components/admin/v2/oppsett/AdminServiceFormTrainLock.tsx` | 5 |
| `src/components/admin/v2/oppsett/AdminServicesTrainLock.tsx` | 6 |
| `src/components/admin/v2/oppsett/AdminTilgangPerTrenerTrainLock.tsx` | 8, 12 |
| `src/components/admin/v2/oppsett/tl-kit.tsx` | 11, 264 |
| `src/components/admin/v2/tournaments/AdminTurneringerTrainLock.tsx` | 14 |
| `src/components/admin/v2/workspace/AdminWorkspaceNotionTrainLock.tsx` | 12 |
| `src/components/athletic/golfdata/golfdata.css` | 3 |
| `src/components/booking/PolicyBanner.tsx` | 2 |
| `src/components/gruppe-kalender/flere-grupper-kalender.tsx` | 8 |
| `src/components/marketing/landing/MarkedBookingPauset.tsx` | 12 |
| `src/components/marketing/landing/MarkedForsideReise.tsx` | 10 |
| `src/components/marketing/v2/MarkedAnleggDetaljV2.tsx` | 3 |
| `src/components/marketing/v2/MarkedAnleggListeV2.tsx` | 3 |
| `src/components/marketing/v2/MarkedBloggDetaljV2.tsx` | 3 |
| `src/components/marketing/v2/MarkedBloggListeV2.tsx` | 5 |
| `src/components/marketing/v2/MarkedBookingV2.tsx` | 4 |
| `src/components/marketing/v2/MarkedCasesV2.tsx` | 3 |
| `src/components/marketing/v2/MarkedCoachDetaljV2.tsx` | 3 |
| `src/components/marketing/v2/MarkedCoacherListeV2.tsx` | 5 |
| `src/components/marketing/v2/MarkedCoachingV2.tsx` | 2 |
| `src/components/marketing/v2/MarkedCookiesV2.tsx` | 2 |
| `src/components/marketing/v2/MarkedFaqV2.tsx` | 2 |
| `src/components/marketing/v2/MarkedJobbV2.tsx` | 2 |
| `src/components/marketing/v2/MarkedKontaktV2.tsx` | 4 |
| `src/components/marketing/v2/MarkedOmOssV2.tsx` | 2 |
| `src/components/marketing/v2/MarkedPersonvernV2.tsx` | 2 |
| `src/components/marketing/v2/MarkedPriserV2.tsx` | 2 |
| `src/components/marketing/v2/MarkedSuksessV2.tsx` | 2 |
| `src/components/marketing/v2/MarkedTreningsfilosofiV2.tsx` | 2, 6 |
| `src/components/marketing/v2/MarkedTurneringDetaljV2.tsx` | 3 |
| `src/components/marketing/v2/MarkedTurneringerListeV2.tsx` | 3 |
| `src/components/marketing/v2/MarkedVilkarV2.tsx` | 2 |
| `src/components/marketing/v2/kit/PkPrimitives.tsx` | 6, 8 |
| `src/components/marketing/v2/kit/PkShell.tsx` | 6 |
| `src/components/marketing/v2/stats-ramme.tsx` | 96, 97, 98, 110 |
| `src/components/portal/live/LiveActive.tsx` | 190 |
| `src/components/portal/live/LiveBrief.tsx` | 89 |
| `src/components/portal/live/LiveLoopNav.tsx` | 8 |
| `src/components/portal/live/LiveSessionShell.tsx` | 14, 23 |
| `src/components/portal/live/SessionTimer.tsx` | 19 |
| `src/components/portal/live/SpillerVurderingForm.tsx` | 5 |
| `src/components/portal/live/WhyDetails.tsx` | 2 |
| `src/components/portal/runde-logg/runde-etterregistrering-klient.tsx` | 15 |
| `src/components/portal/runde-logg/tommel-sone.tsx` | 16 |
| `src/components/portal/v2/AnalysereV2.tsx` | 128, 417, 969 |
| `src/components/portal/v2/BankIDV2.tsx` | 272 |
| `src/components/portal/v2/BookingHubV2.tsx` | 119 |
| `src/components/portal/v2/CheckEmailV2.tsx` | 284 |
| `src/components/portal/v2/CoachTilbakemeldingV2.tsx` | 4, 5 |
| `src/components/portal/v2/DrillDetaljV2.tsx` | 4, 5 |
| `src/components/portal/v2/FeiringV2.tsx` | 5, 6 |
| `src/components/portal/v2/ForelderBarnDetaljV2.tsx` | 4, 5, 148 |
| `src/components/portal/v2/ForelderV2.tsx` | 9 |
| `src/components/portal/v2/ForgotPasswordV2.tsx` | 456 |
| `src/components/portal/v2/GappingV2.tsx` | 3 |
| `src/components/portal/v2/GuardianConsentV2.tsx` | 724 |
| `src/components/portal/v2/HistorikkFilterSheet.tsx` | 4, 5 |
| `src/components/portal/v2/HistorikkV2.tsx` | 4, 5 |
| `src/components/portal/v2/LoggetUtV2.tsx` | 307 |
| `src/components/portal/v2/MegFortsettV2.tsx` | 8 |
| `src/components/portal/v2/MegProfilV2.tsx` | 5 |
| `src/components/portal/v2/MegV2.tsx` | 13, 377, 474 |
| `src/components/portal/v2/ResetPasswordV2.tsx` | 429 |
| `src/components/portal/v2/SamtykkeVenterV2.tsx` | 449 |
| `src/components/portal/v2/SideChrome.tsx` | 4, 5, 107, 151 |
| `src/components/portal/v2/SignupV2.tsx` | 893 |
| `src/components/portal/v2/TurneringDetaljV2.tsx` | 5, 6 |
| `src/components/portal/v2/TurneringPlanleggerV2.tsx` | 5, 6 |
| `src/components/portal/v2/TurneringerV2.tsx` | 40 |
| `src/components/portal/v2/UkesdigestV2.tsx` | 3 |
| `src/components/portal/v2/UtenforBanenV2.tsx` | 4, 5 |
| `src/components/portal/v2/WorkbenchAarsplan.tsx` | 473 |
| `src/components/portal/v2/WorkbenchV2.tsx` | 1454 |
| `src/components/portal/v2/chat/ArtefaktPanel.tsx` | 5, 54 |
| `src/components/portal/v2/chat/FangstSheet.tsx` | 4 |
| `src/components/portal/v2/chat/PortalChatHjem.tsx` | 13, 18, 31, 79, 139, 274, 310, 320, 857, 967, 1088, 1150 |
| `src/components/portal/v2/chat/PortalHvorforDette.tsx` | 4 |
| `src/components/portal/v2/chat/PortalStegListe.tsx` | 5 |
| `src/components/portal/v2/kalender/IDagITidenArk.tsx` | 13 |
| `src/components/shared/ak-golf-logo.tsx` | 11, 12 |
| `src/components/shared/cookie-banner.tsx` | 24, 73, 74, 126, 194, 235, 252, 277 |
| `src/components/shared/sidebar-brand.tsx` | 15 |
| `src/components/shared/trackman-import-modal.tsx` | 62 |
| `src/components/system/ikke-funnet.tsx` | 3 |
| `src/components/system/side-tilstand.tsx` | 12 |
| `src/components/teknisk-plan/teknisk-plan-visning.tsx` | 4, 5 |
| `src/components/teknisk-plan/teknisk-plan.css` | 9, 12 |
| `src/components/v2/composer.tsx` | 9 |
| `src/components/v2/core.tsx` | 11, 12, 14, 46, 55, 83, 94, 106, 120, 129, 170, 212, 213, 236, 240, 302, 327, 329, 407, 456, 512, 560, 848, 853, 884, 916 |
| `src/components/v2/datavis.tsx` | 944 |
| `src/components/v2/design-lab-v2.tsx` | 372 |
| `src/components/v2/hjelp.tsx` | 91, 92 |
| `src/components/v2/inspektorpanel.tsx` | 7 |
| `src/components/v2/overlays.tsx` | 47, 49, 51, 52, 54, 84, 168, 205, 268, 269, 295, 320 |
| `src/components/v2/samtale.tsx` | 181, 182, 227, 266 |
| `src/components/v2/shell.tsx` | 76, 105, 566 |
| `src/components/v2/skjema.tsx` | 11, 13, 20, 38, 78, 475, 747, 754, 829, 872 |
| `src/components/workbench/wb-tl-scope.ts` | 21, 24 |
| `src/lib/__tests__/check-fasit-sitering.test.ts` | 68, 69, 70 |
| `src/lib/admin/innboks-saker.ts` | 4 |
| `src/lib/admin/stallen-data.ts` | 24 |
| `src/lib/admin/ukesrapport.ts` | 3 |
| `src/lib/admin-spiller/spiller-profil-panel-data.ts` | 2 |
| `src/lib/agencyos/ak-stigen-data.ts` | 5 |
| `src/lib/agencyos/live-okt-actions.ts` | 11 |
| `src/lib/agencyos/live-okt-data.ts` | 3 |
| `src/lib/agencyos/live-tavle-data.ts` | 8 |
| `src/lib/booking/coach-colors.ts` | 5 |
| `src/lib/calendar/notion-grid.test.ts` | 19 |
| `src/lib/calendar/notion-grid.ts` | 7, 13, 52 |
| `src/lib/dashboard-data/schemas.ts` | 6 |
| `src/lib/domain/fangst-chips.test.ts` | 21 |
| `src/lib/domain/fangst-chips.ts` | 2, 9, 73 |
| `src/lib/domain/gapping.ts` | 3 |
| `src/lib/domain/kalender-belegg.ts` | 4 |
| `src/lib/domain/pei/index.ts` | 3 |
| `src/lib/domain/pei/scorekort-motor.test.ts` | 9 |
| `src/lib/domain/program-bucket.ts` | 5 |
| `src/lib/domain/skoletid.ts` | 3 |
| `src/lib/forelder-skoletid.ts` | 3 |
| `src/lib/gameplan/map-colors.ts` | 8 |
| `src/lib/portal/profil-flate-data.ts` | 3 |
| `src/lib/portal/ukesdigest.ts` | 2 |
| `src/lib/portal/utstyr-data.ts` | 3 |
| `src/lib/portal-booking/hub-data.ts` | 57 |
| `src/lib/portal-gjennomfore/gjennomfore-data.ts` | 67 |
| `src/lib/portal-okt/coach-tilbakemelding-data.ts` | 3 |
| `src/lib/portal-okt/okt-detalj-data.ts` | 3, 111, 117, 122 |
| `src/lib/portal-plan/uke-periode.ts` | 4 |
| `src/lib/v2/ak-palett.ts` | 4, 23, 47, 94, 102, 103, 115 |
| `src/lib/v2/format.ts` | 2, 4 |
| `src/lib/v2/tema-default.ts` | 15, 18 |
| `src/lib/v2/train-lock.ts` | 16, 28 |
| `src/styles/golfdata-tokens.css` | 7, 20, 21, 118, 127, 174, 202 |
| `src/styles/marked-kit.css` | 185, 522 |
| `src/styles/train-lock-tokens.css` | 20, 25, 53, 85, 275 |

242 filer har historiske henvisninger. Kode og funksjoner er beholdt.
