/**
 * Mapping mellom PlayerHQ-ruter og designfilere i public/design-handover/.
 * Brukt av /admin/godkjenn-portal for godkjenning av sider mot design-handoff.
 */

export type RouteEntry = {
  route: string;
  label: string;
  category:
    | "Hovedmeny"
    | "Mål"
    | "Tren"
    | "Coach"
    | "Booking"
    | "Min profil"
    | "AI"
    | "Live"
    | "Annet";
  designPath?: string;
};

export const PORTAL_ROUTES: RouteEntry[] = [
  // Hovedmeny (13)
  { route: "/portal", label: "Hjem (Dashboard)", category: "Hovedmeny", designPath: "/design-handover/playerhq/workbench-v2.html" },
  { route: "/portal/planlegge", label: "Planlegge", category: "Hovedmeny", designPath: "/design-handover/planlegge/index.html" },
  { route: "/portal/gjennomfore", label: "Gjennomføre", category: "Hovedmeny" },
  { route: "/portal/analysere", label: "Analysere", category: "Hovedmeny" },
  { route: "/portal/coach", label: "Coach (hub)", category: "Hovedmeny" },
  { route: "/portal/meg", label: "Min profil", category: "Hovedmeny" },
  { route: "/portal/talent", label: "Talent", category: "Hovedmeny" },
  { route: "/portal/varsler", label: "Varsler", category: "Hovedmeny", designPath: "/design-handover/playerhq/varsel-senter.html" },
  { route: "/portal/statistikk", label: "Statistikk", category: "Hovedmeny", designPath: "/design-handover/playerhq/resultater-stats.html" },
  { route: "/portal/mal", label: "Mål", category: "Hovedmeny", designPath: "/design-handover/planlegge/planlegge-mal.html" },
  { route: "/portal/booking", label: "Booking", category: "Hovedmeny" },
  { route: "/portal/kalender", label: "Kalender", category: "Hovedmeny" },
  { route: "/portal/drills", label: "Drills", category: "Hovedmeny", designPath: "/design-handover/playerhq/drill-bibliotek.html" },

  // Mål-modul (baneguide/banekart fjernet i V1 — MASTER §5)
  { route: "/portal/mal/bygger", label: "Mål-bygger", category: "Mål" },
  { route: "/portal/mal/goal/[id]", label: "Mål-detalj", category: "Mål" },
  { route: "/portal/mal/leaderboard", label: "Leaderboard", category: "Mål" },
  { route: "/portal/mal/milepaeler", label: "Milepæler", category: "Mål" },
  { route: "/portal/mal/runder", label: "Runder", category: "Mål", designPath: "/design-handover/playerhq/runde-detalj.html" },
  { route: "/portal/mal/runder/[id]", label: "Runde-detalj", category: "Mål", designPath: "/design-handover/playerhq/runde-detalj.html" },
  { route: "/portal/mal/runder/[id]/shot-by-shot", label: "Shot-by-shot", category: "Mål" },
  { route: "/portal/mal/runder/ny", label: "Ny runde", category: "Mål", designPath: "/design-handover/playerhq/legg-til-runde.html" },
  { route: "/portal/mal/sg-hub", label: "SG-hub", category: "Mål" },
  { route: "/portal/mal/sg-hub/conditions", label: "SG · Conditions", category: "Mål" },
  { route: "/portal/mal/sg-hub/equipment", label: "SG · Equipment", category: "Mål" },
  { route: "/portal/mal/sg-hub/strategy", label: "SG · Strategy", category: "Mål" },
  { route: "/portal/mal/sg-hub/yardage", label: "SG · Yardage", category: "Mål" },
  { route: "/portal/mal/sg-hub/best-vs-now", label: "SG · Best vs nå", category: "Mål" },
  { route: "/portal/mal/sg-hub/[club]", label: "SG · Per kølle", category: "Mål" },
  { route: "/portal/mal/statistikk", label: "Mål-statistikk", category: "Mål" },
  { route: "/portal/mal/trackman", label: "TrackMan-økter", category: "Mål", designPath: "/design-handover/playerhq/trackman-okter.html" },
  { route: "/portal/mal/trackman/[id]", label: "TrackMan-detalj", category: "Mål", designPath: "/design-handover/playerhq/trackman-koller.html" },

  // Tren-modul
  { route: "/portal/tren/[sessionId]", label: "Økt-detalj", category: "Tren" },
  { route: "/portal/tren/[sessionId]/planlagt", label: "Planlagt økt", category: "Tren", designPath: "/design-handover/playerhq/okt-detalj-planlagt.html" },
  { route: "/portal/tren/aarsplan", label: "Årsplan", category: "Tren", designPath: "/design-handover/planlegge/planlegge-arsplan.html" },
  { route: "/portal/tren/aarsplan/periode/[id]/rediger", label: "Rediger periode", category: "Tren" },
  { route: "/portal/tren/feiring/[planId]", label: "Plan-feiring", category: "Tren" },
  { route: "/portal/tren/fys-plan", label: "FYS-planer", category: "Tren", designPath: "/design-handover/playerhq/fys-plan-liste.html" },
  { route: "/portal/tren/fys-plan/[planId]", label: "FYS-plan-detalj", category: "Tren", designPath: "/design-handover/playerhq/fys-plan-builder.html" },
  { route: "/portal/tren/kalender", label: "Tren-kalender", category: "Tren" },
  { route: "/portal/tren/ovelser", label: "Øvelser", category: "Tren", designPath: "/design-handover/playerhq/ovelses-bibliotek.html" },
  { route: "/portal/tren/ovelser/[id]", label: "Øvelse-detalj", category: "Tren" },
  { route: "/portal/tren/teknisk-plan", label: "Tekniske planer", category: "Tren", designPath: "/design-handover/playerhq/plan-liste.html" },
  { route: "/portal/tren/teknisk-plan/[planId]", label: "Teknisk plan-detalj", category: "Tren", designPath: "/design-handover/playerhq/plan-builder.html" },
  { route: "/portal/tren/tester", label: "Tester", category: "Tren", designPath: "/design-handover/playerhq/resultater-tester.html" },
  { route: "/portal/tren/tester/[testId]", label: "Test-detalj", category: "Tren", designPath: "/design-handover/playerhq/test-detalj.html" },
  { route: "/portal/tren/tester/katalog", label: "Test-katalog", category: "Tren" },
  { route: "/portal/tren/tester/ny", label: "Ny test", category: "Tren" },
  { route: "/portal/tren/tester/ny/egen", label: "Ny egen test", category: "Tren" },
  { route: "/portal/tren/turneringer", label: "Turneringer", category: "Tren", designPath: "/design-handover/playerhq/resultater-turneringer.html" },
  { route: "/portal/tren/turneringer/[id]", label: "Turnering-detalj", category: "Tren", designPath: "/design-handover/playerhq/tournament-sorlandsapent.html" },
  { route: "/portal/tren/turneringer/ny", label: "Ny turnering", category: "Tren" },

  // Coach-modul
  { route: "/portal/coach/[coachId]", label: "Coach-profil", category: "Coach", designPath: "/design-handover/playerhq/coach-profil-hub.html" },
  { route: "/portal/coach/ai", label: "AI-Caddie", category: "Coach" },
  { route: "/portal/coach/melding", label: "Meldinger", category: "Coach" },
  { route: "/portal/coach/melding/[id]", label: "Melding-tråd", category: "Coach", designPath: "/design-handover/playerhq/meldingstrad-detalj.html" },
  { route: "/portal/coach/melding/[id]/vedlegg", label: "Melding-vedlegg", category: "Coach" },
  { route: "/portal/coach/melding/ny", label: "Ny melding", category: "Coach" },
  { route: "/portal/coach/notes", label: "Coach-notater", category: "Coach" },
  { route: "/portal/coach/notes/[noteId]", label: "Notat-detalj", category: "Coach" },
  { route: "/portal/coach/ovelser", label: "Coach-øvelser", category: "Coach" },
  { route: "/portal/coach/ovelser/ny", label: "Ny øvelse", category: "Coach" },
  { route: "/portal/coach/ovelser/[id]/rediger", label: "Rediger øvelse", category: "Coach" },
  { route: "/portal/coach/plans", label: "Coach-planer", category: "Coach" },
  { route: "/portal/coach/plans/[planId]", label: "Plan-detalj", category: "Coach", designPath: "/design-handover/playerhq/spiller-plan-detalj.html" },
  { route: "/portal/coach/plans/[planId]/ny-okt", label: "Ny økt i plan", category: "Coach" },
  { route: "/portal/coach/plans/perioder", label: "Plan-perioder", category: "Coach" },
  { route: "/portal/coach/sporsmal/[id]", label: "Spørsmål", category: "Coach", designPath: "/design-handover/playerhq/coach-svar-sporsmal.html" },
  { route: "/portal/coach/videoer", label: "Coach-videoer", category: "Coach" },

  // Booking
  { route: "/portal/booking/[bookingId]", label: "Booking-detalj", category: "Booking" },
  { route: "/portal/booking/anlegg/[anleggId]", label: "Anlegg-booking", category: "Booking" },
  { route: "/portal/booking/bekreftet", label: "Booking bekreftet", category: "Booking" },
  { route: "/portal/booking/coach/[coachId]", label: "Coach-booking", category: "Booking" },
  { route: "/portal/booking/ny", label: "Ny booking", category: "Booking" },
  { route: "/portal/booking/ny/bekreft", label: "Bekreft booking", category: "Booking" },

  // Min profil
  { route: "/portal/meg/abonnement", label: "Abonnement", category: "Min profil" },
  { route: "/portal/meg/abonnement/avbestill", label: "Avbestill abonnement", category: "Min profil" },
  { route: "/portal/meg/abonnement/faktura/[id]", label: "Faktura-detalj", category: "Min profil", designPath: "/design-handover/playerhq/faktura-detalj.html" },
  { route: "/portal/meg/abonnement/kort/ny", label: "Nytt kort", category: "Min profil" },
  { route: "/portal/meg/abonnement/oppgrader", label: "Oppgrader Pro", category: "Min profil" },
  { route: "/portal/meg/bookinger", label: "Mine bookinger", category: "Min profil" },
  { route: "/portal/meg/bookinger/reschedule/[bookingId]", label: "Reschedule booking", category: "Min profil" },
  { route: "/portal/meg/dokumenter", label: "Dokumenter", category: "Min profil" },
  { route: "/portal/meg/feedback", label: "Feedback", category: "Min profil" },
  { route: "/portal/meg/foreldre", label: "Foreldre", category: "Min profil" },
  { route: "/portal/meg/help", label: "Hjelp", category: "Min profil" },
  { route: "/portal/meg/help/artikkel/[slug]", label: "Hjelp-artikkel", category: "Min profil" },
  { route: "/portal/meg/help/kategori/[slug]", label: "Hjelp-kategori", category: "Min profil" },
  { route: "/portal/meg/help/kontakt", label: "Kontakt support", category: "Min profil" },
  { route: "/portal/meg/helse", label: "Helse", category: "Min profil" },
  { route: "/portal/meg/helse/symptom/ny", label: "Nytt symptom", category: "Min profil" },
  { route: "/portal/meg/innstillinger", label: "Innstillinger", category: "Min profil" },
  { route: "/portal/meg/innstillinger/anlegg", label: "Innst. · Anlegg", category: "Min profil" },
  { route: "/portal/meg/innstillinger/personvern", label: "Innst. · Personvern & eksport", category: "Min profil" },
  { route: "/portal/meg/innstillinger/integrasjoner", label: "Innst. · Integrasjoner", category: "Min profil" },
  { route: "/portal/meg/innstillinger/okter", label: "Innst. · Økter", category: "Min profil" },
  { route: "/portal/meg/innstillinger/personvern", label: "Innst. · Personvern", category: "Min profil" },
  { route: "/portal/meg/innstillinger/sikkerhet", label: "Innst. · Sikkerhet", category: "Min profil" },
  { route: "/portal/meg/innstillinger/sprak", label: "Innst. · Språk", category: "Min profil" },
  { route: "/portal/meg/innstillinger/varsler", label: "Innst. · Varsler", category: "Min profil" },
  { route: "/portal/meg/profil/rediger", label: "Rediger profil", category: "Min profil" },
  { route: "/portal/meg/sikkerhet", label: "Sikkerhet", category: "Min profil" },
  { route: "/portal/meg/sikkerhet/2fa", label: "2FA", category: "Min profil" },
  { route: "/portal/meg/utstyrsbag", label: "Utstyrsbag", category: "Min profil" },

  // AI
  { route: "/portal/ai/foresla-drill", label: "AI · Foreslå drill", category: "AI", designPath: "/design-handover/planlegge/ai-foresla-drill.html" },
  { route: "/portal/ai/foresla-turnering", label: "AI · Foreslå turnering", category: "AI", designPath: "/design-handover/planlegge/ai-foresla-turnering.html" },
  { route: "/portal/ai/mal-bygger", label: "AI · Mål-bygger", category: "AI", designPath: "/design-handover/planlegge/ai-mal-bygger.html" },

  // Live (fullscreen)
  { route: "/portal/(fullscreen)/live/[sessionId]", label: "Live · Hub", category: "Live" },
  { route: "/portal/(fullscreen)/live/[sessionId]/active", label: "Live · Aktiv", category: "Live" },
  { route: "/portal/(fullscreen)/live/[sessionId]/brief", label: "Live · Brief", category: "Live" },
  { route: "/portal/(fullscreen)/live/[sessionId]/logger", label: "Live · Logger", category: "Live" },
  { route: "/portal/(fullscreen)/live/[sessionId]/summary", label: "Live · Summary", category: "Live" },
  { route: "/portal/(fullscreen)/live/[sessionId]/tapper", label: "Live · Tapper", category: "Live" },
  { route: "/portal/(fullscreen)/tren", label: "Fullscreen · Tren", category: "Live" },

  // Annet
  { route: "/portal/agent-pipeline", label: "Agent-pipeline", category: "Annet" },
  { route: "/portal/analyse", label: "Analyse (legacy)", category: "Annet" },
  { route: "/portal/ny-okt", label: "Ny økt-wizard", category: "Annet", designPath: "/design-handover/playerhq/ny-okt-wizard.html" },
  { route: "/portal/onskeligokt", label: "Ønskelig økt", category: "Annet" },
  { route: "/portal/onskeligokt/bekreftet", label: "Ønske bekreftet", category: "Annet" },
  { route: "/portal/reach", label: "Reach", category: "Annet" },
  { route: "/portal/spiller/[spillerId]", label: "Spiller-profil", category: "Annet" },
  { route: "/portal/statistikk/[metric]", label: "Statistikk · metric", category: "Annet", designPath: "/design-handover/playerhq/statistikk-drill-down.html" },
  { route: "/portal/statistikk/runder/[runId]/del", label: "Del runde", category: "Annet" },
  { route: "/portal/statistikk/sammenlign", label: "Sammenlign statistikk", category: "Annet", designPath: "/design-handover/playerhq/sammenlign-statistikk.html" },
  { route: "/portal/stats", label: "Stats (legacy)", category: "Annet" },
  { route: "/portal/talent/min-plan", label: "Min talent-plan", category: "Annet" },
  { route: "/portal/talent/mitt-niva", label: "Mitt nivå", category: "Annet" },
  { route: "/portal/talent/roadmap", label: "Talent-roadmap", category: "Annet" },
  { route: "/portal/talent/sammenligning", label: "Talent-sammenligning", category: "Annet" },
  { route: "/portal/trackman/[sessionId]", label: "TrackMan-økt", category: "Annet" },
  { route: "/portal/utfordringer", label: "Utfordringer", category: "Annet" },
  { route: "/portal/utfordringer/[id]", label: "Utfordring-detalj", category: "Annet" },
  { route: "/portal/utfordringer/ny", label: "Ny utfordring", category: "Annet" },
  { route: "/portal/workbench-v2", label: "Workbench v2 (referanse)", category: "Annet", designPath: "/design-handover/playerhq/workbench-v2.html" },
];

export const CATEGORIES = [
  "Hovedmeny",
  "Mål",
  "Tren",
  "Coach",
  "Booking",
  "Min profil",
  "AI",
  "Live",
  "Annet",
] as const;
