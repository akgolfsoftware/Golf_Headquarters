/**
 * Data-loader for den KONSOLIDERTE tilbakemeldingsflaten
 * /portal/coach/tilbakemelding/[oktId] (Paper-port W3, fase2 —
 * fasit: playerhq-coach-tilbakemelding.html).
 *
 * Én flate erstatter notat/video/oppsummering-spredningen (manifest-w3
 * §Konsolidering) — video er en MODUL her, ikke egen rute.
 *
 * Datakilder (alle reelle, ingen fabrikkerte felter — D10):
 * - Coachens ord (prosa): TrainingSessionV2.notes — men KUN når
 *   completedSummary.coachRatedAt finnes (lagreCoachVurdering-flyten).
 *   notes alene beviser ingenting: session-generatoren skriver også dit
 *   (anker-/mønster-beskrivelser), og det er ikke coachens tilbakemelding.
 * - «Tre ting å ta med»: completedSummary.coachTakeaways (string[]) — den
 *   deterministiske delen. Ingen coach-flate skriver nøkkelen ennå, så
 *   listen er tom i praksis og kortet utelates ærlig i UI.
 * - Videoklipp: PlayerSwingVideo (liveSessionId = økta) + SessionDrillNote
 *   type VIDEO via øktas drill-instanser. Finnes ingen: ærlig plassholder.
 * - Spillerens svar: completedSummary.dineOrd (skrives av lagreDineOrd —
 *   samme persistens som ETTER-skjermen, coachen leser det i stallen).
 * - Kvittering («Forstått»): completedSummary.tilbakemeldingKvittert.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { MILJO_LABEL } from "@/lib/portal-okt/okt-detalj-data";

export type TilbakemeldingKlipp = {
  id: string;
  url: string;
  /** «Ditt klipp fra økta» eller drill-navnet klippet hører til. */
  label: string;
  /** «16. mai 21:14» (Oslo). */
  meta: string;
};

export type CoachTilbakemeldingData =
  | { found: false }
  | {
      found: true;
      oktId: string;
      /** «Teknisk økt · 16. mai · Bogstad» — sub i toppen. */
      sub: string;
      tilstand: "skrevet" | "venter";
      coach: { navn: string; fornavn: string; initialer: string } | null;
      /** «Skrevet 16. mai 21:14 · 75 min økt» / «75 min økt». */
      kildeMeta: string;
      /** Coachens ord — avsnitt (Lora i UI). Tom i venter-tilstand. */
      prosa: string[];
      /** Kun reelle punkter — tom liste betyr at kortet utelates. */
      punkter: string[];
      klipp: TilbakemeldingKlipp[];
      /** Spillerens eksisterende svar (dineOrd) — null uten. */
      dittSvar: { tekst: string; sendt: string } | null;
      kvittert: boolean;
      /** Kun spilleren selv svarer/kvitterer. */
      kanSvare: boolean;
    };

/** «16. mai» (Oslo). */
function fmtDato(d: Date): string {
  return d
    .toLocaleDateString("nb-NO", { day: "numeric", month: "long", timeZone: "Europe/Oslo" })
    .replace(/\.$/, "");
}

/** «21:14» (Oslo). */
function fmtKl(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo",
  });
}

function initialer(navn: string): string {
  return navn
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function somObjekt(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

/** ISO-streng → Date, ellers null (defensiv JSON-lesing). */
function lesDato(v: unknown): Date | null {
  return typeof v === "string" && !Number.isNaN(Date.parse(v)) ? new Date(v) : null;
}

export async function getCoachTilbakemeldingData(
  user: { id: string; role: string },
  oktId: string | null,
): Promise<CoachTilbakemeldingData> {
  if (!oktId) return { found: false };

  const okt = await prisma.trainingSessionV2
    .findUnique({
      where: { id: oktId },
      select: {
        id: true, title: true, startTime: true, endTime: true, location: true,
        miljo: true, notes: true, completedSummary: true, coachId: true,
        studentId: true, hostId: true,
        participants: { select: { userId: true } },
      },
    })
    .catch(() => null);

  if (!okt) return { found: false };

  // Tilgang — samme modell som okt-detalj: spilleren selv, coach, host,
  // deltaker, eller COACH/ADMIN-rolle.
  const erDeltaker = okt.participants.some((p) => p.userId === user.id);
  const harTilgang =
    okt.studentId === user.id ||
    okt.coachId === user.id ||
    okt.hostId === user.id ||
    erDeltaker ||
    user.role === "ADMIN" ||
    user.role === "COACH";
  if (!harTilgang) return { found: false };

  const summary = somObjekt(okt.completedSummary);
  const coachRatedAt = lesDato(summary.coachRatedAt);
  const coachRatedById =
    typeof summary.coachRatedById === "string" ? summary.coachRatedById : null;

  // «Skrevet» krever begge deler: coach-vurderingsflyten er kjørt OG det
  // finnes faktisk tekst. Rating uten notat = ordene mangler fortsatt.
  const notat = okt.notes?.trim() ?? "";
  const skrevet = coachRatedAt != null && notat.length > 0;

  // Coach-identitet: den som faktisk skrev vurderingen, ellers øktas coach.
  const coachUserId = coachRatedById ?? okt.coachId;
  let coach: { navn: string; fornavn: string; initialer: string } | null = null;
  if (coachUserId) {
    const rad = await prisma.user
      .findUnique({ where: { id: coachUserId }, select: { name: true } })
      .catch(() => null);
    if (rad?.name) {
      coach = {
        navn: rad.name,
        fornavn: rad.name.split(" ")[0] ?? rad.name,
        initialer: initialer(rad.name),
      };
    }
  }

  const varighetMin = Math.max(
    0,
    Math.round((okt.endTime.getTime() - okt.startTime.getTime()) / 60_000),
  );
  const sted = okt.location?.trim() || (MILJO_LABEL[okt.miljo] ?? "Studio");

  // «Tre ting å ta med» — kun reelle punkter fra completedSummary.
  const punkter = Array.isArray(summary.coachTakeaways)
    ? summary.coachTakeaways
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .map((p) => p.trim())
    : [];

  // Videoklipp — reelle klipp fra DENNE økta, aldri oppdiktet innhold.
  const [swingVideoer, drillVideoer] = await Promise.all([
    okt.studentId
      ? prisma.playerSwingVideo
          .findMany({
            where: {
              userId: okt.studentId,
              liveSessionId: okt.id,
              liveSessionKind: "session-v2",
              status: "READY",
            },
            select: { id: true, videoUrl: true, createdAt: true },
            orderBy: { createdAt: "asc" },
          })
          .catch(() => [])
      : Promise.resolve([]),
    prisma.sessionDrillNote
      .findMany({
        where: {
          type: "VIDEO",
          videoUrl: { not: null },
          drillInstance: { sessionId: okt.id },
        },
        select: {
          id: true, videoUrl: true, createdAt: true,
          drillInstance: { select: { drillName: true } },
        },
        orderBy: { createdAt: "asc" },
      })
      .catch(() => []),
  ]);

  const klipp: TilbakemeldingKlipp[] = [
    ...swingVideoer.map((v) => ({
      id: v.id,
      url: v.videoUrl,
      label: "Ditt klipp fra økta",
      meta: `${fmtDato(v.createdAt)} ${fmtKl(v.createdAt)}`,
    })),
    ...drillVideoer.flatMap((n) =>
      n.videoUrl
        ? [{
            id: n.id,
            url: n.videoUrl,
            label: n.drillInstance.drillName,
            meta: `${fmtDato(n.createdAt)} ${fmtKl(n.createdAt)}`,
          }]
        : [],
    ),
  ];

  // Spillerens svar (dineOrd) + kvittering — defensiv lesing.
  const dineOrd = somObjekt(summary.dineOrd);
  const dineOrdTekst = typeof dineOrd.tekst === "string" ? dineOrd.tekst.trim() : "";
  const dineOrdNaar = lesDato(dineOrd.loggedAt);
  const dittSvar =
    dineOrdTekst.length > 0
      ? {
          tekst: dineOrdTekst,
          sendt: dineOrdNaar ? `Sendt ${fmtDato(dineOrdNaar)} ${fmtKl(dineOrdNaar)}` : "Sendt",
        }
      : null;

  const kvittert = Object.keys(somObjekt(summary.tilbakemeldingKvittert)).length > 0;

  const kildeMeta = skrevet && coachRatedAt
    ? `Skrevet ${fmtDato(coachRatedAt)} ${fmtKl(coachRatedAt)} · ${varighetMin} min økt`
    : `${varighetMin} min økt`;

  return {
    found: true,
    oktId: okt.id,
    sub: `${okt.title} · ${fmtDato(okt.startTime)} · ${sted}`,
    tilstand: skrevet ? "skrevet" : "venter",
    coach,
    kildeMeta,
    prosa: skrevet
      ? notat.split(/\n{2,}|\r\n\r\n/).map((a) => a.trim()).filter(Boolean)
      : [],
    punkter: skrevet ? punkter : [],
    klipp,
    dittSvar,
    kvittert,
    kanSvare: okt.studentId === user.id,
  };
}

// ── Tilbakemeldinger — liste (ME-04 Coach-hub-raden «Tilbakemeldinger») ─────

export type TilbakemeldingListeItem = {
  oktId: string;
  tittel: string;
  dato: string;
  snippet: string;
};

/**
 * Alle økter for spilleren med en faktisk skrevet coach-tilbakemelding —
 * samme «skrevet»-betingelse som detaljsiden (coachRatedAt finnes +
 * notat ikke tomt). Ingen sesong-avgrensning finnes som ekte datafelt her,
 * så tallet er alt-tid, aldri en oppdiktet sesongstart.
 */
export async function getTilbakemeldingerListe(studentId: string): Promise<TilbakemeldingListeItem[]> {
  const okter = await prisma.trainingSessionV2.findMany({
    where: { studentId, status: "COMPLETED", notes: { not: null } },
    select: { id: true, title: true, startTime: true, notes: true, completedSummary: true },
    orderBy: { startTime: "desc" },
    take: 100,
  });

  const resultat: TilbakemeldingListeItem[] = [];
  for (const okt of okter) {
    const summary = somObjekt(okt.completedSummary);
    const coachRatedAt = lesDato(summary.coachRatedAt);
    const notat = (okt.notes ?? "").trim();
    if (coachRatedAt == null || notat.length === 0) continue;
    resultat.push({
      oktId: okt.id,
      tittel: okt.title,
      dato: fmtDato(okt.startTime),
      snippet: notat.length > 90 ? `${notat.slice(0, 90)}…` : notat,
    });
  }
  return resultat;
}
