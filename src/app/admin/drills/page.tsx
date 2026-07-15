/**
 * AgencyOS — Drill-bibliotek v2 (retning C). Rekomponert fra
 * src/app/admin/(legacy)/drills (samme Prisma-datakilde og filter-kontrakt:
 * kategori via ?kat=, søk via ?q=, `ExerciseDefinition`, VIS_MAKS=30 per
 * kategori — biblioteket har flere hundre drills, ingen full klientside-last).
 *
 * Kortvisning følger samme mønster som CoachOvelserV2 (AkseChip/LFaseBadge/Bit),
 * men kategori-fanene beholder admin-skjermens EGEN taksonomi (skillArea-basert:
 * Approach/Putting/Driving/Nærspill + pyramidArea=FYS) — ikke pyramidArea-fanene
 * PlayerHQ-siden bruker, siden det er en annen, reell kategorisering.
 *
 * Server component. Ingen ad-hoc UI, ingen rå hex (kun T.*).
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  T,
  Caps,
  Tittel,
  CTAPill,
  Kort,
  AkseChip,
  LFaseBadge,
  Bit,
  TomTilstand,
  Icon,
  TilbakeLenke,
} from "@/components/v2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Drill-bibliotek · AgencyOS" };

const VIS_MAKS = 30;

const KATEGORIER: {
  param: string;
  label: string;
  where: Prisma.ExerciseDefinitionWhereInput | null;
}[] = [
  { param: "alle", label: "Alle", where: null },
  { param: "approach", label: "Approach", where: { skillArea: "TILNAERMING" } },
  { param: "putting", label: "Putting", where: { skillArea: "PUTTING" } },
  { param: "driving", label: "Driving", where: { skillArea: "TEE_TOTAL" } },
  { param: "naerspill", label: "Nærspill", where: { skillArea: "AROUND_GREEN" } },
  { param: "fys", label: "Fys", where: { pyramidArea: "FYS" } },
];

/** Meta-linje av ekte felter — utelater det som mangler, finner aldri på tall. */
function drillMeta(d: { defaultSets: number | null; defaultReps: number | null; durationMin: number | null }): string {
  const deler: string[] = [];
  if (d.defaultSets !== null && d.defaultReps !== null) deler.push(`${d.defaultSets}×${d.defaultReps}`);
  if (d.durationMin !== null) deler.push(`${d.durationMin} min`);
  return deler.join(" · ");
}

function csTekst(d: { csMin: number | null; csMax: number | null }): string | null {
  if (d.csMin == null && d.csMax == null) return null;
  if (d.csMin != null && d.csMax != null) return `CS${d.csMin}–${d.csMax}`;
  return `CS${d.csMin ?? d.csMax}`;
}

function katHref(param: string, q: string): string {
  const params = new URLSearchParams();
  if (param !== "alle") params.set("kat", param);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/admin/drills?${qs}` : "/admin/drills";
}

export default async function AdminDrillsPage({
  searchParams,
}: {
  searchParams: Promise<{ kat?: string; q?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = await searchParams;
  const aktiv = KATEGORIER.find((k) => k.param === (sp.kat ?? "alle")) ?? KATEGORIER[0];
  const q = sp.q?.trim() ?? "";

  const sokWhere: Prisma.ExerciseDefinitionWhereInput | undefined = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { hasSome: [q] } },
        ],
      }
    : undefined;

  const where: Prisma.ExerciseDefinitionWhereInput | undefined =
    aktiv.where && sokWhere ? { AND: [aktiv.where, sokWhere] } : (aktiv.where ?? sokWhere ?? undefined);

  const [total, iKategori, drills] = await Promise.all([
    prisma.exerciseDefinition.count(),
    prisma.exerciseDefinition.count({ where }),
    prisma.exerciseDefinition.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        pyramidArea: true,
        lPhase: true,
        csMin: true,
        csMax: true,
        durationMin: true,
        defaultSets: true,
        defaultReps: true,
      },
      take: VIS_MAKS,
    }),
  ]);

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>

      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <Caps>AgencyOS · Planlegge</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="tagget.">{`${total} drills,`}</Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 8, maxWidth: 480 }}>
              Øvelsesbiblioteket coachene deler. Filtrer på ferdighet og slipp drills rett inn i en plan.
            </p>
          </div>
          <Link href="/admin/drills/ny" style={{ textDecoration: "none" }}>
            <CTAPill icon="plus">Ny drill</CTAPill>
          </Link>
        </div>

        {/* Søk — GET-form, samme kontrakt som legacy (?q=, bevarer ?kat=). */}
        <form action="/admin/drills" method="GET">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              maxWidth: 360,
              borderRadius: 9999,
              border: `1px solid ${T.border}`,
              background: T.panel2,
              padding: "7px 14px",
            }}
          >
            <Icon name="search" size={13} style={{ color: T.mut }} />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Søk drill-navn, beskrivelse eller tag"
              style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: T.ui, fontSize: 13, color: T.fg }}
            />
          </label>
          {aktiv.param !== "alle" && <input type="hidden" name="kat" value={aktiv.param} />}
        </form>

        {/* Kategori-faner — server-drevet via ?kat=, samme taksonomi som legacy. */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {KATEGORIER.map((k) => (
            <Link key={k.param} href={katHref(k.param, q)} style={{ textDecoration: "none" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 9999,
                  border: `1px solid ${k.param === aktiv.param ? "transparent" : T.border}`,
                  background: k.param === aktiv.param ? T.lime : T.panel2,
                  color: k.param === aktiv.param ? T.onLime : T.mut,
                  padding: "6px 13px",
                  fontFamily: T.mono,
                  fontSize: 10.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {k.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Grid */}
        {drills.length === 0 ? (
          <Kort>
            <TomTilstand icon="dumbbell" title="Ingen drills i denne kategorien ennå" sub="Prøv et annet filter, eller opprett en ny drill." />
          </Kort>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 12 }}>
            {drills.map((d) => {
              const meta = drillMeta(d);
              const cs = csTekst(d);
              return (
                <Link key={d.id} href={`/admin/drills/${d.id}`} style={{ textDecoration: "none", color: "inherit", minWidth: 0 }}>
                  <Kort hover pad="14px 15px" style={{ gap: 10, height: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <AkseChip a={d.pyramidArea} />
                      <Icon name="chevron-right" size={14} style={{ color: T.mut }} />
                    </div>
                    <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg, lineHeight: 1.3 }}>{d.name}</div>
                    {(d.lPhase || cs) && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {d.lPhase && <LFaseBadge fase={d.lPhase} kompakt />}
                        {cs && <Bit monoTekst>{cs}</Bit>}
                      </div>
                    )}
                    {meta && <Caps size={9} style={{ color: T.mut }}>{meta}</Caps>}
                  </Kort>
                </Link>
              );
            })}
          </div>
        )}

        {iKategori > VIS_MAKS && (
          <Caps size={9} style={{ color: T.mut }}>
            Viser {VIS_MAKS} av {iKategori} i kategorien «{aktiv.label}».
          </Caps>
        )}
      </div>
    </V2Shell>
  );
}
