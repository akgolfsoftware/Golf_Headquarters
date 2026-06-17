/**
 * PlayerHQ Varsler (/portal/varsler) — hybrid-design 2026-06-17
 *
 * Portert fra: public/design-handover/prosjektgjennomgang-2026-06-17/
 *   prosjektgjennomgang-og-wireframing/project/PlayerHQ Varsler (hybrid).dc.html
 *
 * Designelementer (rekkefølge ovenfra):
 *   1. Eyebrow «PLAYERHQ · VARSLER» + H1 «Varsler nå» (italic accent) + «N nye»-pill
 *   2. «Marker alle lest»-knapp (md+, server action via klient-wrapper)
 *   3. Kortgruppe «I DAG» (sand header + varsel-rader med ikon-sirkel + lime-prikk)
 *   4. Tom-tilstand-kort «Ingen eldre varsler» (alltid synlig under ekte rader)
 *   5. Full tom-tilstand når ingen varsler finnes
 *
 * Data: ekte Notification-rader fra Prisma (via mapVarslerData).
 * Actions: markNotificationsRead fra ./actions (brukt av klient-komponenten).
 */

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BotMessageSquare,
  Calendar,
  CreditCard,
  Info,
  MessageSquare,
  Receipt,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { VarslerMarkerKnapp } from "./VarslerMarkerKnapp";

export const dynamic = "force-dynamic";

// ── Ikon-oppslag per varsel-type ─────────────────────────────────

type Presentasjon = {
  icon: LucideIcon;
  /** Tailwind-klasser for ikon-sirkel (bakgrunn + ikon-farge). */
  ic: string;
};

const PRESENTASJON: Record<string, Presentasjon> = {
  plan: { icon: Zap, ic: "bg-primary/[0.12] text-primary" },
  drill: { icon: Target, ic: "bg-primary/[0.10] text-primary" },
  melding: { icon: MessageSquare, ic: "bg-info/10 text-info" },
  turnering: { icon: Trophy, ic: "bg-destructive/10 text-destructive" },
  achievement: { icon: Trophy, ic: "bg-accent/20 text-accent-foreground" },
  runde: { icon: BarChart3, ic: "bg-accent/20 text-accent-foreground" },
  trackman: { icon: Zap, ic: "bg-primary/[0.10] text-primary" },
  booking: { icon: Calendar, ic: "bg-primary/[0.08] text-primary" },
  credit: { icon: CreditCard, ic: "bg-warning/15 text-warning" },
  betaling: { icon: CreditCard, ic: "bg-warning/15 text-warning" },
  faktura: { icon: Receipt, ic: "bg-primary/[0.08] text-primary" },
  ai: { icon: BotMessageSquare, ic: "bg-accent/20 text-accent-foreground" },
  system: { icon: Bell, ic: "bg-secondary text-muted-foreground" },
};

const FALLBACK: Presentasjon = {
  icon: Info,
  ic: "bg-secondary text-muted-foreground",
};

function presentasjon(type: string): Presentasjon {
  return PRESENTASJON[type] ?? FALLBACK;
}

// ── Dato-hjelp ────────────────────────────────────────────────────

function relTid(d: Date, now: Date): string {
  const startIdag = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (d >= startIdag) {
    return d.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Oslo",
    });
  }
  const dager =
    Math.floor((startIdag.getTime() - d.getTime()) / 86_400_000) + 1;
  if (dager === 1) return "I går";
  if (dager < 7) return `${dager} dager`;
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Oslo",
  });
}

// ── Typer ─────────────────────────────────────────────────────────

type VarselData = {
  id: string;
  icon: LucideIcon;
  ic: string;
  tittel: string;
  tid: string;
  ulest: boolean;
  link: string | null;
};

// ── Varsel-rad (server-rendret) ───────────────────────────────────

function VarselRad({ n }: { n: VarselData }) {
  const Ikon = n.icon;

  const inner = (
    <div
      className="flex items-start gap-[11px] border-b border-border px-4 py-[13px] last:border-b-0 transition-colors hover:bg-primary/[0.02]"
      style={n.ulest ? { background: "rgba(209,248,67,.05)" } : undefined}
    >
      {/* ikon-sirkel */}
      <span
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.ic}`}
        aria-hidden
      >
        <Ikon className="h-4 w-4" strokeWidth={1.5} />
      </span>

      {/* tekst */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-[13.5px] leading-[1.4] ${n.ulest ? "font-bold text-foreground" : "font-medium text-foreground/75"}`}
        >
          {n.tittel}
        </p>
        <p className="mt-[3px] font-mono text-[10px] text-muted-foreground">
          {n.tid}
        </p>
      </div>

      {/* ulest-prikk */}
      {n.ulest && (
        <span
          className="mt-1 h-[7px] w-[7px] shrink-0 rounded-full bg-accent"
          aria-label="Ulest"
        />
      )}
    </div>
  );

  if (n.link) {
    return (
      <a
        href={n.link}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

// ── Seksjonskort (sand-header + rader) ───────────────────────────

function Seksjonskort({
  label,
  rader,
}: {
  label: string;
  rader: VarselData[];
}) {
  if (rader.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-[0_1px_4px_rgba(10,31,23,0.06)]">
      {/* sand-header */}
      <div className="border-b border-border bg-secondary px-4 py-[9px]">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
      </div>
      {/* rader */}
      <div>
        {rader.map((n) => (
          <VarselRad key={n.id} n={n} />
        ))}
      </div>
    </div>
  );
}

// ── Tom-tilstand (ingen eldre) ────────────────────────────────────

function IngenEldreKort() {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-[0_1px_4px_rgba(10,31,23,0.06)]">
      <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Bell className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </span>
        <div>
          <p className="text-[14px] font-semibold text-foreground">
            Ingen eldre varsler
          </p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Varsler eldre enn 7 dager slettes automatisk.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Full tom-tilstand ─────────────────────────────────────────────

function FullTomTilstand() {
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-[0_1px_4px_rgba(10,31,23,0.06)]">
      <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Bell className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </span>
        <div>
          <p className="font-display text-[17px] font-semibold tracking-tight text-foreground">
            Ingen varsler — du er{" "}
            <em className="font-normal italic text-primary">à jour</em>
          </p>
          <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
            Alt nytt vises her: meldinger fra coach, AI Caddie-forslag,
            bookinger og fakturaer.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Side ──────────────────────────────────────────────────────────

export default async function VarslerPage() {
  const user = await requirePortalUser();

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const now = new Date();
  const startIdag = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const alleRader: VarselData[] = rows.map((r) => {
    const p = presentasjon(r.type);
    return {
      id: r.id,
      icon: p.icon,
      ic: p.ic,
      tittel: r.title,
      tid: relTid(r.createdAt, now),
      ulest: r.readAt == null,
      link: r.link,
    };
  });

  const idagRader = alleRader.filter(
    (_, i) => rows[i].createdAt >= startIdag,
  );
  const tidligereRader = alleRader.filter(
    (_, i) => rows[i].createdAt < startIdag,
  );
  const uleste = alleRader.filter((r) => r.ulest).length;

  const TALLORD = [
    "Ingen",
    "Én",
    "To",
    "Tre",
    "Fire",
    "Fem",
    "Seks",
    "Sju",
    "Åtte",
    "Ni",
    "Ti",
    "Elleve",
    "Tolv",
  ];
  const ulesteOrd = uleste <= 12 ? TALLORD[uleste] : String(uleste);

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 pb-10 pt-2 md:max-w-[600px] md:px-6 md:pt-6">
      {/* Topp-rad: tittel + pill + «marker alle»-knapp */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <h1 className="font-display text-[28px] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
          Varsler
          <em className="font-medium italic text-primary"> nå</em>
          {uleste > 0 && (
            <span className="ml-3 align-middle font-mono text-[9.5px] font-bold uppercase tracking-[0.06em] bg-accent text-accent-foreground px-[9px] py-[3px] rounded-full not-italic">
              {ulesteOrd} nye
            </span>
          )}
        </h1>

        {/* Marker alle lest — klient-knapp (md+) */}
        {alleRader.length > 0 && uleste > 0 && (
          <VarslerMarkerKnapp className="hidden shrink-0 pt-1 md:inline-flex" />
        )}
      </div>

      {/* Mobil: marker alle lest under tittelraden */}
      {alleRader.length > 0 && uleste > 0 && (
        <div className="mb-4 md:hidden">
          <VarslerMarkerKnapp />
        </div>
      )}

      {/* Innhold */}
      <div className="flex flex-col gap-[14px]">
        {alleRader.length === 0 ? (
          <FullTomTilstand />
        ) : (
          <>
            <Seksjonskort label="I dag" rader={idagRader} />
            <Seksjonskort label="Tidligere" rader={tidligereRader} />
            <IngenEldreKort />
          </>
        )}
      </div>
    </div>
  );
}
