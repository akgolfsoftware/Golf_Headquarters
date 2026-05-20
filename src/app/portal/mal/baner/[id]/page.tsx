/**
 * PlayerHQ · Mål · Baner · Detalj
 *
 * Migrert fra public/design/batch3/bane-detalj-side.html.
 * Detalj-side per bane med hero, KPI-strip, tabs (hull/tidslinje/strategi/foto).
 */
import Link from "next/link";
import { MapPin, Plus, Share2, User, Flag, BarChart3, NotebookPen, Camera } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { BaneDetailTabs } from "./tabs";

type Hole = {
  n: number;
  par: number;
  len: number;
  avg: number;
  best: number;
  sg: number;
  hard?: boolean;
  easy?: boolean;
};

const HOLES: Hole[] = [
  { n: 1, par: 4, len: 365, avg: 4.2, best: 3, sg: -0.05 },
  { n: 2, par: 5, len: 510, avg: 4.9, best: 4, sg: 0.18 },
  { n: 3, par: 3, len: 172, avg: 3.1, best: 2, sg: -0.02 },
  { n: 4, par: 4, len: 405, avg: 4.4, best: 3, sg: -0.12 },
  { n: 5, par: 4, len: 380, avg: 3.9, best: 3, sg: 0.2 },
  { n: 6, par: 4, len: 298, avg: 3.4, best: 2, sg: 0.36, easy: true },
  { n: 7, par: 3, len: 158, avg: 3.0, best: 2, sg: 0.04 },
  { n: 8, par: 5, len: 525, avg: 5.1, best: 4, sg: -0.06 },
  { n: 9, par: 4, len: 410, avg: 4.1, best: 3, sg: 0 },
  { n: 10, par: 4, len: 388, avg: 4.0, best: 3, sg: 0.05 },
  { n: 11, par: 3, len: 195, avg: 3.4, best: 2, sg: -0.18 },
  { n: 12, par: 4, len: 415, avg: 4.2, best: 3, sg: 0.02 },
  { n: 13, par: 5, len: 540, avg: 5.2, best: 4, sg: 0.1 },
  { n: 14, par: 4, len: 360, avg: 4.0, best: 3, sg: 0.14 },
  { n: 15, par: 3, len: 180, avg: 3.2, best: 2, sg: -0.04 },
  { n: 16, par: 5, len: 495, avg: 4.8, best: 4, sg: 0.22 },
  { n: 17, par: 4, len: 422, avg: 4.8, best: 4, sg: -0.34, hard: true },
  { n: 18, par: 4, len: 394, avg: 4.1, best: 3, sg: 0 },
];

export default async function BaneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser();
  const { id } = await params;
  const bane = await prisma.courseDefinition.findUnique({ where: { id } });
  if (!bane) notFound();

  return (
    <div className="space-y-8 pb-32">
      <PageHeader
        eyebrow={`PlayerHQ · Baner · ${bane.name.split(" ")[0]}`}
        titleLead=""
        titleItalic={bane.name}
        sub={`Detalj-side for ${bane.name} — historikk, strategi og foto.`}
      />

      {/* Hero */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <MetaItem k="Par" v={String(bane.par)} />
            <MetaItem k="Slope" v="130" />
            <MetaItem k="Rating" v="71,4" />
            <MetaItem k="Lengde" v="6 412 m" />
            <MetaItem k="Designet" v="1923 · DJ Ross" />
          </div>
        </div>

        {/* Mini map */}
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <svg viewBox="0 0 280 180" className="h-full w-full">
            <rect width="280" height="180" fill="#B4C99D" />
            <path d="M20 30 Q60 20 90 50 T160 70 Q200 80 240 50" stroke="#8FAB6F" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M30 130 Q70 110 120 130 T220 120" stroke="#8FAB6F" strokeWidth="14" fill="none" strokeLinecap="round" />
            <ellipse cx="200" cy="115" rx="32" ry="14" fill="#7AA4B3" opacity="0.85" />
            <ellipse cx="80" cy="42" rx="6" ry="3" fill="#E8D9A9" />
            <ellipse cx="150" cy="62" rx="8" ry="4" fill="#E8D9A9" />
            <circle cx="40" cy="35" r="5" fill="#5E8C3F" />
            <circle cx="235" cy="48" r="5" fill="#5E8C3F" />
            <circle cx="220" cy="123" r="5" fill="#5E8C3F" />
          </svg>
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] backdrop-blur">
            <MapPin size={11} strokeWidth={1.75} />
            Fredrikstad · 1,1 km
          </div>
        </div>
      </section>

      {/* Hero stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Runder" value="28" sub="Siden mai 2024 · 11 i 2026" />
        <Stat label="Beste" value="67" sub="−4 · 14. juni 2025" />
        <Stat label="Snitt" value="73,2" sub="+2,2 pr. runde" />
        <Stat label="SG total" value="+1,4" sub="T2G +0,8 · Putt +0,6" accent />
      </section>

      <BaneDetailTabs holes={HOLES} />

      {/* Footer actions */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            Sist runde: <strong className="text-foreground">18. apr 2026</strong>{" "}
            · 72 slag · +1
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/40"
            >
              <MapPin size={12} strokeWidth={1.75} /> Se på kart
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/40"
            >
              <User size={12} strokeWidth={1.75} /> Book caddy/coach
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/40"
            >
              <Share2 size={12} strokeWidth={1.75} /> Del
            </button>
            <Link
              href="/portal/mal/runder/ny"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={14} strokeWidth={2} /> Logg runde her
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const BANE_TAB_ICONS = { Flag, BarChart3, NotebookPen, Camera };

function MetaItem({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {k}
      </span>
      <span className="font-mono text-base font-semibold text-foreground tabular-nums">
        {v}
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <div
        className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}
