/**
 * /admin/talent/region — K3 Regional pipeline
 *
 * Grupperer TalentTracking per region. Viser kart-stub (forenklet SVG-Norge),
 * tabell med region/antall/snitt/klubber, og filter på nivå via ?niva=U14.
 * Designet hentet fra src/app/talent-region-pipeline-demo/page.tsx.
 *
 * Roller: COACH, ADMIN.
 */

import Link from "next/link";
import { ArrowLeft, Map as MapIcon, Users } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";

const NIVAER = ["U10", "U12", "U14", "U16", "U18", "Senior"] as const;
type Niva = (typeof NIVAER)[number];

type RegionId = "ost" | "vest" | "sor" | "nord" | "midt" | "innland" | "trondelag";

// Forenklet pin-kart over Norge — én pin per region. Plassering tilpasses ikke
// nøyaktig geografi; brukes som visuell anker, ikke som kart.
const REGION_PINS: { id: RegionId; label: string; matchKeys: string[]; x: number; y: number }[] = [
  { id: "nord", label: "Nord", matchKeys: ["nord", "troms", "finnmark", "nordland"], x: 220, y: 60 },
  { id: "trondelag", label: "Trøndelag", matchKeys: ["trøndelag", "trondelag", "trondheim"], x: 200, y: 130 },
  { id: "midt", label: "Midt", matchKeys: ["midt", "møre"], x: 145, y: 180 },
  { id: "innland", label: "Innland", matchKeys: ["innland", "hedmark", "oppland"], x: 260, y: 230 },
  { id: "vest", label: "Vest", matchKeys: ["vest", "hordaland", "bergen", "rogaland", "stavanger"], x: 100, y: 265 },
  { id: "ost", label: "Øst", matchKeys: ["øst", "ost", "oslo", "akershus", "østfold", "ostfold"], x: 230, y: 295 },
  { id: "sor", label: "Sør", matchKeys: ["sør", "sor", "vestfold", "telemark", "agder"], x: 175, y: 345 },
];

function tilRegionId(region: string | null): RegionId | null {
  if (!region) return null;
  const q = region.toLowerCase();
  for (const pin of REGION_PINS) {
    if (pin.matchKeys.some((k) => q.includes(k))) return pin.id;
  }
  return null;
}

function avg(values: Array<number | null | undefined>): number | null {
  const filtered = values.filter((v): v is number => typeof v === "number");
  if (filtered.length === 0) return null;
  return filtered.reduce((s, v) => s + v, 0) / filtered.length;
}

function fmt1(n: number | null): string {
  if (n == null) return "—";
  return n.toFixed(1).replace(".", ",");
}

type Search = Promise<{ niva?: string }>;

export default async function TalentRegion({
  searchParams,
}: {
  searchParams: Search;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sp = await searchParams;
  const valgtNiva = (NIVAER as readonly string[]).includes(sp.niva ?? "")
    ? (sp.niva as Niva)
    : null;

  const tracking = await prisma.talentTracking.findMany({
    where: valgtNiva ? { niva: valgtNiva } : undefined,
    select: {
      region: true,
      klubb: true,
      fysisk: true,
      teknikk: true,
      taktikk: true,
      mental: true,
      motivasjon: true,
    },
  });

  type Agg = {
    id: RegionId | "ukjent";
    label: string;
    antall: number;
    snitt: number | null;
    klubber: Map<string, number>;
  };

  const aggMap = new Map<string, Agg>();
  for (const pin of REGION_PINS) {
    aggMap.set(pin.id, {
      id: pin.id,
      label: pin.label,
      antall: 0,
      snitt: null,
      klubber: new Map(),
    });
  }
  aggMap.set("ukjent", {
    id: "ukjent",
    label: "Ukjent",
    antall: 0,
    snitt: null,
    klubber: new Map(),
  });

  for (const t of tracking) {
    const rid = tilRegionId(t.region) ?? "ukjent";
    const a = aggMap.get(rid)!;
    a.antall += 1;
    if (t.klubb) a.klubber.set(t.klubb, (a.klubber.get(t.klubb) ?? 0) + 1);
  }

  // Snitt-radar per region
  for (const pin of [...REGION_PINS.map((p) => p.id as RegionId | "ukjent"), "ukjent" as const]) {
    const rader = tracking.filter(
      (t) => (tilRegionId(t.region) ?? "ukjent") === pin,
    );
    const a = aggMap.get(pin);
    if (!a) continue;
    const allRadar: Array<number | null | undefined> = [];
    for (const r of rader) {
      allRadar.push(r.fysisk, r.teknikk, r.taktikk, r.mental, r.motivasjon);
    }
    a.snitt = avg(allRadar);
  }

  const regioner = [...aggMap.values()].filter((a) => a.antall > 0);
  const totalt = tracking.length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Talent · Regional pipeline"
        titleItalic="Regioner"
        titleTrail={valgtNiva ? `· ${valgtNiva}` : ""}
        sub={`${totalt} talent fordelt på regioner${valgtNiva ? ` (filtrert på ${valgtNiva})` : ""}.`}
        actions={
          <Link
            href="/admin/talent"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Tilbake
          </Link>
        }
      />

      {/* Niva-filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Nivå
        </span>
        <Link
          href="/admin/talent/region"
          className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${!valgtNiva ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:bg-secondary"}`}
        >
          Alle
        </Link>
        {NIVAER.map((n) => (
          <Link
            key={n}
            href={`/admin/talent/region?niva=${n}`}
            className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors ${valgtNiva === n ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:bg-secondary"}`}
          >
            {n}
          </Link>
        ))}
      </div>

      {totalt === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Ingen talent"
          titleTrail={valgtNiva ? `på ${valgtNiva}` : "registrert"}
          sub="Talent-spillere må ha region registrert i TalentTracking for å vises her."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          {/* Kart-stub */}
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <MapIcon className="mr-1 inline h-3 w-3" strokeWidth={1.5} />
              Norge · regioner
            </div>
            <svg viewBox="0 0 360 420" className="w-full">
              {/* Forenklet Norge-omriss */}
              <path
                d="M210 30 L260 50 L240 120 L260 160 L290 200 L300 250 L260 290 L240 330 L200 370 L160 390 L130 380 L110 340 L90 290 L80 240 L100 200 L120 160 L140 130 L160 100 L180 60 Z"
                fill="var(--color-secondary)"
                stroke="var(--color-border)"
                strokeWidth={1.5}
              />
              {REGION_PINS.map((pin) => {
                const agg = aggMap.get(pin.id);
                const antall = agg?.antall ?? 0;
                const r = Math.max(8, Math.min(28, 8 + antall * 2));
                const active = antall > 0;
                return (
                  <g key={pin.id}>
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={r}
                      fill={active ? "var(--color-primary)" : "var(--color-muted)"}
                      opacity={active ? 0.85 : 0.4}
                      stroke="var(--color-card)"
                      strokeWidth={2}
                    />
                    <text
                      x={pin.x}
                      y={pin.y + 3}
                      textAnchor="middle"
                      fontFamily="var(--font-geist-mono)"
                      fontSize="11"
                      fontWeight={600}
                      fill={active ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)"}
                    >
                      {antall}
                    </text>
                    <text
                      x={pin.x}
                      y={pin.y + r + 14}
                      textAnchor="middle"
                      fontFamily="var(--font-geist-mono)"
                      fontSize="10"
                      fill="var(--color-foreground)"
                    >
                      {pin.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </section>

          {/* Tabell */}
          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border bg-secondary px-6 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Region-oversikt ({regioner.length})
              </span>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[13px]">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Region
                  </th>
                  <th className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Antall
                  </th>
                  <th className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Snitt-radar
                  </th>
                  <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Topp-klubber
                  </th>
                </tr>
              </thead>
              <tbody>
                {regioner.map((r) => {
                  const toppKlubber = [...r.klubber.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-6 py-4 font-semibold">{r.label}</td>
                      <td className="px-4 py-4 font-mono tabular-nums">
                        {r.antall}
                      </td>
                      <td className="px-4 py-4 font-mono font-semibold tabular-nums text-primary">
                        {fmt1(r.snitt)}
                      </td>
                      <td className="px-6 py-4">
                        {toppKlubber.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {toppKlubber.map(([navn, ant]) => (
                              <span
                                key={navn}
                                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px]"
                              >
                                {navn}
                                <span className="font-mono text-muted-foreground">
                                  {ant}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
