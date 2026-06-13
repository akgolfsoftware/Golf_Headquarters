/**
 * AgencyOS — Tester (ANALYSERE · TESTER), /admin/tester.
 *
 * Port av fasit `agencyos-app/screens-analyze.jsx` → TestsScreen (mørkt tema,
 * desktop 1280): PageHead + «Ny test»-CTA + tabell Spiller/Test/Dato/Resultat.
 * Radklikk (spillernavn) → /admin/spillere/[id] (fasit-flyt player-profile).
 *
 * Datakilder: prisma.testSession (IN_PROGRESS → chip «Pågår») øverst +
 * prisma.testResult (siste registrerte, nyeste først). Tittel-tallet =
 * antall resultater siste 30 d.
 *
 * FYS-PLASSHOLDER-REGEL (LÅST): resultatformelen er ikke låst — vi viser kun
 * faktisk registrert score, INGEN referanse-/normverdier og derfor ingen
 * fargekoding av resultat-chips (alle nøytrale til formelen er godkjent).
 */

import Link from "next/link";
import { Plus } from "lucide-react";

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
  agBtnClass,
  agTrClass,
} from "@/components/admin/agencyos/ui";
import { TestUkeTrigger } from "@/components/admin/tester/test-uke-trigger";

export const dynamic = "force-dynamic";

const TALLORD = [
  "Null", "Én", "To", "Tre", "Fire", "Fem", "Seks",
  "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** «I dag 14:30» / «14. mai» (fasit-format). */
function naarLabel(d: Date, naa: Date): string {
  if (d.toDateString() === naa.toDateString()) {
    return `I dag ${d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
}

/** Registrert score uten referanseverdi (FYS-formelen er ikke låst). */
function fmtScore(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

export default async function TesterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const naa = new Date();
  const d30 = new Date(naa.getTime() - 30 * 86_400_000);

  const [paagaaende, resultater, antall30] = await Promise.all([
    prisma.testSession.findMany({
      where: { status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
      take: 6,
      select: {
        id: true,
        startedAt: true,
        user: { select: { id: true, name: true } },
        test: { select: { name: true } },
      },
    }),
    prisma.testResult.findMany({
      orderBy: { takenAt: "desc" },
      take: 12,
      select: {
        id: true,
        takenAt: true,
        score: true,
        user: { select: { id: true, name: true } },
        test: { select: { name: true } },
      },
    }),
    prisma.testResult.count({ where: { takenAt: { gte: d30 } } }),
  ]);

  type Rad = {
    key: string;
    spillerId: string;
    navn: string;
    test: string;
    naar: string;
    chip: string;
  };

  const rader: Rad[] = [
    ...paagaaende.map((s) => ({
      key: `s-${s.id}`,
      spillerId: s.user.id,
      navn: s.user.name,
      test: s.test.name,
      naar: naarLabel(s.startedAt, naa),
      chip: "Pågår",
    })),
    ...resultater.map((r) => ({
      key: `r-${r.id}`,
      spillerId: r.user.id,
      navn: r.user.name,
      test: r.test.name,
      naar: naarLabel(r.takenAt, naa),
      chip: fmtScore(r.score),
    })),
  ].slice(0, 14);

  const tall = antall30 < TALLORD.length ? TALLORD[antall30] : String(antall30);

  return (
    <AgPage>
      {/* Aktiveres når TestWeek-modell kobles til — vises kun når testuke nærmer seg */}
      <TestUkeTrigger countdown={null} weeks={[]} players={[]} />

      <AgPageHead
        eyebrow="Analysere · Tester"
        title={`${tall} tester`}
        italic="siste 30 d."
        lead="Ferdighetstester på tvers av stallen — pågående tester og siste registrerte resultater."
        actions={
          <Link href="/admin/tester" className={agBtnClass("primary")}>
            <Plus size={16} strokeWidth={1.5} /> Ny test
          </Link>
        }
      />

      {/* Mobil (<md): kortliste */}
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card md:hidden">
        {rader.length === 0 && (
          <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
            Ingen tester registrert ennå.
          </p>
        )}
        {rader.map((r) => (
          <Link
            key={r.key}
            href={`/admin/spillere/${r.spillerId}`}
            className="flex min-h-[60px] items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary active:bg-secondary"
          >
            <AgPlayerCell initials={initials(r.navn)} name={r.navn} sub={r.naar} size={32} />
            <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
              <AgChip tone="neu">{r.chip}</AgChip>
              <span className="font-mono text-[10px] text-muted-foreground">{r.test}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop (md+): tabell */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <AgTable>
          <thead>
            <tr>
              <AgTh>Spiller</AgTh>
              <AgTh>Test</AgTh>
              <AgTh>Dato</AgTh>
              <AgTh>Resultat</AgTh>
            </tr>
          </thead>
          <tbody>
            {rader.length === 0 && (
              <tr>
                <td colSpan={4} className="px-[14px] py-10 text-center text-[13px] text-muted-foreground">
                  Ingen tester registrert ennå — resultater dukker opp her når spillerne gjennomfører tester.
                </td>
              </tr>
            )}
            {rader.map((r) => (
              <tr key={r.key} className={agTrClass}>
                <AgTd>
                  <Link href={`/admin/spillere/${r.spillerId}`} className="hover:underline">
                    <AgPlayerCell initials={initials(r.navn)} name={r.navn} size={28} />
                  </Link>
                </AgTd>
                <AgTd>{r.test}</AgTd>
                <AgTd>
                  <span className="font-mono text-xs text-muted-foreground">{r.naar}</span>
                </AgTd>
                <AgTd>
                  <AgChip tone="neu">{r.chip}</AgChip>
                </AgTd>
              </tr>
            ))}
          </tbody>
        </AgTable>
      </div>
    </AgPage>
  );
}
