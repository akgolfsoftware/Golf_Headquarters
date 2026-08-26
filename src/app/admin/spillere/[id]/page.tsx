/**
 * AgencyOS — Spiller 360 (`/admin/spillere/[id]`), konsolidert (T4, 26.08.2026).
 *
 * Fasit: `AG-08 Spiller-ark.dc.html` + `S3-01 Agency Spiller 360 Mac.dc.html`
 * (+ S3-01L lys, S3-02 iPad). Denne siden er ÉN spillerprofil — tre tidligere
 * ruter er slått sammen hit, med redirects fra de gamle adressene:
 *   - `/admin/(legacy)/spillere/[id]/profil` → hit (PII: personalia, forelder-
 *     kontakt, art. 9-skade/permisjonsdata, spiller-DNA, mål, coach-vurdering)
 *   - `/admin/spillere/[id]/fremgang` → hit (SG-fremgang, treningsvolum,
 *     korrelasjon)
 * Ingen av dataene dupliseres — hver hentes ÉN gang her, samme loader og
 * samme tilgangsport (`coachScopedPlayerWhere`, samtykke-gated skadedata via
 * `innsynsNivaaFra`) som de gamle sidene brukte. PII eksponeres altså ikke
 * bredere enn før konsolideringen — kun samlet på én URL.
 *
 * `/admin/spillere/[id]/analyse` er IKKE flettet inn her — den forblir egen
 * rute (egen fasit S3-01-mønsteret + Analyse Gapping + DG-01, se dens page.tsx).
 *
 * AVVIK FRA TRAIN-LOCK (dokumentert, se docs/natt/T4-DONE.md §Spiller 360):
 * Denne sesjonen porter Stall (`TrainLockStall`) fullt til TL-tokens, men
 * IKKE selve visningslaget for Spiller 360 — de tre eksisterende komponentene
 * (`SpillerProfilFull`, `AdminSpillerProfilSideV2`, `AdminSpillerFremgangV2`)
 * bruker Paper-tokens (`--p-*`/`T.*`) og beholdes UENDRET i denne omgang.
 * Grunn: å bygge AG-08/S3-01 pixel-riktig for alle tre (DNA-radar, mål-kort,
 * skade/permisjon-tabell, SG-fremgangsgrafer, korrelasjon) er et eget,
 * betydelig arbeid som ikke fikk plass i denne økten uten å love noe som ikke
 * ble levert. Å blande TL og Paper i den SAMME komponenten er forbudt
 * (CLAUDE.md invariant 2) — derfor er hele denne sidens INNHOLD fortsatt
 * konsekvent Paper, slik det var før konsolideringen (kun URL-en/dataflyten
 * er ny). Skjermens ytre skall (V2Shell/rail) er allerede Train-lock via T2 —
 * det er uendret av dette valget. Neste session bør porte disse tre
 * komponentene til TL og fjerne denne merknaden.
 *
 * Server component.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { hentSamtykkeStatus } from "@/lib/health/samtykke";
import { innsynsNivaaFra, maskerLeave } from "@/lib/health/leave-innsyn";
import { beregnGoalProgress } from "@/lib/portal/goals/progress";
import { hentTreningsVolum } from "@/lib/training/volum";
import { beregnKorrelasjon } from "@/lib/training/korrelasjon";
import type { SgCategory } from "@/generated/prisma/client";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { SpillerProfilFull } from "@/components/admin/v2/SpillerProfilPanel";
import { loadSpillerProfilPanel } from "@/lib/admin-spiller/spiller-profil-panel-data";
import {
  AdminSpillerProfilSideV2,
  type AdminSpillerProfilSideV2Data,
  type DnaShape,
} from "@/components/admin/v2/AdminSpillerProfilSideV2";
import {
  AdminSpillerFremgangV2,
  type FremgangV2Data,
  type FremgangV2Omrade,
} from "@/components/admin/v2/AdminSpillerFremgangV2";

export const dynamic = "force-dynamic";

const NB_LONG = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" });
const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric" });

const OMRADE_NAVN: Record<SgCategory, string> = {
  OTT: "Tee-slag",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

function calcAge(dob: Date | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

/** ISO-ukenummer (identisk med den gamle fremgang-siden). */
function isoUkeNummer(dato: Date): string {
  const d = new Date(Date.UTC(dato.getFullYear(), dato.getMonth(), dato.getDate()));
  const dag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dag);
  const year = d.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const uke = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(uke).padStart(2, "0")}`;
}
const kortUke = (uke: string): string => uke.replace(/^\d{4}-/, "");

export default async function SpillerProfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  // Én coach-scopet spiller-oppslag med alt profil+fremgang-siden trenger av
  // felt — erstatter de to separate `prisma.user.findFirst`-kallene de gamle
  // sidene gjorde (profil + fremgang), pluss loadSpillerProfilPanel sin egen.
  const player = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(user), { id }] },
    include: {
      childRelations: {
        include: {
          parent: { select: { id: true, name: true, phone: true, email: true, avatarUrl: true } },
        },
      },
      goals: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 6 },
      leaves: { orderBy: { startAt: "desc" }, take: 10 },
      coachNotesAbout: { orderBy: { updatedAt: "desc" }, take: 1, include: { coach: { select: { name: true } } } },
    },
  });
  if (!player || player.role !== "PLAYER") notFound();

  const profilPanelData = await loadSpillerProfilPanel({ id: user.id, role: user.role }, id);

  const ageYears = calcAge(player.dateOfBirth);
  const coachNote = player.coachNotesAbout[0] ?? null;
  const innsyn = innsynsNivaaFra(await hentSamtykkeStatus(player.id));

  let dna: DnaShape | null = null;
  const cohort: DnaShape = { fysisk: 70, teknikk: 68, taktikk: 72, mental: 65, motivasjon: 70 };
  try {
    const prefs = player.preferences as { spillerDna?: DnaShape } | null;
    if (prefs?.spillerDna) dna = prefs.spillerDna;
  } catch {
    /* ignore */
  }
  if (!dna) dna = { fysisk: 78, teknikk: 82, taktikk: 74, mental: 60, motivasjon: 65 };

  const profilData: AdminSpillerProfilSideV2Data = {
    spillerId: player.id,
    navn: player.name,
    epost: player.email,
    fodselsdatoLabel: player.dateOfBirth
      ? `${NB_LONG.format(player.dateOfBirth)}${ageYears != null ? ` · ${ageYears} år` : ""}`
      : null,
    telefon: player.phone ?? "—",
    hjemmeklubb: player.homeClub ?? "—",
    skole: player.school ?? "—",
    spilteAar: player.playingYears ? `${player.playingYears} år` : "—",
    ambisjon: player.ambition ?? "—",
    foreldre: player.childRelations.map((cr) => ({
      id: cr.id,
      navn: cr.parent.name,
      avatarUrl: cr.parent.avatarUrl,
      relasjon: cr.relationship,
      kontakt: cr.parent.phone ?? cr.parent.email,
    })),
    dna,
    cohort,
    maal: await Promise.all(
      player.goals.slice(0, 3).map(async (g) => {
        const progress = await beregnGoalProgress(g, { hcp: player.hcp });
        return {
          id: g.id,
          typeLabel: g.category === "OUTCOME" ? "Resultat" : "Prosess",
          tittel: g.title,
          fristLabel: g.targetDate ? NB_DATE.format(g.targetDate) : null,
          pct: progress.hasData ? progress.pct : null,
        };
      }),
    ),
    permisjoner: player.leaves.map((rad) => {
      const l = maskerLeave(rad, innsyn);
      return {
        id: rad.id,
        aarsak: l.reason,
        fraLabel: NB_DATE.format(l.startAt),
        tilLabel: l.endAt ? NB_DATE.format(l.endAt) : "pågår",
        beskrivelse: l.description ?? (l.skjult ? "Ikke delt av spilleren" : "—"),
        statusLabel: l.returnedAt ? "Avsluttet" : l.endAt ? "Planlagt slutt" : "Pågående",
      };
    }),
    coachVurdering: coachNote
      ? { tekst: coachNote.content, coachNavn: coachNote.coach.name, datoLabel: NB_DATE.format(coachNote.updatedAt) }
      : null,
  };

  // Fremgang — identisk aggregering med den gamle /fremgang-siden.
  const UKER = 8;
  const grense = new Date();
  grense.setDate(grense.getDate() - UKER * 7);
  const [runder, treningsVolum, korrelasjon] = await Promise.all([
    prisma.round.findMany({
      where: { userId: id, playedAt: { gte: grense }, sgTotal: { not: null } },
      select: { playedAt: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
      orderBy: { playedAt: "asc" },
    }),
    hentTreningsVolum(id, UKER),
    beregnKorrelasjon(id, 16),
  ]);

  const omraaderKoder: SgCategory[] = ["OTT", "APP", "ARG", "PUTT"];
  const ukeMap = new Map<string, Map<SgCategory, { sum: number; count: number }>>();
  for (const r of runder) {
    const uke = isoUkeNummer(r.playedAt);
    if (!ukeMap.has(uke)) ukeMap.set(uke, new Map());
    const entry = ukeMap.get(uke)!;
    const sgVerdier: Record<SgCategory, number | null> = {
      OTT: r.sgOtt,
      APP: r.sgApp,
      ARG: r.sgArg,
      PUTT: r.sgPutt,
    };
    for (const a of omraaderKoder) {
      const sg = sgVerdier[a];
      if (sg == null) continue;
      const prev = entry.get(a) ?? { sum: 0, count: 0 };
      entry.set(a, { sum: prev.sum + sg, count: prev.count + 1 });
    }
  }
  const sorterteUker = Array.from(ukeMap.keys()).sort();
  const sgSerier: Record<SgCategory, { uke: string; snittSg: number }[]> = { OTT: [], APP: [], ARG: [], PUTT: [] };
  for (const uke of sorterteUker) {
    const entry = ukeMap.get(uke)!;
    for (const a of omraaderKoder) {
      const agg = entry.get(a);
      if (agg && agg.count > 0) sgSerier[a].push({ uke, snittSg: agg.sum / agg.count });
    }
  }
  const omrader: FremgangV2Omrade[] = omraaderKoder
    .map((a): FremgangV2Omrade | null => {
      const serie = sgSerier[a];
      if (serie.length === 0) return null;
      const vals = serie.map((s) => s.snittSg);
      return {
        kode: a,
        label: OMRADE_NAVN[a],
        serie: vals,
        ukeLabels: serie.map((s) => kortUke(s.uke)),
        siste: vals[vals.length - 1],
        trend: vals.length > 1 ? vals[vals.length - 1] - vals[vals.length - 2] : null,
      };
    })
    .filter((x): x is FremgangV2Omrade => x !== null);

  const ukerVolum = [...new Set(treningsVolum.map((t) => t.uke))].sort();
  const volumUker = ukerVolum.map((uke) => ({
    uke: kortUke(uke),
    total: treningsVolum.filter((t) => t.uke === uke).reduce((s, t) => s + t.minutter, 0),
  }));
  const volumOmrader = omraaderKoder
    .map((a) => ({
      kode: a,
      label: OMRADE_NAVN[a],
      minutter: treningsVolum.filter((t) => t.sgArea === a).reduce((s, t) => s + t.minutter, 0),
    }))
    .filter((v) => v.minutter > 0);
  const volumTotal = volumOmrader.reduce((s, v) => s + v.minutter, 0);
  const korr = korrelasjon.map((k) => ({
    kode: k.sgArea,
    label: OMRADE_NAVN[k.sgArea],
    r: k.r,
    datapunkter: k.datapunkter,
    tolkning: k.tolkning,
  }));

  const fremgangData: FremgangV2Data = {
    navn: player.name,
    spillerId: player.id,
    uker: UKER,
    harRunder: runder.length > 0,
    omrader,
    volumUker,
    volumOmrader,
    volumTotal,
    korrelasjon: korr,
  };

  return (
    <V2Shell bredde="full" aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {profilPanelData && <SpillerProfilFull data={profilPanelData} />}
        <AdminSpillerProfilSideV2 data={profilData} />
        <AdminSpillerFremgangV2 data={fremgangData} />
      </div>
    </V2Shell>
  );
}
