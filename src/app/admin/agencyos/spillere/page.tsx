// AgencyOS · Spillere — søkbar, data-tett spillertabell med HCP, SG-trend,
// pakke og betaling. Speiler stallen-table-vokabularet (Bloomberg-tetthet,
// mono-caps eyebrows, DS-tokens). Server component + ekte Prisma.

import { Sparkline } from "@/components/athletic/golfdata";
import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

// SG-verdi → norsk format med fortegn (ekte minus-tegn).
function fmtSg(n: number | null): string {
  if (n == null) return "—";
  const s = `${Math.abs(n).toFixed(2).replace(".", ",")}`;
  return n > 0 ? `+${s}` : n < 0 ? `−${s}` : s;
}

type Filter = "alle" | "aktiv" | "abonnent" | "skylder";

type SearchParams = Promise<{ q?: string; filter?: string }>;

export default async function SpillereTabPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { q: qRaw, filter: filterRaw } = await searchParams;
  const q = (qRaw ?? "").trim().toLowerCase();
  const filter: Filter =
    filterRaw === "aktiv" || filterRaw === "abonnent" || filterRaw === "skylder" ? filterRaw : "alle";

  // 90 dager tilbake = "aktiv"
  const aktivCutoff = new Date();
  aktivCutoff.setDate(aktivCutoff.getDate() - 90);

  const spillere = await prisma.user.findMany({
    where: { role: "PLAYER" },
    include: {
      subscription: true,
      bookings: {
        orderBy: { startAt: "desc" },
        take: 1,
      },
      // Siste 8 SG-registreringer → trend-sparkline + nyeste SG total.
      sgInputs: {
        orderBy: { dato: "desc" },
        take: 8,
        select: { sgTotal: true },
      },
      // «Skylder» = minst én feilet betaling (charge gikk ikke gjennom).
      _count: { select: { bookings: true, payments: { where: { status: "FAILED" } } } },
    },
    orderBy: { name: "asc" },
    take: 200,
  });

  type Rad = {
    id: string;
    navn: string;
    initialer: string;
    hcp: number | null;
    pakke: string;
    pakkeAktiv: boolean;
    sistMott: Date | null;
    totaltOkter: number;
    skylder: boolean;
    sgTotal: number | null; // nyeste SG total
    sgTrend: number[]; // eldste → nyeste, for sparkline
  };

  const rader: Rad[] = spillere.map((s) => {
    const navn = s.name || "Ukjent";
    const initialer = navn
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const pakke = s.subscription?.tier ?? "Drop-in";
    const pakkeAktiv = s.subscription?.status === "ACTIVE";
    // sgInputs er desc (nyeste først). Trend skal være eldste → nyeste.
    const sgVerdier = s.sgInputs
      .map((i) => i.sgTotal)
      .filter((v): v is number => v != null);
    const sgTrend = [...sgVerdier].reverse();
    return {
      id: s.id,
      navn,
      initialer,
      hcp: s.hcp,
      pakke,
      pakkeAktiv,
      sistMott: s.bookings[0]?.startAt ?? null,
      totaltOkter: s._count.bookings,
      skylder: s._count.payments > 0, // minst én FAILED Payment = utestående
      sgTotal: sgVerdier[0] ?? null,
      sgTrend,
    };
  });

  const filtrert = rader.filter((r) => {
    if (q && !r.navn.toLowerCase().includes(q)) return false;
    if (filter === "aktiv") return r.sistMott && r.sistMott > aktivCutoff;
    if (filter === "abonnent") return r.pakkeAktiv;
    if (filter === "skylder") return r.skylder;
    return true;
  });

  const filtere: { key: Filter; label: string; count: number }[] = [
    { key: "alle", label: "Alle", count: rader.length },
    { key: "aktiv", label: "Aktiv", count: rader.filter((r) => r.sistMott && r.sistMott > aktivCutoff).length },
    { key: "abonnent", label: "Abonnent", count: rader.filter((r) => r.pakkeAktiv).length },
    { key: "skylder", label: "Skylder", count: rader.filter((r) => r.skylder).length },
  ];

  const isEmpty = rader.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AgencyOS · Spillere"
        titleLead="Mine"
        titleItalic="spillere"
        sub={`${rader.length} totalt. Caddie holder hver spillerside oppdatert etter hver økt.`}
      />

      {/* Panel: toolbar + tabell, ett kort (stallen-vokabular) */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Toolbar */}
        <form className="flex flex-wrap items-center gap-2.5 border-b border-border bg-background px-5 py-2.5">
          <div className="inline-flex flex-wrap gap-1.5">
            {filtere.map((f) => {
              const on = filter === f.key;
              return (
                <Link
                  key={f.key}
                  href={`/admin/agencyos/spillere?filter=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.10em] transition-colors ${
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-full px-[5px] py-0.5 font-mono text-[9px] font-extrabold tabular-nums ${
                      on ? "bg-accent/30 text-primary-foreground" : "bg-primary/[0.08] text-muted-foreground"
                    }`}
                  >
                    {f.count}
                  </span>
                </Link>
              );
            })}
          </div>

          <label className="inline-flex h-7 max-w-[320px] min-w-[200px] flex-1 items-center gap-2 rounded-full border border-input bg-card px-2.5">
            <Search className="h-[13px] w-[13px] text-muted-foreground" strokeWidth={1.75} aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Søk på navn, pakke eller fokus …"
              className="min-w-0 flex-1 bg-transparent font-sans text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
          <input type="hidden" name="filter" value={filter} />
        </form>

        {isEmpty ? (
          <div className="px-5 py-4">
            <EmptyState
              icon={Users}
              titleItalic="Ingen spillere"
              titleTrail="i stallen ennå"
              sub="Spillere du coacher dukker opp her med HCP, SG-trend, pakke og betalingsstatus."
            />
          </div>
        ) : (
          <>
            {/* Tabell (desktop) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <Th>Spiller</Th>
                    <Th align="right">HCP</Th>
                    <Th align="right">SG total</Th>
                    <Th>Trend · 6 mnd</Th>
                    <Th>Pakke</Th>
                    <Th>Sist møtt</Th>
                    <Th align="right">Totalt</Th>
                    <Th>Betaling</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {filtrert.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border transition-colors last:border-b-0 hover:bg-primary/[0.03]"
                    >
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-[11px] font-bold text-foreground">
                            {r.initialer}
                          </span>
                          <span className="flex min-w-0 flex-col leading-[1.15]">
                            <span className="truncate text-[13px] font-semibold tracking-[-0.005em] text-foreground">
                              {r.navn}
                            </span>
                            <span className="mt-px truncate font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                              {r.totaltOkter} økter totalt
                            </span>
                          </span>
                        </div>
                      </Td>
                      <Td align="right">
                        <span className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                          {r.hcp != null ? r.hcp.toFixed(1).replace(".", ",") : "—"}
                        </span>
                      </Td>
                      <Td align="right">
                        <span
                          className={`font-mono text-[13px] font-bold tabular-nums ${
                            r.sgTotal == null
                              ? "text-muted-foreground"
                              : r.sgTotal > 0
                                ? "text-success"
                                : r.sgTotal < 0
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                          }`}
                        >
                          {fmtSg(r.sgTotal)}
                        </span>
                      </Td>
                      <Td>
                        {r.sgTrend.length >= 2 ? (
                          <Sparkline
                            data={r.sgTrend}
                            width={72}
                            height={24}
                            color={
                              r.sgTrend[r.sgTrend.length - 1] >= r.sgTrend[0]
                                ? "hsl(var(--success))"
                                : "hsl(var(--destructive))"
                            }
                          />
                        ) : (
                          <span className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                            for få data
                          </span>
                        )}
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex h-[22px] items-center rounded-full px-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${
                            r.pakkeAktiv
                              ? "bg-accent text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {r.pakke}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {r.sistMott
                            ? r.sistMott.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })
                            : "—"}
                        </span>
                      </Td>
                      <Td align="right">
                        <span className="font-mono text-[13px] tabular-nums text-foreground">{r.totaltOkter}</span>
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex h-[22px] items-center gap-1.5 rounded-full pl-2 pr-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${
                            r.skylder
                              ? "bg-destructive/10 text-destructive"
                              : "bg-[var(--color-pyr-fys-track)] text-success"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${r.skylder ? "bg-destructive" : "bg-success"}`} />
                          {r.skylder ? "Skylder" : "OK"}
                        </span>
                      </Td>
                      <Td align="right">
                        <Link
                          href={`/admin/spillere/${r.id}`}
                          aria-label={`Åpne ${r.navn}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary"
                        >
                          <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </Link>
                      </Td>
                    </tr>
                  ))}
                  {filtrert.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                        Ingen spillere matcher filteret.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobil */}
            <ul className="divide-y divide-border md:hidden">
              {filtrert.map((r) => (
                <li key={r.id} className="p-4">
                  <Link href={`/admin/spillere/${r.id}`} className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-foreground">
                      {r.initialer}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground">{r.navn}</div>
                      <div className="text-xs text-muted-foreground">
                        HCP {r.hcp?.toFixed(1).replace(".", ",") ?? "—"} · SG {fmtSg(r.sgTotal)} · {r.pakke}
                      </div>
                    </div>
                    {r.sgTrend.length >= 2 && (
                      <Sparkline
                        data={r.sgTrend}
                        width={56}
                        height={20}
                        color={
                          r.sgTrend[r.sgTrend.length - 1] >= r.sgTrend[0]
                            ? "hsl(var(--success))"
                            : "hsl(var(--destructive))"
                        }
                        className="shrink-0"
                      />
                    )}
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                  </Link>
                </li>
              ))}
              {filtrert.length === 0 && (
                <li className="py-10 text-center text-sm text-muted-foreground">
                  Ingen spillere matcher filteret.
                </li>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Th({ children, align = "left" }: { children?: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className={`border-b border-border bg-card px-3 py-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left" }: { children?: React.ReactNode; align?: "left" | "right" }) {
  return (
    <td className={`px-3 py-[11px] align-middle ${align === "right" ? "text-right" : ""}`}>{children}</td>
  );
}
