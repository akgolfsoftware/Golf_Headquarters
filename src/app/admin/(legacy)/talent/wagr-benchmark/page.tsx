/**
 * /admin/talent/wagr-benchmark — WAGR-referansespillere
 *
 * Viser 5 globalt topp + 5 norske topp som kalibreringspunkter for
 * NGF-kategori (A-L). AK Golf-spillere kan kobles til wagr_snapshot via
 * userId hvis de er registrert på wagr.com.
 *
 * Data: hentet via Chrome MCP fra wagr.com 12. mai 2026.
 * Beregning: mapTilNgfKategori i scripts/seed-wagr-benchmark.ts.
 */

import Link from "next/link";
import { ExternalLink, TrendingUp, TrendingDown, Trophy, Flag } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { WagrDeleteButton } from "./wagr-delete-button";

// NGF-kategori → label fra Øyvinds tabell
const KATEGORI_INFO: Record<string, { tier: string; pts: string }> = {
  A: { tier: "OWGR Top 150", pts: "≥1500" },
  B: { tier: "OWGR Top 400", pts: "≥1100" },
  C: { tier: "OWGR Top 700", pts: "≥900" },
  D: { tier: "Am. World 100", pts: "≥700" },
  E: { tier: "Am. Europa 300", pts: "≥400" },
  F: { tier: "Junior WORLD", pts: "≥220" },
  G: { tier: "Junior EUROPE", pts: "≥100" },
  H: { tier: "Junior Nasjonal", pts: "≥50" },
  I: { tier: "Junior Region/Klubb", pts: "<50" },
};

// Lande-koder vises som mono-tekst badge + Flag-ikon (CLAUDE.md: ingen emoji).

export default async function WagrBenchmarkPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [globale, norske] = await Promise.all([
    prisma.wagrSnapshot.findMany({
      where: { country: { not: "no" } },
      orderBy: { rank: "asc" },
      take: 5,
    }),
    prisma.wagrSnapshot.findMany({
      where: { country: "no" },
      orderBy: { rank: "asc" },
      take: 5,
    }),
  ]);

  const snapshotDato = globale[0]?.snapshotAt ?? new Date();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AgencyOS · Talent · WAGR-benchmark"
        titleLead="Kalibrer mot"
        titleItalic="verdens beste"
        sub={`Snapshot fra wagr.com · uke ${getIsoWeek(snapshotDato)}/${snapshotDato.getFullYear()}. NGF-kategori (A-L) beregnes fra Pts Avg.`}
        actions={
          <Link
            href="/admin/talent/wagr-import"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            + Importer spiller
          </Link>
        }
      />

      {/* Kategori-forklaring */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-base font-semibold tracking-tight">
          NGF-kategori-skala
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Power-skalaen fra Øyvind Rojahn (NGF) kalibrert mot WAGR Pts Avg.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {Object.entries(KATEGORI_INFO).map(([kat, info]) => (
            <div
              key={kat}
              className="rounded-md border border-border bg-secondary/30 p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg font-semibold">{kat}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {info.pts}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{info.tier}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Topp 5 globalt */}
      <Section
        title="Topp 5 menn — globalt"
        sub="Verdens beste amatører. Setter taket på Pts Avg-skalaen."
      >
        {globale.length === 0 ? (
          <EmptyState
            icon={Trophy}
            titleItalic="Ingen data"
            sub="Kjør seed-script: npx tsx scripts/seed-wagr-benchmark.ts"
          />
        ) : (
          <PlayerTable rows={globale} />
        )}
      </Section>

      {/* Topp 5 norske */}
      <Section
        title="Topp 5 norske gutter"
        sub="Setter floor for elite-junior i AK Golf-systemet. Norsk gull-standard = ~1000 Pts Avg (Mjaaseth)."
      >
        {norske.length === 0 ? (
          <EmptyState
            icon={Trophy}
            titleItalic="Ingen norske spillere"
            sub="Kjør seed-script eller bruk Importer-knappen for å legge til."
          />
        ) : (
          <PlayerTable rows={norske} />
        )}
      </Section>

      {/* Footnote */}
      <p className="font-mono text-[11px] text-muted-foreground">
        Snapshot tatt 12. mai 2026 (uke 18). Oppdateres manuelt ved behov.
        Auto-sync via cron kommer i Sprint J.
      </p>
    </div>
  );
}

// --- Components ---

function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-display text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </header>
      {children}
    </section>
  );
}

type SnapshotRow = {
  id: string;
  wagrPlayerSlug: string;
  fullName: string;
  country: string;
  rank: number;
  moveDelta: number | null;
  ptsAvg: number;
  ngfCategory: string | null;
};

function PlayerTable({ rows }: { rows: SnapshotRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-border bg-secondary/40">
          <tr>
            <Th>Rank</Th>
            <Th>Move</Th>
            <Th>Land</Th>
            <Th>Spiller</Th>
            <Th align="right">Pts Avg</Th>
            <Th align="center">NGF-kat</Th>
            <Th align="right">WAGR</Th>
            <Th align="right">Slett</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
            >
              <Td className="font-mono">{r.rank}</Td>
              <Td>{renderMove(r.moveDelta)}</Td>
              <Td>
                <span
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-secondary/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground"
                  aria-label={r.country}
                >
                  <Flag size={10} strokeWidth={1.75} />
                  {r.country}
                </span>
              </Td>
              <Td className="font-medium text-foreground">{r.fullName}</Td>
              <Td align="right" className="font-mono tabular-nums">
                {r.ptsAvg.toFixed(2)}
              </Td>
              <Td align="center">
                {r.ngfCategory && (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                    {r.ngfCategory}
                  </span>
                )}
              </Td>
              <Td align="right">
                <Link
                  href={`https://www.wagr.com/playerprofile/${r.wagrPlayerSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary"
                >
                  Åpne
                  <ExternalLink size={11} strokeWidth={1.75} />
                </Link>
              </Td>
              <Td align="right">
                <WagrDeleteButton snapshotId={r.id} fullName={r.fullName} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      className={`px-4 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground text-${align}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <td className={`px-4 py-4 text-${align} ${className}`}>{children}</td>
  );
}

function renderMove(delta: number | null) {
  if (delta === null || delta === 0) {
    return <span className="font-mono text-xs text-muted-foreground">—</span>;
  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs ${
        up ? "text-primary" : "text-destructive"
      }`}
    >
      {up ? (
        <TrendingUp size={12} strokeWidth={2} />
      ) : (
        <TrendingDown size={12} strokeWidth={2} />
      )}
      {Math.abs(delta)}
    </span>
  );
}

function getIsoWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
