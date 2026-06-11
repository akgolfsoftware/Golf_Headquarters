/**
 * PlayerHQ Varsler (/portal/varsler) — portet FRA fersk Claude Design-fasit
 * (ph-screens.jsx · VarslerScreen).
 *
 * Struktur: eyebrow + «{N} uleste.» (em primary italic) + «Marker alle lest»
 * (desktop, ekte server action) → grupper I DAG / TIDLIGERE med rader:
 * ikon-chip per type (lime ulest-dot), tittel, meta, relativ tid. Rad lenker
 * til varselets link når satt. Ekte Notification-data — tomstate ellers.
 */

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Zap,
  Target,
  MessageSquare,
  Trophy,
  BarChart3,
  Calendar,
  CreditCard,
  Receipt,
  BotMessageSquare,
  Bell,
  Info,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { markNotificationsRead } from "./actions";

export const dynamic = "force-dynamic";

const IKON: Record<string, LucideIcon> = {
  plan: Zap,
  drill: Target,
  melding: MessageSquare,
  turnering: Trophy,
  achievement: Trophy,
  runde: BarChart3,
  trackman: Zap,
  booking: Calendar,
  credit: CreditCard,
  betaling: CreditCard,
  faktura: Receipt,
  ai: BotMessageSquare,
  system: Bell,
};

const TALLORD = ["Ingen", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv"];

function relTid(d: Date, now: Date): string {
  const startIdag = new Date(now);
  startIdag.setHours(0, 0, 0, 0);
  if (d >= startIdag) {
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  const dager = Math.floor((startIdag.getTime() - d.getTime()) / 86_400_000) + 1;
  if (dager === 1) return "I går";
  if (dager < 7) return `${dager} dager`;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

type Rad = {
  id: string;
  ikon: LucideIcon;
  tittel: string;
  meta: string | null;
  tid: string;
  ulest: boolean;
  link: string | null;
};

function VarselRad({ n }: { n: Rad }) {
  const Ikon = n.ikon;
  const inner = (
    <>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-secondary text-primary">
        <Ikon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        {n.ulest && (
          <span className="absolute -right-0.5 -top-0.5 h-[9px] w-[9px] rounded-full border-2 border-card bg-accent shadow-[0_0_6px_rgba(209,248,67,0.5)]" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold tracking-[-0.005em] text-foreground">{n.tittel}</span>
        {n.meta && <span className="mt-[3px] block truncate font-mono text-[10px] text-muted-foreground">{n.meta}</span>}
      </span>
      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{n.tid}</span>
    </>
  );
  const cls =
    "flex w-full items-center gap-3.5 border-b border-border py-3.5 text-left last:border-b-0 transition-colors hover:bg-secondary/40";
  return n.link ? (
    <Link href={n.link} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function Gruppe({ label, rader }: { label: string; rader: Rad[] }) {
  if (!rader.length) return null;
  return (
    <section>
      <div className="mb-3 mt-7 flex items-baseline justify-between">
        <AthleticEyebrow>{label}</AthleticEyebrow>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card px-4">
        {rader.map((n) => (
          <VarselRad key={n.id} n={n} />
        ))}
      </div>
    </section>
  );
}

export default async function VarslerPage() {
  const user = await requirePortalUser();

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const now = new Date();
  const startIdag = new Date(now);
  startIdag.setHours(0, 0, 0, 0);

  const rader: Rad[] = rows.map((r) => ({
    id: r.id,
    ikon: IKON[r.type] ?? Info,
    tittel: r.title,
    meta: r.body,
    tid: relTid(r.createdAt, now),
    ulest: r.readAt == null,
    link: r.link,
  }));

  const idag = rader.filter((_, i) => rows[i].createdAt >= startIdag);
  const tidligere = rader.filter((_, i) => rows[i].createdAt < startIdag);
  const uleste = rader.filter((r) => r.ulest).length;
  const ulesteOrd = uleste <= 12 ? TALLORD[uleste] : String(uleste);

  async function markerAlleLest() {
    "use server";
    await markNotificationsRead();
  }

  return (
    <div className="mx-auto w-full max-w-[460px] px-1 pb-10 pt-2 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <AthleticEyebrow>PLAYERHQ · VARSLER</AthleticEyebrow>
          <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.04] tracking-[-0.025em] text-foreground md:text-[30px]">
            {ulesteOrd} <em className="font-normal italic text-primary">uleste.</em>
          </h1>
        </div>
        {rader.length > 0 && (
          <form action={markerAlleLest} className="hidden md:block">
            <button
              type="submit"
              className="inline-flex h-11 items-center rounded-full border border-primary px-4 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-primary transition-colors hover:bg-primary/5"
            >
              Marker alle lest
            </button>
          </form>
        )}
      </div>

      <div className="max-w-[680px]">
        {rader.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">Ingen varsler ennå.</p>
        ) : (
          <>
            <Gruppe label="I DAG" rader={idag} />
            <Gruppe label="TIDLIGERE" rader={tidligere} />
          </>
        )}
      </div>
    </div>
  );
}
