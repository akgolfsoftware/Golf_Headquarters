/**
 * AgencyOS — Tilgjengelighet (GJENNOMFØRE · TILGJENGELIGHET), /admin/availability.
 *
 * Port av fasit `agencyos-app/screens-ops.jsx` → AvailabilityScreen (mørkt
 * tema, desktop 1280): PageHead («Din måned, åpen for booking.» + Synk),
 * måned-kalender man-først med grønne «åpen for booking»-dager (tidsrom i
 * cellen), accent-dot på i dag, måned-navigasjon og tegnforklaring.
 *
 * Datakilde: prisma.coachAvailability (ukentlige vinduer per coach) projisert
 * på datoene i valgt måned — ekte data, ingen per-dato-overstyringer i modellen
 * ennå. Visningen er statisk: fasitens klikk-og-rediger-panel er ikke koblet
 * (CRUD finnes i ./slot-form.tsx + ./actions.ts — uendret). Måned-navigasjon
 * via ?m=YYYY-MM. Synk-knappen er no-op som i fasit-demoen.
 */

import Link from "next/link";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MND_NB = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];
const UKEDAGER_NB = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

type SearchParams = Promise<{ m?: string }>;

/** ?m=YYYY-MM → {y, m(0-11)}, ellers inneværende måned. */
function parseMnd(param: string | undefined): { y: number; m: number } {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const y = Number(param.slice(0, 4));
    const m = Number(param.slice(5, 7)) - 1;
    if (m >= 0 && m <= 11) return { y, m };
  }
  const naa = new Date();
  return { y: naa.getFullYear(), m: naa.getMonth() };
}

function mndParam(y: number, m: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

function skift(y: number, m: number, delta: number): { y: number; m: number } {
  let nm = m + delta;
  let ny = y;
  if (nm < 0) { nm = 11; ny--; }
  if (nm > 11) { nm = 0; ny++; }
  return { y: ny, m: nm };
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { m: mParam } = await searchParams;
  const { y, m } = parseMnd(mParam);

  // Egne aktive uke-vinduer → tidsrom per ukedag (0 = mandag).
  const slots = await prisma.coachAvailability.findMany({
    where: { coachId: user.id, active: true },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    select: { weekday: true, startTime: true, endTime: true },
  });
  const perUkedag = new Map<number, string>();
  for (const s of slots) {
    const range = `${s.startTime}–${s.endTime}`;
    perUkedag.set(s.weekday, perUkedag.has(s.weekday) ? `${perUkedag.get(s.weekday)} · ${range}` : range);
  }

  // Måned-grid, mandag først.
  const dagerIMnd = new Date(y, m + 1, 0).getDate();
  const innrykk = (new Date(y, m, 1).getDay() + 6) % 7;
  const celler: Array<number | null> = [];
  for (let i = 0; i < innrykk; i++) celler.push(null);
  for (let d = 1; d <= dagerIMnd; d++) celler.push(d);
  while (celler.length % 7) celler.push(null);

  const naa = new Date();
  const erIdag = (d: number) =>
    y === naa.getFullYear() && m === naa.getMonth() && d === naa.getDate();

  const forrige = skift(y, m, -1);
  const neste = skift(y, m, 1);

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Gjennomføre · Tilgjengelighet"
        title="Din måned,"
        italic="åpen for booking."
        lead="Klikk en dato og skriv inn tidsrommet du er tilgjengelig, f.eks. 10:00 – 18:00. Grønne dager er åpne for spiller-booking."
        actions={
          <button type="button" className={agBtnClass("ghost")}>
            <RefreshCw size={16} strokeWidth={1.5} /> Synk
          </button>
        }
      />

      <div className="rounded-xl border border-border bg-card p-[18px]">
        {/* Måned-navigasjon */}
        <div className="mb-[14px] flex items-center justify-between">
          <div className="font-display text-lg font-bold tracking-[-0.015em] text-foreground">
            {MND_NB[m]} {y}
          </div>
          <div className="flex gap-[6px]">
            <Link
              href={`/admin/availability?m=${mndParam(forrige.y, forrige.m)}`}
              className={agBtnClass("ghost", "sm")}
              aria-label="Forrige måned"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </Link>
            <Link
              href={`/admin/availability?m=${mndParam(neste.y, neste.m)}`}
              className={agBtnClass("ghost", "sm")}
              aria-label="Neste måned"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Ukedager */}
        <div className="mb-[6px] grid grid-cols-7 gap-[6px]">
          {UKEDAGER_NB.map((w) => (
            <span
              key={w}
              className="text-center font-mono text-[9px] font-extrabold tracking-[0.08em] text-muted-foreground"
            >
              {w}
            </span>
          ))}
        </div>

        {/* Dato-ruter */}
        <div className="grid grid-cols-7 gap-[6px]">
          {celler.map((d, i) => {
            if (d == null) return <span key={`tom-${i}`} />;
            const range = perUkedag.get((new Date(y, m, d).getDay() + 6) % 7);
            return (
              <div
                key={d}
                className={cn(
                  "flex min-h-[72px] flex-col gap-1 rounded-[10px] border px-[9px] py-2 text-left",
                  range ? "border-success/25 bg-success/[0.08]" : "border-border bg-background",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="font-mono text-[13px] font-bold text-foreground">{d}</span>
                  {erIdag(d) && (
                    <span className="h-[6px] w-[6px] rounded-full bg-accent shadow-[0_0_6px_rgba(209,248,67,0.7)]" />
                  )}
                </span>
                {range ? (
                  <span className="font-mono text-[10px] font-bold tracking-[0.01em] text-success">
                    {range}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground">—</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Tegnforklaring */}
        <div className="mt-[14px] flex flex-wrap gap-[18px]">
          <span className="inline-flex items-center gap-[7px] font-mono text-[9px] font-bold tracking-[0.06em] text-muted-foreground">
            <span className="h-3 w-3 rounded-[4px] border border-success/25 bg-success/[0.08]" />{" "}
            ÅPEN FOR BOOKING
          </span>
          <span className="inline-flex items-center gap-[7px] font-mono text-[9px] font-bold tracking-[0.06em] text-muted-foreground">
            <span className="h-3 w-3 rounded-[4px] border border-border bg-background" /> INGEN TID
            SATT
          </span>
          <span className="inline-flex items-center gap-[7px] font-mono text-[9px] font-bold tracking-[0.06em] text-muted-foreground">
            <span className="h-[6px] w-[6px] rounded-full bg-accent" /> I DAG
          </span>
        </div>
      </div>
    </AgPage>
  );
}
