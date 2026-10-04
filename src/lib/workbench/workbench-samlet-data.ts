import "server-only";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { stallenPlayerWhere } from "@/lib/admin/stallen-scope";
import { addDays } from "@/lib/domain/workbench/operations";
import type { WorkbenchMode } from "@/lib/domain/workbench/types";
import { editableGroupWhere, ownGroupPublicationWhere } from "./group-scope";
import { loadWeek, loadSources, loadStallFollowup, loadSession, type WbResultat } from "./wb-actions";
import { loadFysTurneringWorkbenchData } from "./fys-turnering-data";
import { hentMaalSpor } from "./maal-spor";
import { parsePlanKontekst, queryVerdi, type PlanQuery } from "./plan-kontekst";
import { parseSessionBudget } from "./perioder";
import { summerTreningsvolum, type TreningsvolumOkt } from "./treningsvolum";
import { fraDatoKolonne, tilDatoKolonne } from "./wb-map";
import { lastSamletVolumgrunnlag, samletOsloMidnatt } from "./workbench-samlet-volum";
import type { WorkbenchSurface } from "./visning-url";
import type { SamletVindu, WorkbenchFlate, WorkbenchSamletAnalyse, WorkbenchSamletData } from "./workbench-samlet-typer";

const INGEN_TILGANG = "Ingen tilgang til denne spilleren.";
const BORD_SAMTIDIGHET = 4;
const volumKilde = "Egne økter og eldre planer uten dubletter. Registrert tid er eksplisitt ført; eldre loggers klokketid vises separat som anslag.";

function summer(okter: TreningsvolumOkt[], vindu: SamletVindu, naa: Date) {
  return summerTreningsvolum(okter, { fraDato: tilDatoKolonne(vindu.fraDato), tilDato: tilDatoKolonne(vindu.tilDato), naa });
}

/** Kun én spiller og nøyaktig oppgitt Oslo-datovindu; ingen stall-/kohortkilde. */
async function lastAnalyse(playerId: string, vindu: SamletVindu, volum: WorkbenchSamletAnalyse["volum"]): Promise<WorkbenchSamletAnalyse> {
  const dato = { gte: samletOsloMidnatt(vindu.fraDato), lt: samletOsloMidnatt(vindu.tilDato) };
  const [runder, tester, trackman] = await Promise.all([
    prisma.round.findMany({ where: { userId: playerId, playedAt: dato }, orderBy: { playedAt: "asc" },
      select: { id: true, playedAt: true, score: true, sgSource: true, sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true,
        _count: { select: { holeScores: true } } } }),
    prisma.testResult.findMany({ where: { userId: playerId, takenAt: dato }, orderBy: { takenAt: "asc" },
      select: { id: true, testId: true, takenAt: true, score: true, test: { select: { name: true } } } }),
    prisma.trackManSession.findMany({ where: { userId: playerId, recordedAt: dato }, orderBy: { recordedAt: "asc" },
      select: { id: true, recordedAt: true, shotCount: true } }),
  ]);
  return {
    vindu, kilde: "Egne lagrede runder, testresultater og TrackMan-økter i valgt datovindu. Sammenfall viser ikke årsak.", volum,
    runder: runder.map(r => ({ id: r.id, dato: r.playedAt.toISOString(), brutto: r.score, hull: r._count.holeScores, sgKilde: r.sgSource,
      sgTotal: r.sgTotal, sgOtt: r.sgOtt, sgApp: r.sgApp, sgArg: r.sgArg, sgPutt: r.sgPutt })),
    tester: tester.map(t => ({ id: t.id, testId: t.testId, navn: t.test.name, dato: t.takenAt.toISOString(), verdi: t.score, enhet: null })),
    trackman: trackman.map(t => ({ id: t.id, dato: t.recordedAt.toISOString(), slag: t.shotCount })),
    // Kilde-tag og hullantall beviser ikke samme baseline/normalisering.
    // Per-runde tall beholdes; ni/18 hull normaliseres ikke uten slik kilde.
    sg: { roundCount: runder.filter(r => r.sgTotal !== null).length, total: null, ott: null, app: null,
      arg: null, putt: null, referanse: "Samlet SG er ikke beregnet: felles referanse og normalisering er ikke dokumentert. Se kilde og hullantall per runde." },
  };
}

export async function loadWorkbenchSamletData(input: {
  playerId: string; routeSurface: WorkbenchSurface; flate: WorkbenchFlate; query: PlanQuery; now?: Date;
}): Promise<WbResultat<WorkbenchSamletData>> {
  // Autentisering/samtykke skjer før første personlesing; ingen klientrolle er autoritet.
  const viewer = await requirePortalUser(input.routeSurface === "agency" ? { allow: ["COACH", "ADMIN"] } : {});
  if (input.routeSurface !== "agency" && input.routeSurface !== "player") return { ok: false, error: INGEN_TILGANG };
  if (input.routeSurface === "player" && (viewer.id !== input.playerId || viewer.role === "PARENT" || viewer.role === "GUEST"))
    return { ok: false, error: INGEN_TILGANG };
  if (input.routeSurface === "agency" && viewer.role !== "COACH" && viewer.role !== "ADMIN") return { ok: false, error: INGEN_TILGANG };
  if (!["sesong", "uke", "bord", "analyse"].includes(input.flate)) return { ok: false, error: "Ugyldig Workbench-visning." };
  const spiller = await prisma.user.findFirst({
    where: input.routeSurface === "agency" ? { AND: [coachScopedPlayerWhere(viewer), { id: input.playerId }] } : { id: viewer.id },
    select: { id: true, name: true },
  });
  if (!spiller) return { ok: false, error: INGEN_TILGANG };
  const now = input.now ?? new Date();
  const playerId = spiller.id;
  const role = input.routeSurface === "player" ? "player" : "coach";
  const mode: WorkbenchMode = { kind: role === "player" ? "PLAYER" : "AGENCY", subjectId: playerId, sources: [] };
  const varsler: string[] = [];
  try {
    const query = { ...input.query };
    let kontekst = parsePlanKontekst(query, { now });
    const season = await prisma.seasonPlan.findFirst({
      where: { userId: playerId, year: kontekst.year },
      select: { id: true, name: true, startDate: true, endDate: true, updatedAt: true, periodBlocks: {
        orderBy: { startDate: "asc" }, select: { id: true, lPhase: true, startDate: true, endDate: true, focus: true,
          weeklyVolMin: true, weeklyVolMax: true, weeklySessionBudget: true },
      } },
    });
    const periode = season?.periodBlocks.find(p => p.id === kontekst.referanse.periode);
    if (kontekst.referanse.periode && !periode) {
      delete query.periode;
      varsler.push("Periodevalget er ikke tilgjengelig for denne spilleren og er tømt.");
    }
    kontekst = parsePlanKontekst(query, { now, periode: periode ? {
      id: periode.id, startDate: fraDatoKolonne(periode.startDate), endDate: fraDatoKolonne(periode.endDate),
    } : null });
    const weekVindu = { fraDato: kontekst.weekStart, tilDato: addDays(kontekst.weekStart, 7) };
    const [ukeRes, kilderRes, weekGrunnlag, goals, fys, rosterRows, gruppeRows] = await Promise.all([
      loadWeek({ playerId, mode, weekStart: kontekst.weekStart }), loadSources({ playerId, weekStart: kontekst.weekStart }),
      lastSamletVolumgrunnlag(playerId, viewer.id, weekVindu), hentMaalSpor(playerId),
      loadFysTurneringWorkbenchData(playerId, { viewer: role }),
      role === "coach" ? prisma.user.findMany({ where: stallenPlayerWhere(viewer), select: { id: true, name: true }, orderBy: [{ name: "asc" }, { id: "asc" }] }) : [],
      role === "coach" ? prisma.group.findMany({ where: editableGroupWhere(viewer), select: { id: true, name: true }, orderBy: { name: "asc" } }) : [],
    ]);
    if (!ukeRes.ok) return ukeRes;
    if (!kilderRes.ok) varsler.push("Kildebiblioteket kunne ikke lastes. Prøv igjen.");
    if (goals.some(g => g.spor)) varsler.push("Målsporet følger dagens målfrister; det er ikke en historisk periodesum.");
    const ønsketGruppeId = queryVerdi(query, "gruppe");
    const valgtGruppeId = role === "coach"
      ? gruppeRows.find(group => group.id === ønsketGruppeId)?.id ?? gruppeRows[0]?.id ?? null
      : null;
    const data: WorkbenchSamletData = {
      player: { id: playerId, navn: spiller.name ?? "Spiller" }, routeSurface: input.routeSurface, role, flate: input.flate,
      planKontekst: kontekst, uke: ukeRes.data, kilder: kilderRes.ok ? kilderRes.data : [], goals, fys,
      roster: rosterRows.map(p => ({ id: p.id, navn: p.name ?? "Spiller" })), grupper: gruppeRows.map(g => ({ id: g.id, navn: g.name })),
      valgtGruppeId,
      volum: summer(weekGrunnlag.okter, weekVindu, now), volumKilde, valgtOkt: null,
      sesong: null, bord: null, analyse: null, varsler,
    };
    if (kontekst.referanse.okt) {
      const row = await prisma.workbenchSession.findFirst({
        where: { id: kontekst.referanse.okt, playerId, ...(viewer.id === playerId ? { hiddenByPlayer: false, AND: [ownGroupPublicationWhere()] } : {}) },
        select: { id: true },
      });
      // Eiersjekken skjer før loadSession, som beholder egne original-/gruppevakter.
      const valgt = row ? await loadSession(row.id) : null;
      if (valgt?.ok && valgt.data?.playerId === playerId) data.valgtOkt = valgt.data;
      else { delete kontekst.referanse.okt; varsler.push("Øktvalget er ikke tilgjengelig for denne spilleren og er tømt."); }
    }
    if (input.flate === "bord") {
      const personer = role === "player" ? [data.player] : data.roster;
      const rader: NonNullable<WorkbenchSamletData["bord"]>["rader"] = [];
      for (let i = 0; i < personer.length; i += BORD_SAMTIDIGHET) {
        rader.push(...await Promise.all(personer.slice(i, i + BORD_SAMTIDIGHET).map(async p => {
          try {
            // Hver rad får sin egen gjeldende tilgangsvakt gjennom loadWeek.
            const uke = p.id === playerId ? ukeRes : await loadWeek({ playerId: p.id, weekStart: kontekst.weekStart, mode: { ...mode, subjectId: p.id } });
            if (!uke.ok) return { spiller: { id: p.id, navn: "Utilgjengelig" }, uke: null, volum: null, followup: null, error: "Spilleren kunne ikke lastes." };
            const [grunnlag, oppfolging] = await Promise.all([
              p.id === playerId ? weekGrunnlag : lastSamletVolumgrunnlag(p.id, viewer.id, weekVindu),
              loadStallFollowup({ playerId: p.id, weekStart: kontekst.weekStart }),
            ]);
            return { spiller: p, uke: uke.data, volum: summer(grunnlag.okter, weekVindu, now),
              followup: oppfolging.ok ? oppfolging.data : null, error: oppfolging.ok ? null : "Oppfølgingen kunne ikke lastes." };
          } catch { return { spiller: { id: p.id, navn: "Utilgjengelig" }, uke: null, volum: null, followup: null, error: "Spilleren kunne ikke lastes." }; }
        })));
      }
      data.bord = { rader, total: personer.length, samtidigeLesere: BORD_SAMTIDIGHET };
    }
    if (input.flate === "sesong" || input.flate === "analyse") {
      const vindu = periode && input.flate === "analyse"
        ? { fraDato: fraDatoKolonne(periode.startDate), tilDato: addDays(fraDatoKolonne(periode.endDate), 1) }
        : season ? { fraDato: fraDatoKolonne(season.startDate), tilDato: addDays(fraDatoKolonne(season.endDate), 1) }
          : { fraDato: `${kontekst.year}-01-01`, tilDato: `${kontekst.year + 1}-01-01` };
      if (!season) varsler.push("Ingen årsplan er lagret. Datovinduet viser valgt kalenderår.");
      const grunnlag = await lastSamletVolumgrunnlag(playerId, viewer.id, vindu);
      const volum = summer(grunnlag.okter, vindu, now);
      if (input.flate === "analyse") data.analyse = await lastAnalyse(playerId, vindu, volum);
      else {
        const [turneringer, tester] = await Promise.all([
          prisma.tournamentEntry.findMany({ where: { userId: playerId, entryStatus: { not: "WITHDRAWN" }, OR: [
            { tournament: { startDate: { lt: tilDatoKolonne(vindu.tilDato) }, OR: [{ endDate: { gte: tilDatoKolonne(vindu.fraDato) } }, { endDate: null, startDate: { gte: tilDatoKolonne(vindu.fraDato) } }] } },
            { manualDate: { lt: tilDatoKolonne(vindu.tilDato) }, OR: [{ manualEndDate: { gte: tilDatoKolonne(vindu.fraDato) } }, { manualEndDate: null, manualDate: { gte: tilDatoKolonne(vindu.fraDato) } }] },
          ] }, select: { id: true, manualName: true, manualDate: true, manualEndDate: true, priority: true,
            tournament: { select: { name: true, startDate: true, endDate: true } } } }),
          prisma.testResult.findMany({ where: { userId: playerId, takenAt: { gte: samletOsloMidnatt(vindu.fraDato), lt: samletOsloMidnatt(vindu.tilDato) } },
            select: { id: true, takenAt: true, test: { select: { name: true } } } }),
        ]);
        const maneder = [];
        for (let dato = vindu.fraDato.slice(0, 7) + "-01"; dato < vindu.tilDato;) {
          const d = tilDatoKolonne(dato); d.setUTCMonth(d.getUTCMonth() + 1);
          const neste = fraDatoKolonne(d);
          maneder.push({ monthStart: dato, volum: summer(grunnlag.okter, { fraDato: dato < vindu.fraDato ? vindu.fraDato : dato, tilDato: neste > vindu.tilDato ? vindu.tilDato : neste }, now) });
          dato = neste;
        }
        data.sesong = {
          plan: season ? { id: season.id, navn: season.name, startDate: fraDatoKolonne(season.startDate), endDate: fraDatoKolonne(season.endDate), updatedAt: season.updatedAt.toISOString() } : null,
          vindu, volum, sessions: grunnlag.sessions, maneder,
          perioder: (season?.periodBlocks ?? []).map(p => ({ id: p.id, type: p.lPhase, startDate: fraDatoKolonne(p.startDate), endDate: fraDatoKolonne(p.endDate),
            focus: p.focus, weeklyVolMin: p.weeklyVolMin, weeklyVolMax: p.weeklyVolMax, sessionBudget: parseSessionBudget(p.weeklySessionBudget),
            volum: summer(grunnlag.okter, { fraDato: fraDatoKolonne(p.startDate), tilDato: addDays(fraDatoKolonne(p.endDate), 1) }, now) })),
          hendelser: [...turneringer.flatMap(t => {
            const start = t.tournament?.startDate ?? t.manualDate; const navn = t.tournament?.name ?? t.manualName;
            return start && navn ? [{ id: t.id, kind: "turnering" as const, navn, fraDato: fraDatoKolonne(start),
              tilDato: addDays(fraDatoKolonne(t.tournament?.endDate ?? t.manualEndDate ?? start), 1), kilde: "TournamentEntry" as const, priority: t.priority }] : [];
          }), ...tester.map(t => {
            const dato = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(t.takenAt);
            return { id: t.id, kind: "test" as const, navn: t.test.name, fraDato: dato,
              tilDato: addDays(dato, 1), kilde: "TestResult" as const, priority: null };
          })].sort((a, b) => a.fraDato.localeCompare(b.fraDato)),
        };
      }
    }
    return { ok: true, data };
  } catch { return { ok: false, error: "Workbench-data kunne ikke lastes. Prøv igjen." }; }
}
