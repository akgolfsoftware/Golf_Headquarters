"use client";

/**
 * Gameplan interaktiv modus (B30/C7) — port av
 * ui_kits/v2/baneguide-gameplan-interaktiv.jsx til ekte GPS + ekte data.
 *
 * Forskjell fra design-prototypen (som brukte en fast fake-ellipse på en
 * statisk satellittbilde-piksel-viewBox): her er kartet det ekte, interaktive
 * Mapbox-banekartet (CourseMap), sikte/soner er ekte GPS lagret i
 * GameplanHull/GameplanSone, og "andel i rød sone" regnes fra spillerens
 * FAKTISKE spredningsellipse (samme motor som hull-detaljens dispersion-KPI-
 * er) projisert mot det nye siktet — se ellipseGpsPunkter i lib/gameplan/dispersion.ts.
 */

import { useMemo, useState, useTransition } from "react";
import { Check, X, Crosshair, TriangleAlert, CircleCheck } from "lucide-react";
import { CourseMap, gameplanAvstander, type LatLngPoint, type GameplanSoneVisning } from "./course-map";
import { ellipseGpsPunkter, andelISone, haversine, type DispersionEllipse } from "@/lib/gameplan/dispersion";
import { lagreSikte, leggTilSone, tomSonerForHull, type GameplanHullData } from "@/lib/gameplan/actions";

const SONE_RADIUS_M = 20;

export function GameplanPlanlegger({
  holeId,
  tee,
  green,
  center,
  geojson,
  initial,
  ellipse,
}: {
  holeId: string;
  tee: LatLngPoint;
  green: LatLngPoint;
  center: LatLngPoint;
  geojson: GeoJSON.FeatureCollection;
  initial: GameplanHullData;
  ellipse: DispersionEllipse | null;
}) {
  const [sikte, setSikte] = useState<LatLngPoint | null>(
    initial.sikte ? { lat: initial.sikte.lat, lng: initial.sikte.lng } : null,
  );
  const [soner, setSoner] = useState<GameplanSoneVisning[]>(
    initial.soner.map((s) => ({ id: s.id, type: s.type, senter: { lat: s.senterLat, lng: s.senterLng }, radiusMeter: s.radiusMeter })),
  );
  const [modus, setModus] = useState<"sikte" | "bra" | "aldri">("sikte");
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);

  function onKlikk(p: LatLngPoint) {
    if (modus === "sikte") {
      setSikte(p);
      startTransition(async () => {
        await lagreSikte(holeId, p);
        setLagret(true);
        setTimeout(() => setLagret(false), 1500);
      });
      return;
    }
    const midlertidigId = `ny-${Date.now()}`;
    setSoner((prev) => [...prev, { id: midlertidigId, type: modus, senter: p, radiusMeter: SONE_RADIUS_M }]);
    startTransition(async () => {
      const res = await leggTilSone(holeId, { type: modus, senterLat: p.lat, senterLng: p.lng, radiusMeter: SONE_RADIUS_M });
      if (res.ok) {
        setSoner((prev) => prev.map((s) => (s.id === midlertidigId ? { ...s, id: res.id } : s)));
      }
    });
  }

  function tomSoner() {
    setSoner([]);
    startTransition(async () => {
      await tomSonerForHull(holeId);
    });
  }

  const avstander = sikte ? gameplanAvstander(tee, sikte, green) : null;

  const { pctAldri, pctBra } = useMemo(() => {
    if (!ellipse || !sikte) return { pctAldri: 0, pctBra: 0 };
    const punkter = ellipseGpsPunkter(ellipse, tee, sikte);
    const iAldri = new Set(
      punkter
        .map((p, i) => (soner.some((s) => s.type === "aldri" && haversine(p, s.senter) <= s.radiusMeter) ? i : -1))
        .filter((i) => i >= 0),
    );
    const punkterUtenomAldri = punkter.filter((_, i) => !iAldri.has(i));
    return {
      pctAldri: Math.round(andelISone(punkter, soner, "aldri") * 100),
      pctBra: Math.round(
        (punkterUtenomAldri.filter((p) => soner.some((s) => s.type === "bra" && haversine(p, s.senter) <= s.radiusMeter))
          .length /
          Math.max(punkter.length, 1)) *
          100,
      ),
    };
  }, [ellipse, sikte, soner, tee]);

  return (
    <div className="space-y-3">
      <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-border">
        <CourseMap
          center={center}
          geojson={geojson}
          zoom={16.5}
          interactive
          onKlikk={onKlikk}
          sikte={sikte}
          soner={soner}
          className="h-full w-full"
        />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">
          {modus === "sikte" ? "Dra / tapp for å flytte siktet" : modus === "bra" ? "Tapp for å male BRA-sone" : "Tapp for å male ALDRI-sone"}
        </span>
        {avstander && (
          <span className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 font-mono text-[11px] text-white">
            <b>{avstander.carry} m</b>&nbsp;carry ·&nbsp;<b>{avstander.igjen} m</b>&nbsp;igjen
            {ellipse && (
              <span className="ml-auto flex items-center gap-1.5">
                {pctAldri > 10 ? (
                  <TriangleAlert size={13} strokeWidth={1.5} className="text-destructive" />
                ) : (
                  <CircleCheck size={13} strokeWidth={1.5} className="text-primary" />
                )}
                {pctAldri}% i rød sone · {pctBra}% i bra
              </span>
            )}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["sikte", "Flytt sikte", Crosshair],
            ["bra", "Bra å misse", Check],
            ["aldri", "Aldri hit", X],
          ] as const
        ).map(([id, label, Ic]) => (
          <button
            key={id}
            type="button"
            onClick={() => setModus(id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              modus === id
                ? id === "aldri"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : id === "bra"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-secondary text-foreground"
                : "border-border bg-transparent text-muted-foreground hover:bg-secondary/60"
            }`}
          >
            <Ic size={13} strokeWidth={1.5} />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={tomSoner}
          disabled={pending || soner.length === 0}
          className="rounded-full border border-border bg-transparent px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
        >
          Tøm soner
        </button>
        {lagret && (
          <span className="ml-auto self-center font-mono text-[10px] uppercase tracking-wide text-primary">
            Lagret
          </span>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-border bg-card/40 p-4 text-xs leading-relaxed text-muted-foreground">
        Du taster aldri avstand — du peker. Carry og igjen regnes fra ekte GPS (tee/green på
        hullet). {ellipse ? "Rød/bra-andelen er regnet fra din faktiske spredning på dette hullet." : "Logg noen slag på dette hullet for å se rød/bra-andel fra din egen spredning."}
      </div>
    </div>
  );
}
