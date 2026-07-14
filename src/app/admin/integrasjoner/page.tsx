/**
 * AgencyOS — Integrasjoner (`/admin/integrasjoner`), v2.
 * Port av `(legacy)/integrasjoner/page.tsx` (2026-07-14, AgencyOS Bølge 3.1) —
 * samme statuskilder (Prisma + env-sjekk), ny v2-presentasjon i
 * `AdminIntegrasjonerV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminIntegrasjonerV2, type AdminIntegrasjonV2Card } from "@/components/admin/v2/AdminIntegrasjonerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Integrasjoner · AgencyOS (v2)" };

function nokFormat(ore: number): string {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(ore / 100);
}

export default async function IntegrasjonerPage() {
  const me = await requirePortalUser({ allow: ["ADMIN"] });

  const googleConn = await prisma.googleCalendarConnection.findUnique({ where: { userId: me.id }, select: { id: true, updatedAt: true } });

  const stripeAktiv = Boolean(process.env.STRIPE_SECRET_KEY);
  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);
  const stripeSum = stripeAktiv
    ? await prisma.booking.aggregate({ _sum: { priceOre: true }, where: { stripePaymentIntentId: { not: null }, startAt: { gte: tretti } } })
    : null;
  const stripeBelop = stripeSum?._sum.priceOre ?? 0;

  const anthropicAktiv = Boolean(process.env.ANTHROPIC_API_KEY);
  const resendAktiv = Boolean(process.env.RESEND_API_KEY);

  const cards: AdminIntegrasjonV2Card[] = [
    {
      key: "google-calendar", title: "Google Calendar", ikon: "calendar",
      status: googleConn ? "connected" : "disconnected", statusLabel: googleConn ? "Koblet" : "Ikke koblet",
      description: "Toveis-sync av timer og bookinger med trenerens Google-kalender.",
      meta: googleConn ? `Sist oppdatert ${googleConn.updatedAt.toLocaleDateString("nb-NO")}` : undefined,
      ctaLabel: googleConn ? "Administrer" : "Koble til", ctaHref: "/admin/settings/calendar",
    },
    {
      key: "stripe", title: "Stripe", ikon: "credit-card",
      status: stripeAktiv ? "active" : "disconnected", statusLabel: stripeAktiv ? "Aktiv" : "Ikke konfigurert",
      description: "Betaling for bookinger, abonnement og fakturering.",
      meta: stripeAktiv ? `${nokFormat(stripeBelop)} siste 30 dager` : undefined,
      ctaLabel: "Se økonomi", ctaHref: "/admin/finance",
    },
    {
      key: "notion", title: "Notion", ikon: "file-text",
      status: "disconnected", statusLabel: "Ikke koblet",
      description: "Speil prosjekter og oppgaver fra Notion-arbeidsområdet.",
      meta: "Venter på Notion-token",
      ctaLabel: "Koble Notion", ctaHref: "https://www.notion.so/profile/integrations", ctaExternal: true,
    },
    {
      key: "anthropic", title: "Anthropic (AI)", ikon: "sparkles",
      status: anthropicAktiv ? "active" : "disconnected", statusLabel: anthropicAktiv ? "Aktiv" : "Ikke konfigurert",
      description: "Claude-modeller for AI-agenter, godkjennelser og innholdsgenerering.",
      ctaLabel: "Se agenter", ctaHref: "/admin/agents",
    },
    {
      key: "resend", title: "Resend (E-post)", ikon: "mail",
      status: resendAktiv ? "active" : "disconnected", statusLabel: resendAktiv ? "Aktiv" : "Ikke konfigurert",
      description: "Transaksjonell e-post — bekreftelser, påminnelser, maler.",
      ctaLabel: "E-postmaler", ctaHref: "/admin/email-templates",
    },
    {
      key: "supabase", title: "Supabase", ikon: "layers",
      status: "active", statusLabel: "Aktiv",
      description: "Postgres-database og autentisering. Kjernen i hele plattformen.",
      meta: "Always-on",
      ctaLabel: "Status", ctaHref: "https://status.supabase.com", ctaExternal: true,
    },
  ];

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={me.name} avatarUrl={me.avatarUrl}>
      <AdminIntegrasjonerV2 cards={cards} />
    </V2Shell>
  );
}
