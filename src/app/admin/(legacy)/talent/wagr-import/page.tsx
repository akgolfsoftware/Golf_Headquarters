/**
 * AgencyOS — Talent · WAGR-import (TALENT · WAGR-IMPORT)
 *
 * Port av fasit `agencyos-app/screens-stable.jsx` → WagrScreen (mørkt, desktop).
 * Datakilde: WagrSnapshot (matchede spillere = snapshot med userId-kobling) +
 * antall PLAYER-brukere for stallen. «Sist synket» = nyeste snapshotAt.
 * Ingen oppdiktede tall — tomme tilstander vises ærlig.
 *
 * Bevisste avvik fra fasit (mangler backend, rapportert i porting-retur):
 *  - «Synk nå» har ingen automatisk synk-action ennå (import skjer manuelt via
 *    importerWagrSpiller i ./actions.ts) — knappen rendres uten handler.
 *  - Fasit har én rad «Trenger bekreftelse»; WagrSnapshot mangler felt for
 *    match-konfidens, så alle koblede rader vises som «Sikker match».
 *
 * Roller: COACH, ADMIN.
 */

import Link from "next/link";
import { Globe } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  AgChip,
  AgPage,
  AgPageHead,
  AgPlayerCell,
  AgTable,
  AgTd,
  AgTh,
  agTrClass,
} from "@/components/admin/agencyos/ui";
import { SynkNaaButton } from "./wagr-actions";

export const dynamic = "force-dynamic";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtSynket(d: Date): string {
  const dato = d.toLocaleDateString("nb-NO", { day: "numeric", month: "long" });
  const tid = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return `${dato} ${tid}`;
}

export default async function WagrImportPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [snapshots, antallSpillere] = await Promise.all([
    prisma.wagrSnapshot.findMany({
      orderBy: { rank: "asc" },
      select: {
        id: true,
        rank: true,
        snapshotAt: true,
        fullName: true,
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.user.count({ where: { role: "PLAYER", deletedAt: null } }),
  ]);

  const koblede = snapshots.flatMap((s) =>
    s.user ? [{ id: s.id, rank: s.rank, user: s.user }] : [],
  );
  const sistSynket = snapshots.length
    ? snapshots.reduce(
        (maks, s) => (s.snapshotAt > maks ? s.snapshotAt : maks),
        snapshots[0].snapshotAt,
      )
    : null;

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Talent · WAGR-import"
        title="Synk mot"
        italic="verdensrankingen."
        lead="Hent World Amateur Golf Ranking for stallen din. Vi matcher på navn og fødselsdato."
      />
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-[18px]">
        <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-secondary text-primary">
          <Globe size={20} aria-hidden />
        </span>
        <div className="min-w-[180px] flex-1">
          <div className="text-[15px] font-bold text-foreground">
            {koblede.length} av {antallSpillere} spillere har WAGR-profil
          </div>
          <div className="mt-[3px] font-mono text-[11px] text-muted-foreground">
            {sistSynket ? `Sist synket ${fmtSynket(sistSynket)}` : "Aldri synket"}
          </div>
        </div>
        <SynkNaaButton />
      </div>
      <div className="mb-[14px] mt-7 flex items-center gap-[10px] font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground after:h-px after:flex-1 after:bg-border after:content-['']">
        Matchede spillere <span className="font-bold text-muted-foreground">· {koblede.length}</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <AgTable>
          <thead>
            <tr>
              <AgTh>Spiller</AgTh>
              <AgTh num>WAGR</AgTh>
              <AgTh>Match</AgTh>
            </tr>
          </thead>
          <tbody>
            {koblede.length === 0 && (
              <tr>
                <td colSpan={3} className="px-[14px] py-10 text-center text-sm text-muted-foreground">
                  Ingen spillere koblet til WAGR ennå — importer fra wagr.com via Talent-modulen.
                </td>
              </tr>
            )}
            {koblede.map((s) => (
              <tr key={s.id} className={agTrClass}>
                <AgTd>
                  <Link href={`/admin/spillere/${s.user.id}`} className="block">
                    <AgPlayerCell initials={initials(s.user.name)} name={s.user.name} size={28} />
                  </Link>
                </AgTd>
                <AgTd num>#{s.rank.toLocaleString("nb-NO")}</AgTd>
                <AgTd>
                  <AgChip tone="ok">Sikker match</AgChip>
                </AgTd>
              </tr>
            ))}
          </tbody>
        </AgTable>
      </div>
    </AgPage>
  );
}
