/**
 * AgencyOS — Talent · Regional pipeline (`/admin/talent/region`), v2.
 * Port av `(legacy)/talent/region/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.21) — aggregeringslogikken er 100% uendret, ny v2-presentasjon
 * i `AdminTalentRegionV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminTalentRegionV2, REGION_PINS_V2, type NivaTalentV2, type RegionAggV2, type RegionIdV2 } from "@/components/admin/v2/AdminTalentRegionV2";

const NIVAER: NivaTalentV2[] = ["U10", "U12", "U14", "U16", "U18", "Senior"];

function tilRegionId(region: string | null): RegionIdV2 | null {
  if (!region) return null;
  const q = region.toLowerCase();
  const matchKeys: Record<RegionIdV2, string[]> = {
    nord: ["nord", "troms", "finnmark", "nordland"],
    trondelag: ["trøndelag", "trondelag", "trondheim"],
    midt: ["midt", "møre"],
    innland: ["innland", "hedmark", "oppland"],
    vest: ["vest", "hordaland", "bergen", "rogaland", "stavanger"],
    ost: ["øst", "ost", "oslo", "akershus", "østfold", "ostfold"],
    sor: ["sør", "sor", "vestfold", "telemark", "agder"],
  };
  for (const pin of REGION_PINS_V2) {
    if (matchKeys[pin.id].some((k) => q.includes(k))) return pin.id;
  }
  return null;
}

function avg(values: Array<number | null | undefined>): number | null {
  const filtered = values.filter((v): v is number => typeof v === "number");
  if (filtered.length === 0) return null;
  return filtered.reduce((s, v) => s + v, 0) / filtered.length;
}

export default async function TalentRegion({ searchParams }: { searchParams: Promise<{ niva?: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sp = await searchParams;
  const valgtNiva = (NIVAER as readonly string[]).includes(sp.niva ?? "") ? (sp.niva as NivaTalentV2) : null;

  const tracking = await prisma.talentTracking.findMany({
    where: valgtNiva ? { niva: valgtNiva } : undefined,
    select: { region: true, klubb: true, fysisk: true, teknikk: true, taktikk: true, mental: true, motivasjon: true },
  });

  type Agg = { id: RegionIdV2 | "ukjent"; label: string; antall: number; snitt: number | null; klubber: Map<string, number> };

  const aggMap = new Map<string, Agg>();
  for (const pin of REGION_PINS_V2) aggMap.set(pin.id, { id: pin.id, label: pin.label, antall: 0, snitt: null, klubber: new Map() });
  aggMap.set("ukjent", { id: "ukjent", label: "Ukjent", antall: 0, snitt: null, klubber: new Map() });

  for (const t of tracking) {
    const rid = tilRegionId(t.region) ?? "ukjent";
    const a = aggMap.get(rid)!;
    a.antall += 1;
    if (t.klubb) a.klubber.set(t.klubb, (a.klubber.get(t.klubb) ?? 0) + 1);
  }

  for (const pin of [...REGION_PINS_V2.map((p) => p.id as RegionIdV2 | "ukjent"), "ukjent" as const]) {
    const rader = tracking.filter((t) => (tilRegionId(t.region) ?? "ukjent") === pin);
    const a = aggMap.get(pin);
    if (!a) continue;
    const allRadar: Array<number | null | undefined> = [];
    for (const r of rader) allRadar.push(r.fysisk, r.teknikk, r.taktikk, r.mental, r.motivasjon);
    a.snitt = avg(allRadar);
  }

  const regioner: RegionAggV2[] = [...aggMap.values()]
    .filter((a) => a.antall > 0)
    .map((a) => ({
      id: a.id,
      label: a.label,
      antall: a.antall,
      snitt: a.snitt,
      toppKlubber: [...a.klubber.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3),
    }));

  const antallPerRegion: Record<string, number> = {};
  for (const [id, a] of aggMap) antallPerRegion[id] = a.antall;

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminTalentRegionV2 regioner={regioner} antallPerRegion={antallPerRegion} totalt={tracking.length} valgtNiva={valgtNiva} />
    </V2Shell>
  );
}
