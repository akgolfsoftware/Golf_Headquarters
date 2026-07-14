/**
 * AgencyOS — Full spiller-profil (`/admin/spillere/[id]/profil`), v2.
 * Port av `(legacy)/spillere/[id]/profil/page.tsx` + `invite-parent-button.tsx`
 * (2026-07-14, AgencyOS Bølge 3.28) — samme Prisma-datamodell, samme
 * `inviterForelderForSpiller`-server-action-kontrakt (bor i `(legacy)/spillere/
 * [id]/profil/actions.ts`, delt, uendret).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminSpillerFullProfilV2,
  type SpillerProfilFaktaV2,
  type ForelderRadV2,
  type AktivtMaalV2,
  type SkadeRadV2,
} from "@/components/admin/v2/AdminSpillerFullProfilV2";

export const dynamic = "force-dynamic";

const NB_LONG = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" });
const NB_DATE = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric" });

type DnaShape = { fysisk: number; teknikk: number; taktikk: number; mental: number; motivasjon: number };

function calcAge(dob: Date | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export default async function SpillerProfilSide({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const player = await prisma.user.findUnique({
    where: { id },
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

  // Spiller-DNA fra preferences-JSON (sample dersom mangler) — se MERK i
  // AdminSpillerFullProfilV2.tsx: dna/cohort er hardkodede plassholdertall,
  // bevart uendret fra legacy (design-port, ikke en data-fiks).
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

  const fakta: SpillerProfilFaktaV2 = {
    fulltNavn: player.name,
    epost: player.email,
    fodselsdatoTekst: player.dateOfBirth
      ? `${NB_LONG.format(player.dateOfBirth)}${ageYears != null ? ` · ${ageYears} år` : ""}`
      : "—",
    telefon: player.phone ?? "—",
    hjemmeklubb: player.homeClub ?? "—",
    skole: player.school ?? "—",
    spilteAar: player.playingYears ? `${player.playingYears} år` : "—",
    ambisjon: player.ambition ?? "—",
  };

  const foreldre: ForelderRadV2[] = player.childRelations.map((cr) => ({
    id: cr.id,
    navn: cr.parent.name,
    avatarUrl: cr.parent.avatarUrl,
    relasjon: cr.relationship,
    kontakt: cr.parent.phone ?? cr.parent.email,
  }));

  const aktiveMaal: AktivtMaalV2[] = player.goals.slice(0, 3).map((g) => ({
    id: g.id,
    typeLabel: g.type === "HCP_TARGET" ? "Resultat" : g.type === "SG_AREA" ? "Prosess" : "Atferd",
    tittel: g.title,
    fristTekst: g.targetDate ? NB_DATE.format(g.targetDate) : null,
  }));

  const skader: SkadeRadV2[] = player.leaves.map((l) => ({
    id: l.id,
    aarsak: l.reason,
    fraTekst: NB_DATE.format(l.startAt),
    tilTekst: l.endAt ? NB_DATE.format(l.endAt) : "pågår",
    beskrivelse: l.description ?? "—",
    statusLabel: l.returnedAt ? "Avsluttet" : l.endAt ? "Planlagt slutt" : "Pågående",
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminSpillerFullProfilV2
        playerId={player.id}
        playerName={player.name}
        fakta={fakta}
        foreldre={foreldre}
        dna={dna}
        cohort={cohort}
        aktiveMaal={aktiveMaal}
        skader={skader}
        coachVurdering={coachNote ? { tekst: coachNote.content, forfatterTekst: `${coachNote.coach.name} · oppdatert ${NB_DATE.format(coachNote.updatedAt)}` } : null}
      />
    </V2Shell>
  );
}
