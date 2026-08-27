/**
 * AgencyOS — Plan-hub (AG-06, Train-lock). Produksjonsside, IKKE forhåndsvisning.
 *
 * Fasit: `designsystem/train-lock/AG-06 Plan-hub.dc.html`. Hub-prinsipp: se
 * og velg, redigering skjer i Workbench (`/admin/workbench/[playerId]`).
 *
 * Fem rader med EKTE tall:
 * - Ukemaler        = PlanTemplate der varighetUker <= 1
 * - Treningsprogram = PlanTemplate der varighetUker > 1
 * - Månedsplaner    = 0, alltid, ikke-klikkbar — ingen månedsplan-modell
 *   finnes i skjemaet ennå (måned/år er bevisst utenfor bølge 1, se
 *   CLAUDE.md «Ikke i scope»). Fabriker ALDRI et tall her.
 * - Standardøkter   = OktMal
 * - Øvelsesbank     = DrillMal
 *
 * Uke-headeren («Uke N · X spillere · Y økter · Z udekket») telles fra
 * `WorkbenchSession` (den nye, gjeldende økt-modellen) for coachens
 * coachede spillere i inneværende Oslo-uke — IKKE fra den pensjonerte
 * TrainingPlan/TrainingPlanSession-modellen.
 *
 * «Udekket» (avveining, dokumentert her siden ingen fasit definerer det):
 * antall aktive coachede spillere som IKKE har noen WorkbenchSession i
 * inneværende uke. Måler manglende planlegging, ikke manglende
 * gjennomføring — en spiller med kun DRAFT-økter regnes som dekket.
 *
 * Primær-CTA («Åpne uke i Workbench»): dagens økt for en coachet spiller →
 * første coachede spiller med en økt denne uken → første coachede spiller
 * → `/admin/spillere` (ingen `/admin/stall`-rute finnes ennå).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { mondayOf } from "@/lib/domain/workbench/operations";
import { ukenummer } from "@/lib/uke-helpers";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { PlanHubV2, type PlanHubData, type PlanHubMalRad } from "@/components/admin/v2/PlanHubV2";

export const dynamic = "force-dynamic";

function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

function tilDatoKolonne(iso: string): Date {
  const [aar, maned, dag] = iso.split("-").map(Number);
  return new Date(Date.UTC(aar, maned - 1, dag));
}

function sistBruktTekst(d: { usageCount: number; updatedAt: Date }): string {
  if (d.usageCount <= 0) return "Ikke brukt ennå";
  const dato = d.updatedAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short" }).replace(/\.$/, "");
  return `Brukt ${d.usageCount} ${d.usageCount === 1 ? "gang" : "ganger"} · sist ${dato}`;
}

export default async function AdminPlanleggePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const idagIso = osloIdag();
  const weekStartIso = mondayOf(idagIso);
  const weekStart = tilDatoKolonne(weekStartIso);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const idag = tilDatoKolonne(idagIso);

  const spillerWhere = coachScopedPlayerWhere(user);

  // WorkbenchSession har INGEN Prisma-relasjon til User (kun plain
  // `playerId String`, jf. gotcha om additive tabeller uten @relation) — kan
  // derfor ikke filtrere via en nested `player: spillerWhere`. Hent
  // coachede spiller-IDer først, filtrer WorkbenchSession på `playerId: { in }`.
  const spillere = await prisma.user.findMany({
    where: spillerWhere,
    select: { id: true },
  });
  const spillerIder = spillere.map((s) => s.id);

  const [
    ukensOkter,
    dagensOkt,
    ukemalAntall,
    programAntall,
    oktMalAntall,
    drillMalAntall,
    ukemalRaderRaw,
    programRaderRaw,
  ] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: {
        date: { gte: weekStart, lte: weekEnd },
        playerId: { in: spillerIder },
      },
      select: { playerId: true },
    }),
    prisma.workbenchSession.findFirst({
      where: { date: idag, playerId: { in: spillerIder } },
      orderBy: { startMinute: "asc" },
      select: { playerId: true },
    }),
    prisma.planTemplate.count({ where: { varighetUker: { lte: 1 } } }),
    prisma.planTemplate.count({ where: { varighetUker: { gt: 1 } } }),
    prisma.oktMal.count(),
    prisma.drillMal.count(),
    prisma.planTemplate.findMany({
      where: { varighetUker: { lte: 1 } },
      orderBy: [{ usageCount: "desc" }, { name: "asc" }],
      take: 4,
      select: {
        id: true,
        name: true,
        usageCount: true,
        updatedAt: true,
        _count: { select: { sessions: true } },
      },
    }),
    prisma.planTemplate.findMany({
      where: { varighetUker: { gt: 1 } },
      orderBy: [{ usageCount: "desc" }, { name: "asc" }],
      take: 4,
      select: {
        id: true,
        name: true,
        usageCount: true,
        updatedAt: true,
        _count: { select: { sessions: true } },
      },
    }),
  ]);

  const spillerAntall = spillere.length;
  const spillerIdSet = new Set(spillere.map((s) => s.id));
  const dekketSpillerIder = new Set(ukensOkter.map((o) => o.playerId));
  const udekketAntall = Array.from(spillerIdSet).filter((id) => !dekketSpillerIder.has(id)).length;

  // Workbench-mål: dagens økt → første coachede spiller med økt denne uken →
  // første coachede spiller → fallback /admin/spillere.
  const forsteSpillerMedOktIUka = ukensOkter[0]?.playerId ?? null;
  const workbenchPlayerId = dagensOkt?.playerId ?? forsteSpillerMedOktIUka ?? spillere[0]?.id ?? null;
  const primaerHref = workbenchPlayerId
    ? `/admin/workbench/${workbenchPlayerId}?uke=${weekStartIso}`
    : "/admin/spillere";

  const tilMalRad = (base: string) => (m: (typeof ukemalRaderRaw)[number]): PlanHubMalRad => ({
    id: m.id,
    navn: m.name,
    meta: `${m._count.sessions} økter · ${sistBruktTekst(m)}`,
    href: `${base}/${m.id}`,
  });

  const data: PlanHubData = {
    coachFornavn: (user.name ?? "Coach").split(" ")[0],
    ukenummer: ukenummer(weekStart),
    spillerAntall,
    oktAntall: ukensOkter.length,
    udekketAntall,
    primaerHref,
    rader: [
      {
        id: "ukemaler",
        tittel: "Ukemaler",
        undertekst: "Slippes som ghost-dager i kilder",
        antall: ukemalAntall,
        href: "/admin/plan-templates",
      },
      {
        id: "program",
        tittel: "Treningsprogram",
        undertekst: "Flerukers program per spiller",
        antall: programAntall,
        href: "/admin/plan-templates",
      },
      {
        id: "maanedsplaner",
        tittel: "Månedsplaner",
        undertekst: "Ikke bygget ennå (bølge 2)",
        antall: 0,
        href: null,
      },
      {
        id: "standardokter",
        tittel: "Standardøkter",
        // Ingen egen admin-CRUD-side finnes ennå — malene brukes via
        // Workbench sitt kilder-panel. Ikke lenk til en rute som ikke finnes.
        undertekst: "Brukes fra kilder i Workbench",
        antall: oktMalAntall,
        href: null,
      },
      {
        id: "ovelsesbank",
        tittel: "Øvelsesbank",
        undertekst: "Drill må inn i en økt",
        antall: drillMalAntall,
        href: null,
      },
    ],
    ukemalRader: ukemalRaderRaw.map(tilMalRad("/admin/plan-templates")),
    programRader: programRaderRaw.map(tilMalRad("/admin/plan-templates")),
  };

  return (
    <V2Shell bredde="full" aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <PlanHubV2 data={data} />
    </V2Shell>
  );
}
