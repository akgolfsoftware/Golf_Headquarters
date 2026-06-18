/**
 * AgencyOS — Tester, /admin/tester
 *
 * Hybrid terminal design: 4 KPI-kort + tabell «Testresultater · siste gjennomføring»
 * med kolonnene Spiller / Test / Resultat / Delta / Dato / Status.
 *
 * Port av fasit `AgencyOS Tester (hybrid).dc.html` (2026-06-17).
 * Datakilder: prisma.testResult + prisma.testSession (IN_PROGRESS).
 * Tittel-KPI = antall resultater siste 30 d.
 *
 * FYS-PLASSHOLDER-REGEL (LÅST): resultatformelen er ikke låst — ingen
 * fargekoding av resultater basert på normverdier (alle nøytrale) til
 * formelen er godkjent av Anders.
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
  AgSeg,
  agBtnClass,
  agTrClass,
} from "@/components/admin/agencyos/ui";
import { TestUkeTrigger } from "@/components/admin/tester/test-uke-trigger";

export const dynamic = "force-dynamic";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function datoLabel(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
}

function fmtScore(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

export default async function TesterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const naa = new Date();
  const d30 = new Date(naa.getTime() - 30 * 86_400_000);
  const d7 = new Date(naa.getTime() - 7 * 86_400_000);

  const [paagaaende, resultater, antall30, antall7] = await Promise.all([
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
      take: 20,
      select: {
        id: true,
        takenAt: true,
        score: true,
        user: { select: { id: true, name: true } },
        test: { select: { name: true } },
      },
    }),
    prisma.testResult.count({ where: { takenAt: { gte: d30 } } }),
    prisma.testResult.count({ where: { takenAt: { gte: d7 } } }),
  ]);

  // Beregn snitt-score siste 30 d
  const siste30Resultater = resultater.filter(
    (r) => r.takenAt >= d30,
  );
  const snittScore =
    siste30Resultater.length > 0
      ? Math.round(
          siste30Resultater.reduce((acc, r) => acc + r.score, 0) /
            siste30Resultater.length,
        )
      : null;

  type Rad = {
    key: string;
    spillerId: string;
    navn: string;
    test: string;
    resultat: string;
    delta: string | null;
    deltaOpp: boolean | null;
    dato: string;
    status: "Pågår" | "Bedre" | "Stabilt" | "Svakere" | "Ferdig";
  };

  // Bygg delta: sammenlign med forrige TestResult for samme spiller + test
  // Enkel heuristikk: vi bruker score vs. nest siste for samme test
  const perSpillerTest = new Map<string, number[]>();
  for (const r of resultater) {
    const k = `${r.user.id}::${r.test.name}`;
    if (!perSpillerTest.has(k)) perSpillerTest.set(k, []);
    perSpillerTest.get(k)!.push(r.score);
  }

  const rader: Rad[] = [
    ...paagaaende.map((s): Rad => ({
      key: `s-${s.id}`,
      spillerId: s.user.id,
      navn: s.user.name,
      test: s.test.name,
      resultat: "—",
      delta: null,
      deltaOpp: null,
      dato: datoLabel(s.startedAt),
      status: "Pågår",
    })),
    ...resultater.slice(0, 14).map((r): Rad => {
      const k = `${r.user.id}::${r.test.name}`;
      const serie = perSpillerTest.get(k) ?? [];
      // Serie er sortert desc — indeks 0 = siste, indeks 1 = forrige
      const forrige = serie[1] ?? null;
      let delta: string | null = null;
      let deltaOpp: boolean | null = null;
      if (forrige !== null) {
        const diff = r.score - forrige;
        if (Math.abs(diff) < 0.05) {
          delta = "— stabilt";
          deltaOpp = null;
        } else if (diff > 0) {
          delta = `+${fmtScore(diff)}`;
          deltaOpp = true;
        } else {
          delta = fmtScore(diff);
          deltaOpp = false;
        }
      }

      const status: Rad["status"] =
        deltaOpp === true
          ? "Bedre"
          : deltaOpp === false
            ? "Svakere"
            : delta === "— stabilt"
              ? "Stabilt"
              : "Ferdig";

      return {
        key: `r-${r.id}`,
        spillerId: r.user.id,
        navn: r.user.name,
        test: r.test.name,
        resultat: fmtScore(r.score),
        delta,
        deltaOpp,
        dato: datoLabel(r.takenAt),
        status,
      };
    }),
  ];

  const kpis = [
    { label: "Tester utført", val: String(antall30), color: "text-foreground" },
    {
      label: "Snitt-score",
      val: snittScore !== null ? `${snittScore}` : "—",
      color: "text-accent",
    },
    { label: "Sist uke", val: String(antall7), color: "text-foreground" },
    {
      label: "Pågår nå",
      val: String(paagaaende.length),
      color: paagaaende.length > 0 ? "text-accent" : "text-foreground",
    },
  ];

  return (
    <AgPage>
      <TestUkeTrigger countdown={null} weeks={[]} players={[]} />

      <AgPageHead
        eyebrow="Analysere · Tester"
        title="Tester"
        italic="· FYS &amp; teknikk"
        lead="Ferdighetstester på tvers av stallen — resultater, delta og status."
        actions={
          <Link href="/admin/tester/tildel" className={agBtnClass("primary")}>
            <Plus size={14} strokeWidth={2.4} /> Registrer test
          </Link>
        }
      />

      {/* KPI-strip */}
      <div className="mb-4 grid grid-cols-2 gap-[10px] md:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-border bg-card px-4 py-[14px]"
          >
            <div className="font-mono text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {k.label}
            </div>
            <div
              className={[
                "mt-[7px] font-mono text-[24px] font-semibold leading-none tabular-nums",
                k.color,
              ].join(" ")}
            >
              {k.val}
            </div>
          </div>
        ))}
      </div>

      {/* Tabell */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Tabell-header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Testresultater · siste gjennomføring
          </span>
          <AgSeg options={["Alle", "FYS", "Teknikk", "TrackMan"]} active="Alle" />
        </div>

        {/* Mobil (<md): kortliste */}
        <div className="flex flex-col divide-y divide-border md:hidden">
          {rader.length === 0 && (
            <p className="px-4 py-10 text-center font-mono text-[13px] text-muted-foreground">
              Ingen tester registrert ennå.
            </p>
          )}
          {rader.map((r) => (
            <Link
              key={r.key}
              href={`/admin/spillere/${r.spillerId}`}
              className="flex min-h-[60px] items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary active:bg-secondary"
            >
              <AgPlayerCell
                initials={initials(r.navn)}
                name={r.navn}
                sub={r.dato}
                size={32}
              />
              <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
                <StatusChip status={r.status} />
                <span className="font-mono text-[10px] text-muted-foreground">
                  {r.test}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop (md+): tabell */}
        <div className="hidden max-h-[420px] overflow-y-auto md:block">
          <AgTable>
            <thead>
              <tr>
                <AgTh>Spiller</AgTh>
                <AgTh>Test</AgTh>
                <AgTh num>Resultat</AgTh>
                <AgTh num>Delta</AgTh>
                <AgTh num>Dato</AgTh>
                <AgTh>Status</AgTh>
              </tr>
            </thead>
            <tbody>
              {rader.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-[14px] py-10 text-center font-mono text-[13px] text-muted-foreground"
                  >
                    Ingen tester registrert ennå — resultater dukker opp her
                    når spillerne gjennomfører tester.
                  </td>
                </tr>
              )}
              {rader.map((r) => (
                <tr key={r.key} className={agTrClass}>
                  <AgTd>
                    <Link
                      href={`/admin/spillere/${r.spillerId}`}
                      className="hover:underline"
                    >
                      <AgPlayerCell
                        initials={initials(r.navn)}
                        name={r.navn}
                        size={28}
                      />
                    </Link>
                  </AgTd>
                  <AgTd>
                    <span className="text-muted-foreground">{r.test}</span>
                  </AgTd>
                  <AgTd num>
                    <span className="text-foreground">{r.resultat}</span>
                  </AgTd>
                  <AgTd num>
                    {r.delta ? (
                      <span
                        className={
                          r.deltaOpp === true
                            ? "font-mono text-[11px] text-success"
                            : r.deltaOpp === false
                              ? "font-mono text-[11px] text-destructive"
                              : "font-mono text-[11px] text-muted-foreground"
                        }
                      >
                        {r.delta}
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        —
                      </span>
                    )}
                  </AgTd>
                  <AgTd num>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {r.dato}
                    </span>
                  </AgTd>
                  <AgTd>
                    <StatusChip status={r.status} />
                  </AgTd>
                </tr>
              ))}
            </tbody>
          </AgTable>
        </div>
      </div>
    </AgPage>
  );
}

function StatusChip({
  status,
}: {
  status: "Pågår" | "Bedre" | "Stabilt" | "Svakere" | "Ferdig";
}) {
  const tone: "ok" | "warn" | "alert" | "neu" | "lime" =
    status === "Bedre"
      ? "lime"
      : status === "Svakere"
        ? "alert"
        : status === "Pågår"
          ? "warn"
          : "neu";
  return <AgChip tone={tone}>{status}</AgChip>;
}
