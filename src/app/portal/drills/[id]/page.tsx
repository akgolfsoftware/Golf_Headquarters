// PH13DrillDetalj — Precision Athletics. Data og handlinger er beholdt.
/**
 * PlayerHQ · Drill-detalj (/portal/drills/[id]) i Precision Athletics.
 * Kilde: Claude Design ui_kits/playerhq/screens/PH-13.jsx
 *
 * Auth/eierskaps-sjekk, ExerciseDefinition-lesing og bruk siste 30 dager er beholdt.
 */

import Link from "next/link";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadDrillDetalj } from "@/lib/portal-drilldetalj/drill-detalj-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Ikon, TomTilstand } from "@/components/precision/pa";
import { PH13DrillDetalj } from "@/components/portal/precision/PH13DrillDetalj";
import {
  SYNTETISKE_PH13_DRILLS,
  SYNTETISKE_PH13_CADDIE_FORSLAG,
  type PH13Drill,
  type PH13Akse,
} from "@/lib/portal-drills/ph13-drills-data";

export const dynamic = "force-dynamic";

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

  const data = await loadDrillDetalj(id, { id: user.id, hcp: user.hcp });

  let drill: PH13Drill | null = null;

  if (data) {
    const brukRader = await prisma.trainingDrillV2.findMany({
      where: { exerciseId: id, session: { studentId: user.id } },
      select: { sessionId: true, session: { select: { title: true, startTime: true } } },
      orderBy: { session: { startTime: "desc" } },
    });
    const grense = tredveDagerSiden();
    const okterSiste30 = new Set(
      brukRader.filter((b) => b.session.startTime >= grense).map((b) => b.sessionId)
    ).size;

    const codeParts = [data.axis.toUpperCase()];
    if (data.eyebrow.includes(" · ")) {
      codeParts.push(data.eyebrow.split(" · ")[1].toUpperCase().replace(/\s+/g, "_"));
    }
    const miljo = data.params.find((p) => p.key === "Miljø")?.value;
    if (miljo) codeParts.push(miljo.toUpperCase().replace(/\s+/g, "_"));

    const clockMeta = data.meta.find((m) => m.icon === "clock");
    const duration = clockMeta
      ? parseInt(clockMeta.text.replace(/\D/g, ""), 10) || 15
      : 15;

    drill = {
      id: data.id,
      axis: data.axis.toLowerCase() as PH13Akse,
      area: data.eyebrow.includes(" · ") ? data.eyebrow.split(" · ")[1] : data.axisLabel,
      name: data.name,
      code: codeParts.join("_"),
      mot: data.params.find((p) => p.key === "Læringsfase")?.value ?? null,
      dim: data.params.find((p) => p.key === "Modus")?.value ?? null,
      bel: miljo ?? null,
      press: null,
      p: null,
      qty: data.meta.map((m) => m.text).join(" · ") || "1 økt",
      min: duration,
      goal: null,
      src: "coach",
      desc: data.description,
      bruktTekst:
        okterSiste30 > 0
          ? `brukt i ${okterSiste30} ${okterSiste30 === 1 ? "økt" : "økter"} siste 30 dager`
          : "ny for deg",
    };
  } else {
    // Sjekk syntetiske drills eller forslag
    const matchSyntetisk =
      SYNTETISKE_PH13_DRILLS.find((d) => d.id === id) ||
      SYNTETISKE_PH13_CADDIE_FORSLAG.find((d) => d.id === id);
    if (matchSyntetisk) {
      drill = matchSyntetisk;
    }
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div
        className="pa-side"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 640,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Link
          href="/portal/drills"
          className="pa-btn pa-btn--ghost pa-btn--sm"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
            alignSelf: "flex-start",
          }}
        >
          <Ikon icon={ArrowLeft} size={16} name="arrow-left" />
          <span>Tilbake til øvelsesbanken</span>
        </Link>

        {drill ? (
          <div
            className="pa-card"
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              border: "1px solid var(--border-hairline)",
            }}
          >
            <div>
              <span className="kicker">Øvelse</span>
              <h1
                style={{
                  font: "var(--type-title-s)",
                  color: "var(--text-primary)",
                  margin: "4px 0 0",
                }}
              >
                {drill.name}
              </h1>
            </div>
            <PH13DrillDetalj drill={drill} />
          </div>
        ) : (
          <div className="pa-card" style={{ padding: 24 }}>
            <TomTilstand
              icon={Dumbbell}
              title="Fant ikke drillen"
              text="Drillen finnes ikke eller er ikke tilgjengelig for deg — den kan være fjernet fra banken."
              actions={
                <Link
                  href="/portal/drills"
                  className="pa-btn pa-btn--primary"
                  style={{ textDecoration: "none" }}
                >
                  Tilbake til øvelsesbanken
                </Link>
              }
            />
          </div>
        )}
      </div>
    </PlayerHQSkall>
  );
}
