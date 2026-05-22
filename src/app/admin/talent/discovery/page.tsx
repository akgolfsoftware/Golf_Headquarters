/**
 * /admin/talent/discovery — Scout-feed for nye talenter (M13 K2)
 *
 * Viser alle PLAYER-brukere som IKKE er i TalentTracking, med søk +
 * filter på HCP-range og hjemmeklubb. Hver rad har en form for å
 * legge spilleren inn i talent-tracking via server action.
 *
 * Roller: ADMIN, COACH.
 */

import Link from "next/link";
import { ArrowLeft, Filter, UserPlus } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";

import { LeggTilForm } from "./legg-til-form";

type Search = {
  q?: string;
  hcp?: string; // "0-5" | "5-15" | "15-30" | "30+"
  klubb?: string;
};

const HCP_RANGES: Record<string, { label: string; min: number; max: number }> = {
  "0-5": { label: "0–5", min: 0, max: 5 },
  "5-15": { label: "5–15", min: 5, max: 15 },
  "15-30": { label: "15–30", min: 15, max: 30 },
  "30+": { label: "30+", min: 30, max: 999 },
};

function inHcp(hcp: number | null, rangeKey: string | null): boolean {
  if (!rangeKey) return true;
  if (hcp == null) return false;
  const r = HCP_RANGES[rangeKey];
  if (!r) return true;
  return hcp >= r.min && hcp < r.max;
}

export default async function TalentDiscovery({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const hcpRange = params.hcp ?? null;
  const klubbFilter = params.klubb ?? null;

  // Hent alle PLAYER-brukere som IKKE har talent-tracking
  const alle = await prisma.user.findMany({
    where: {
      role: "PLAYER",
      talentTracking: { is: null },
    },
    select: {
      id: true,
      name: true,
      hcp: true,
      playingYears: true,
      homeClub: true,
    },
    orderBy: [{ hcp: "asc" }, { name: "asc" }],
  });

  const filtrert = alle.filter((u) => {
    if (q) {
      const navn = (u.name ?? "").toLowerCase();
      const klubb = (u.homeClub ?? "").toLowerCase();
      if (!navn.includes(q) && !klubb.includes(q)) return false;
    }
    if (!inHcp(u.hcp, hcpRange)) return false;
    if (klubbFilter && u.homeClub !== klubbFilter) return false;
    return true;
  });

  // Unike klubber for filter-chip
  const klubber = Array.from(
    new Set(
      alle.map((u) => u.homeClub).filter((k): k is string => Boolean(k)),
    ),
  ).sort();

  function lenke(extra: { hcp?: string | null; klubb?: string | null }) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    const hcp = extra.hcp !== undefined ? extra.hcp : hcpRange;
    const klubb = extra.klubb !== undefined ? extra.klubb : klubbFilter;
    if (hcp) sp.set("hcp", hcp);
    if (klubb) sp.set("klubb", klubb);
    const s = sp.toString();
    return s ? `/admin/talent/discovery?${s}` : "/admin/talent/discovery";
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Talent · Discovery"
        titleLead="Finn nytt"
        titleItalic="talent"
        sub={`${alle.length} spillere ikke i tracking. Filtrer og legg til de mest aktuelle.`}
        actions={
          <Link
            href="/admin/talent"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Tilbake til oversikt
          </Link>
        }
      />

      {/* Søk */}
      <form
        method="get"
        action="/admin/talent/discovery"
        className="flex flex-wrap items-center gap-2"
      >
        {hcpRange && <input type="hidden" name="hcp" value={hcpRange} />}
        {klubbFilter && <input type="hidden" name="klubb" value={klubbFilter} />}
        <input
          type="search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Søk spiller eller klubb …"
          className="flex-1 min-w-64 rounded-md border border-input bg-background px-4 py-2 text-[13px]"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Søk
        </button>
      </form>

      {/* HCP filter */}
      <section>
        <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <Filter className="h-3 w-3" strokeWidth={1.5} />
          HCP-range
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={lenke({ hcp: null })}
            className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
              !hcpRange
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Alle
          </Link>
          {Object.entries(HCP_RANGES).map(([key, r]) => {
            const aktiv = hcpRange === key;
            return (
              <Link
                key={key}
                href={lenke({ hcp: aktiv ? null : key })}
                className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
                  aktiv
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                HCP {r.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Klubb-filter */}
      {klubber.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <Filter className="h-3 w-3" strokeWidth={1.5} />
            Hjemmeklubb
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={lenke({ klubb: null })}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
                !klubbFilter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Alle klubber
            </Link>
            {klubber.slice(0, 12).map((k) => {
              const aktiv = klubbFilter === k;
              return (
                <Link
                  key={k}
                  href={lenke({ klubb: aktiv ? null : k })}
                  className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${
                    aktiv
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {k}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Resultat-tabell */}
      {filtrert.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          titleItalic="Ingen treff"
          titleTrail="med disse filtrene"
          sub="Prøv å fjerne filtre eller endre søketeksten."
        />
      ) : (
        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="border-b border-border bg-secondary px-6 py-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {filtrert.length} kandidater
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <th className="px-6 py-4 font-medium">Spiller</th>
                <th className="px-4 py-4 font-medium">Hjemmeklubb</th>
                <th className="px-4 py-4 text-right font-medium">HCP</th>
                <th className="px-4 py-4 text-right font-medium">Spilt år</th>
                <th className="px-6 py-4 font-medium">Handling</th>
              </tr>
            </thead>
            <tbody>
              {filtrert.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border align-top last:border-b-0 hover:bg-secondary/40"
                >
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-semibold leading-tight">
                      {u.name}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[12px] text-muted-foreground">
                    {u.homeClub ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-[13px] tabular-nums">
                    {u.hcp?.toFixed(1).replace(".", ",") ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-[13px] tabular-nums text-muted-foreground">
                    {u.playingYears ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <LeggTilForm
                      userId={u.id}
                      spillerNavn={u.name}
                      homeClub={u.homeClub}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
