/**
 * AgencyOS — Integrasjoner.
 *
 * Dashboard som viser status for alle tilkoblede tredjeparts-tjenester:
 * Google Calendar, Stripe, Notion, Anthropic, Resend, Supabase.
 */

import Link from "next/link";
import {
  Calendar,
  CreditCard,
  Database,
  FileText,
  Mail,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";

type Status = "active" | "connected" | "disconnected";

type Card = {
  key: string;
  title: string;
  icon: LucideIcon;
  status: Status;
  statusLabel: string;
  description: string;
  meta?: string;
  ctaLabel: string;
  ctaHref: string;
  ctaExternal?: boolean;
};

function nokFormat(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

export default async function IntegrasjonerPage() {
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

  const cards: Card[] = [
    {
      key: "google-calendar",
      title: "Google Calendar",
      icon: Calendar,
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
      icon: CreditCard,
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
      icon: FileText,
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
      icon: Sparkles,
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
      icon: Mail,
      status: resendAktiv ? "active" : "disconnected",
      statusLabel: resendAktiv ? "Aktiv" : "Ikke konfigurert",
      description: "Transaksjonell e-post — bekreftelser, påminnelser, maler.",
      ctaLabel: "E-postmaler",
      ctaHref: "/admin/email-templates",
    },
    {
      key: "supabase",
      title: "Supabase",
      icon: Database,
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="AgencyOS · Verktøy"
        titleLead="Tilkoblede"
        titleItalic="tjenester"
        sub="Status og konfigurasjon for tredjeparts-integrasjoner."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <IntegrationCard key={card.key} card={card} />
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status, label }: { status: Status; label: string }) {
  const tone =
    status === "active"
      ? "bg-accent/30 text-primary"
      : status === "connected"
        ? "bg-accent/30 text-primary"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${tone}`}
    >
      {label}
    </span>
  );
}

function IntegrationCard({ card }: { card: Card }) {
  const Icon = card.icon;
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-muted-foreground">
          <Icon size={20} strokeWidth={1.5} />
        </div>
        <StatusPill status={card.status} label={card.statusLabel} />
      </div>
      <div className="flex-1">
        <h3 className="font-display text-base font-semibold tracking-tight">
          {card.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {card.description}
        </p>
        {card.meta && (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {card.meta}
          </p>
        )}
      </div>
      <div className="border-t border-border pt-4">
        {card.ctaExternal ? (
          <a
            href={card.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {card.ctaLabel}
          </a>
        ) : (
          <Link
            href={card.ctaHref}
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {card.ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
