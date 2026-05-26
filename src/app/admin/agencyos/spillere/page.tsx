// AgencyOS · Spillere — søkbar tabell med HCP, pakke, betaling.
// Speiler PlayersScreen fra Claude artifact AK Golf AgencyOS.

import Link from "next/link";
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";

export const dynamic = "force-dynamic";

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
      _count: { select: { bookings: true } },
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
    return {
      id: s.id,
      navn,
      initialer,
      hcp: s.hcp,
      pakke,
      pakkeAktiv,
      sistMott: s.bookings[0]?.startAt ?? null,
      totaltOkter: s._count.bookings,
      skylder: false, // TODO: koble til Payment.status=PENDING når relevant
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AgencyOS · Spillere"
        titleLead="Mine"
        titleItalic="spillere"
        sub={`${rader.length} totalt. Caddie holder hver spillerside oppdatert etter hver økt.`}
      />

      {/* Toolbar */}
      <form className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Søk spiller, pakke eller fokus…"
          className="h-9 min-w-[200px] flex-1 rounded-md border border-input bg-background px-4 text-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
        />
        <input type="hidden" name="filter" value={filter} />
        {filtere.map((f) => (
          <Link
            key={f.key}
            href={`/admin/agencyos/spillere?filter=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`inline-flex h-9 items-center gap-1 rounded-md border px-4 text-xs font-mono uppercase tracking-[0.10em] transition-colors ${
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-secondary"
            }`}
          >
            {f.label} <span className="tabular-nums">{f.count}</span>
          </Link>
        ))}
        <button
          type="button"
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90"
          disabled
        >
          <Sparkles className="h-3 w-3" /> Be Caddie lage rapport
        </button>
      </form>

      {/* Tabell */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr>
                <Th>Spiller</Th>
                <Th>HCP</Th>
                <Th>Pakke</Th>
                <Th>Sist møtt</Th>
                <Th>Totalt</Th>
                <Th>Betaling</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {filtrert.map((r) => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/30">
                  <Td>
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[11px] font-semibold">
                        {r.initialer}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{r.navn}</div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          {r.totaltOkter} økter totalt
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      {r.hcp != null ? r.hcp.toFixed(1) : "—"}
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                        r.pakkeAktiv
                          ? "bg-accent/15 text-accent-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {r.pakke}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-muted-foreground">
                      {r.sistMott
                        ? r.sistMott.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })
                        : "—"}
                    </span>
                  </Td>
                  <Td mono>{r.totaltOkter}</Td>
                  <Td>
                    <span
                      className={`rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                        r.skylder ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {r.skylder ? "skylder" : "ok"}
                    </span>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/elever/${r.id}`}
                      className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
                    >
                      Åpne →
                    </Link>
                  </Td>
                </tr>
              ))}
              {filtrert.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
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
              <Link href={`/admin/elever/${r.id}`} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold">
                  {r.initialer}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground">{r.navn}</div>
                  <div className="text-xs text-muted-foreground">
                    HCP {r.hcp?.toFixed(1) ?? "—"} · {r.pakke}
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
      {children}
    </th>
  );
}

function Td({ children, mono = false }: { children?: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`px-4 py-2.5 ${mono ? "font-mono tabular-nums" : ""}`}>{children}</td>
  );
}

// Lucide-icons brukes nedenfor — sørg for at de er importert øverst
void TrendingUp;
void TrendingDown;
