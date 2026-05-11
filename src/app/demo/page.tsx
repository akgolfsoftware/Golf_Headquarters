import Link from "next/link";

/**
 * Demo-index for alle pilot-pages konvertert fra Claude Design / wireframes / spec.
 * 127 pages dekker hele AK Golf Platform — CoachHQ, PlayerHQ, Foreldre, Klubb, Auth,
 * Onboarding, Live Session, Modaler, Edge cases, Settings, Talent-modulen.
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
    description: "Spillerprofil, plan-bygger og plan-management",
    pilots: [
      { url: "/360-demo", title: "360-profil (Markus)" },
      { url: "/plan-bygger-demo", title: "Plan-bygger (6-steg wizard)" },
      { url: "/plan-detalj-demo", title: "Plan-detalj" },
      { url: "/plan-edit-demo", title: "Plan-edit" },
      { url: "/plan-templates-demo", title: "Plan-templates" },
      { url: "/newplan-demo", title: "Ny plan (modal-wizard)" },
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
    title: "CoachHQ — Portefølje & Rapporter",
    description: "Spillerlister, planlegger, rapporter, coach-profil",
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
    title: "PlayerHQ — Wizards & Kalender",
    description: "Ny økt, ønsket økt, tren-kalender",
    pilots: [
      { url: "/ny-okt-demo", title: "Ny økt (6-steg wizard)" },
      { url: "/onskeligokt-demo", title: "Ønskelig økt" },
      { url: "/tren-kalender-demo", title: "Tren-kalender" },
      { url: "/treningsdetalj-demo", title: "Trenings-detalj" },
    ],
  },
  {
    title: "Live Session-flyten",
    description: "Live-økt fra intro til oppsummering — 7 skjermer",
    pilots: [
      { url: "/live-intro-demo", title: "Live intro (modal)" },
      { url: "/live-session-demo", title: "Live session (Screen 1)" },
      { url: "/live-tapper-demo", title: "Live tapper" },
      { url: "/live-active-demo", title: "Live active (Screen 2)" },
      { url: "/live-between-demo", title: "Live between (Screen 3)" },
      { url: "/live-summary-demo", title: "Live summary (Screen 4)" },
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
    description: "12 skjermer — CoachHQ Talent, PlayerHQ Talent, shared",
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
    title: "Booking-modaler",
    description: "Booking-flyt: session, reschedule, facility, confirmation",
    pilots: [
      { url: "/book-session-demo", title: "Book session" },
      { url: "/book-session-free-demo", title: "Book session (FREE)" },
      { url: "/book-session-pro-demo", title: "Book session (PRO)" },
      { url: "/book-session-locked-demo", title: "Book session (locked)" },
      { url: "/reschedule-demo", title: "Reschedule" },
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
      { url: "/trackman-import-demo", title: "Trackman import (steg)" },
      { url: "/comparison-demo", title: "Sammenligning" },
      { url: "/bulk-approve-demo", title: "Bulk approve" },
    ],
  },
  {
    title: "Social / Tier / Other-modaler",
    description: "Challenges, leaderboard, melding, varsel, payment, video",
    pilots: [
      { url: "/drill-challenge-demo", title: "Drill challenge" },
      { url: "/challenge-detail-demo", title: "Challenge detail" },
      { url: "/leaderboard-modal-demo", title: "Leaderboard (modal)" },
      { url: "/message-detail-demo", title: "Message detail (utvidet)" },
      { url: "/notification-center-demo", title: "Notification center" },
      { url: "/video-upload-demo", title: "Video upload" },
      { url: "/payment-variants-demo", title: "Payment (Pro 300/mnd)" },
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
];

export default function DemoIndex() {
  const total = GROUPS.reduce((sum, g) => sum + g.pilots.length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12">
          <div className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
            AK Golf Platform · Pilot-pages
          </div>
          <h1 className="mt-3 font-display text-5xl italic leading-tight">
            {total} produksjonsklare skjermer
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Komplett dekning av CoachHQ, PlayerHQ, Foreldreportal, Klubb-admin,
            Auth, Onboarding, Live Session, Talent-modulen og alle modaler.
            Alle pages er server components med design-system v2.
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
                    className="group flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm transition hover:border-primary hover:bg-primary/5"
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
            Sist oppdatert: 11.05.2026 · Alle pages er typesjekket med{" "}
            <code className="font-mono">npx tsc --noEmit</code>.
          </p>
        </footer>
      </div>
    </div>
  );
}
