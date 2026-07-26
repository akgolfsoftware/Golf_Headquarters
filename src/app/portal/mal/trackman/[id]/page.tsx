/**
 * PlayerHQ TrackMan-økt-detalj — v2.
 *
 * Bølge 12c (Open Design-port): økta bruker nå fasit-kortene fra
 * `familie-trackman.html` — `TrackmanSammendrag`, `DispersionPlot` og
 * `KolleStatKort` — i stedet for et lokalt SVG-plot og en naken rad-liste.
 *
 * Det gamle lokale plottet tegnet med Tailwind/shadcn-tokens
 * (`hsl(var(--primary))`) midt på en v2-flate, og blandet alle køller i ett
 * bilde. Fasit-plottet er per kølle; se `dispersjon.ts` for hvorfor.
 *
 * Per-kølle-tallene kommer fra `beregnStabilitet` (snitt, spredning, snitt side
 * per kølle er alt regnet ut der) — ikke fra en ny parallell utregning.
 * Stabilitets-seksjonen under er fortsatt tailwind og er IKKE portet her.
 *
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
  MikroMeta,
  TomTilstand,
  HjelpTips,
  TrackmanSammendrag,
  DispersionPlot,
  KolleStatKort,
  type TrackmanKpi,
} from "@/components/v2";
import { finnDispersjonKolle, sideTekst } from "./dispersjon";
import { StabilitetSeksjon, beregnStabilitet } from "./stability-seksjon";

/** mph → m/s (DB lagrer ball-/køllefart i mph, fasit viser m/s). */
const MPH_TIL_MPS = 0.44704;

/** Snitt av tallene som faktisk finnes. Null når ingen har verdi. */
function snitt(verdier: (number | null)[]): number | null {
  const tall = verdier.filter((v): v is number => v !== null);
  if (tall.length === 0) return null;
  return tall.reduce((a, b) => a + b, 0) / tall.length;
}

/** Norsk komma-desimal, eller null → kortene viser «—» selv. */
function komma(v: number | null, desimaler: number): string | null {
  if (v === null) return null;
  return v.toFixed(desimaler).replace(".", ",");
}

/** Heltall med norsk tusenskille (spinn: «2 540»). Skillet er et hardt
 *  mellomrom (U+00A0) — med vanlig mellomrom brøt «2 540» over to linjer i
 *  KPI-ruten på 390px. */
function heltall(v: number | null): string | null {
  if (v === null) return null;
  return Math.round(v).toLocaleString("nb-NO").replace(/[\s ]/g, " ");
}

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
        ballSpeed: true,
        launchAngle: true,
        spinRate: true,
        side: true,
        clubSpeed: true,
      },
    }),
  ]);

  const matchet = shots.filter((s) => s.positionTaskId != null).length;

  const rader = Array.isArray(sesjon.rawJson)
    ? (sesjon.rawJson as Record<string, string>[])
    : [];

  const stabilitetData = beregnStabilitet(sesjon.rawJson, shots);

  // Per kølle: bruk stabilitets-utregningen (snitt + spredning + snitt side i
  // ett). Faller tilbake til agent-signalene når økta ikke har lagrede slag —
  // da finnes bare snitt-distansen, og spredning/side vises som «—».
  type KolleRad = {
    kolle: string;
    snitt: number | null;
    spredning: number | null;
    side: string | null;
    slag: number | null;
  };
  let kolleKort: KolleRad[] = stabilitetData.klubber.map((k) => ({
    kolle: k.navn,
    snitt: k.params.carry.mean,
    spredning: k.params.carry.stddev,
    side: sideTekst(k.antallSlag > 0 ? k.meanSide : null),
    slag: k.antallSlag,
  }));

  if (kolleKort.length === 0) {
    kolleKort = signals
      .filter((s) => {
        const p = s.payload as { sessionId?: string } | null;
        return p?.sessionId === sesjon.id;
      })
      .map((s) => {
        const p = s.payload as { klubb?: string; antallSlag?: number };
        return {
          kolle: p.klubb ?? "Ukjent",
          snitt: s.value ?? null,
          spredning: null,
          side: null,
          slag: p.antallSlag ?? null,
        };
      });
  }

  // Sammendrag-KPI-er — snitt av det som faktisk er målt. Manglende felt gir
  // null, og kortet skriver «—» i stedet for et oppdiktet tall.
  const ballfartMps = snitt(shots.map((s) => s.ballSpeed));
  const kpier: TrackmanKpi[] = [
    { l: "Ballhastighet", v: komma(ballfartMps === null ? null : ballfartMps * MPH_TIL_MPS, 1), enhet: "m/s" },
    { l: "Smash", v: komma(snitt(shots.map((s) => s.smashFactor)), 2) },
    { l: "Carry snitt", v: heltall(snitt(shots.map((s) => s.carryDistance))), enhet: "m" },
    { l: "Spinn", v: heltall(snitt(shots.map((s) => s.spinRate))), enhet: "rpm" },
  ];

  // Beste slag = lengste carry i økta. Kun ekte felter tas med i teksten.
  const medCarry = shots.filter((s) => s.carryDistance !== null);
  const lengste = medCarry.length > 0
    ? medCarry.reduce((a, b) => ((b.carryDistance ?? 0) > (a.carryDistance ?? 0) ? b : a))
    : null;
  const beste = lengste
    ? [
        `Lengste slag: ${heltall(lengste.carryDistance)} m carry`,
        lengste.smashFactor !== null ? `${komma(lengste.smashFactor, 2)} smash` : null,
      ]
        .filter(Boolean)
        .join(" · ") + ` (${lengste.club})`
    : null;

  const datoTekst = sesjon.recordedAt.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const dispersjon = finnDispersjonKolle(sesjon.rawJson, shots);

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

        {/* Sammendrag for økta */}
        <TrackmanSammendrag
          tittel="TrackMan-økt"
          dato={datoTekst}
          slag={sesjon.shotCount}
          kpier={kpier}
          beste={beste}
        />

        {/* Spredning for kølla med flest plasserbare slag */}
        <div>
          <Caps size={9} style={{ marginBottom: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Slag-spredning <HjelpTips k="dispersjon" size={11} />
            </span>
          </Caps>
          {dispersjon ? (
            <DispersionPlot
              kolle={dispersjon.kolle}
              skudd={dispersjon.punkter}
              grunnlag={`${dispersjon.punkter.length} slag · TrackMan`}
              /* Ingen siktemål i importerte økter — ingen linje å tegne. */
              maal={null}
            />
          ) : (
            <Kort>
              <TomTilstand
                icon="crosshair"
                title="Ingen spredningsdata ennå"
                sub="Importer en økt med både distanse og side-avvik per slag, så tegnes spredningen her."
              />
            </Kort>
          )}
          {dispersjon && rader.length > 0 && kolleKort.length > 1 && (
            <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, margin: "8px 2px 0" }}>
              Viser {dispersjon.kolle} — kølla med flest slag i økta. Snitt og spredning for de
              øvrige står under.
            </p>
          )}
        </div>

        {/* Per kølle */}
        <div>
          <Caps size={9} style={{ marginBottom: 8 }}>Per kølle</Caps>
          {kolleKort.length === 0 ? (
            <Kort>
              <TomTilstand
                icon="wrench"
                title="Ingen kølle-snitt ennå"
                sub="Importer CSV/HTML med slag — snitt beregnes fra lagrede slag eller agent."
              />
            </Kort>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {kolleKort.map((k) => (
                <KolleStatKort
                  key={k.kolle}
                  kolle={k.kolle}
                  snitt={k.snitt}
                  spredning={k.spredning}
                  side={k.side}
                  slag={k.slag}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stabilitet-analyse (vises kun hvis sessions har shots-data) */}
        {stabilitetData.klubber.length > 0 && <StabilitetSeksjon data={stabilitetData} />}
      </div>
    </V2Shell>
  );
}
