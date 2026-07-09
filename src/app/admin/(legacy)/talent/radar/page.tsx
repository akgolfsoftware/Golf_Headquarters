/**
 * AgencyOS — Talent · Talent-radar (TALENT · RADAR)
 *
 * Port av fasit `agencyos-app/screens-stable.jsx` → TalentRadarScreen (mørkt, desktop).
 * Datakilde: TalentTracking (hvem er i talentprogrammet) + WagrSnapshot (rank +
 * ukes-trend) + treningsplan-økter per pyramide-akse. Mini-pyramiden viser antall
 * økter per akse, normalisert mot største økt-antall i utvalget — ingen tall
 * diktes opp, mangler data vises «—».
 *
 * Bevisste avvik fra fasit (datadrevet, ikke design):
 *  - Fasit viser «30 dg»-trend; WagrSnapshot har kun delta siden forrige uke →
 *    vi viser «uke ↑/↓ N».
 *  - Fasit-signalene «Toppemne»/«Råtalent» krever felt som ikke finnes — signal
 *    derives av WAGR-trend: Stigende (lime) / Watch (warn) / Stabil / Uten WAGR.
 *
 * Roller: COACH, ADMIN.
 */

import Link from "next/link";
import { Download, GitCompareArrows } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgAvatar, AgChip, AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

const PYR_AKSER = [
  { key: "FYS", label: "FYS", bar: "bg-pyr-fys" },
  { key: "TEK", label: "TEK", bar: "bg-pyr-tek" },
  { key: "SLAG", label: "SLAG", bar: "bg-pyr-slag" },
  { key: "SPILL", label: "SPILL", bar: "bg-pyr-spill" },
  { key: "TURN", label: "TURN", bar: "bg-pyr-turn" },
] as const;

const TALLORD = ["Ingen", "Ett", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv"];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function alder(dob: Date | null): number | null {
  if (!dob) return null;
  const naa = new Date();
  let a = naa.getFullYear() - dob.getFullYear();
  const m = naa.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && naa.getDate() < dob.getDate())) a--;
  return a;
}

type Signal = { label: string; tone: "lime" | "warn" | "neu" };

function signalFor(rank: number | null, moveDelta: number | null): Signal {
  if (rank == null) return { label: "Uten WAGR", tone: "neu" };
  if (moveDelta != null && moveDelta > 0) return { label: "Stigende", tone: "lime" };
  if (moveDelta != null && moveDelta < 0) return { label: "Watch", tone: "warn" };
  return { label: "Stabil", tone: "neu" };
}

export default async function TalentRadarPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const talenter = await prisma.talentTracking.findMany({
    where: { user: { deletedAt: null } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          dateOfBirth: true,
          wagrSnapshot: { select: { rank: true, moveDelta: true } },
          trainingPlans: { select: { sessions: { select: { pyramidArea: true } } } },
        },
      },
    },
  });

  const rader = talenter.map((t) => {
    const counts: Record<string, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
    for (const plan of t.user.trainingPlans) {
      for (const s of plan.sessions) counts[s.pyramidArea] = (counts[s.pyramidArea] ?? 0) + 1;
    }
    return {
      userId: t.user.id,
      name: t.user.name,
      alder: alder(t.user.dateOfBirth),
      rank: t.user.wagrSnapshot?.rank ?? null,
      moveDelta: t.user.wagrSnapshot?.moveDelta ?? null,
      counts: PYR_AKSER.map((a) => counts[a.key] ?? 0),
    };
  });

  rader.sort((a, b) => {
    if (a.rank == null && b.rank == null) return a.name.localeCompare(b.name, "nb");
    if (a.rank == null) return 1;
    if (b.rank == null) return -1;
    return a.rank - b.rank;
  });

  const maksOkter = Math.max(0, ...rader.flatMap((r) => r.counts));
  const besteRank = rader.find((r) => r.rank != null)?.rank ?? null;
  const n = rader.length;
  const tittel = n === 1 ? "Ett emne på" : `${TALLORD[n] ?? n} emner på`;

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Talent · Radar"
        title={tittel}
        italic="WAGR-kurs."
        lead="Talentene med internasjonalt rankingpotensial. Mini-pyramide viser profil på tvers av de fem aksene."
        actions={
          <>
            <Link href="/admin/talent/sammenligning" className={agBtnClass("ghost")}>
              <GitCompareArrows size={16} aria-hidden /> Sammenlign
            </Link>
            <Link href="/admin/talent/wagr-import" className={agBtnClass("primary")}>
              <Download size={16} aria-hidden /> WAGR-import
            </Link>
          </>
        }
      />
      <div className="flex flex-col gap-[10px]">
        {rader.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-[18px] text-sm text-muted-foreground">
            Ingen talenter i programmet ennå — legg til spillere via Talent-modulen.
          </div>
        )}
        {rader.map((r) => {
          const signal = signalFor(r.rank, r.moveDelta);
          const trend =
            r.rank != null && r.moveDelta != null
              ? ` · uke ${r.moveDelta > 0 ? "↑" : r.moveDelta < 0 ? "↓" : "±"} ${Math.abs(r.moveDelta)}`
              : "";
          return (
            <Link
              key={r.userId}
              href={`/admin/spillere/${r.userId}`}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border border-border bg-card p-[18px] text-left"
            >
              <AgAvatar
                initials={initials(r.name)}
                size={48}
                tone={besteRank != null && r.rank === besteRank ? "lime" : "neu"}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-[10px]">
                  <span className="font-display text-base font-bold tracking-[-0.015em] text-foreground">
                    {r.name}
                  </span>
                  <AgChip tone={signal.tone} className="px-2 py-[2px] text-[10px] tracking-[0.1em]">
                    {signal.label}
                  </AgChip>
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  WAGR {r.rank != null ? `#${r.rank.toLocaleString("nb-NO")}` : "—"} · {r.alder ?? "—"} år
                  {trend}
                </div>
              </div>
              <div className="flex h-11 items-end gap-1">
                {r.counts.map((c, i) => (
                  <span
                    key={PYR_AKSER[i].key}
                    title={`${PYR_AKSER[i].label} · ${c} økter`}
                    className={`w-[10px] rounded-[3px] ${PYR_AKSER[i].bar}`}
                    style={{
                      height: maksOkter > 0 && c > 0 ? `${Math.max(7, Math.round((c / maksOkter) * 100))}%` : 0,
                    }}
                  />
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </AgPage>
  );
}
