/**
 * v2-preview: AgencyOS Grupper (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell/AdminShell — kun root-layout — så
 * V2Shell leverer all chrome i mørk v2-scope.
 *
 * Auth er identisk med /admin/grupper (requirePortalUser ADMIN/COACH). Data
 * hentes fra samme kilder som den ekte grupper-siden: Group + GroupMember +
 * GroupSchedule. «Neste økt» og faste treningstider utledes av de ekte
 * GroupSchedule-radene (WEEKLY) — ingen fabrikerte tider.
 *
 * Server component.
 */

import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG16Grupper } from "@/components/admin/precision/AG16Grupper";
import type { GrupperData, GruppeV2, FastTid } from "@/lib/admin/grupper/typer";
import { GfgkBootstrapButton, NyGruppeButton } from "./grupper-actions";
import { GFGK_BOOTSTRAP_GRUPPER } from "@/lib/gfgk-junior/bootstrap";
import { AK_STIGEN_TRINN, VED_SIDEN_AV_STIGEN } from "@/lib/agencyos/ak-stigen-data";
import { lastEtterlevelsePerGruppe } from "@/lib/admin/analyse/gruppe-analyse";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { gruppeInnsynWhere } from "@/lib/workbench/group-scope";
import type { AG16Helt } from "@/components/admin/precision/AG16Grupper";

export const dynamic = "force-dynamic";
export const metadata = { title: "Grupper · AgencyOS" };

// Man-indeksert (0=mandag) ukedagsforkortelser — matcher AK-kalenderens uke.
const DAG_KORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const UKEDAG_NUM: Record<string, number> = {
  monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6,
};

/** Oslo-lokal ukedag (0=man..6=søn), uavhengig av server-tidssone. */
function osloUkedag(d: Date): number {
  const dag = d.toLocaleDateString("en-US", { weekday: "long", timeZone: "Europe/Oslo" }).toLowerCase();
  return UKEDAG_NUM[dag] ?? 0;
}
/** Oslo-lokal «HH:MM». */
function osloTid(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
}
function minutter(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export default async function V2GrupperPage() {
  // G6: capability-gate (MANAGE_GROUPS ligger i COACH-defaulten — ingen
  // eksisterende coach mister tilgang; kan trekkes per trener via REVOKE).
  const user = await requireCapability(Capability.MANAGE_GROUPS);

  const coachesRaw = await prisma.user.findMany({
    where: { role: "COACH", deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const coaches = coachesRaw.map((c) => ({ id: c.id, name: c.name ?? "Ukjent" }));

  // Coach-scoping: en COACH ser kun grupper hun eier (Group.coachId) — samme
  // eierskapsmodell som coachScopedPlayerWhere allerede bygger på. ADMIN ser
  // alle, inkludert grupper uten tildelt coach.
  const groups = await prisma.group.findMany({
    where: user.role === "COACH" ? { coachId: user.id } : {},
    select: {
      id: true,
      name: true,
      coach: { select: { name: true } },
      members: { where: { endedAt: null, role: "PLAYER" }, select: { userId: true } },
      _count: { select: { members: { where: { endedAt: null } } } },
      schedules: {
        where: { recurring: "WEEKLY" },
        select: { id: true, title: true, startAt: true, endAt: true, location: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const etterlevelse = await lastEtterlevelsePerGruppe(groups.map((g) => ({ id: g.id })), now);
  const naaUkedag = osloUkedag(now);
  const naaMin = minutter(osloTid(now));

  type ForsteSamling = { minTil: number; gruppe: string; dag: string; tid: string; tittel: string; sted: string | null; id: string };

  const medNeste = groups.map((g): { gruppe: GruppeV2; neste: ForsteSamling | null } => {
    // Faste treningstider — sortert etter ukedag, deretter klokkeslett.
    const faste: (FastTid & { _ukedag: number; _min: number })[] = g.schedules
      .map((s) => {
        const ukedag = osloUkedag(s.startAt);
        return {
          id: s.id,
          dag: DAG_KORT[ukedag],
          tid: `${osloTid(s.startAt)}–${osloTid(s.endAt)}`,
          tittel: s.title,
          sted: s.location,
          _ukedag: ukedag,
          _min: minutter(osloTid(s.startAt)),
        };
      })
      .sort((a, b) => a._ukedag - b._ukedag || a._min - b._min);

    // Neste økt = treningstiden med minst tid til neste forekomst fra nå.
    let neste: (typeof faste)[number] | null = null;
    let minTilNeste = Infinity;
    for (const f of faste) {
      let dagDiff = (f._ukedag - naaUkedag + 7) % 7;
      if (dagDiff === 0 && f._min <= naaMin) dagDiff = 7;
      const tilNeste = dagDiff * 1440 + (f._min - naaMin);
      if (tilNeste < minTilNeste) {
        minTilNeste = tilNeste;
        neste = f;
      }
    }

    const nesteOkt = neste
      ? `${neste.dag} ${neste.tid.split("–")[0]}${neste.sted ? ` · ${neste.sted}` : ""}`
      : null;

    return {
      neste: neste ? { minTil: minTilNeste, gruppe: g.name, dag: neste.dag, tid: neste.tid, tittel: neste.tittel, sted: neste.sted, id: g.id } : null,
      gruppe: {
        id: g.id,
        navn: g.name,
        antallMedlemmer: g._count.members,
        nesteOkt,
        coachNavn: g.coach?.name ?? null,
        etterlevelsePct: etterlevelse[g.id] ?? null,
        faste: faste.map(({ _ukedag, _min, ...rest }) => rest),
      },
    };
  });
  const grupper: GruppeV2[] = medNeste.map((m) => m.gruppe);
  // Neste samling på tvers av gruppene (til tallet og hovedkortet i toppen).
  const forst = medNeste.reduce<ForsteSamling | null>((best, m) => (m.neste && (!best || m.neste.minTil < best.minTil) ? m.neste : best), null);

  const data: GrupperData = { grupper };

  // Spillere i grupper (ulike) og spillere coachen når som ikke står i noen aktiv gruppe.
  const iGrupper = new Set(groups.flatMap((g) => g.members.map((m) => m.userId))).size;
  const [utenGruppe, testdag] = await Promise.all([
    prisma.user.count({ where: { AND: [coachScopedPlayerWhere(user), { role: "PLAYER", deletedAt: null }, { groupMemberships: { none: { endedAt: null } } }] } }),
    prisma.testDayEvent.findFirst({
      where: { scheduledAt: { gte: now }, status: { in: ["PLANNED", "ACTIVE"] }, organizer: gruppeInnsynWhere(user) },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, title: true, location: true, scheduledAt: true, organizer: { select: { name: true } } },
    }),
  ]);

  const samling = forst;
  const samlingStart = samling ? new Date(now.getTime() + samling.minTil * 60_000) : null;
  const OSLO_DAG = new Intl.DateTimeFormat("nb-NO", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
  let helt: AG16Helt | null = null;
  if (testdag && (!samlingStart || testdag.scheduledAt <= samlingStart)) {
    helt = {
      overlinje: `Testdag · ${OSLO_DAG.format(testdag.scheduledAt)}`,
      tid: osloTid(testdag.scheduledAt),
      tittel: testdag.organizer.name,
      meta: [testdag.title, testdag.location].filter(Boolean).join(" · "),
      href: `/admin/tester/testdag/${testdag.id}`,
      lenkeTekst: "Åpne testdagen",
    };
  } else if (samling && samlingStart) {
    helt = {
      overlinje: `Neste samling · ${OSLO_DAG.format(samlingStart)}`,
      tid: samling.tid.split("–")[0],
      tidEtter: samling.tid.includes("–") ? `til ${samling.tid.split("–")[1]}` : undefined,
      tittel: samling.gruppe,
      meta: [samling.tittel, samling.sted].filter(Boolean).join(" · "),
      href: `/admin/grupper/${samling.id}`,
      lenkeTekst: "Åpne gruppa",
    };
  }

  // gfgkjunior.no-bootstrap: vis engangsknappen til alle fire gruppene finnes.
  const gfgkNavn = new Set(GFGK_BOOTSTRAP_GRUPPER.map((g) => g.navn));
  const manglerGfgk =
    groups.filter((g) => gfgkNavn.has(g.name)).length < gfgkNavn.size;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG16Grupper
        tilstand={grupper.length === 0 ? "tom" : "data"}
        data={data}
        nyGruppeKnapp={<NyGruppeButton coaches={coaches} />}
        gfgkBootstrapKnapp={manglerGfgk ? <GfgkBootstrapButton /> : null}
        tall={{ iGrupper, utenGruppe, nesteSamling: samling ? `${samling.dag} ${samling.tid.split("–")[0]}` : null }}
        helt={helt}
        stigen={{ trinn: AK_STIGEN_TRINN.map((t) => ({ navn: t.navn, gruppeNavn: t.gruppeNavn })), vedSiden: VED_SIDEN_AV_STIGEN }}
      />
    </AgencyOSSkall>
  );
}
