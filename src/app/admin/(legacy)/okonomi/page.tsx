/**
 * AgencyOS — Økonomi, /admin/okonomi  (hybrid terminal design 2026-06-17).
 *
 * Layout: KPI-stripe (4 kort) + fakturaer/betalinger-tabell.
 * Periode-filter via ?p=mai|jun|q2 — server-side (ingen klient-JS for tabs).
 * Datakilde: Prisma Payment-modell.
 */

import Link from "next/link";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import {
  AgTable,
  AgTh,
  AgTd,
  AgChip,
  AgPage,
  AgPageHead,
  agBtnClass,
  agTrClass,
  AgPlayerCell,
} from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ p?: string }>;

/* ───────── periode-helpers ───────── */

type PeriodeKey = "mai" | "jun" | "q2";

function periodeRange(key: PeriodeKey): { fra: Date; til: Date; label: string } {
  const now = new Date();
  const yr = now.getFullYear();
  if (key === "mai") {
    return {
      fra: new Date(yr, 4, 1),
      til: new Date(yr, 5, 1),
      label: `mai ${yr}`,
    };
  }
  if (key === "jun") {
    return {
      fra: new Date(yr, 5, 1),
      til: new Date(yr, 6, 1),
      label: `juni ${yr}`,
    };
  }
  // q2: april–juni
  return {
    fra: new Date(yr, 3, 1),
    til: new Date(yr, 6, 1),
    label: `Q2 ${yr}`,
  };
}

function normalisePeriode(raw: string | undefined): PeriodeKey {
  if (raw === "mai" || raw === "q2") return raw;
  return "jun";
}

/* ───────── helpers ───────── */

function kroner(ore: number): string {
  return (ore / 100).toLocaleString("nb-NO", { maximumFractionDigits: 0 }) + " kr";
}

function initials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
}

/* ───────── status chip ───────── */

function PaymentChip({ status }: { status: string }) {
  const map: Record<string, { tone: "ok" | "warn" | "neu" | "alert" | "lime"; label: string }> = {
    SUCCEEDED: { tone: "lime", label: "Betalt" },
    PENDING: { tone: "warn", label: "Venter" },
    FAILED: { tone: "alert", label: "Feilet" },
    REFUNDED: { tone: "neu", label: "Refundert" },
    PARTIALLY_REFUNDED: { tone: "warn", label: "Del.refund." },
  };
  const cfg = map[status] ?? { tone: "neu" as const, label: status };
  return <AgChip tone={cfg.tone}>{cfg.label}</AgChip>;
}

/* ───────── KPI kort ───────── */

function KpiCard({
  label,
  value,
  delta,
  hot = false,
  warnTone = false,
}: {
  label: string;
  value: string;
  delta: string;
  hot?: boolean;
  warnTone?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[10px] border p-[14px] pb-3",
        hot
          ? "border-primary/20 bg-primary/10"
          : "border-border bg-card",
      )}
    >
      <div className="font-mono text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-[7px] font-mono text-[24px] font-semibold leading-none tabular-nums",
          hot ? "text-primary" : warnTone ? "text-warning" : "text-foreground",
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "mt-[6px] font-mono text-[10px]",
          hot ? "text-success" : warnTone ? "text-warning" : "text-muted-foreground",
        )}
      >
        {delta}
      </div>
    </div>
  );
}

/* ───────── page ───────── */

export default async function OkonomiPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireCapability(Capability.VIEW_FINANCE);

  const { p } = await searchParams;
  const periodeKey = normalisePeriode(p);
  const { fra, til, label: periodeLabel } = periodeRange(periodeKey);

  // Hent data for valgt periode
  const [
    inntektAgg,
    utestaaende,
    betalte,
    aktiveSubs,
    allePayments,
    // forrige periode for delta-beregning
    forrigeAgg,
  ] = await Promise.all([
    // Inntekt i perioden (netto)
    prisma.payment.aggregate({
      where: {
        status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED"] },
        paidAt: { gte: fra, lt: til },
      },
      _sum: { amountOre: true, amountRefundedOre: true },
      _count: true,
    }),
    // Utestående (PENDING i perioden)
    prisma.payment.aggregate({
      where: {
        status: "PENDING",
        createdAt: { gte: fra, lt: til },
      },
      _sum: { amountOre: true },
      _count: true,
    }),
    // Antall betalte i perioden
    prisma.payment.count({
      where: {
        status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED"] },
        paidAt: { gte: fra, lt: til },
      },
    }),
    // Aktive Pro-abonnenter
    prisma.subscription.count({ where: { status: "ACTIVE", tier: "PRO" } }),
    // Alle betalinger i perioden (tabell)
    prisma.payment.findMany({
      where: {
        createdAt: { gte: fra, lt: til },
        status: { in: ["SUCCEEDED", "PENDING", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"] },
      },
      include: { user: { select: { name: true } } },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
      take: 50,
    }),
    // Forrige tilsvarende periode for delta (simple: én periode tilbake)
    prisma.payment.aggregate({
      where: {
        status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED"] },
        paidAt: {
          gte: new Date(fra.getTime() - (til.getTime() - fra.getTime())),
          lt: fra,
        },
      },
      _sum: { amountOre: true, amountRefundedOre: true },
    }),
  ]);

  // Kalkuler KPI-verdier
  const bruttoOre = inntektAgg._sum.amountOre ?? 0;
  const refundOre = inntektAgg._sum.amountRefundedOre ?? 0;
  const nettoOre = bruttoOre - refundOre;

  const forrigeBrutto = forrigeAgg._sum.amountOre ?? 0;
  const forrigeRefund = forrigeAgg._sum.amountRefundedOre ?? 0;
  const forrigeNetto = forrigeBrutto - forrigeRefund;
  const deltaProc =
    forrigeNetto > 0
      ? Math.round(((nettoOre - forrigeNetto) / forrigeNetto) * 100)
      : null;

  const utestaaendeOre = utestaaende._sum.amountOre ?? 0;
  const utestaaendeAntall = utestaaende._count ?? 0;

  const period_tabs: { key: PeriodeKey; label: string }[] = [
    { key: "mai", label: "Mai" },
    { key: "jun", label: "Juni" },
    { key: "q2", label: "Q2" },
  ];

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Økonomi"
        title="Fakturaer"
        italic="og betalinger"
        lead="Fakturaer · betalinger · abonnement"
        actions={
          <div className="flex items-center gap-2">
            {/* Periode-tabs (server-side navigation) */}
            <div className="flex gap-[3px] rounded-[10px] border border-border bg-card p-[3px]">
              {period_tabs.map((t) => (
                <Link
                  key={t.key}
                  href={`/admin/okonomi?p=${t.key}`}
                  className={cn(
                    "rounded-[8px] px-[11px] py-[6px] font-mono text-[10px] font-bold transition-colors",
                    periodeKey === t.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </div>
            <button
              type="button"
              className={cn(agBtnClass("primary", "sm"), "cursor-not-allowed opacity-60")}
              title="Faktura-generering kommer"
            >
              <Plus size={13} strokeWidth={2.4} />
              Ny faktura
            </button>
          </div>
        }
      />

      {/* ── KPI strip ── */}
      <div className="mb-[18px] grid grid-cols-2 gap-[10px] lg:grid-cols-4">
        <KpiCard
          label={`Inntekt ${periodeLabel}`}
          value={kroner(nettoOre)}
          delta={
            deltaProc !== null
              ? `${deltaProc >= 0 ? "+" : ""}${deltaProc} % vs forrige`
              : `${inntektAgg._count} betalinger`
          }
          hot={nettoOre > 0}
        />
        <KpiCard
          label="Utestående"
          value={kroner(utestaaendeOre)}
          delta={`${utestaaendeAntall} faktura${utestaaendeAntall === 1 ? "" : "er"}`}
          warnTone={utestaaendeOre > 0}
        />
        <KpiCard
          label={`Betalte ${periodeLabel}`}
          value={String(betalte)}
          delta="fakturaer betalt"
        />
        <KpiCard
          label="Aktive abonnenter"
          value={String(aktiveSubs)}
          delta="PRO-spillere"
        />
      </div>

      {/* ── Betalingstabell ── */}
      <div className="overflow-hidden rounded-[10px] border border-border bg-card">
        {/* Tabell-header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Fakturaer · {periodeLabel}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {allePayments.length} rader
          </span>
        </div>

        {/* Scrollable table */}
        <div className="overflow-x-auto">
          <AgTable>
            <thead>
              <tr>
                <AgTh>Spiller</AgTh>
                <AgTh>Beskrivelse</AgTh>
                <AgTh>Type</AgTh>
                <AgTh num>Beløp</AgTh>
                <AgTh num>Dato</AgTh>
                <AgTh>Status</AgTh>
              </tr>
            </thead>
            <tbody>
              {allePayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center font-mono text-[12px] text-muted-foreground"
                  >
                    Ingen betalinger i perioden.
                  </td>
                </tr>
              ) : (
                allePayments.map((p) => {
                  const refund =
                    p.amountRefundedOre > 0
                      ? ` (− ${(p.amountRefundedOre / 100).toLocaleString("nb-NO")} kr)`
                      : "";
                  return (
                    <tr key={p.id} className={agTrClass}>
                      <AgTd>
                        <AgPlayerCell
                          initials={initials(p.user?.name ?? null)}
                          name={p.user?.name ?? "Ukjent"}
                          sub={p.description ?? undefined}
                          tone="neu"
                        />
                      </AgTd>
                      <AgTd>
                        <span className="text-[12.5px] text-muted-foreground">
                          {p.description ?? "—"}
                        </span>
                      </AgTd>
                      <AgTd>
                        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                          {p.type.toLowerCase()}
                        </span>
                      </AgTd>
                      <AgTd num>
                        {kroner(p.amountOre)}
                        {refund && (
                          <span className="text-muted-foreground">{refund}</span>
                        )}
                      </AgTd>
                      <AgTd num>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {formatDate(p.paidAt ?? p.createdAt)}
                        </span>
                      </AgTd>
                      <AgTd>
                        <PaymentChip status={p.status} />
                      </AgTd>
                    </tr>
                  );
                })
              )}
            </tbody>
          </AgTable>
        </div>
      </div>
    </AgPage>
  );
}
