/**
 * AgencyOS — Integrasjoner (v2, retning C «Presis»).
 *
 * Port av /admin/(legacy)/integrasjoner: dashboard som viser status for alle
 * tilkoblede tredjeparts-tjenester (Google Calendar, Stripe, Notion,
 * Anthropic, Resend, Supabase). Data/logikk (env-sjekker, Prisma-spørringer,
 * NOK-formatering, CTA-adresser) er kopiert verbatim fra legacy-fasiten —
 * dette er ekte infrastruktur-status, ikke pynt.
 *
 * Rent lesbart statusgrid uten interaksjon → server component, ingen
 * "use client", ingen egen komponentfil. Kun v2-primitiver (Kort/StatusPill/
 * Icon) fra "@/components/v2" — ingen rå hex, ingen ad-hoc UI.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  TilbakeLenke,
  Kort,
  StatusPill,
  Icon,
  Caps,
  Tittel,
  CTAPill,
  T,
  type StatusTone,
} from "@/components/v2";

export const dynamic = "force-dynamic";

type IntegrasjonStatus = "active" | "connected" | "disconnected";

type IntegrasjonKort = {
  key: string;
  title: string;
  icon: string;
  status: IntegrasjonStatus;
  statusLabel: string;
  description: string;
  meta?: string;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal?: boolean;
};

const TONE_FOR_STATUS: Record<IntegrasjonStatus, StatusTone> = {
  active: "lime",
  connected: "lime",
  disconnected: "warn",
};

function nokFormat(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

export default async function V2IntegrasjonerPage() {
  const me = await requirePortalUser({ allow: ["ADMIN"] });

  // Google Calendar — sjekk om current user har en kobling.
  const googleConn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: me.id },
    select: { id: true, updatedAt: true },
  });

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
      status: googleConn ? "connected" : "disconnected",
      statusLabel: googleConn ? "Koblet" : "Ikke koblet",
      description:
        "Toveis-sync av timer og bookinger med trenerens Google-kalender.",
      meta: googleConn
        ? `Sist oppdatert ${googleConn.updatedAt.toLocaleDateString("nb-NO")}`
        : undefined,
      ctaLabel: googleConn ? "Administrer" : "Koble til",
      ctaHref: "/admin/settings/calendar",
    },
    {
      key: "stripe",
      title: "Stripe",
      icon: "credit-card",
      status: stripeAktiv ? "active" : "disconnected",
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
      status: anthropicAktiv ? "active" : "disconnected",
      statusLabel: anthropicAktiv ? "Aktiv" : "Ikke konfigurert",
      description:
        "Claude-modeller for AI-agenter, godkjennelser og innholdsgenerering.",
      ctaLabel: "Se agenter",
      ctaHref: "/admin/agents",
    },
    {
      key: "resend",
      title: "Resend (E-post)",
      icon: "mail",
      status: resendAktiv ? "active" : "disconnected",
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
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={me.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>AgencyOS · Verktøy</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="tjenester.">Tilkoblede</Tittel>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <IntegrasjonKortView key={card.key} card={card} />
          ))}
        </div>
      </div>
    </V2Shell>
  );
}

function IntegrasjonKortView({ card }: { card: IntegrasjonKort }) {
  return (
    <Kort>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: 10,
            background: T.panel2,
            border: `1px solid ${T.border}`,
            color: T.fg2,
            flex: "none",
          }}
        >
          <Icon name={card.icon} size={18} />
        </span>
        <StatusPill tone={TONE_FOR_STATUS[card.status]}>
          {card.statusLabel}
        </StatusPill>
      </div>
      <div style={{ marginTop: 16, flex: 1 }}>
        <div
          style={{
            fontFamily: T.disp,
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "-0.01em",
            color: T.fg,
          }}
        >
          {card.title}
        </div>
        <p
          style={{
            marginTop: 8,
            fontFamily: T.ui,
            fontSize: 13,
            lineHeight: 1.55,
            color: T.mut,
          }}
        >
          {card.description}
        </p>
        {card.meta && (
          <p
            style={{
              marginTop: 14,
              fontFamily: T.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: T.mut,
            }}
          >
            {card.meta}
          </p>
        )}
      </div>
      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: `1px solid ${T.border}`,
        }}
      >
        {card.ctaExternal ? (
          <a
            href={card.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <CTAPill icon="external-link">{card.ctaLabel}</CTAPill>
          </a>
        ) : (
          <Link href={card.ctaHref} style={{ textDecoration: "none" }}>
            <CTAPill>{card.ctaLabel}</CTAPill>
          </Link>
        )}
      </div>
    </Kort>
  );
}
