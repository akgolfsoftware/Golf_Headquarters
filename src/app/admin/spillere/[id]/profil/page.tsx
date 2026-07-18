/**
 * AgencyOS — Full spiller-profil (/admin/spillere/[id]/profil), v2-design
 * (retning C).
 *
 * Auth + datagrunnlag gjenbrukt 1:1 fra den forrige (legacy) siden: samme
 * requirePortalUser-guard (COACH/ADMIN) og samme User-spørring med relasjoner
 * (foreldre, mål, permisjoner, coach-notat). Spiller-oppslaget er i tillegg
 * coach-scopet (coachScopedPlayerWhere) som hovedsiden /admin/spillere/[id] —
 * notFound() hvis spilleren ikke finnes eller er utenfor coachens stall.
 *
 * Server component.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminSpillerProfilSideV2,
  type AdminSpillerProfilSideV2Data,
  type DnaShape,
} from "@/components/admin/v2/AdminSpillerProfilSideV2";

export const dynamic = "force-dynamic";

const NB_LONG = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" });
const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric" });

function calcAge(dob: Date | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export default async function SpillerProfilSide({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

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

  const ageYears = calcAge(player.dateOfBirth);
  const coachNote = player.coachNotesAbout[0] ?? null;

  let dna: DnaShape | null = null;
  const cohort: DnaShape = { fysisk: 70, teknikk: 68, taktikk: 72, mental: 65, motivasjon: 70 };
  try {
    const prefs = player.preferences as { spillerDna?: DnaShape } | null;
    if (prefs?.spillerDna) dna = prefs.spillerDna;
  } catch {
    /* ignore */
  }
  if (!dna) {
    dna = { fysisk: 78, teknikk: 82, taktikk: 74, mental: 60, motivasjon: 65 };
  }

  const data: AdminSpillerProfilSideV2Data = {
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
    maal: player.goals.slice(0, 3).map((g) => ({
      id: g.id,
      typeLabel: g.type === "HCP_TARGET" ? "Resultat" : g.type === "SG_AREA" ? "Prosess" : "Atferd",
      tittel: g.title,
      fristLabel: g.targetDate ? NB_DATE.format(g.targetDate) : null,
    })),
    permisjoner: player.leaves.map((l) => ({
      id: l.id,
      aarsak: l.reason,
      fraLabel: NB_DATE.format(l.startAt),
      tilLabel: l.endAt ? NB_DATE.format(l.endAt) : "pågår",
      beskrivelse: l.description ?? "—",
      statusLabel: l.returnedAt ? "Avsluttet" : l.endAt ? "Planlagt slutt" : "Pågående",
    })),
    coachVurdering: coachNote
      ? { tekst: coachNote.content, coachNavn: coachNote.coach.name, datoLabel: NB_DATE.format(coachNote.updatedAt) }
      : null,
  };

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminSpillerProfilSideV2 data={data} />
    </V2Shell>
  );
}
