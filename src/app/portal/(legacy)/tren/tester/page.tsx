/**
 * PlayerHQ · Trening · Tester (/portal/tren/tester)
 *
 * Hybrid-design (2026-06-17): editorial header + filter-chips + 2-kolonne
 * kortgrid (TesterKatalogGrid). Beholder:
 *   - «Tildelt deg» seksjon (TestAssignment OPEN)
 *   - «Siste resultater» seksjon (5 siste TestResult)
 * Kortgridet erstatter den gamle TesterKatalog-listen.
 *
 * Server component. Auth-guard via requirePortalUser.
 */

import Link from "next/link";
import { Crosshair, Dumbbell, Flag, Target, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PyramidArea } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadTesterScreen } from "@/lib/portal-tester/tester-data";
import { MeSub, SetGroup, SetRow, SetVal } from "@/components/portal/meg/meg-sub";
import { TesterKatalogGrid, type KatalogKort } from "./tester-katalog-grid";
import { parseForScoring } from "@/lib/portal-tester/test-scoring";
import { TestUkeKommende } from "@/components/portal/tester/test-uke-kommende";

export const dynamic = "force-dynamic";

const OMRADE_IKON: Record<PyramidArea, LucideIcon> = {
  FYS: Dumbbell,
  TEK: Crosshair,
  SLAG: Target,
  SPILL: Flag,
  TURN: Trophy,
};

/** Norsk tall-format: maks 2 desimaler, komma som desimalskille. */
function fmtNum(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString("nb-NO", {
    maximumFractionDigits: 2,
  });
}

function fmtDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Første setning av scoringRule som kort rad-meta. */
function kortRegel(rule: string): string {
  const s = rule.trim();
  const i = s.indexOf(". ");
  return i === -1 ? s : s.slice(0, i + 1);
}

export default async function TesterPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const [screen, siste, tildelinger] = await Promise.all([
    loadTesterScreen({
      id: user.id,
      name: user.name,
      hcp: user.hcp,
      tier: user.tier,
    }),
    prisma.testResult.findMany({
      where: { userId: user.id },
      orderBy: { takenAt: "desc" },
      take: 5,
      select: {
        id: true,
        score: true,
        takenAt: true,
        test: { select: { name: true, pyramidArea: true, protocol: true } },
      },
    }),
    prisma.testAssignment.findMany({
      where: { playerId: user.id, status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        dueDate: true,
        test: { select: { id: true, name: true, pyramidArea: true } },
        coach: { select: { name: true } },
      },
    }),
  ]);

  /** ID-set for tildelte tester — for å merke kort i grid. */
  const tildeltIds = new Set(tildelinger.map((a) => a.test.id));

  /** Bygg kortliste fra screen.groups — alle tester i spillerens univers. */
  const kortliste: KatalogKort[] = screen.groups.flatMap((g) =>
    g.rows.map((r) => ({
      id: r.id,
      name: r.name,
      axis: g.axis,
      meta: kortRegel(r.rule),
      attempts: r.attempts,
      latestDate: r.latestDate,
      href: r.href,
      tildelt: tildeltIds.has(r.id),
    }))
  );

  return (
    <MeSub
      eyebrow="TREN · TESTER"
      title="Test"
      italic="katalog"
      lead="NGF- og Team Norway-protokoller for hele pyramiden. Finn en test, gjennomfør og følg fremgangen din over tid."
    >
      {/* Aktiveres når TestWeek-modell er på plass */}
      <TestUkeKommende countdown={null} tester={[]} />

      {/* Tildelt deg */}
      {tildelinger.length > 0 && (
        <SetGroup label="TILDELT DEG">
          {tildelinger.map((a) => (
            <Link
              key={a.id}
              href={`/portal/tren/tester/${a.test.id}`}
              className="flex items-center gap-3.5 border-b border-border px-[18px] py-[15px] transition-colors last:border-b-0 hover:bg-secondary/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                {(() => {
                  const Ikon = OMRADE_IKON[a.test.pyramidArea];
                  return (
                    <Ikon
                      className="h-4 w-4 text-foreground"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  );
                })()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-foreground">
                  {a.test.name}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground">
                  {a.coach.name}
                  {a.dueDate ? ` · frist ${fmtDato(a.dueDate)}` : ""}
                </span>
              </span>
              <SetVal>Start</SetVal>
            </Link>
          ))}
        </SetGroup>
      )}

      {/* Siste resultater */}
      <SetGroup label="SISTE RESULTATER">
        {siste.length === 0 ? (
          <p className="px-[18px] py-6 text-center text-sm text-muted-foreground">
            Ingen testresultater ennå. Velg en test i katalogen og kom i gang.
          </p>
        ) : (
          siste.map((r) => {
            const enhet = parseForScoring(r.test.protocol).unit;
            return (
              <SetRow
                key={r.id}
                icon={OMRADE_IKON[r.test.pyramidArea]}
                title={r.test.name}
                meta={fmtDato(r.takenAt)}
                right={
                  <SetVal>
                    {fmtNum(r.score)}
                    {enhet ? ` ${enhet}` : ""}
                  </SetVal>
                }
              />
            );
          })
        )}
      </SetGroup>

      {/* Kortgrid med filter-chips — erstatter gammel TesterKatalog-liste */}
      <TesterKatalogGrid kort={kortliste} />
    </MeSub>
  );
}
