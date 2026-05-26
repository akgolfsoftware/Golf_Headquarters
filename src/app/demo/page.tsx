import Link from "next/link";

/**
 * Demo-index — komplett pilot-dekning av AK Golf Platform + akgolf.no marketing.
 * 236 demo-pages: 171 plattform-pages + 45 state-varianter (dark/mobile/loading/error)
 * + 20 akgolf.no marketing-pages (designet direkte i React).
 */

type Pilot = {
  url: string;
  title: string;
};

type Group = {
  title: string;
  description: string;
  pilots: Pilot[];
};

const GROUPS: Group[] = [
  {
    title: "CoachHQ — Plan & Profil",
    description: "Spillerprofil, plan-bygger, plan-management og approvals",
    pilots: [
      { url: "/360-demo", title: "360-profil (Markus)" },
      { url: "/demos/plan-bygger", title: "Plan-bygger (6-steg wizard)" },
      { url: "/plan-detalj-demo", title: "Plan-detalj" },
      { url: "/plan-edit-demo", title: "Plan-edit" },
      { url: "/plan-templates-demo", title: "Plan-templates" },
      { url: "/demos/newplan/1", title: "Ny plan (modal-wizard)" },
      { url: "/editplan-demo", title: "Rediger plan (modal)" },
      { url: "/plan-approval-demo", title: "Plan-godkjenning" },
      { url: "/plan-share-demo", title: "Plan-deling" },
      { url: "/plan-action-demo", title: "Plan-action-detalj" },
      { url: "/template-selector-demo", title: "Template-velger" },
      { url: "/ai-plan-demo", title: "AI plan-generator" },
    ],
  },
  {
    title: "CoachHQ — Operative dashboards",
    description: "Daglig brief, kalender, fasiliteter, analytics, audit",
    pilots: [
      { url: "/daglig-brief-demo", title: "Daglig brief" },
      { url: "/kalender-demo", title: "Kalender (uke)" },
      { url: "/kalender-maaned-demo", title: "Kalender (måned)" },
      { url: "/tilstander-demo", title: "Tilstander" },
      { url: "/fasiliteter-demo", title: "Fasiliteter" },
      { url: "/analytics-v2-demo", title: "Analytics v2" },
      { url: "/revisjonslogg-demo", title: "Revisjonslogg" },
      { url: "/rapporter-demo", title: "Rapporter" },
      { url: "/kapasitet-demo", title: "Kapasitet" },
      { url: "/lag-snitt-demo", title: "Lag-snitt" },
      { url: "/meldinger-demo", title: "Meldinger" },
      { url: "/oppfolgingsko-demo", title: "Oppfølgingskø" },
    ],
  },
  {
    title: "CoachHQ — Lister & Konfig",
    description: "Elever, planer, godkjenninger, bookinger, økter, tjenester",
    pilots: [
      { url: "/elever-demo", title: "Elever (spillerliste)" },
      { url: "/treningsplaner-demo", title: "Treningsplaner" },
      { url: "/godkjenninger-demo", title: "Godkjenninger" },
      { url: "/bookinger-demo", title: "Bookinger" },
      { url: "/okter-demo", title: "Økter (bibliotek)" },
      { url: "/tjenester-demo", title: "Tjenester (katalog)" },
      { url: "/lokasjoner-demo", title: "Lokasjoner" },
      { url: "/team-demo", title: "Team" },
      { url: "/coachhq-team-demo", title: "Team v2 (utvidet)" },
      { url: "/grupper-demo", title: "Grupper" },
      { url: "/coachhq-grupper-demo", title: "Grupper v2 (utvidet)" },
      { url: "/turneringer-demo", title: "Turneringer (coach-syn)" },
      { url: "/sesjon-opptak-demo", title: "Sesjon-opptak (video)" },
      { url: "/coaching-board-demo", title: "Coaching-board (kanban)" },
    ],
  },
  {
    title: "CoachHQ — Portefølje & Rapporter",
    description: "Spillerlister, planlegger, foreldre-innboks, coach-profil",
    pilots: [
      { url: "/coachhq-portefolje-demo", title: "Portefølje" },
      { url: "/coachhq-planlegger-demo", title: "Sesjon-planlegger" },
      { url: "/coachhq-foreldre-innboks-demo", title: "Foreldre-innboks" },
      { url: "/coachhq-rapport-demo", title: "Coach-rapport" },
      { url: "/coach-profil-demo", title: "Coach-profil" },
    ],
  },
  {
    title: "PlayerHQ — Mål & Data",
    description: "Spillerens dashbord, mål, statistikk, baner",
    pilots: [
      { url: "/baner-demo", title: "Baner" },
      { url: "/mal-detalj-demo", title: "Mål-detalj (HCP)" },
      { url: "/leaderboard-demo", title: "Leaderboard" },
      { url: "/test-detalj-demo", title: "Test-detalj" },
      { url: "/trackman-demo", title: "Trackman-sesjoner" },
      { url: "/playerhq-statistikk-demo", title: "Statistikk" },
      { url: "/playerhq-milepaeler-demo", title: "Mål & milepæler" },
      { url: "/playerhq-lagfeed-demo", title: "Lagfeed" },
      { url: "/playerhq-utstyrsbag-demo", title: "Utstyrsbag" },
      { url: "/playerhq-bibliotek-demo", title: "Treningsbibliotek" },
    ],
  },
  {
    title: "PlayerHQ — Coach-samhandling",
    description: "Spillerens visning av coach, planer, notater",
    pilots: [
      { url: "/coach-detalj-demo", title: "Coach-detalj (min coach)" },
      { url: "/coaching-planer-demo", title: "Coaching-planer" },
      { url: "/coaching-detail-demo", title: "Coaching-detail" },
      { url: "/coach-notes-demo", title: "Coach-notater" },
      { url: "/notater-detalj-demo", title: "Notat-detalj" },
      { url: "/coach-melding-demo", title: "Coach-melding" },
    ],
  },
  {
    title: "PlayerHQ — Profil & Konto",
    description: "Min profil, helse, varsler, abonnement",
    pilots: [
      { url: "/playerhq-profil-demo", title: "Min profil" },
      { url: "/playerhq-helse-demo", title: "Helse (skader/restitusjon)" },
      { url: "/playerhq-varsler-demo", title: "Varselsinnstillinger" },
      { url: "/playerhq-abonnement-demo", title: "Abonnement (Pro)" },
    ],
  },
  {
    title: "PlayerHQ — Wizards & Kalender",
    description: "Ny økt, ønsket økt, tren-kalender",
    pilots: [
      { url: "/demos/ny-okt/1", title: "Ny økt (6-steg wizard)" },
      { url: "/onskeligokt-demo", title: "Ønskelig økt" },
      { url: "/tren-kalender-demo", title: "Tren-kalender" },
      { url: "/treningsdetalj-demo", title: "Trenings-detalj" },
    ],
  },
  {
    title: "Live Session-flyten",
    description: "Fra intro til oppsummering — alle states (idle/aktiv/pause/ferdig)",
    pilots: [
      { url: "/live-intro-demo", title: "Live intro (modal)" },
      { url: "/live-session-demo", title: "Live session (Screen 1)" },
      { url: "/live-tapper-demo", title: "Live tapper" },
      { url: "/live-active-demo", title: "Live active (mid-rep)" },
      { url: "/live-active-idle-demo", title: "Live active (idle/før start)" },
      { url: "/live-active-pause-demo", title: "Live active (pause)" },
      { url: "/live-active-ferdig-demo", title: "Live active (ferdig)" },
      { url: "/live-between-demo", title: "Live between (Screen 3)" },
      { url: "/live-summary-demo", title: "Live summary (Screen 4)" },
      { url: "/live-summary-achievement-demo", title: "Live summary (achievement)" },
      { url: "/edge-live-empty-demo", title: "Empty: ingen aktiv økt" },
    ],
  },
  {
    title: "Agent-pipeline & AI",
    description: "Agent-skjermer, periodiseringsagent, coach-agent-chat",
    pilots: [
      { url: "/playerhq-pipeline-demo", title: "PlayerHQ pipeline" },
      { url: "/agent-pipeline-overview-demo", title: "Agent pipeline overview" },
      { url: "/periodiserings-agent-demo", title: "Periodiseringsagent" },
      { url: "/coach-agent-chat-demo", title: "Coach-agent chat" },
      { url: "/coachhq-agenter-demo", title: "CoachHQ agenter" },
      { url: "/agent-feedback-demo", title: "Agent-feedback" },
    ],
  },
  {
    title: "Talent-modulen",
    description: "14 skjermer — CoachHQ Talent, PlayerHQ Talent, shared",
    pilots: [
      { url: "/talent-demo", title: "Talent-pipeline (A1-A5)" },
      { url: "/talent-mine-spillere-demo", title: "Mine spillere" },
      { url: "/talent-radar-demo", title: "Talent-radar" },
      { url: "/talent-spiller-360-demo", title: "Spiller 360 (utvidet)" },
      { url: "/talent-klubb-region-demo", title: "Klubb/region-oversikt" },
      { url: "/talent-sammenlign-to-demo", title: "Sammenlign to spillere" },
      { url: "/talent-mitt-niva-demo", title: "Mitt nivå (spiller)" },
      { url: "/talent-min-plan-demo", title: "Min plan (spiller)" },
      { url: "/talent-min-sammenligning-demo", title: "Min sammenligning" },
      { url: "/talent-ressurser-demo", title: "Talent-ressurser" },
      { url: "/talent-discovery-demo", title: "Talent-discovery" },
      { url: "/talent-kohort-demo", title: "Kohort-explorer" },
      { url: "/talent-region-pipeline-demo", title: "Region-pipeline" },
      { url: "/spiller-detalj-light-demo", title: "Spiller-detalj (light)" },
    ],
  },
  {
    title: "Foreldreportal",
    description: "Forelder-syn — dashboard, ukerapport, samtykke, billing",
    pilots: [
      { url: "/foreldre-dashboard-demo", title: "Foreldre-dashboard" },
      { url: "/foreldre-ukerapport-demo", title: "Ukerapport" },
      { url: "/foreldre-samtykke-demo", title: "Samtykke" },
      { url: "/foreldre-varsler-demo", title: "Varsler" },
      { url: "/foreldre-billing-demo", title: "Fakturering" },
    ],
  },
  {
    title: "Klubb-admin",
    description: "Klubb-perspektivet — turneringer, ranking, dashboard",
    pilots: [
      { url: "/klubb-dashboard-demo", title: "Klubb-dashboard" },
      { url: "/klubb-turneringer-demo", title: "Turneringer" },
      { url: "/klubb-lagoppstilling-demo", title: "Lagoppstilling" },
      { url: "/klubb-ranking-demo", title: "Ranking" },
      { url: "/klubb-rsvp-demo", title: "Foreldre-RSVP admin" },
      { url: "/klubb-live-scoring-demo", title: "Live scoring (broadcast)" },
    ],
  },
  {
    title: "Booking — Forbruker-flyt",
    description: "booking.akgolf.no — komplett kjøpsflyt for forbrukere",
    pilots: [
      { url: "/booking-index-demo", title: "Booking-forsiden" },
      { url: "/booking-tjenester-demo", title: "Velg tjeneste (1/5)" },
      { url: "/booking-coaches-demo", title: "Velg coach (2/5)" },
      { url: "/booking-coach-detalj-demo", title: "Coach-detalj" },
      { url: "/booking-kalender-demo", title: "Velg tid (kalender)" },
      { url: "/booking-anlegg-demo", title: "Velg anlegg" },
      { url: "/booking-info-demo", title: "Din info (5/5)" },
    ],
  },
  {
    title: "Booking-modaler (admin/PlayerHQ)",
    description: "Book session, reschedule, facility — alle steg og varianter",
    pilots: [
      { url: "/book-session-demo", title: "Book session (default)" },
      { url: "/book-session-steg2-demo", title: "Book session steg 2 (tid)" },
      { url: "/book-session-steg3-demo", title: "Book session steg 3 (bekreft)" },
      { url: "/book-session-free-demo", title: "Book session (FREE)" },
      { url: "/book-session-pro-demo", title: "Book session (PRO)" },
      { url: "/book-session-locked-demo", title: "Book session (locked)" },
      { url: "/reschedule-demo", title: "Reschedule" },
      { url: "/reschedule-default-demo", title: "Reschedule (default)" },
      { url: "/reschedule-success-demo", title: "Reschedule (success)" },
      { url: "/facility-detail-demo", title: "Facility detail" },
      { url: "/facility-detail-tabs-demo", title: "Facility detail (tabs)" },
      { url: "/booking-confirmation-demo", title: "Booking confirmation" },
    ],
  },
  {
    title: "Round / Stats / Agent-modaler",
    description: "Runde-detalj, innsikter, Trackman-import, bulk-approve",
    pilots: [
      { url: "/round-detail-demo", title: "Round detail" },
      { url: "/round-insight-demo", title: "Round insight" },
      { url: "/demos/trackman-import/1", title: "Trackman import (steg)" },
      { url: "/comparison-demo", title: "Sammenligning" },
      { url: "/bulk-approve-demo", title: "Bulk approve" },
    ],
  },
  {
    title: "Social / Tier / Other-modaler",
    description: "Challenges, leaderboard, melding, varsel, payment, video — med states",
    pilots: [
      { url: "/drill-challenge-demo", title: "Drill challenge" },
      { url: "/challenge-detail-demo", title: "Challenge detail" },
      { url: "/leaderboard-modal-demo", title: "Leaderboard (modal)" },
      { url: "/message-detail-demo", title: "Message detail" },
      { url: "/notification-center-demo", title: "Notification center" },
      { url: "/notification-empty-demo", title: "Notification (empty)" },
      { url: "/video-upload-demo", title: "Video upload" },
      { url: "/video-upload-success-demo", title: "Video upload (success)" },
      { url: "/payment-variants-demo", title: "Payment (Pro 300/mnd)" },
      { url: "/payment-success-demo", title: "Payment (success)" },
      { url: "/payment-error-demo", title: "Payment (error)" },
    ],
  },
  {
    title: "Auth & Onboarding",
    description: "Login, BankID, org-velger, onboarding-flow",
    pilots: [
      { url: "/auth-login-demo", title: "Auth — logg inn" },
      { url: "/auth-glemt-demo", title: "Auth — glemt passord" },
      { url: "/auth-bankid-demo", title: "Auth — BankID" },
      { url: "/auth-org-demo", title: "Auth — velg organisasjon" },
      { url: "/auth-logget-ut-demo", title: "Auth — logget ut" },
      { url: "/onboarding-velkomst-demo", title: "Onboarding — velkomst" },
      { url: "/onboarding-spiller-demo", title: "Onboarding — spiller" },
      { url: "/onboarding-coach-demo", title: "Onboarding — coach" },
      { url: "/onboarding-forelder-demo", title: "Onboarding — forelder" },
      { url: "/onboarding-ferdig-demo", title: "Onboarding — ferdig" },
    ],
  },
  {
    title: "System & Foundation",
    description: "CBAC, tilgang, notif-taksonomi, design-tokens, e-postmaler",
    pilots: [
      { url: "/innstillings-layout-demo", title: "Innstillings-layout (shell)" },
      { url: "/cbac-matrise-demo", title: "CBAC-matrise" },
      { url: "/tilgang-demo", title: "Tilgangskontroll" },
      { url: "/notif-taksonomi-demo", title: "Notifikasjons-taksonomi" },
      { url: "/design-tokens-demo", title: "Designsystem-tokens" },
      { url: "/email-templates-demo", title: "E-postmaler" },
      { url: "/teknisk-plan-demo", title: "Teknisk plan / roadmap" },
    ],
  },
  {
    title: "Settings",
    description: "Bruker, sikkerhet, API-nøkler, tilgjengelighet",
    pilots: [
      { url: "/settings-bruker-demo", title: "Bruker-innstillinger" },
      { url: "/settings-sikkerhet-demo", title: "Sikkerhet & 2FA" },
      { url: "/settings-api-demo", title: "API-nøkler & integrasjoner" },
      { url: "/settings-tilgjengelighet-demo", title: "Tilgjengelighet" },
    ],
  },
  {
    title: "Edge cases & system-modaler",
    description: "Offline, paywall, suspended, timeout, 500, avatar-upload",
    pilots: [
      { url: "/edge-offline-demo", title: "Offline" },
      { url: "/edge-paywall-demo", title: "Paywall" },
      { url: "/edge-suspended-demo", title: "Suspended" },
      { url: "/edge-timeout-demo", title: "Timeout" },
      { url: "/edge-500-demo", title: "500 / 503" },
      { url: "/avatar-upload-demo", title: "Avatar upload" },
    ],
  },
  {
    title: "State-varianter — Dark mode",
    description: "Dark-mode versjoner av CoachHQ-dashboards og modaler",
    pilots: [
      { url: "/daglig-brief-dark-demo", title: "Daglig brief (dark)" },
      { url: "/fasiliteter-dark-demo", title: "Fasiliteter (dark)" },
      { url: "/analytics-v2-dark-demo", title: "Analytics v2 (dark)" },
      { url: "/revisjonslogg-dark-demo", title: "Revisjonslogg (dark)" },
      { url: "/rapporter-dark-demo", title: "Rapporter (dark)" },
      { url: "/kapasitet-dark-demo", title: "Kapasitet (dark)" },
      { url: "/kalender-dark-demo", title: "Kalender (dark)" },
      { url: "/book-session-dark-demo", title: "Book session (dark)" },
      { url: "/reschedule-dark-demo", title: "Reschedule (dark)" },
      { url: "/facility-detail-dark-demo", title: "Facility detail (dark)" },
      { url: "/booking-confirmation-dark-demo", title: "Booking confirmation (dark)" },
      { url: "/message-detail-dark-demo", title: "Message detail (dark)" },
      { url: "/payment-dark-demo", title: "Payment (dark)" },
      { url: "/drill-challenge-dark-demo", title: "Drill challenge (dark)" },
    ],
  },
  {
    title: "State-varianter — Mobile",
    description: "Mobile-versjoner av kritiske skjermer",
    pilots: [
      { url: "/live-summary-mobile-demo", title: "Live summary (mobile)" },
      { url: "/drill-challenge-mobile-demo", title: "Drill challenge (mobile)" },
      { url: "/message-detail-mobile-demo", title: "Message detail (mobile)" },
      { url: "/notification-center-mobile-demo", title: "Notification center (mobile)" },
      { url: "/payment-mobile-demo", title: "Payment (mobile)" },
    ],
  },
  {
    title: "State-varianter — Live Session detaljer",
    description: "Connection-lost, longpress, pause, siste, skip-confirm, confetti",
    pilots: [
      { url: "/live-active-connection-lost-demo", title: "Active (connection lost)" },
      { url: "/live-active-longpress-demo", title: "Active (longpress)" },
      { url: "/live-between-pause-demo", title: "Between (pause)" },
      { url: "/live-between-siste-demo", title: "Between (siste øvelse)" },
      { url: "/live-between-skip-confirm-demo", title: "Between (skip confirm)" },
      { url: "/live-summary-confetti-demo", title: "Summary (confetti)" },
      { url: "/live-summary-feedback-sendt-demo", title: "Summary (feedback sendt)" },
      { url: "/drill-challenge-loading-demo", title: "Challenge (loading)" },
      { url: "/drill-challenge-steg1-bli-med-demo", title: "Challenge (bli med)" },
      { url: "/drill-challenge-steg1-lag-ny-demo", title: "Challenge (lag ny)" },
      { url: "/drill-challenge-success-demo", title: "Challenge (success)" },
      { url: "/leaderboard-free-lock-demo", title: "Leaderboard (free-lock)" },
    ],
  },
  {
    title: "State-varianter — Message/Notification/Video/Loading",
    description: "Empty, sender, skriver, vedlegg, achievements, plan, uleste, progress, error, trim, loading",
    pilots: [
      { url: "/message-detail-empty-demo", title: "Message (empty)" },
      { url: "/message-detail-sender-demo", title: "Message (sender)" },
      { url: "/message-detail-skriver-demo", title: "Message (skriver)" },
      { url: "/message-detail-vedlegg-demo", title: "Message (vedlegg)" },
      { url: "/notification-achievements-demo", title: "Notification (achievements)" },
      { url: "/notification-plan-demo", title: "Notification (plan)" },
      { url: "/notification-uleste-demo", title: "Notification (uleste)" },
      { url: "/video-upload-progress-demo", title: "Video upload (progress)" },
      { url: "/video-upload-error-demo", title: "Video upload (error)" },
      { url: "/video-upload-trim-demo", title: "Video upload (trim)" },
      { url: "/payment-loading-demo", title: "Payment (loading)" },
      { url: "/book-session-loading-demo", title: "Book session (loading)" },
      { url: "/facility-detail-loading-demo", title: "Facility detail (loading)" },
      { url: "/booking-confirmation-loading-demo", title: "Booking confirmation (loading)" },
    ],
  },
  {
    title: "Marketing — akgolf.no (NYTT DESIGN)",
    description: "20 marketing-pages designet direkte i React for forbrukernettstedet",
    pilots: [
      { url: "/akgolf-forside-demo", title: "Forside" },
      { url: "/akgolf-om-demo", title: "Om oss" },
      { url: "/akgolf-tjenester-demo", title: "Tjenester" },
      { url: "/akgolf-priser-demo", title: "Priser" },
      { url: "/akgolf-kontakt-demo", title: "Kontakt" },
      { url: "/akgolf-coacher-demo", title: "Coacher (liste)" },
      { url: "/akgolf-coach-profil-demo", title: "Coach-profil (Anders K)" },
      { url: "/akgolf-anlegg-demo", title: "Anlegg (liste)" },
      { url: "/akgolf-anlegg-detalj-demo", title: "Anlegg-detalj (Mulligan Borre)" },
      { url: "/akgolf-faq-demo", title: "FAQ" },
      { url: "/akgolf-blogg-demo", title: "Blogg (forside)" },
      { url: "/akgolf-blogg-post-demo", title: "Blogg-post" },
      { url: "/akgolf-suksess-demo", title: "Suksesshistorier" },
      { url: "/akgolf-junior-demo", title: "Junior-program" },
      { url: "/akgolf-bedrift-demo", title: "Bedrift" },
      { url: "/akgolf-wang-demo", title: "WANG Toppidrett (partner)" },
      { url: "/akgolf-mulligan-demo", title: "Mulligan Indoor (partner)" },
      { url: "/akgolf-personvern-demo", title: "Personvernerklæring" },
      { url: "/akgolf-vilkar-demo", title: "Vilkår og betingelser" },
      { url: "/akgolf-cookies-demo", title: "Cookie-policy" },
    ],
  },
];

export default function DemoIndex() {
  const total = GROUPS.reduce((sum, g) => sum + g.pilots.length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12">
          <div className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            AK Golf Group · Plattform + akgolf.no · Komplett pilot-dekning
          </div>
          <h1 className="mt-2 font-display text-5xl italic leading-tight">
            {total} produksjonsklare skjermer
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Komplett pilot-dekning av AK Golf Platform — CoachHQ, PlayerHQ,
            Foreldreportal, Klubb-admin, Booking-forbruker, Auth, Onboarding,
            Live Session-flyten, Talent-modulen, tverrgående systemskjermer
            og alle kritiske state-varianter. Alle pages er server components
            med design-system v2.
          </p>
        </header>

        <div className="space-y-10">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-2">
                <h2 className="font-display text-2xl italic">{group.title}</h2>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {group.pilots.length} skjermer
                </span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{group.description}</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {group.pilots.map((p) => (
                  <Link
                    key={p.url}
                    href={p.url}
                    className="group flex items-center justify-between rounded-md border border-border bg-card px-4 py-2 text-sm transition hover:border-primary hover:bg-primary/5"
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="font-mono text-[10px] text-muted-foreground group-hover:text-primary">
                      {p.url}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            Sist oppdatert: 11.05.2026 · Typesjekket med{" "}
            <code className="font-mono">npx tsc --noEmit</code> (0 feil).
          </p>
        </footer>
      </div>
    </div>
  );
}
