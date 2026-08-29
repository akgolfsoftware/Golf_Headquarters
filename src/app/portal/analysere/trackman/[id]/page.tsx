/**
 * TM-11 «TrackMan-økt-detalj» — kanonisk PlayerHQ-side for én TrackMan-økt
 * (B7, DispersionMap). Erstatter den eldre Paper-porten
 * `src/app/portal/mal/trackman/[id]/page.tsx` som IA-fasit for dette
 * skjermbildet (HANDOFF §LANSERINGSKJERNE TM-11) — den gamle siden lever
 * videre uendret (egen rute, egen /portal/mal-liste), kun
 * `/portal/trackman/[sessionId]` (legacy-redirect) peker nå hit.
 *
 * Auth-mønster kopiert fra den gamle siden: eier ELLER ADMIN/COACH.
 * Domeneregning (1σ/2σ, bøtter, caddie-setning) skjer i
 * `computeTrackManDispersionMap` (src/lib/trackman/dispersion-map.ts) — ikke
 * her, jf. CLAUDE.md invariant 5.
 *
 * Bak samme feature-flagg som den gamle siden (FEATURES.TRACKMAN_DETAIL) —
 * funksjonen er ny nok (25.08-fasit, ikke tidligere skjermbilde-godkjent av
 * Anders) til at flagget beholdes fremfor å fjernes.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { FEATURES } from "@/lib/features";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { computeTrackManDispersionMap } from "@/lib/trackman/dispersion-map";
import { TrackManSessionDetail } from "@/components/trackman/TrackManSessionDetail";
import Link from "next/link";

const SOURCE_LABEL: Record<string, string> = {
  "csv-import": "TrackMan · CSV",
  "html-import": "TrackMan · HTML",
  api: "TrackMan API",
};

export default async function TrackManOktDetalj({ params }: { params: Promise<{ id: string }> }) {
  if (!FEATURES.TRACKMAN_DETAIL) notFound();

  // /portal/analysere/* står på talent-allowlisten (stats-lesing er åpent for
  // den gratis TALENT-profilen — BUSINESS-RULES §317: «Analysere + TrackMan +
  // Runder + SG er én flate med faner»). kreverTilgang MÅ derfor matche
  // allowlisten, ellers lyver den om hva TALENT faktisk kommer inn på
  // (håndhevet av src/lib/__tests__/tilgang/portal-tilgang-kontrakt.test.ts).
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const { id } = await params;

  const sesjon = await prisma.trackManSession.findUnique({ where: { id } });
  if (!sesjon) notFound();
  if (sesjon.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") notFound();

  const shots = await prisma.trackManShot.findMany({
    where: { sessionId: sesjon.id },
    orderBy: { shotNumber: "asc" },
    select: {
      id: true,
      shotNumber: true,
      club: true,
      side: true,
      carryDistance: true,
      totalDistance: true,
      smashFactor: true,
      launchAngle: true,
      faceToPath: true,
    },
  });

  // Kølla med flest gyldige slag — samme regel som den gamle siden
  // (finnDispersjonKolle): ett siktemål, én ellipse, aldri alle køller blandet.
  const perKolle = new Map<string, typeof shots>();
  for (const s of shots) {
    if (s.side == null || s.carryDistance == null) continue;
    perKolle.set(s.club, [...(perKolle.get(s.club) ?? []), s]);
  }
  let valgtKolle = shots[0]?.club ?? "—";
  let flest = -1;
  for (const [kolle, liste] of perKolle) {
    if (liste.length > flest) {
      flest = liste.length;
      valgtKolle = kolle;
    }
  }
  const kolleShots = shots.filter((s) => s.club === valgtKolle);

  const result = computeTrackManDispersionMap(kolleShots);

  // «Mot forrige» (TM-02/TM-08 «Funn»-lista, siste rad) — nærmeste TIDLIGERE
  // økt med samme kølle, medianCarry-delta. Ren les-side aggregering av
  // eksisterende TrackManShot-data, ingen ny datamodell.
  const forrigeOkt = await prisma.trackManShot.findFirst({
    where: { club: valgtKolle, session: { userId: sesjon.userId, recordedAt: { lt: sesjon.recordedAt } } },
    orderBy: { session: { recordedAt: "desc" } },
    select: { sessionId: true },
  });
  let forrigeDeltaTekst: string | null = null;
  if (forrigeOkt) {
    const forrigeShots = await prisma.trackManShot.findMany({
      where: { sessionId: forrigeOkt.sessionId, club: valgtKolle },
      select: { carryDistance: true },
    });
    const forrigeCarries = forrigeShots.map((s) => s.carryDistance).filter((v): v is number => v != null).sort((a, b) => a - b);
    if (forrigeCarries.length > 0 && result.medianCarry != null) {
      const mid = Math.floor(forrigeCarries.length / 2);
      const forrigeMedian = forrigeCarries.length % 2 === 0 ? (forrigeCarries[mid - 1] + forrigeCarries[mid]) / 2 : forrigeCarries[mid];
      const delta = result.medianCarry - forrigeMedian;
      forrigeDeltaTekst =
        Math.abs(delta) < 0.5
          ? "+0 m · som sist"
          : `${delta > 0 ? "+" : ""}${Math.round(delta)} m · ${delta > 0 ? "lenger enn sist" : "kortere enn sist"}`;
    }
  }

  const datoTekst = sesjon.recordedAt.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <Link
        href="/portal/analysere/trackman"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontFamily: TL.font.sans,
          fontSize: 13,
          color: TL.mute,
          textDecoration: "none",
          marginBottom: 12,
        }}
      >
        <Icon name="arrow-left" size={15} />
        Alle TrackMan-økter
      </Link>

      {kolleShots.length === 0 ? (
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            background: TL.elev,
            border: `1px solid ${TL.hair}`,
            borderRadius: TL.radius.card,
            padding: "28px 20px",
            textAlign: "center",
          }}
        >
          <Icon name="crosshair" size={22} style={{ color: TL.mute }} />
          <p style={{ margin: "10px 0 0", fontFamily: TL.font.sans, fontSize: 14, color: TL.text }}>
            Ingen slag med side og carry i denne økta.
          </p>
          <p style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>
            Importer en økt med begge feltene, så tegnes spredningen her.
          </p>
        </div>
      ) : (
        <TrackManSessionDetail
          club={valgtKolle}
          dateText={datoTekst}
          sourceLabel={SOURCE_LABEL[sesjon.source] ?? sesjon.source}
          result={result}
          allShotsHref="#alle-slag"
          forrigeDeltaTekst={forrigeDeltaTekst}
        />
      )}
    </V2Shell>
  );
}
