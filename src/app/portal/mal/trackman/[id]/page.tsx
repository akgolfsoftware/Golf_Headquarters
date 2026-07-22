/**
 * PlayerHQ TrackMan-økt-detalj — v2. Dispersion-plot og stabilitets-seksjon
 * (tailwind) gjenbrukes som de er; ramme, header og per-kølle-listen er v2.
 * «?»-regelen: dispersion forklares via hjelpetekst-nøkkelen dispersjon.
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { FEATURES } from "@/lib/features";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import {
  Caps,
  Tittel,
  Kort,
  Rad,
  MikroMeta,
  TomTilstand,
  HjelpTips,
} from "@/components/v2";
import { DispersionPlot } from "./dispersion-plot";
import { StabilitetSeksjon, beregnStabilitet } from "./stability-seksjon";

export default async function TrackManDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!FEATURES.TRACKMAN_DETAIL) notFound();

  const user = await requirePortalUser();
  const { id } = await params;

  const sesjon = await prisma.trackManSession.findUnique({
    where: { id },
  });
  if (!sesjon) notFound();
  if (
    sesjon.userId !== user.id &&
    user.role !== "ADMIN" &&
    user.role !== "COACH"
  ) {
    notFound();
  }

  // Hent CLUB_AVG-signals knyttet til denne sesjonen + strukturerte shots
  const [signals, shots] = await Promise.all([
    prisma.signal.findMany({
      where: {
        userId: sesjon.userId,
        kind: "CLUB_AVG",
      },
      orderBy: { computedAt: "desc" },
    }),
    prisma.trackManShot.findMany({
      where: { sessionId: sesjon.id },
      select: {
        club: true,
        carryDistance: true,
        totalDistance: true,
        smashFactor: true,
        matchConfidence: true,
        positionTaskId: true,
      },
    }),
  ]);

  let klubbStats = signals
    .filter((s) => {
      const p = s.payload as { sessionId?: string } | null;
      return p?.sessionId === sesjon.id;
    })
    .map((s) => {
      const p = s.payload as { klubb?: string; antallSlag?: number };
      return {
        klubb: p.klubb ?? "Ukjent",
        snittDistanse: s.value ?? 0,
        antallSlag: p.antallSlag ?? 0,
      };
    });

  // Fallback: aggreger fra TrackManShot når agent-signaler mangler
  if (klubbStats.length === 0 && shots.length > 0) {
    const map = new Map<string, number[]>();
    for (const s of shots) {
      const d = s.carryDistance ?? s.totalDistance;
      if (d == null) continue;
      map.set(s.club, [...(map.get(s.club) ?? []), d]);
    }
    klubbStats = [...map.entries()].map(([klubb, vals]) => ({
      klubb,
      snittDistanse: vals.reduce((a, b) => a + b, 0) / vals.length,
      antallSlag: vals.length,
    }));
  }

  const matchet = shots.filter((s) => s.positionTaskId != null).length;

  const rader = Array.isArray(sesjon.rawJson)
    ? (sesjon.rawJson as Record<string, string>[])
    : [];

  const stabilitetData = beregnStabilitet(sesjon.rawJson);

  const datoTekst = sesjon.recordedAt.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <Link href="/portal/mal/trackman" style={{ textDecoration: "none", alignSelf: "flex-start" }}>
          <MikroMeta icon="arrow-left">Alle TrackMan-økter</MikroMeta>
        </Link>

        <div>
          <Caps>PlayerHQ · TrackMan · {sesjon.source}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em={datoTekst}>Økt</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
            {sesjon.shotCount} slag registrert
            {shots.length > 0
              ? ` · ${matchet} matchet til teknisk plan`
              : ""}
            .
          </p>
        </div>

        {/* Slag-dispersion */}
        <Kort
          eyebrow={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Slag-dispersion <HjelpTips k="dispersjon" size={11} />
            </span>
          }
        >
          <DispersionPlot rader={rader} />
        </Kort>

        {/* Per kølle */}
        <Kort eyebrow="Per kølle (snitt-distanse)">
          {klubbStats.length === 0 ? (
            <TomTilstand
              icon="wrench"
              title="Ingen kølle-snitt ennå"
              sub="Importer CSV/HTML med slag — snitt beregnes fra lagrede slag eller agent."
            />
          ) : (
            <div>
              {klubbStats.map((s, i) => (
                <Rad
                  key={s.klubb}
                  last={i === klubbStats.length - 1}
                  title={s.klubb}
                  sub={`${s.antallSlag} slag`}
                  trailing={
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: 16,
                        fontWeight: 700,
                        color: T.fg,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {s.snittDistanse.toFixed(0)} m
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </Kort>

        {/* Stabilitet-analyse (vises kun hvis sessions har shots-data) */}
        {stabilitetData.klubber.length > 0 && <StabilitetSeksjon data={stabilitetData} />}
      </div>
    </V2Shell>
  );
}
