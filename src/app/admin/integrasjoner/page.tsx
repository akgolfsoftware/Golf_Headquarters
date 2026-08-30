/**
 * AgencyOS — Integrasjoner (Train-lock, T13-detaljer 27.08.2026).
 *
 * Port av /admin/(legacy)/integrasjoner: dashboard som viser status for alle
 * tilkoblede tredjeparts-tjenester (Google Calendar, Stripe, Notion,
 * Anthropic, Resend, Supabase). Data/logikk (env-sjekker, Prisma-spørringer,
 * NOK-formatering, CTA-adresser) er UENDRET fra Paper-versjonen — kun
 * visningen er byttet til `AdminIntegrasjonerTrainLock` (TL.*).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminIntegrasjonerTrainLock, type IntegrasjonKort, type IntegrasjonStatus } from "@/components/admin/v2/oppsett/AdminIntegrasjonerTrainLock";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";

export const dynamic = "force-dynamic";

function nokFormat(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

export default async function V2IntegrasjonerPage() {
  const me = await requirePortalUser({ allow: ["ADMIN"] });

  // Google Calendar — sjekk om current user har en kobling, og om den
  // krever ny pålogging (status ERROR — f.eks. utløpt/tilbakekalt token).
  const googleConn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: me.id },
    select: { id: true, updatedAt: true, status: true, lastError: true },
  });
  const googleKreverPalogging = googleConn?.status === "ERROR";

  // Stripe — env-sjekk + sum av betalte bookinger siste 30 dager.
  const stripeAktiv = Boolean(process.env.STRIPE_SECRET_KEY);
  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);
  const stripeSum = stripeAktiv
    ? await prisma.booking.aggregate({
        _sum: { priceOre: true },
        where: {
          stripePaymentIntentId: { not: null },
          startAt: { gte: tretti },
        },
      })
    : null;
  const stripeBelop = stripeSum?._sum.priceOre ?? 0;

  const anthropicAktiv = Boolean(process.env.ANTHROPIC_API_KEY);
  const resendAktiv = Boolean(process.env.RESEND_API_KEY);

  const cards: IntegrasjonKort[] = [
    {
      key: "google-calendar",
      title: "Google Calendar",
      icon: "calendar",
      status: (googleKreverPalogging ? "error" : googleConn ? "connected" : "disconnected") as IntegrasjonStatus,
      statusLabel: googleKreverPalogging ? "Krever pålogging" : googleConn ? "Koblet" : "Ikke koblet",
      description:
        "Toveis-sync av timer og bookinger med trenerens Google-kalender.",
      meta: googleKreverPalogging
        ? (googleConn?.lastError ?? "Tilgangen utløp — logg inn på nytt.")
        : googleConn
          ? `Sist oppdatert ${googleConn.updatedAt.toLocaleDateString("nb-NO")}`
          : undefined,
      ctaLabel: googleKreverPalogging ? "Logg inn på nytt" : googleConn ? "Administrer" : "Koble til",
      ctaHref: "/admin/settings/calendar",
    },
    {
      key: "stripe",
      title: "Stripe",
      icon: "credit-card",
      status: (stripeAktiv ? "active" : "disconnected") as IntegrasjonStatus,
      statusLabel: stripeAktiv ? "Aktiv" : "Ikke konfigurert",
      description: "Betaling for bookinger, abonnement og fakturering.",
      meta: stripeAktiv
        ? `${nokFormat(stripeBelop)} siste 30 dager`
        : undefined,
      ctaLabel: "Se økonomi",
      ctaHref: "/admin/finance",
    },
    {
      key: "notion",
      title: "Notion",
      icon: "file-text",
      status: "disconnected",
      statusLabel: "Ikke koblet",
      description: "Speil prosjekter og oppgaver fra Notion-arbeidsområdet.",
      meta: "Venter på Notion-token",
      ctaLabel: "Koble Notion",
      ctaHref: "https://www.notion.so/profile/integrations",
      ctaExternal: true,
    },
    {
      key: "anthropic",
      title: "Anthropic (AI)",
      icon: "sparkles",
      status: (anthropicAktiv ? "active" : "disconnected") as IntegrasjonStatus,
      statusLabel: anthropicAktiv ? "Aktiv" : "Ikke konfigurert",
      description:
        "Claude-modeller for AI-agenter, godkjennelser og innholdsgenerering.",
      ctaLabel: "Se agenter",
      ctaHref: "/admin/agenticos",
    },
    {
      key: "resend",
      title: "Resend (E-post)",
      icon: "mail",
      status: (resendAktiv ? "active" : "disconnected") as IntegrasjonStatus,
      statusLabel: resendAktiv ? "Aktiv" : "Ikke konfigurert",
      description: "Transaksjonell e-post — bekreftelser, påminnelser, maler.",
      ctaLabel: "E-postmaler",
      ctaHref: "/admin/email-templates",
    },
    {
      key: "supabase",
      title: "Supabase",
      icon: "database",
      status: "active",
      statusLabel: "Aktiv",
      description:
        "Postgres-database og autentisering. Kjernen i hele plattformen.",
      meta: "Always-on",
      ctaLabel: "Status",
      ctaHref: "https://status.supabase.com",
      ctaExternal: true,
    },
  ];

  return (
    <V2Shell bredde="kolonne" aktiv="cockpit" nav={AGENCYOS_NAV} navn={me.name ?? "Coach"}>
      <TlTilbake href="/admin/agencyos">Cockpit</TlTilbake>
      <AdminIntegrasjonerTrainLock cards={cards} />
    </V2Shell>
  );
}
