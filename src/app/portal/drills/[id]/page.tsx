/**
 * PH26Drill — drill-detalj i PlayerHQSkall.
 * Auth (PLAYER + PARENT) og loadDrillDetalj er uendret.
 * Meta, trinn og parametere utledes bare fra faktiske felter.
 * Media uten filer gir «Media kommer». Mangler drillen, vises en ærlig vei tilbake.
 */

import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadDrillDetalj } from "@/lib/portal-drilldetalj/drill-detalj-data";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TomTilstand } from "@/components/precision/pa";
import {
  DrillDetaljV2,
  type DrillDetaljV2Data,
} from "@/components/portal/v2/DrillDetaljV2";

// Modulnivå-helper: Date.now() kan ikke kalles i render-body (react-hooks/purity).
function tredveDagerSiden(): Date {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

export default async function DrillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const { id } = await params;

  const [data, ulest] = await Promise.all([
    loadDrillDetalj(id, { id: user.id, hcp: user.hcp }),
    getUnreadNotifications(user.id, 1),
  ]);

  if (!data) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
        <div className="pa-side">
          <Link href="/portal/drills" className="ph-tilbake">Øvelsesbank</Link>
          <div className="ph-flate">
            <TomTilstand
              icon={Dumbbell}
              title="Fant ikke drillen"
              text="Drillen finnes ikke eller er ikke tilgjengelig for deg — den kan være fjernet fra banken."
            />
            <Link href="/portal/drills" className="pa-btn pa-btn--primary pa-btn--full">
              Til øvelsesbanken
            </Link>
          </div>
        </div>
      </PlayerHQSkall>
    );
  }

  // Sub-linjen komponeres av eyebrow-detaljen + meta-chips (kun reelle felter).
  // AK-formel-slots utledes av faktiske felter: Pyramide (akse), Område
  // (skill/treningsområde), Motorikk (læringsfase) og Belastning (miljø).
  // Slots uten data utelates — aldri fabrikert.
  // «din bruk» — samme datakilde som øvelsesbankens «brukt i N økter siste
  // 30 dager» (TrainingDrillV2.exerciseId → egne TrainingSessionV2-økter).
  // «Beste resultat» finnes ikke i datamodellen og utelates.
  const brukRader = await prisma.trainingDrillV2.findMany({
    where: { exerciseId: id, session: { studentId: user.id } },
    select: { sessionId: true, session: { select: { title: true, startTime: true } } },
    orderBy: { session: { startTime: "desc" } },
  });
  const grense = tredveDagerSiden();
  const okterSiste30 = new Set(
    brukRader.filter((b) => b.session.startTime >= grense).map((b) => b.sessionId),
  ).size;
  const sist = brukRader[0] ?? null;
  const bruk: { k: string; v: string }[] = [
    {
      k: "Sist brukt",
      v: sist
        ? `${sist.session.startTime.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" })} · økta ${sist.session.title}`
        : "ikke brukt ennå",
    },
    { k: "Siste 30 dager", v: `${okterSiste30} ${okterSiste30 === 1 ? "økt" : "økter"}` },
  ];

  const eyebrowDetalj = data.eyebrow.includes(" · ")
    ? data.eyebrow.split(" · ").slice(1).join(" · ")
    : null;
  const sub = [eyebrowDetalj ?? data.eyebrow, ...data.meta.map((m) => m.text)].join(" · ");
  const laeringsfase = data.params.find((p) => p.key === "Læringsfase")?.value ?? null;
  const miljo = data.params.find((p) => p.key === "Miljø")?.value ?? null;
  const slots: { k: string; v: string }[] = [
    { k: "Pyramide", v: data.axisLabel },
    ...(eyebrowDetalj ? [{ k: "Område", v: eyebrowDetalj }] : []),
    ...(laeringsfase ? [{ k: "Motorikk", v: laeringsfase }] : []),
    ...(miljo ? [{ k: "Belastning", v: miljo }] : []),
  ];
  const v2Data: DrillDetaljV2Data = {
    akse: data.axis.toUpperCase(),
    sub,
    navn: data.name,
    beskrivelse: data.description,
    slots,
    trinn: data.steps,
    coachNotat: data.coachNotes,
    coachNavn: "Anders Kristiansen",
    media: data.media.map((m) => ({
      kind: m.kind,
      label: m.label,
      url: m.url,
    })),
    params: data.params,
    bruk,
    hrefLeggTilIPlan: "/portal/planlegge/workbench",
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/drills" className="ph-tilbake">Øvelsesbank</Link>
        <DrillDetaljV2 data={v2Data} />
      </div>
    </PlayerHQSkall>
  );
}
