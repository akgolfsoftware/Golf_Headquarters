/**
 * AgencyOS — Risiko, /admin/risiko
 *
 * Hybrid terminal design: stall-intensitetskart (heatmap 8×3 grid) +
 * liste over spillere som trenger oppfølging. Data fra ekte Prisma.
 *
 * Risiko-logikk (enkel, ingen FYS-formel avhengighet):
 *   - SKADET-status → Kritisk
 *   - Aktiv Leave (ikke returnert) → Kritisk
 *   - Ingen økt på > 7 dager AND har aktiv plan → Høy
 *   - Ingen økt på 4–7 dager AND har aktiv plan → Moderat
 *   - Ingen økt siste 30 d og ingen plan → Lav-mod
 *   - Øvrige → Lav
 */

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  AgChip,
  AgPage,
  AgPageHead,
  AgAvatar,
} from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

type RisikoNivaa = 0 | 1 | 2 | 3 | 4;

const RISIKO_LABEL: Record<RisikoNivaa, string> = {
  0: "Lav",
  1: "Lav-mod.",
  2: "Moderat",
  3: "Høy",
  4: "Kritisk",
};

const RISIKO_CHIP_TONE: Record<
  RisikoNivaa,
  "ok" | "warn" | "alert" | "neu" | "lime"
> = {
  0: "neu",
  1: "neu",
  2: "warn",
  3: "warn",
  4: "alert",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Bakgrunnsklasse for heatmap-celle basert på risikonivå.
 * Tilsvarer design-tokens .rh-cell.r0–r4 i fasiten.
 */
function heatCellClass(lvl: RisikoNivaa): string {
  if (lvl === 0) return "bg-secondary text-muted-foreground";
  if (lvl === 1) return "bg-accent/20 text-accent-foreground";
  if (lvl === 2) return "bg-warning/30 text-warning";
  if (lvl === 3) return "bg-destructive/30 text-destructive-foreground";
  // lvl 4 — kritisk
  return "bg-destructive text-destructive-foreground";
}

/** Kort årsaks-tekst for risiko-listen. */
function aarsak(
  skadet: boolean,
  harAktivPermisjon: boolean,
  dagerSidenOkt: number | null,
  harAktivPlan: boolean,
): string {
  if (skadet) return "Skade registrert";
  if (harAktivPermisjon) return "Aktiv permisjon";
  if (dagerSidenOkt !== null && dagerSidenOkt > 7 && harAktivPlan)
    return `${dagerSidenOkt} dg siden økt · under plan`;
  if (dagerSidenOkt !== null && dagerSidenOkt > 3 && harAktivPlan)
    return `${dagerSidenOkt} dg siden økt · aktiv plan`;
  if (dagerSidenOkt === null)
    return "Ingen økt registrert";
  return `${dagerSidenOkt} dg siden siste økt`;
}

export default async function RisikoPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const naa = new Date();
  const d30 = new Date(naa.getTime() - 30 * 86_400_000);

  // Hent alle aktive spillere + siste økt + aktiv plan + permisjon/skade
  const spillere = await prisma.user.findMany({
    where: {
      role: "PLAYER",
      deletedAt: null,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      userStatus: true,
      // Aktive leaves (permisjon/skade)
      leaves: {
        where: {
          OR: [{ endAt: null }, { endAt: { gt: naa } }],
          returnedAt: null,
        },
        select: { reason: true, isInjury: true },
        take: 1,
      },
      // Siste treningsøkt (TrainingPlanSessionLog — fullførte)
      trainingPlans: {
        where: { status: { in: ["ACTIVE", "ACCEPTED"] } },
        select: { id: true },
        take: 1,
      },
    },
  });

  // For å finne siste fullførte økt bruker vi TrainingPlanSessionLog
  const spillerIds = spillere.map((s) => s.id);

  // Hent siste logg-entry per spiller (siste fullførte økt siste 30 dager).
  // TrainingPlanSessionLog har ingen userId — vi når spilleren via
  // session.plan.userId og bygger map-en manuelt (nyeste først).
  const sisteLogger = await prisma.trainingPlanSessionLog.findMany({
    where: {
      completedAt: { gte: d30 },
      session: { plan: { userId: { in: spillerIds } } },
    },
    orderBy: { completedAt: "desc" },
    select: {
      completedAt: true,
      session: { select: { plan: { select: { userId: true } } } },
    },
  });

  const sisteOktMap = new Map<string, Date | null>();
  for (const l of sisteLogger) {
    const uid = l.session.plan.userId;
    // findMany er sortert nyeste→eldste, så første treff per spiller vinner.
    if (!sisteOktMap.has(uid)) sisteOktMap.set(uid, l.completedAt);
  }

  // Bygg risiko-data per spiller
  type SpillerRisiko = {
    id: string;
    navn: string;
    init: string;
    nivaa: RisikoNivaa;
    aarsak: string;
  };

  const risikoData: SpillerRisiko[] = spillere.map((s) => {
    const skadet = s.userStatus === "SKADET";
    const harAktivPermisjon =
      s.leaves.length > 0 && !s.leaves[0].isInjury;
    const harAktivPlan = s.trainingPlans.length > 0;
    const sisteOkt = sisteOktMap.get(s.id);
    const dagerSidenOkt = sisteOkt
      ? Math.floor(
          (naa.getTime() - sisteOkt.getTime()) / 86_400_000,
        )
      : null;

    let nivaa: RisikoNivaa = 0;
    if (skadet || (s.leaves.length > 0 && s.leaves[0].isInjury)) {
      nivaa = 4;
    } else if (harAktivPermisjon) {
      nivaa = 4;
    } else if (dagerSidenOkt !== null && dagerSidenOkt > 7 && harAktivPlan) {
      nivaa = 3;
    } else if (dagerSidenOkt !== null && dagerSidenOkt > 3 && harAktivPlan) {
      nivaa = 2;
    } else if (dagerSidenOkt === null && harAktivPlan) {
      nivaa = 1;
    } else if (dagerSidenOkt !== null && dagerSidenOkt > 14) {
      nivaa = 1;
    }

    return {
      id: s.id,
      navn: s.name,
      init: initials(s.name),
      nivaa,
      aarsak: aarsak(skadet, harAktivPermisjon, dagerSidenOkt, harAktivPlan),
    };
  });

  // Sorter: høyest risiko først
  risikoData.sort((a, b) => b.nivaa - a.nivaa);

  const kritiske = risikoData.filter((s) => s.nivaa >= 4);
  const trenger = risikoData.filter((s) => s.nivaa >= 2);
  const antallSpillere = risikoData.length;

  return (
    <AgPage>
      <AgPageHead
        eyebrow="AgencyOS · Risiko"
        title="Risiko"
        italic="· stall-kart"
        lead="Intensitetskart over stallen — hvem trenger oppfølging nå."
        when={
          kritiske.length > 0
            ? `${kritiske.length} kritisk${kritiske.length !== 1 ? "e" : ""}`
            : undefined
        }
        actions={
          kritiske.length > 0 ? (
            <span className="inline-flex items-center gap-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-destructive">
              <span className="inline-block h-[7px] w-[7px] animate-pulse rounded-full bg-destructive" />
              {kritiske.length} kritisk{kritiske.length !== 1 ? "e" : ""}
            </span>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        {/* Heatmap */}
        <section
          className="relative overflow-hidden rounded-xl border border-border bg-card p-5"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)/0.4) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--border)/0.4) 1px,transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        >
          {/* Frosted overlay so grid doesn't fight the card bg */}
          <div className="absolute inset-0 bg-card/80 backdrop-blur-[1px]" />
          <div className="relative">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Risk
                <em className="not-italic text-accent">Heatmap</em>
                {" · "}
                {antallSpillere} spillere
              </span>
              <span className="rounded-md border border-border px-2 py-[3px] font-mono text-[10px] font-semibold text-muted-foreground">
                {naa.toLocaleDateString("nb-NO", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Heatmap grid — 8 kolonner */}
            {antallSpillere === 0 ? (
              <p className="py-12 text-center font-mono text-[12px] text-muted-foreground">
                Ingen spillere registrert ennå.
              </p>
            ) : (
              <div className="grid grid-cols-8 gap-[5px]">
                {risikoData.map((s) => (
                  <Link
                    key={s.id}
                    href={`/admin/spillere/${s.id}`}
                    title={`${s.navn} · Risiko: ${RISIKO_LABEL[s.nivaa]}`}
                    className={[
                      "aspect-square cursor-pointer rounded-[5px] border border-border",
                      "grid place-items-center font-mono text-[9px] font-semibold",
                      "transition-transform hover:scale-110 hover:z-10 hover:relative",
                      heatCellClass(s.nivaa),
                    ].join(" ")}
                  >
                    {s.init}
                  </Link>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="mt-3 flex items-center justify-between font-mono text-[9px] text-muted-foreground">
              <span>Lav risiko</span>
              <span className="flex items-center gap-[3px]">
                <span className="inline-block h-3 w-3 rounded-[2px] bg-secondary" />
                <span className="inline-block h-3 w-3 rounded-[2px] bg-accent/20" />
                <span className="inline-block h-3 w-3 rounded-[2px] bg-warning/30" />
                <span className="inline-block h-3 w-3 rounded-[2px] bg-destructive/30" />
                <span className="inline-block h-3 w-3 rounded-[2px] bg-destructive" />
              </span>
              <span>Kritisk</span>
            </div>
          </div>
        </section>

        {/* Risiko-liste */}
        <aside className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Trenger oppfølging nå
          </div>

          {trenger.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <AlertTriangle
                className="h-8 w-8 text-muted-foreground/40"
                strokeWidth={1.5}
              />
              <p className="font-mono text-[12px] text-muted-foreground">
                Ingen spillere med forhøyet risiko.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {trenger.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/spillere/${s.id}`}
                  className="flex items-center gap-[10px] rounded-lg border border-border bg-background/50 px-3 py-3 transition-colors hover:bg-secondary"
                  style={{
                    borderLeftWidth: "3px",
                    borderLeftColor:
                      s.nivaa >= 4
                        ? "hsl(var(--destructive))"
                        : "hsl(var(--warning))",
                  }}
                >
                  <AgAvatar initials={s.init} size={30} tone="neu" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold text-foreground">
                      {s.navn}
                    </div>
                    <div className="mt-[2px] truncate font-mono text-[9.5px] text-muted-foreground">
                      {s.aarsak}
                    </div>
                  </div>
                  <AgChip tone={RISIKO_CHIP_TONE[s.nivaa]}>
                    {RISIKO_LABEL[s.nivaa]}
                  </AgChip>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </AgPage>
  );
}
