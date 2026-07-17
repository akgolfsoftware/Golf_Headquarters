/**
 * PlayerHQ · Drill-detalj (/portal/drills/[id]) — v2.
 * v2-port 16. juli 2026: `DrillDetaljV2` erstatter DrillDetalj (v10), ruten
 * flyttet ut av (legacy). Auth-guard (PLAYER + PARENT), loadDrillDetalj-loaderen
 * og tom-tilstand-prinsippene er uendret: meta/trinn/params utledes kun fra
 * faktiske felter, media uten filer gir «Media kommer» — aldri fabrikerte tall.
 * Not-found-fallback beholdt (ærlig melding + vei tilbake til øvelsesbanken).
 */

import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadDrillDetalj } from "@/lib/portal-drilldetalj/drill-detalj-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, TomTilstand, CTAPill, Kort } from "@/components/v2";
import {
  DrillDetaljV2,
  type DrillDetaljV2Data,
} from "@/components/portal/v2/DrillDetaljV2";
import type { AkseKey } from "@/lib/v2/tokens";

export default async function DrillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const { id } = await params;

  const data = await loadDrillDetalj(id, { id: user.id, hcp: user.hcp });

  // Fallback hvis drillen ikke finnes — ærlig melding, aldri demo-innhold.
  if (!data) {
    return (
      <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/drills">Øvelsesbank</TilbakeLenke>
        <Kort>
          <TomTilstand
            icon="dumbbell"
            title="Drillen finnes ikke"
            sub="Denne drillen finnes ikke eller er ikke tilgjengelig for deg."
          />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link href="/portal/drills" style={{ textDecoration: "none" }}>
              <CTAPill icon="arrow-right">Se alle drills</CTAPill>
            </Link>
          </div>
        </Kort>
      </V2Shell>
    );
  }

  // Loader-output → v2-datakontrakt. Samme felter som v10-mappingen
  // (mapDrillData), inkl. coach = Anders Kristiansen og faste CTA-adresser.
  const v2Data: DrillDetaljV2Data = {
    akse: data.axis.toUpperCase() as AkseKey,
    eyebrow: data.eyebrow,
    navn: data.name,
    beskrivelse: data.description,
    meta: data.meta.map((chip) => ({
      icon: chip.icon,
      text: chip.text,
    })),
    trinn: data.steps,
    coachNotat: data.coachNotes,
    coachNavn: "Anders Kristiansen",
    media: data.media.map((m) => ({
      kind: m.kind,
      label: m.label,
      url: m.url,
    })),
    params: data.params,
    hrefBibliotek: "/portal/drills",
    hrefLeggTilIPlan: "/portal/planlegge/workbench",
  };

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/drills">Øvelsesbank</TilbakeLenke>
      <DrillDetaljV2 data={v2Data} />
    </V2Shell>
  );
}
