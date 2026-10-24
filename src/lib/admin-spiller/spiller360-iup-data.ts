import "server-only";
import { medAkProfiler } from "@/lib/deling/ak-profil-lesing";
import { krevNavngittTrener } from "@/lib/deling/navngitt";
import { harSpiller360IupTilgang } from "./spiller360-iup-tilgang";
import { beregnGoalProgressListe } from "@/lib/portal/goals/progress";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import { osloDagSomDbDato } from "@/lib/portal/ph01-data";
import { summerTreningsvolum } from "@/lib/workbench/treningsvolum";
import { SPILLER_SYNLIGE_STATUSER } from "@/lib/workbench/wb-map";
import { ukenummer } from "@/lib/uke-helpers";
import { formaterLagretTestResultat } from "@/lib/portal-tester/resultat-visning";
import { lastSpiller360Teknisk } from "./spiller360-teknisk-data";
import { akseFra, dato } from "./spiller360-visning";
import type { S360Iup } from "./spiller360-typer";

const DAG = 86_400_000;
const UKEDAG = new Intl.DateTimeFormat("nb-NO", { weekday: "short", timeZone: "UTC" });
const DAG_MND = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
function dagLabel(d: Date): string {
  const u = UKEDAG.format(d).replace(".", "");
  return `${u.charAt(0).toUpperCase()}${u.slice(1, 3)} ${DAG_MND.format(d)}`;
}
const VOLUM_SELECT = {
  id: true, date: true, startMinute: true, pyramid: true, durationMinutes: true,
  actualMinutes: true, status: true, updatedAt: true, migrertFraTrainingPlanSessionId: true,
  isTemplate: true, hiddenByPlayer: true, needsPlayerApproval: true, approvalStatus: true,
} as const;
const synligeOkter = { status: { in: [...SPILLER_SYNLIGE_STATUSER] }, isTemplate: false,
  hiddenByPlayer: false, needsPlayerApproval: false,
  OR: [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }] };

/** Intern AgencyOS-leser. Begge formål kreves: AK-profil og navngitt skole-/TN-deling.
 * Miljøet må velges uttrykkelig; et gruppenavn eller første medlemskap er aldri grunnlag.
 * UI-valg av miljø er separat arbeid. Manglende gruppe skal stenge før profiloppslag. */
export async function lastSpiller360Iup(viewer: { id: string; role: string }, id: string, gruppeId?: string): Promise<S360Iup | null> {
  if (!gruppeId || gruppeId.trim() !== gruppeId || gruppeId.length > 120) return null;
  let trener;
  try { trener = await krevNavngittTrener(); }
  catch (error) {
    if (error instanceof Error && ["forbidden", "unauthenticated"].includes(error.message)) return null;
    throw error;
  }
  if (trener.id !== viewer.id) return null;
  return medAkProfiler(viewer, async (tx, scope) => {
    const tillatt = await tx.user.findFirst({ where: { AND: [scope, { id }] }, select: { id: true } });
    if (!tillatt || !(await harSpiller360IupTilgang(tx, trener, id, gruppeId))) return null;
    const gruppe = await tx.group.findUniqueOrThrow({ where: { id: gruppeId }, select: { name: true, program: true } });
    const naa = new Date();
    const idag = osloDagSomDbDato(naa);
    const mandag = new Date(idag.getTime() - ((idag.getUTCDay() + 6) % 7) * DAG);
    const spiller = await tx.user.findFirst({
      where: { AND: [scope, { id, role: "PLAYER" }] },
      select: {
        name: true, email: true, phone: true, hcp: true, dateOfBirth: true, homeClub: true, playingYears: true, ambition: true, primaryCoachId: true,
        childRelations: { where: { approved: true, parent: { role: "PARENT", deletedAt: null, anonymisertAt: null } }, select: { id: true, relationship: true, parent: { select: { name: true, phone: true, email: true } } } },
        goals: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 12,
          select: { id: true, category: true, title: true, targetDate: true, userId: true, type: true,
            targetValue: true, linkedPyramidArea: true, linkedTestId: true, payload: true } },
      },
    });
    if (!spiller) return null;

    const [wagr, sesong, fysTester, historikk, coach, uke, fireUker, tp, tester] = await Promise.all([
      tx.wagrSnapshot.findUnique({ where: { userId: id }, select: { rank: true } }),
      tx.seasonPlan.findFirst({ where: { userId: id }, orderBy: { year: "desc" },
        select: { periodBlocks: { orderBy: { startDate: "asc" }, select: {
          lPhase: true, startDate: true, endDate: true, focus: true, weeklyVolMin: true, weeklyVolMax: true } } } }),
      tx.testResult.findMany({ where: { userId: id, test: { pyramidArea: "FYS" } }, orderBy: { takenAt: "desc" }, take: 4,
        select: { id: true, testId: true, details: true, score: true, takenAt: true, test: { select: { name: true, protocol: true } } } }),
      hentTurneringshistorikk(id, tx),
      spiller.primaryCoachId ? tx.user.findUnique({ where: { id: spiller.primaryCoachId }, select: { name: true } }) : Promise.resolve(null),
      tx.workbenchSession.findMany({
        where: { playerId: id, date: { gte: mandag, lt: new Date(mandag.getTime() + 7 * DAG) }, ...synligeOkter },
        orderBy: [{ date: "asc" }, { startMinute: "asc" }],
        select: { date: true, title: true, pyramid: true, durationMinutes: true },
      }),
      tx.workbenchSession.findMany({
        where: { playerId: id, date: { gte: new Date(idag.getTime() - 28 * DAG), lt: new Date(idag.getTime() + DAG) }, ...synligeOkter },
        select: VOLUM_SELECT,
      }),
      lastSpiller360Teknisk(id, tx),
      tx.testResult.findMany({
        where: { userId: id },
        orderBy: { takenAt: "desc" },
        take: 12,
        select: { id: true, testId: true, details: true, score: true, takenAt: true, test: { select: { name: true, protocol: true } } },
      }),
    ]);

    const grupper = [gruppe.name];
    const fremdrift = await beregnGoalProgressListe(spiller.goals, { hcp: spiller.hcp, now: naa }, tx);
    const maal = spiller.goals.map((g, index) => {
      const p = fremdrift[index];
      return { id: g.id, kategori: g.category, tittel: g.title, frist: g.targetDate ? dato(g.targetDate) : null, pct: p.hasData ? p.pct : null };
    });
    const fireUkersVolum = summerTreningsvolum(fireUker, {
      fraDato: new Date(idag.getTime() - 28 * DAG), tilDato: new Date(idag.getTime() + DAG), naa,
    });
    const timer = fireUkersVolum.akser.flatMap((r) => r.faktiskMinutter === null ? [] : [{
      akse: r.akse, timer: Math.round(r.faktiskMinutter / 6) / 10,
    }]);

    return {
      ak: false,
      person: {
        navn: spiller.name ?? "Spiller",
        fodt: spiller.dateOfBirth ? dato(spiller.dateOfBirth) : null,
        klubb: spiller.homeClub, skole: gruppe.program === "WANG_UNG" || gruppe.program === "WANG_TOPPIDRETT" ? gruppe.name : null, hovedcoach: coach?.name ?? null,
        telefon: spiller.phone, epost: spiller.email,
        spilteAar: spiller.playingYears ? `${spiller.playingYears} år` : null,
        ambisjon: spiller.ambition, grupper,
      },
      foreldre: spiller.childRelations.map((c) => ({ id: c.id, navn: c.parent.name ?? "—", relasjon: ({ FATHER: "Far", MOTHER: "Mor", GUARDIAN: "Verge / annen foresatt" } as Record<string, string>)[c.relationship] ?? c.relationship, kontakt: c.parent.phone ?? c.parent.email ?? null })),
      ranking: [
        { navn: "WAGR", verdi: wagr ? `${wagr.rank}. plass` : null, kilde: wagr ? "WAGR · SISTE SNAPSHOT" : "WAGR · IKKE RANGERT" },
        { navn: "NGF juniorranking", verdi: null, kilde: "NGF · FINNES IKKE I APPEN ENNÅ" },
      ],
      resultatmaal: maal.filter((m) => m.kategori === "OUTCOME"),
      prosessmaal: maal.filter((m) => m.kategori !== "OUTCOME"),
      perioder: (sesong?.periodBlocks ?? []).map((p) => ({
        navn: p.focus ?? p.lPhase,
        uker: `Uke ${ukenummer(p.startDate)}–${ukenummer(p.endDate)}`,
        timer: p.weeklyVolMin != null || p.weeklyVolMax != null ? `${p.weeklyVolMin ?? "—"}–${p.weeklyVolMax ?? "—"} min/uke` : "—",
      })),
      turneringer: historikk.aar.flatMap(a => a.turneringer).filter(t => t.plassering != null || t.brutto != null).slice(0, 5).map((t) => ({
        navn: t.navn, dato: dato(t.startDato),
        resultat: [t.brutto != null ? String(t.brutto) : null, t.plassering != null ? `${t.plassering}. plass` : null].filter(Boolean).join(" · ") || "—",
      })),
      uke: uke.map((o) => ({ dag: dagLabel(o.date), tittel: o.title, meta: `${(akseFra(o.pyramid) ?? "—").toString().toUpperCase()} · ${o.durationMinutes} min` })),
      trening: fireUkersVolum.total.planlagteOkter
        ? {
            gjennomfort: fireUkersVolum.total.gjennomforteOkter, planlagt: fireUkersVolum.total.planlagteOkter,
            timer, volumMetadata: fireUkersVolum,
            kilde: `WORKBENCH · 4 UKER · FAKTISK REGISTRERT · ${fireUkersVolum.total.ukjentOkter} UKJENT · ${dato(naa)}`,
          }
        : null,
      tester: tester.map((t) => ({ navn: t.test.name, verdi: formaterLagretTestResultat({ ...t, protocol: t.test.protocol }), kilde: `TEST · ${dato(t.takenAt)}` })),
      teknikk: tp.aktiv?.oppgaver.map((o) => ({ p: o.pNummer, tittel: o.tittel, status: o.status })) ?? [],
      teknikkKilde: tp.aktiv ? `TEKNISK PLAN · ${tp.aktiv.coach ?? "—"} · ${tp.aktiv.sistRegistrert}`.toUpperCase() : null,
      fys: fysTester.map((t) => ({ navn: t.test.name, verdi: formaterLagretTestResultat({ ...t, protocol: t.test.protocol }), kilde: `FYS-TEST · ${dato(t.takenAt)}` })),
    };
  });
}
