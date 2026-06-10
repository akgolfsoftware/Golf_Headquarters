/**
 * AgencyOS — Grupper (/admin/grupper).
 *
 * Port av fasit `agencyos-app/screens-stable.jsx` → GroupsScreen (mørkt tema,
 * desktop 1280): PageHead («STALL · GRUPPER» / «Fire grupper.» / lead +
 * «Ny gruppe») og 2-kolonners grid av gruppe-tiles (ikon + nivå-chip + navn +
 * medlemstall/HCP-snitt + aktivitetsbar). Klikk på tile → gruppe-detalj.
 *
 * Datakilder: prisma.group m/ members→user (hcp, lastLoginAt) + _count.
 * Aktivitetsbaren = andel medlemmer med innlogging siste 14 dager (ekte tall).
 * HCP-snitt utelates når ingen medlemmer har HCP — aldri liksom-tall.
 */

import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgChip, AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

const TALLORD = [
  "Null",
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

/** Gruppe-nivå (A1–A5 = selekterte puljer, S* = skolelinjer) → visningsetikett. */
function nivaaLabel(level: string | null): string {
  if (!level) return "Klubb";
  if (level.startsWith("S")) return "Skole";
  if (level.startsWith("A")) return "Selektert";
  return "Klubb";
}

function snittHcp(hcps: Array<number | null>): string | null {
  const valid = hcps.filter((h): h is number => h != null);
  if (valid.length === 0) return null;
  const avg = valid.reduce((s, n) => s + n, 0) / valid.length;
  if (avg <= 0) return `+${Math.abs(avg).toFixed(1).replace(".", ",")}`;
  return avg.toFixed(1).replace(".", ",");
}

export default async function GrupperPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const now = new Date();
  const groups = await prisma.group.findMany({
    select: {
      id: true,
      name: true,
      level: true,
      members: { select: { user: { select: { hcp: true, lastLoginAt: true } } } },
      _count: { select: { members: true } },
    },
    orderBy: { name: "asc" },
  });

  const tittel = groups.length < TALLORD.length ? TALLORD[groups.length] : String(groups.length);

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Stall · Grupper"
        title={tittel}
        italic="grupper."
        lead="Treningsgrupper på tvers av klubbene dine. Klikk for å se medlemmer og lag-snitt."
        actions={
          <Link href="/admin/grupper" className={agBtnClass("primary")}>
            <Plus size={16} strokeWidth={1.5} /> Ny gruppe
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        {groups.length === 0 && (
          <div className="rounded-xl border border-border bg-card px-[18px] py-10 text-center text-sm text-muted-foreground md:col-span-2">
            Ingen grupper ennå — opprett den første.
          </div>
        )}
        {groups.map((g) => {
          const snitt = snittHcp(g.members.map((m) => m.user.hcp));
          const aktive = g.members.filter(
            (m) => m.user.lastLoginAt && now.getTime() - m.user.lastLoginAt.getTime() < 14 * 86_400_000,
          ).length;
          const pct = g._count.members > 0 ? Math.round((aktive / g._count.members) * 100) : 0;
          return (
            <Link
              key={g.id}
              href={`/admin/grupper/${g.id}`}
              className="flex min-h-[120px] flex-col gap-[10px] rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-secondary text-primary">
                  <Users size={20} strokeWidth={1.5} />
                </span>
                <AgChip tone="neu">{nivaaLabel(g.level)}</AgChip>
              </div>
              <span className="font-display text-base font-bold tracking-[-0.015em] text-foreground">
                {g.name}
              </span>
              <span className="mt-auto font-mono text-[10px] text-muted-foreground">
                <b className="font-bold text-primary">{g._count.members} spillere</b>
                {snitt && <> · HCP {snitt} snitt</>}
              </span>
              <span className="mt-1 block h-[6px] overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </AgPage>
  );
}
