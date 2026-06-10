/**
 * AgencyOS — Kalender (GJENNOMFØRE · KALENDER), /admin/kalender.
 *
 * Port av fasit `agencyos-app/screens-ops.jsx` → CalendarScreen (mørkt tema,
 * desktop 1280): PageHead («Uke N · din uke.» + «Ny økt»), UKE/MÅNED-seg og
 * uke-grid man–fre 08–20 med økt-blokker. Venstre kant farges etter pyramide-
 * akse (best-effort fra tjenestenavn), lime ring = økt pågår nå.
 *
 * Datakilde: loadWeekCalendar (Prisma booking, gjenbrukt fra forrige versjon).
 * ?uke=YYYY-MM-DD støttes fortsatt for dyplenker. MÅNED-seg lenker til
 * eksisterende /admin/kalender/maned (urørt underside).
 */

import Link from "next/link";
import { Plus } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadWeekCalendar } from "@/lib/admin-kalender/week-data";
import { AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ uke?: string }>;

/** Pyramide-akse, best-effort fra tjenestenavn (fasit farger økter per akse). */
type Akse = "fys" | "tek" | "slag" | "spill" | "turn";

function akseFra(serviceLabel: string): Akse {
  const t = serviceLabel.toLowerCase();
  if (/(fys|speed|styrke|screening|mobilitet)/.test(t)) return "fys";
  if (/(turnering)/.test(t)) return "turn";
  if (/(trackman|driver|innspill|wedge|jern|slag)/.test(t)) return "slag";
  if (/(spill|bane|hull|runde|tee)/.test(t)) return "spill";
  return "tek";
}

/** Literal-klasser så Tailwind plukker dem opp (aldri template-interpolering). */
const AKSE_BAR: Record<Akse, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

/* Fasit-grid: 6 rader à 93px = vindu 08:00–20:00 (120 min per rad). */
const VINDU_START_MIN = 8 * 60;
const VINDU_SLUTT_MIN = 20 * 60;
const RAD_PX = 93;
const PX_PER_MIN = RAD_PX / 120;
const GRID_PX = 6 * RAD_PX;

function dagLabel(dow: string, date: string): string {
  return `${dow.charAt(0)}${dow.slice(1).toLowerCase()} ${date}`;
}

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const { uke } = await searchParams;
  const props = await loadWeekCalendar(uke);

  // Fasit viser man–fre. Økter utenfor kolonnene/tidsvinduet vises ikke her.
  const dager = props.days.slice(0, 5);
  const synlige = props.events.filter(
    (e) => e.dayIndex <= 4 && e.endMin > VINDU_START_MIN && e.startMin < VINDU_SLUTT_MIN,
  );

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Gjennomføre · Kalender"
        title={`Uke ${props.weekNumber}`}
        italic="· din uke."
        lead="Alle øktene dine på tvers av stallen. Lime kant = pågår nå."
        actions={
          <Link href="/admin/coach-workbench" className={agBtnClass("primary")}>
            <Plus size={16} strokeWidth={1.5} /> Ny økt
          </Link>
        }
      />

      {/* UKE/MÅNED-seg (fasit .seg) — MÅNED er lenke til eksisterende underside */}
      <div className="mb-[14px] inline-flex gap-[2px] rounded-lg bg-secondary p-[3px]">
        <span className="inline-flex h-[26px] items-center rounded-md bg-card px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-primary shadow-sm">
          Uke
        </span>
        <Link
          href="/admin/kalender/maned"
          className="inline-flex h-[26px] items-center rounded-md px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Måned
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Dag-header */}
        <div className="grid grid-cols-[56px_repeat(5,1fr)]">
          <div className="border-b border-r border-border" />
          {dager.map((d) => (
            <div
              key={`${d.dow}-${d.date}`}
              className={cn(
                "border-b border-r border-border py-3 text-center font-mono text-[11px] font-bold",
                d.isToday ? "text-primary" : "text-foreground",
              )}
            >
              {dagLabel(d.dow, String(d.date))}
            </div>
          ))}
        </div>

        {/* Tids-grid */}
        <div className="relative grid grid-cols-[56px_repeat(5,1fr)]" style={{ height: GRID_PX + 2 }}>
          <div>
            {["08", "10", "12", "14", "16", "18"].map((h) => (
              <div
                key={h}
                className="h-[93px] border-r border-border px-2 py-1 text-right font-mono text-[9px] text-muted-foreground"
              >
                {h}:00
              </div>
            ))}
          </div>
          {[0, 1, 2, 3, 4].map((di) => (
            <div key={di} className="relative border-r border-border">
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <div key={r} className="h-[93px] border-b border-border" />
              ))}
              {synlige
                .filter((e) => e.dayIndex === di)
                .map((e) => {
                  const topPx = (Math.max(e.startMin, VINDU_START_MIN) - VINDU_START_MIN) * PX_PER_MIN;
                  const bunnPx = (Math.min(e.endMin, VINDU_SLUTT_MIN) - VINDU_START_MIN) * PX_PER_MIN;
                  const hoydePx = Math.max(bunnPx - topPx, 28);
                  const akse = akseFra(e.serviceLabel);
                  return (
                    <div
                      key={e.id}
                      className="absolute left-1 right-1"
                      style={{ top: topPx, height: hoydePx }}
                    >
                      <span
                        className={cn(
                          "relative block h-full overflow-hidden rounded-[7px] border border-border bg-background py-[6px] pl-3 pr-2",
                          e.kind === "live" && "bg-card ring-2 ring-accent",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute bottom-2 left-0 top-2 w-[3px] rounded-full",
                            AKSE_BAR[akse],
                          )}
                        />
                        <span className="block truncate text-[11px] font-bold text-foreground">
                          {e.title}
                        </span>
                        <span className="mt-[2px] block truncate font-mono text-[9px] text-muted-foreground">
                          {e.timeLabel} · {e.serviceLabel}
                        </span>
                      </span>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </AgPage>
  );
}
