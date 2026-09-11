/**
 * AgencyOS — Spiller 360 (`/admin/spillere/[id]`), konsolidert (T4, 26.08.2026;
 * Oversikt-bento D3, 03.09.2026).
 *
 * Fasit: `S3-03 Spiller profil bento.dc.html` (Oversikt-fanen, landingen) +
 * `AG-08 Spiller-ark.dc.html` + `S3-01 Agency Spiller 360 Mac.dc.html`
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
 * Ø13 (03.09.2026): `?vis=360` bytter innholdet til `SpillerArbeidsvisningV2`
 * — fasitens faktiske S3-01/S3-02/AG-08 master-detalj-arbeidsvindu (smal
 * spillerliste + ett 360-panel), ved siden av Oversikt-bentoen (default,
 * S3-03) heller enn å erstatte den — samme fane-mønster som Plan/Analyse/
 * Tester under.
 *
 * D3 (03.09.2026): `SpillerOversiktV2` (S3-03-bentoen) er nå lagt til øverst
 * som ny landing — identitet, nøkkeltall, ukeaktivitet, teknisk plan,
 * sesong og «I dag», alt fra ekte spørringer (se
 * `src/lib/admin-spiller/spiller-oversikt-data.ts`). De tre eldre
 * komponentene under (`SpillerProfilFull`, `AdminSpillerProfilSideV2`,
 * `AdminSpillerFremgangV2`) er UENDRET — de var allerede portet til TL i en
 * tidligere Paper-fjerningsøkt (30.08), men er ikke lagt om til bento-
 * formatet. Fanenavigasjonen (Plan/Analyse/Tester) lenker til eksisterende
 * ruter; «Turneringer» og «Notater» har ingen egen per-spiller-liste-rute i
 * dag og er derfor ikke lenket (turneringene vises i Oversikt-bentoen).
 *
 * Ikke live-testet med ekte data i denne økten — ingen spillere i stallen
 * for coachtest (basen nullstilt 30.08.2026). tsc/eslint grønt, kode
 * gjennomgått mot skjemaet felt for felt.
 *
 * Server component.
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { hentSamtykkeStatus } from "@/lib/health/samtykke";
import { innsynsNivaaFra, maskerLeave } from "@/lib/health/leave-innsyn";
import { beregnGoalProgress } from "@/lib/portal/goals/progress";
import { TL } from "@/lib/v2/train-lock";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { SpillerOversiktV2 } from "@/components/admin/v2/SpillerOversiktV2";
import { lastSpillerOversikt } from "@/lib/admin-spiller/spiller-oversikt-data";
import { SpillerArbeidsvisningV2 } from "@/components/admin/v2/SpillerArbeidsvisningV2";
import { lastSpillerArbeidsvisning } from "@/lib/admin-spiller/spiller-arbeidsvisning-data";
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

export default async function SpillerProfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ vis?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;
  const { vis } = await searchParams;
  const visArbeidsvisning = vis === "360";

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

  const [oversikt, arbeidsvisning] = await Promise.all([
    lastSpillerOversikt(id),
    visArbeidsvisning ? lastSpillerArbeidsvisning(user, id) : Promise.resolve(null),
  ]);

  const ageYears = calcAge(player.dateOfBirth);
  const coachNote = player.coachNotesAbout[0] ?? null;
  const innsyn = innsynsNivaaFra(await hentSamtykkeStatus(player.id));

  let dna: DnaShape | null = null;
  let cohort: DnaShape | null = null;
  try {
    const prefs = player.preferences as { spillerDna?: DnaShape; cohortDna?: DnaShape } | null;
    if (prefs?.spillerDna) dna = prefs.spillerDna;
    if (prefs?.cohortDna) cohort = prefs.cohortDna;
  } catch {
    /* ignore */
  }

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

  // S3-03: fanenavigasjon til de andre spiller-flatene. «Turneringer» og
  // «Notater» har ingen egen per-spiller-liste-rute i dag (kun en
  // koblingsside for turneringsidentitet) — ikke lenket, fremfor å peke på
  // noe som ikke finnes. Turneringene vises uansett i «Neste turneringer»-
  // kortet i Oversikt.
  const faner: { navn: string; href: string }[] = [
    { navn: "Plan", href: `/admin/workbench/${id}` },
    { navn: "Analyse", href: `/admin/spillere/${id}/analyse` },
    { navn: "Tester", href: `/admin/spillere/${id}/tester` },
  ];

  return (
    <V2Shell bredde="full" aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href={`/admin/spillere/${id}`}
            className="v2-press v2-focus"
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: TL.radius.pill,
              background: visArbeidsvisning ? "transparent" : TL.dock,
              color: visArbeidsvisning ? TL.mute : TL.text,
              display: "flex",
              alignItems: "center",
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Oversikt
          </Link>
          <Link
            href={`/admin/spillere/${id}?vis=360`}
            className="v2-press v2-focus"
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: TL.radius.pill,
              background: visArbeidsvisning ? TL.dock : "transparent",
              color: visArbeidsvisning ? TL.text : TL.mute,
              display: "flex",
              alignItems: "center",
              fontFamily: TL.font.sans,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Arbeidsvisning
          </Link>
          {faner.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="v2-press v2-focus"
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: TL.radius.pill,
                color: TL.mute,
                display: "flex",
                alignItems: "center",
                fontFamily: TL.font.sans,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {f.navn}
            </Link>
          ))}
        </div>

        {visArbeidsvisning && arbeidsvisning ? (
          <SpillerArbeidsvisningV2 data={arbeidsvisning} workbenchHref={`/admin/workbench/${id}`} basePath="/admin/spillere" />
        ) : (
          <>
            <SpillerOversiktV2 data={oversikt} workbenchHref={`/admin/workbench/${id}`} />
            <AdminSpillerProfilSideV2 data={profilData} />
          </>
        )}
      </div>
    </V2Shell>
  );
}
